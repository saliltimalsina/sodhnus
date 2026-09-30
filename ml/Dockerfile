# The search API, sized for a free Hugging Face Space (CPU, 16 GB RAM).
# Set DATABASE_URL and ML_TOKEN as Space secrets; the Next app sets ML_URL and the same ML_TOKEN.
FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy HF_HOME=/app/hf

WORKDIR /app
COPY pyproject.toml uv.lock .python-version ./
RUN uv sync --locked --no-install-project --no-dev
COPY src ./src
COPY sources.yaml ./
RUN uv sync --locked --no-dev

# Download both models at build time so the Space starts answering straight away.
RUN uv run python -c "from sodhnus.models import embedder, reranker; embedder(); reranker()"

EXPOSE 7860
CMD ["uv", "run", "--no-sync", "sodhnus", "serve", "--host", "0.0.0.0", "--port", "7860"]
