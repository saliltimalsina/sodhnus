-- Sources, the pages crawled from them, and the chunks that get searched.

create extension if not exists vector;
create extension if not exists pg_trgm;

-- One row per official website. Loaded from ingest/sources.yaml.
create table sources (
  id serial primary key,
  domain text not null unique,
  office text not null,
  office_ne text not null,
  level text not null check (level in ('federal', 'province', 'local')),
  start_urls text[] not null,
  recrawl_hours int not null default 168,
  active boolean not null default true
);

-- One row per crawled page or PDF, replaced when its content hash changes.
create table documents (
  id bigserial primary key,
  source_id int not null references sources (id) on delete cascade,
  url text not null unique,
  title text,
  lang text check (lang in ('en', 'ne', 'mixed')),
  kind text not null check (kind in ('html', 'pdf')),
  content_hash text not null,
  -- The date as printed on the page (usually Bikram Sambat), and the same date in AD.
  published_bs text,
  published_at date,
  fetched_at timestamptz not null default now(),
  text text not null
);

create index documents_source_idx on documents (source_id);

-- Passages that retrieval searches. BGE-M3 embeds to 1024 dimensions; halfvec halves the storage.
create table chunks (
  id bigserial primary key,
  document_id bigint not null references documents (id) on delete cascade,
  ord int not null,
  text text not null,
  embedding halfvec(1024),
  unique (document_id, ord)
);

create index chunks_embedding_idx on chunks using hnsw (embedding halfvec_cosine_ops);
-- Trigram search works for Devanagari, where Postgres full-text search has no Nepali dictionary.
create index chunks_text_trgm_idx on chunks using gin (text gin_trgm_ops);
