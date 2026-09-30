# Sodhnus (सोध्नुस्)

An independent, AI-first front door to government information in Nepal. Ask in English, Nepali or Roman
Nepali; answers come only from official .gov.np sources. Not affiliated with the Government of Nepal.

```bash
npm install
npm run dev   # http://localhost:3000
```

- `app/page.tsx` composes the landing page from `components/`.
- `data/situations.ts` holds the hero examples (photo, office, the same question in three languages).
- Design system (tokens, type scale, grid) lives in `app/globals.css`, modelled on America.gov: white canvas,
  navy-derived greys, Newsreader (serif), Inter (sans), Noto Devanagari for Nepali.
- `data/nepal-map.json` is one dot per local government, derived from geoJSON-Nepal (MIT).
- Photos are from Wikimedia Commons; licences and authors are in `data/photo-credits.json` and shown at `/credits`.

## How answering works

```
question ─► language (rules) ─► emergency? ─► Roman Nepali → Devanagari ─► search ─► answer model ─► cited answer
                                  │ yes: 100/101/102        (Gemma 3)          BGE-M3 vectors      only from the
                                  ▼                                            + trigram, reranked  passages given
                              emergency card
```

- `ml/` (Python, uv) crawls the sites in `ml/sources.yaml`, embeds passages with BGE-M3, and serves `/search`
  (vector + trigram search, fused and reranked with bge-reranker-v2-m3).
- `lib/answer/` (Next.js, server only) detects the language, handles emergencies without waiting on a model,
  asks the answer model for JSON, and refuses to show anything that doesn't cite a retrieved passage.
- `app/api/ask/route.ts` is the endpoint; `components/ask-provider.tsx` keeps the conversation in memory only.
- `evals/` holds the golden questions (`golden.ts`) and the runner (`npm run evals`).

Everything is free and open source: Postgres + pgvector, BGE-M3, bge-reranker-v2-m3, Gemma 3 via Ollama locally,
and any OpenAI-compatible free tier in production.

## Run it locally

Needs Postgres 16+ with pgvector, [uv](https://docs.astral.sh/uv/) and [Ollama](https://ollama.com).

```bash
cp .env.example .env.local
createdb sodhnus
npm run db:migrate
npm run sources            # load ml/sources.yaml
npm run crawl              # crawl sites that are due (150 pages each by default)
npm run ml -- embed        # embed new passages
ollama pull gemma3:12b

npm run ml:serve           # search API on :8765 (keep running)
npm run dev                # the site on :3000
npm run evals              # score the golden questions against the running app
```

## Deploy for free

| Piece | Free option |
|---|---|
| Site (`next build`) | Vercel Hobby |
| Database | Neon free tier (pgvector included) |
| Search API | Hugging Face Space (Docker, CPU): `ml/Dockerfile`, secrets `DATABASE_URL`, `ML_TOKEN` |
| Answer model | Any OpenAI-compatible free tier: set `LLM_BASE_URL`, `LLM_MODEL`, `LLM_API_KEY` |
| Crawling | GitHub Actions: `.github/workflows/crawl.yml`, secret `DATABASE_URL` |

Check a free tier's data policy before using it: some train on what they're sent, which would break the privacy
promise on the page.

## Known gaps

- Scanned PDFs need OCR (Tesseract with Nepali data) and Preeti/Kantipur PDFs need a legacy-font converter;
  both are recorded in `skipped_urls` for later. The only converter found so far, `npttf2utf`, is GPL-3.0.
- JavaScript-only sites (psc.gov.np) need a headless browser.
- Laya (a free decision model) scored 8/11 zero-shot on routing questions; it needs fine-tuning on our data
  before it can decide anything users see.
