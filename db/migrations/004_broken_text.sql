-- PDFs whose text layer maps Devanagari glyphs to the wrong characters; OCR reads them instead.
alter table skipped_urls drop constraint skipped_urls_reason_check;
alter table skipped_urls add constraint skipped_urls_reason_check
  check (reason in ('scanned-pdf', 'broken-text', 'legacy-font', 'too-short', 'too-large', 'error'));
