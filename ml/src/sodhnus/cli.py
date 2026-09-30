import argparse
import asyncio
import os
import sys
from pathlib import Path

import psycopg
from dotenv import load_dotenv

from .sources import load_registry, sync

# Share the Next app's environment file so there is one place to configure everything.
load_dotenv(Path(__file__).resolve().parents[3] / ".env.local")


def database_url() -> str:
    url = os.environ.get("DATABASE_URL")
    if not url:
        sys.exit("Set DATABASE_URL in .env.local (see .env.example)")
    return url


def main() -> None:
    parser = argparse.ArgumentParser(prog="sodhnus")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("sources", help="sync sources.yaml into the database")
    crawl = commands.add_parser("crawl", help="crawl sources that are due")
    crawl.add_argument("domains", nargs="*", help="only these domains")
    crawl.add_argument("--max-pages", type=int, default=150, help="pages per site (default 150)")
    crawl.add_argument("--delay", type=float, default=1.0, help="seconds between requests to one site")
    crawl.add_argument("--force", action="store_true", help="crawl even if not due")
    commands.add_parser("embed", help="embed chunks that have no embedding yet")
    ocr = commands.add_parser("ocr", help="read scanned PDFs with Tesseract (needs the nep language data)")
    ocr.add_argument("--limit", type=int, default=200, help="PDFs to process (default 200)")
    serve = commands.add_parser("serve", help="run the search API for the Next app")
    serve.add_argument("--host", default="127.0.0.1")
    serve.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()

    if args.command == "sources":
        sources = load_registry()
        with psycopg.connect(database_url()) as conn:
            sync(conn, sources)
        print(f"Synced {len(sources)} sources")
    elif args.command == "crawl":
        from .crawl import crawl as run

        asyncio.run(run(database_url(), args.domains or None, args.max_pages, args.delay, args.force))
    elif args.command == "embed":
        from .embed import embed_pending

        embed_pending(database_url())
    elif args.command == "ocr":
        from .ocr import ocr_pending

        asyncio.run(ocr_pending(database_url(), args.limit))
    elif args.command == "serve":
        import uvicorn

        database_url()  # fail early with a clear message when unset
        uvicorn.run("sodhnus.serve:app", host=args.host, port=args.port)
