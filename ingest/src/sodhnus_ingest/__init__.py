import os
import sys
from pathlib import Path

import psycopg
from dotenv import load_dotenv

from .sources import load_registry, sync

# Share the Next app's environment file so there is one place to configure the database.
load_dotenv(Path(__file__).resolve().parents[3] / ".env.local")


def main() -> None:
    command = sys.argv[1] if len(sys.argv) > 1 else None
    if command != "sources":
        sys.exit("Usage: sodhnus-ingest sources   Sync sources.yaml into the database")

    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        sys.exit("Set DATABASE_URL in .env.local (see .env.example)")

    sources = load_registry()
    with psycopg.connect(database_url) as conn:
        sync(conn, sources)
    print(f"Synced {len(sources)} sources")
