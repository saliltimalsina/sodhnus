import datetime

from sodhnus.crawl import allowed, boilerplate, priority
from sodhnus.text import chunk, detect_lang, find_bs_date


def test_nepali_digits_date_converts_to_ad():
    assert find_bs_date("मिति: २०८३/०६/१४ गते") == ("२०८३/०६/१४", datetime.date(2026, 9, 30))


def test_invalid_bs_date_is_skipped_for_the_next_valid_one():
    assert find_bs_date("2083-13-40 then 2082.5.3")[1] == datetime.date(2025, 8, 19)


def test_detect_lang():
    assert detect_lang("नेपाल सरकार") == "ne"
    assert detect_lang("Government of Nepal") == "en"


def test_chunks_stay_near_size_and_carry_title():
    chunks = chunk("Title", "word " * 1000 + "\nshort")
    assert all(c.startswith("Title\n") and len(c) <= 1210 for c in chunks)


def test_boilerplate_is_lines_repeated_across_pages():
    pages = [f"Menu\nHome\nUnique page {i}" for i in range(10)]
    assert boilerplate(pages) == {"Menu", "Home"}


def test_pdfs_on_other_gov_hosts_are_allowed_but_not_their_pages():
    assert allowed("https://giwmscdnone.gov.np/media/a.pdf", "dotm.gov.np")
    assert not allowed("https://giwmscdnone.gov.np/media/page", "dotm.gov.np")
    assert not allowed("https://example.com/a.pdf", "dotm.gov.np")
    assert allowed("https://www.dotm.gov.np/x", "dotm.gov.np")


def test_charters_are_crawled_before_ordinary_pages():
    assert priority("https://x.gov.np/pages/citizen-charter", "", 1) < priority("https://x.gov.np/about", "", 1)


def test_garbled_devanagari_is_detected():
    from sodhnus.text import broken_devanagari

    garbled = "प्रणालीमा रहने प्रयोगकर्ाा सम्बन्धमा मालपोर् कायाालयमा प्रयोगकर्ााहरु " * 10
    clean = "राहदानी नवीकरणका लागि पुरानो राहदानी र नागरिकताको प्रतिलिपि चाहिन्छ। " * 10
    assert broken_devanagari(garbled)
    assert not broken_devanagari(clean)
