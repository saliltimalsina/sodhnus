"""Sync the source registry (sources.yaml) into the `sources` table."""

from pathlib import Path

import psycopg
import yaml

REGISTRY = Path(__file__).resolve().parents[2] / "sources.yaml"
LEVELS = ("federal", "province", "local")


def load_registry(path: Path = REGISTRY) -> list[dict]:
    registry = yaml.safe_load(path.read_text(encoding="utf-8"))
    unknown = set(registry) - set(LEVELS)
    if unknown:
        raise ValueError(f"Unknown levels in {path.name}: {', '.join(sorted(unknown))}")

    sources = []
    for level in LEVELS:
        for entry in registry.get(level) or []:
            domain = entry["domain"]
            if not domain.endswith(".gov.np"):
                raise ValueError(f"{domain} is not an official .gov.np domain")
            sources.append(
                {
                    "domain": domain,
                    "office": entry["office"],
                    "office_ne": entry["office_ne"],
                    "level": level,
                    "start_urls": entry.get("start_urls") or [f"https://{domain}/"],
                    "recrawl_hours": entry.get("recrawl_hours", 168),
                }
            )

    domains = [s["domain"] for s in sources]
    duplicates = {d for d in domains if domains.count(d) > 1}
    if duplicates:
        raise ValueError(f"Listed more than once: {', '.join(sorted(duplicates))}")
    return sources


def sync(conn: psycopg.Connection, sources: list[dict]) -> None:
    """Upsert every listed source and deactivate any that were removed from the registry."""
    with conn.transaction():
        for source in sources:
            conn.execute(
                """
                insert into sources (domain, office, office_ne, level, start_urls, recrawl_hours, active)
                values (%(domain)s, %(office)s, %(office_ne)s, %(level)s, %(start_urls)s, %(recrawl_hours)s, true)
                on conflict (domain) do update set
                  office = excluded.office,
                  office_ne = excluded.office_ne,
                  level = excluded.level,
                  start_urls = excluded.start_urls,
                  recrawl_hours = excluded.recrawl_hours,
                  active = true
                """,
                source,
            )
        conn.execute(
            "update sources set active = false where not (domain = any(%s))",
            ([s["domain"] for s in sources],),
        )
