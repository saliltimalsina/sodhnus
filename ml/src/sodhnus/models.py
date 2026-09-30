"""The open models Sodhnus runs locally: BGE-M3 for embeddings and bge-reranker-v2-m3 for reranking."""

from functools import cache

import torch
from sentence_transformers import CrossEncoder, SentenceTransformer

EMBEDDING_MODEL = "BAAI/bge-m3"
RERANK_MODEL = "BAAI/bge-reranker-v2-m3"


def device() -> str:
    if torch.cuda.is_available():
        return "cuda"
    return "mps" if torch.backends.mps.is_available() else "cpu"


@cache
def embedder() -> SentenceTransformer:
    return SentenceTransformer(EMBEDDING_MODEL, device=device())


@cache
def reranker() -> CrossEncoder:
    # Half precision on a GPU is about three times faster with the same ranking.
    dtype = torch.float32 if device() == "cpu" else torch.float16
    return CrossEncoder(RERANK_MODEL, device=device(), max_length=1024, model_kwargs={"torch_dtype": dtype})


def embed(texts: list[str], batch_size: int = 16) -> list[list[float]]:
    return embedder().encode(texts, batch_size=batch_size, normalize_embeddings=True).tolist()


def to_pgvector(vector: list[float]) -> str:
    return "[" + ",".join(f"{x:.6f}" for x in vector) + "]"
