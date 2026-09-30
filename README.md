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
- The ask box is a front end only: submitting shows a "preview" notice until an answer engine is connected.

## Answer engine (in progress)

Everything runs on free, open-source tools and free tiers.

```bash
cp .env.example .env.local
createdb sodhnus            # Postgres 16+ with the pgvector extension
npm run db:migrate          # applies db/migrations/*.sql once each
npm run ingest:sources      # syncs ingest/sources.yaml into the sources table (needs uv)
```

- `ingest/` is a Python package (uv) that crawls the official sites in `ingest/sources.yaml` into Postgres.
- `db/migrations/` defines sources, documents and the searchable chunks (pgvector + trigram indexes).
- `lib/answer/types.ts` is the contract between retrieval, decisions and the UI.
- `evals/golden.ts` lists questions with known right behaviour: every hero example in all three languages,
  plus questions Sodhnus must refuse or redirect.
