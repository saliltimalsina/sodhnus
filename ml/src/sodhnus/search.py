"""Hybrid retrieval: vector and trigram search for each phrasing of a question, merged with
reciprocal rank fusion, then reranked with a cross-encoder."""

import psycopg

from .models import embed, reranker, to_pgvector

CANDIDATES = 30
RERANK = 20
RRF_K = 60
PER_DOCUMENT = 3


def search(conn: psycopg.Connection, phrasings: list[str], k: int = 8) -> list[dict]:
    """`phrasings` are the same question in different forms (as typed, in Devanagari, in English).
    The first is used for reranking, so callers should put the clearest one first."""
    scores: dict[int, float] = {}

    def fuse(ids: list[int]) -> None:
        for rank, chunk_id in enumerate(ids):
            scores[chunk_id] = scores.get(chunk_id, 0) + 1 / (RRF_K + rank)

    conn.execute("select set_config('pg_trgm.word_similarity_threshold', '0.3', false)")
    for phrasing, vector in zip(phrasings, embed(phrasings)):
        fuse([r[0] for r in conn.execute(
            "select id from chunks where embedding is not null order by embedding <=> %s::halfvec limit %s",
            (to_pgvector(vector), CANDIDATES),
        )])
        fuse([r[0] for r in conn.execute(
            "select id from chunks where %s <%% text order by word_similarity(%s, text) desc limit %s",
            (phrasing, phrasing, CANDIDATES),
        )])
    if not scores:
        return []

    top = sorted(scores, key=scores.get, reverse=True)[:RERANK]
    rows = conn.execute(
        """
        select c.id, c.text, d.url, d.title, s.office, s.office_ne, s.domain, d.fetched_at, d.published_at
        from chunks c join documents d on d.id = c.document_id join sources s on s.id = d.source_id
        where c.id = any(%s)
        """,
        (top,),
    ).fetchall()
    rerank = reranker().predict([(phrasings[0], row[1]) for row in rows])

    results, per_document = [], {}
    for row, score in sorted(zip(rows, rerank), key=lambda pair: pair[1], reverse=True):
        chunk_id, text, url, title, office, office_ne, domain, fetched_at, published_at = row
        if per_document.get(url, 0) >= PER_DOCUMENT:
            continue
        per_document[url] = per_document.get(url, 0) + 1
        results.append({
            "id": chunk_id, "text": text, "url": url, "title": title, "office": office, "officeNe": office_ne,
            "domain": domain, "fetchedAt": fetched_at.isoformat(),
            "publishedAt": published_at.isoformat() if published_at else None, "score": round(float(score), 4),
        })
        if len(results) == k:
            break
    return results
