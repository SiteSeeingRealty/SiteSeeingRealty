-- Per-property spec fields so the broker can edit each detail on its own line
-- in the dashboard instead of maintaining one hand-written paragraph.
-- Dimension reuses the existing `size` column; `city` still drives the map filter.
ALTER TABLE public.plots ADD COLUMN IF NOT EXISTS site_no TEXT;
ALTER TABLE public.plots ADD COLUMN IF NOT EXISTS facing TEXT;
ALTER TABLE public.plots ADD COLUMN IF NOT EXISTS location_text TEXT;
ALTER TABLE public.plots ADD COLUMN IF NOT EXISTS contact TEXT;
