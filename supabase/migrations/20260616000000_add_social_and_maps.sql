-- Add per-property social and Google Maps link columns
ALTER TABLE public.plots ADD COLUMN IF NOT EXISTS fb_url TEXT;
ALTER TABLE public.plots ADD COLUMN IF NOT EXISTS insta_url TEXT;
ALTER TABLE public.plots ADD COLUMN IF NOT EXISTS maps_url TEXT;

-- `documents` (text[]) already exists and now stores uploaded document-image URLs.
