#!/bin/sh
# Applies db/migrations/*.sql in order, once each, recording them in schema_migrations.
set -eu

cd "$(dirname "$0")/.."
[ -f .env.local ] && . ./.env.local
: "${DATABASE_URL:?Set DATABASE_URL in .env.local (see .env.example)}"
export PGOPTIONS="-c client_min_messages=warning"

psql "$DATABASE_URL" -qX -v ON_ERROR_STOP=1 -c \
  "create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())"

for file in db/migrations/*.sql; do
  name=$(basename "$file")
  applied=$(psql "$DATABASE_URL" -qXAt -c "select 1 from schema_migrations where name = '$name'")
  if [ -z "$applied" ]; then
    echo "Applying $name"
    psql "$DATABASE_URL" -qX -v ON_ERROR_STOP=1 --single-transaction \
      -f "$file" -c "insert into schema_migrations (name) values ('$name')"
  fi
done
