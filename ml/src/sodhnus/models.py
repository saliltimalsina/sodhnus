"""The open models Sodhnus runs locally: BGE-M3 for embeddings and bge-reranker-v2-m3 for reranking."""

import threading
from functools import cache

import torch
from sentence_transformers import CrossEncoder, SentenceTransformer

EMBEDDING_MODEL = "BAAI/bge-m3"
RERANK_MODEL = "BAAI/bge-reranker-v2-m3"
# GPU backends (Apple's MPS in particular) crash when two threads run a model at once, and the
# web server handles requests on a thread pool, so every model call goes through this lock.
GPU = threading.Lock()


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
    with GPU:
        return embedder().encode(texts, batch_size=batch_size, normalize_embeddings=True).tolist()


def rerank(query: str, passages: list[str]) -> list[float]:
    with GPU:
        return [float(s) for s in reranker().predict([(query, p) for p in passages])]


def to_pgvector(vector: list[float]) -> str:
    return "[" + ",".join(f"{x:.6f}" for x in vector) + "]"
