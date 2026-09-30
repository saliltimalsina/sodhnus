"""Read scanned PDFs, and PDFs whose text layer is garbled, with Tesseract's Nepali and English models."""

import asyncio
import re

import psycopg
import pypdfium2
import pytesseract

from .crawl import MIN_CHARS, Page, fetch, http_client, rechunk, store

MAX_PAGES = 8
DPI = 200


def ocr_pdf(data: bytes) -> str:
    pdf = pypdfium2.PdfDocument(data)
    pages = []
    for i in range(min(len(pdf), MAX_PAGES)):
        image = pdf[i].render(scale=DPI / 72).to_pil()
        pages.append(pytesseract.image_to_string(image, lang="nep+eng"))
    return "\n".join(re.sub(r"[ \t]+", " ", line).strip() for page in pages for line in page.split("\n"))


async def ocr_pending(database_url: str, limit: int) -> None:
    async with await psycopg.AsyncConnection.connect(database_url, autocommit=True) as conn:
        rows = await (
            await conn.execute(
                """
                select url, source_id from skipped_urls
                where reason in ('scanned-pdf', 'broken-text') and detail is distinct from 'no text after OCR'
                order by seen_at limit %s
                """,
                (limit,),
            )
        ).fetchall()
        touched: set[int] = set()
        async with http_client() as client:
            for i, (url, source_id) in enumerate(rows, 1):
                try:
                    response = await fetch(client, url)
                    text = await asyncio.to_thread(ocr_pdf, response.content)
                except Exception as error:  # one unreadable file must not stop the rest
                    print(f"[{i}/{len(rows)}] failed {url}: {type(error).__name__}")
                    continue
                if len(text.strip()) < MIN_CHARS:
                    await conn.execute("update skipped_urls set detail = 'no text after OCR' where url = %s", (url,))
                    continue
                title = next(line for line in text.split("\n") if line.strip())[:200]
                status = await store(conn, source_id, Page(url, title, text, "pdf"))
                touched.add(source_id)
                print(f"[{i}/{len(rows)}] {status} {len(text)} chars {url}", flush=True)
        for source_id in touched:
            await rechunk(conn, source_id)
