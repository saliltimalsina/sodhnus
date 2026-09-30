-- URLs the crawler found but could not turn into text yet, kept so later work (OCR, legacy-font
-- conversion, a headless browser) knows exactly what is waiting.
create table skipped_urls (
  url text primary key,
  source_id int not null references sources (id) on delete cascade,
  reason text not null check (reason in ('scanned-pdf', 'legacy-font', 'too-short', 'too-large', 'error')),
  detail text,
  seen_at timestamptz not null default now()
);

alter table sources add column last_crawled_at timestamptz;
