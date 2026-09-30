"""Crawl official sites into `documents` and `chunks`, politely: one request at a time per site."""

import asyncio
import hashlib
import heapq
import io
import re
import ssl
from collections import Counter
from dataclasses import dataclass
from urllib.parse import urldefrag, urljoin, urlsplit
from urllib.robotparser import RobotFileParser

import httpx
import lxml.html
import psycopg
import trafilatura
import truststore
from pypdf import PdfReader

from .text import broken_devanagari, chunk, detect_lang, find_bs_date

USER_AGENT = "SodhnusBot/0.1 (independent public-information service for Nepal)"
MAX_BYTES = 15 * 1024 * 1024
MIN_CHARS = 200
MAX_DEPTH = 3
SKIP_EXTENSIONS = re.compile(r"\.(jpe?g|png|gif|webp|svg|ico|zip|rar|mp4|mp3|docx?|xlsx?|pptx?|css|js)$", re.I)
LEGACY_FONTS = re.compile(r"preeti|kantipur|himal|sagarmatha|fontasy|ganess|pcs.?nepali", re.I)
# Pages people ask about most: citizen charters, services, procedures, forms and FAQs, then notices.
SERVICE_LINK = re.compile(
    r"charter|service|sewa|procedure|process|faq|fee|form|citizen|बडापत्र|सेवा|प्रक्रिया|शुल्क|दस्तुर|फाराम|नागरिक",
    re.I,
)
NOTICE_LINK = re.compile(r"notice|suchana|download|circular|सूचना|सुचना|परिपत्र", re.I)


CHROME = (
    "//header | //nav | //footer | //marquee | //aside | //*[@role='navigation']"
    " | //*[re:test(concat(@class, ' ', @id), 'ticker|marquee|breaking|navbar|menu|footer|sidebar|topbar', 'i')]"
)


@dataclass
class Page:
    url: str
    title: str | None
    text: str
    kind: str


class Skip(Exception):
    def __init__(self, reason: str, detail: str = ""):
        super().__init__(detail or reason)
        self.reason = reason
        self.detail = detail


def same_site(url: str, domain: str) -> bool:
    host = (urlsplit(url).hostname or "").lower()
    return host == domain or host == f"www.{domain}"


def allowed(url: str, domain: str) -> bool:
    """The site's own pages, plus PDFs it links on other official hosts (such as the shared
    government CDN giwmscdnone.gov.np), which are credited to the linking site."""
    if same_site(url, domain):
        return True
    host = (urlsplit(url).hostname or "").lower()
    return host.endswith(".gov.np") and urlsplit(url).path.lower().endswith(".pdf")


def priority(url: str, anchor: str, depth: int) -> int:
    """Lower runs sooner: shallow pages first, and useful-looking links before the rest."""
    target = f"{url} {anchor}"
    score = depth * 10 - (8 if SERVICE_LINK.search(target) else 3 if NOTICE_LINK.search(target) else 0)
    # Guidelines, charters and notices are usually published as PDFs, not page text.
    return score - (6 if urlsplit(url).path.lower().endswith(".pdf") else 0)


def links(html: str, base: str, domain: str) -> list[tuple[str, str]]:
    try:
        tree = lxml.html.fromstring(html)
    except (lxml.etree.ParserError, ValueError):
        return []
    found = []
    for a in tree.iterfind(".//a[@href]"):
        url, _ = urldefrag(urljoin(base, a.get("href", "").strip()))
        if url.startswith(("http://", "https://")) and allowed(url, domain) and not SKIP_EXTENSIONS.search(urlsplit(url).path):
            found.append((url, a.text_content().strip()[:100]))
    return found


def read_pdf(data: bytes) -> tuple[str, str]:
    """The PDF's title (its metadata, else its first line) and text."""
    reader = PdfReader(io.BytesIO(data))
    for page in reader.pages[:2]:
        fonts = (page.get("/Resources") or {}).get("/Font") or {}
        for font in fonts.values():
            name = str(font.get_object().get("/BaseFont", ""))
            if LEGACY_FONTS.search(name):
                raise Skip("legacy-font", name)
    text = "\n".join(page.extract_text() or "" for page in reader.pages[:60])
    if len(text.strip()) < MIN_CHARS:
        raise Skip("scanned-pdf", f"{len(reader.pages)} pages")
    if broken_devanagari(text):
        raise Skip("broken-text", "Devanagari text layer maps to the wrong characters")
    title = (reader.metadata.title if reader.metadata else None) or next(l.strip() for l in text.split("\n") if l.strip())
    return title[:200], text


