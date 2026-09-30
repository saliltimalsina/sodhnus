"""Embed every chunk that has no embedding yet."""

import time

import psycopg

from .models import embed, to_pgvector


def embed_pending(database_url: str, batch: int = 64) -> None:
    with psycopg.connect(database_url, autocommit=True) as conn:
        total = conn.execute("select count(*) from chunks where embedding is null").fetchone()[0]
        done = 0
        started = time.time()
        while True:
            rows = conn.execute("select id, text from chunks where embedding is null order by id limit %s", (batch,)).fetchall()
            if not rows:
                break
            vectors = embed([text for _, text in rows])
            with conn.cursor() as cur:
                cur.executemany(
                    "update chunks set embedding = %s::halfvec where id = %s",
                    [(to_pgvector(v), chunk_id) for (chunk_id, _), v in zip(rows, vectors)],
                )
            done += len(rows)
            print(f"\rEmbedded {done}/{total} ({done / (time.time() - started):.1f}/s)", end="", flush=True)
        print()
