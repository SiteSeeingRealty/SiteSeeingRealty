-- Add city column to plots
ALTER TABLE public.plots ADD COLUMN IF NOT EXISTS city TEXT;