def strip_chrome(html: str) -> str:
    """Remove menus, headers, footers and scrolling notice tickers before extracting the main text."""
    try:
        tree = lxml.html.fromstring(html)
    except (lxml.etree.ParserError, ValueError):
        return html
    total = len(tree.text_content())
    for element in tree.xpath(CHROME, namespaces={"re": "http://exslt.org/regular-expressions"}):
        # Wrappers can carry names like "has-sidebar"; never drop what holds most of the page.
        if element.tag in ("html", "body", "main") or len(element.text_content()) > 0.4 * total:
            continue
        element.drop_tree()
    return lxml.html.tostring(tree, encoding="unicode")


def extract(url: str, response: httpx.Response) -> Page:
    content_type = response.headers.get("content-type", "").lower()
    if "pdf" in content_type or url.lower().endswith(".pdf"):
        title, text = read_pdf(response.content)
        return Page(url, title, text, "pdf")
    html = response.text
    text = trafilatura.extract(strip_chrome(html), url=url, include_tables=True, include_comments=False, favor_recall=True) or ""
    if len(text) < MIN_CHARS:
        raise Skip("too-short", f"{len(text)} chars")
    metadata = trafilatura.extract_metadata(html, default_url=url)
    return Page(url, metadata.title if metadata else None, text, "html")


def http_client(max_connections: int = 10) -> httpx.AsyncClient:
    # The system trust store completes the certificate chains several .gov.np servers leave out.
    return httpx.AsyncClient(
        verify=truststore.SSLContext(ssl.PROTOCOL_TLS_CLIENT),
        follow_redirects=True,
        timeout=httpx.Timeout(30, connect=20),
        headers={"User-Agent": USER_AGENT},
        limits=httpx.Limits(max_connections=max_connections),
    )


async def fetch(client: httpx.AsyncClient, url: str) -> httpx.Response:
    """GET with two retries; government servers often reset connections under load."""
    for attempt in range(3):
        try:
            async with client.stream("GET", url) as response:
                if int(response.headers.get("content-length") or 0) > MAX_BYTES:
                    raise Skip("too-large", response.headers["content-length"])
                body = b""
                async for part in response.aiter_bytes():
                    body += part
                    if len(body) > MAX_BYTES:
                        raise Skip("too-large", f">{MAX_BYTES}")
                # The body is already decompressed, so drop the headers describing the wire encoding.
                headers = {k: v for k, v in response.headers.items() if k.lower() not in ("content-encoding", "content-length", "transfer-encoding")}
                return httpx.Response(response.status_code, headers=headers, content=body, request=response.request)
        except (httpx.TransportError, httpx.TimeoutException):
            if attempt == 2:
                raise
            await asyncio.sleep(2 * (attempt + 1))
    raise AssertionError("unreachable")


async def robots_for(client: httpx.AsyncClient, domain: str) -> RobotFileParser:
    parser = RobotFileParser()
    try:
        response = await client.get(f"https://{domain}/robots.txt")
        parser.parse(response.text.splitlines() if response.status_code == 200 else [])
    except httpx.HTTPError:
        parser.parse([])
    return parser


async def store(conn: psycopg.AsyncConnection, source_id: int, page: Page) -> str:
    """Insert or refresh a page. Returns 'new', 'changed', 'unchanged' or 'duplicate'."""
    content_hash = hashlib.sha256(page.text.encode()).hexdigest()
    async with conn.transaction():
        existing = await (await conn.execute("select id, content_hash from documents where url = %s", (page.url,))).fetchone()
        if existing and existing[1] == content_hash:
            await conn.execute("update documents set fetched_at = now() where id = %s", (existing[0],))
            return "unchanged"
        duplicate = await (
            await conn.execute(
                "select 1 from documents where source_id = %s and content_hash = %s and url <> %s",
                (source_id, content_hash, page.url),
            )
        ).fetchone()
        if duplicate:
            return "duplicate"

        published_bs, published_at = find_bs_date(page.text)
        values = (source_id, page.url, page.title, detect_lang(page.text), page.kind, content_hash, published_bs, published_at, page.text)
        await conn.execute(
                """
                insert into documents (source_id, url, title, lang, kind, content_hash, published_bs, published_at, text)
                values (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                on conflict (url) do update set
                  title = excluded.title, lang = excluded.lang, kind = excluded.kind,
                  content_hash = excluded.content_hash, published_bs = excluded.published_bs,
                  published_at = excluded.published_at, text = excluded.text, fetched_at = now()
                """,
                values,
            )
        await conn.execute("delete from skipped_urls where url = %s", (page.url,))
    return "changed" if existing else "new"


# Reasons that describe the file itself, so any text stored for it earlier is wrong or unreadable.
UNREADABLE = ("scanned-pdf", "broken-text", "legacy-font")


async def skip(conn: psycopg.AsyncConnection, source_id: int, url: str, reason: str, detail: str) -> None:
    if reason in UNREADABLE:
        await conn.execute("delete from documents where url = %s", (url,))
    await conn.execute(
        """
        insert into skipped_urls (url, source_id, reason, detail) values (%s, %s, %s, %s)
        on conflict (url) do update set reason = excluded.reason, detail = excluded.detail, seen_at = now()
        """,
        (url, source_id, reason, detail[:500]),
    )


