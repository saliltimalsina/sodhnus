"""HTTP API the Next app calls for retrieval. Keeps the models loaded between requests."""

import hmac
import os
from contextlib import asynccontextmanager

import psycopg
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from .models import embedder, reranker
from .search import search


@asynccontextmanager
async def lifespan(_: FastAPI):
    embedder(), reranker()  # load both models before the first question arrives
    yield


app = FastAPI(title="Sodhnus ML", lifespan=lifespan)


class SearchRequest(BaseModel):
    phrasings: list[str] = Field(min_length=1, max_length=3)
    k: int = Field(default=8, ge=1, le=20)


def authorize(token: str | None) -> None:
    expected = os.environ.get("ML_TOKEN")
    if expected and not hmac.compare_digest(token or "", expected):
        raise HTTPException(status_code=401)


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.post("/search")
def search_endpoint(body: SearchRequest, authorization: str | None = Header(default=None)) -> dict:
    authorize(authorization.removeprefix("Bearer ") if authorization else None)
    phrasings = [p.strip()[:500] for p in body.phrasings if p.strip()]
    if not phrasings:
        raise HTTPException(status_code=422, detail="Empty question")
    with psycopg.connect(os.environ["DATABASE_URL"]) as conn:
        return {"results": search(conn, phrasings, body.k)}
