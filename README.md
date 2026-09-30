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