def boilerplate(texts: list[str], share: float = 0.08) -> set[str]:
    """Lines that repeat across many pages of one site: menus, tickers, addresses, footers."""
    if len(texts) < 3:
        return set()
    counts = Counter(line for text in texts for line in {l.strip() for l in text.split("\n")} if line)
    return {line for line, n in counts.items() if n >= max(3, share * len(texts))}


async def rechunk(conn: psycopg.AsyncConnection, source_id: int) -> int:
    """Strip the site's boilerplate from every page and rebuild chunks where the cleaned text changed."""
    rows = await (await conn.execute("select id, title, text, clean_hash from documents where source_id = %s", (source_id,))).fetchall()
    repeated = boilerplate([r[2] for r in rows])
    rebuilt = 0
    for document_id, title, text, clean_hash in rows:
        cleaned = "\n".join(l for l in text.split("\n") if l.strip() and l.strip() not in repeated)
        new_hash = hashlib.sha256(cleaned.encode()).hexdigest()
        if new_hash == clean_hash:
            continue
        passages = chunk(title, cleaned) if len(cleaned) >= MIN_CHARS else []
        async with conn.transaction():
            await conn.execute("delete from chunks where document_id = %s", (document_id,))
            async with conn.cursor() as cur:
                await cur.executemany(
                    "insert into chunks (document_id, ord, text) values (%s, %s, %s)",
                    [(document_id, i, p) for i, p in enumerate(passages)],
                )
            await conn.execute("update documents set clean_hash = %s where id = %s", (new_hash, document_id))
        rebuilt += 1
    return rebuilt


async def crawl_source(database_url: str, client: httpx.AsyncClient, source: dict, max_pages: int, delay: float) -> dict:
    domain = source["domain"]
    counts = {"new": 0, "changed": 0, "unchanged": 0, "duplicate": 0, "skipped": 0}
    robots = await robots_for(client, domain)
    queue: list[tuple[int, int, str, int]] = []
    seen: set[str] = set()
    order = 0
    for url in source["start_urls"]:
        heapq.heappush(queue, (0, order, url, 0))
        seen.add(url)

    async with await psycopg.AsyncConnection.connect(database_url, autocommit=True) as conn:
        fetched = 0
        while queue and fetched < max_pages:
            _, _, url, depth = heapq.heappop(queue)
            if not robots.can_fetch(USER_AGENT, url):
                continue
            fetched += 1
            try:
                response = await fetch(client, url)
                await asyncio.sleep(delay)
                if response.status_code != 200:
                    raise Skip("error", f"HTTP {response.status_code}")
                final_url = str(response.url)
                if not allowed(final_url, domain):
                    continue
                if depth < MAX_DEPTH and "html" in response.headers.get("content-type", ""):
                    for link, anchor in links(response.text, final_url, domain):
                        if link not in seen:
                            seen.add(link)
                            order += 1
                            heapq.heappush(queue, (priority(link, anchor, depth + 1), order, link, depth + 1))
                page = extract(final_url, response)
                counts[await store(conn, source["id"], page)] += 1
            except Skip as reason:
                counts["skipped"] += 1
                await skip(conn, source["id"], url, reason.reason, reason.detail)
            except Exception as error:  # one bad page must not stop the site's crawl
                counts["skipped"] += 1
                await skip(conn, source["id"], url, "error", f"{type(error).__name__}: {error}")
        await conn.execute("update sources set last_crawled_at = now() where id = %s", (source["id"],))
        counts["rechunked"] = await rechunk(conn, source["id"])
    return counts


async def crawl(database_url: str, domains: list[str] | None, max_pages: int, delay: float, force: bool) -> None:
    async with await psycopg.AsyncConnection.connect(database_url) as conn:
        rows = await (
            await conn.execute(
                """
                select id, domain, start_urls from sources
                where active
                  and (%(domains)s::text[] is null or domain = any(%(domains)s))
                  and (%(force)s or last_crawled_at is null or last_crawled_at < now() - make_interval(hours => recrawl_hours))
                order by id
                """,
                {"domains": domains, "force": force},
            )
        ).fetchall()
    sources = [{"id": r[0], "domain": r[1], "start_urls": r[2]} for r in rows]
    if not sources:
        print("Nothing is due for a crawl (use --force to crawl anyway)")
        return

    async with http_client(max_connections=len(sources) * 2) as client:

        async def run(source: dict) -> None:
            counts = await crawl_source(database_url, client, source, max_pages, delay)
            print(f"{source['domain']:24} " + " ".join(f"{k}={v}" for k, v in counts.items()), flush=True)

        await asyncio.gather(*(run(s) for s in sources))
