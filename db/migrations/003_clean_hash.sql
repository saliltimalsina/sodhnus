-- documents.text keeps the raw extraction; chunks are built from it after lines repeated across the
-- site (menus, tickers, footers) are removed. clean_hash records which cleaned text the chunks match.
alter table documents add column clean_hash text;
