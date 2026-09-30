"""Language, date and chunking helpers for text taken from official pages."""

import datetime
import re

import nepali_datetime

DEVANAGARI = re.compile(r"[ऀ-ॿ]")
LATIN = re.compile(r"[A-Za-z]")
NEPALI_DIGITS = str.maketrans("०१२३४५६७८९", "0123456789")
# Sequences that cannot occur in real Devanagari: a virama or vowel sign followed by another vowel sign.
# PDFs with broken font mappings produce them constantly ("प्रयोगकर्ाा" for "प्रयोगकर्ता").
IMPOSSIBLE = re.compile(r"[\u093E-\u094D][\u093E-\u094C]")
# Bikram Sambat years 2060-2099 (AD 2003-2043), written 2083-06-14, 2083/6/14 or २०८३.०६.१४.
BS_DATE = re.compile(r"(20[6-9]\d)\s*[-/.]\s*(\d{1,2})\s*[-/.]\s*(\d{1,2})")


def detect_lang(text: str) -> str:
    devanagari = len(DEVANAGARI.findall(text))
    latin = len(LATIN.findall(text))
    if devanagari + latin == 0:
        return "mixed"
    share = devanagari / (devanagari + latin)
    return "ne" if share > 0.7 else "en" if share < 0.3 else "mixed"


def broken_devanagari(text: str) -> bool:
    """True when a text layer is garbled enough that OCR will read the document better."""
    letters = len(DEVANAGARI.findall(text))
    return letters >= 200 and len(IMPOSSIBLE.findall(text)) / letters > 0.005


def find_bs_date(text: str) -> tuple[str | None, datetime.date | None]:
    """The first valid Bikram Sambat date near the top of a page, as printed and in AD."""
    head = text[:3000]
    for match in BS_DATE.finditer(head.translate(NEPALI_DIGITS)):
        year, month, day = map(int, match.groups())
        try:
            ad = nepali_datetime.date(year, month, day).to_datetime_date()
        except ValueError:
            continue
        return head[match.start() : match.end()], ad
    return None, None


def chunk(title: str | None, text: str, size: int = 1200) -> list[str]:
    """Pack paragraphs into passages of about `size` characters, each prefixed with the page title."""
    pieces: list[str] = []
    for paragraph in (p.strip() for p in text.split("\n")):
        while len(paragraph) > size:
            cut = paragraph.rfind(" ", 0, size)
            cut = cut if cut > size // 2 else size
            pieces.append(paragraph[:cut])
            paragraph = paragraph[cut:].strip()
        if paragraph:
            pieces.append(paragraph)

    chunks: list[str] = []
    current = ""
    for piece in pieces:
        if current and len(current) + len(piece) + 1 > size:
            chunks.append(current)
            current = piece
        else:
            current = f"{current}\n{piece}" if current else piece
    if current:
        chunks.append(current)

    prefix = f"{title.strip()}\n" if title and title.strip() else ""
    return [prefix + c for c in chunks]
