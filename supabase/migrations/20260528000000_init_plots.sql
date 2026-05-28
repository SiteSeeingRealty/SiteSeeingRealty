-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create plots table
CREATE TABLE IF NOT EXISTS public.plots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    size TEXT NOT NULL,
    price TEXT NOT NULL,
    lat NUMERIC NOT NULL,
    lng NUMERIC NOT NULL,
    image TEXT,
    gallery TEXT[],
    description TEXT,
    documents TEXT[]
);

-- Explicitly expose the table to the Data API (PostgREST / supabase-js).
-- Required for projects created on/after 2026-05-30, where public-schema
-- tables are no longer auto-granted. RLS policies below still govern access.
GRANT SELECT ON public.plots TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plots TO authenticated;

-- Enable Row Level Security
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;

-- Plots policies (drop-then-create for idempotent re-runs)
DROP POLICY IF EXISTS "Allow public read access on plots" ON public.plots;
CREATE POLICY "Allow public read access on plots" ON public.plots
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert plots" ON public.plots;
CREATE POLICY "Allow authenticated users to insert plots" ON public.plots
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to update plots" ON public.plots;
CREATE POLICY "Allow authenticated users to update plots" ON public.plots
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users to delete plots" ON public.plots;
CREATE POLICY "Allow authenticated users to delete plots" ON public.plots
    FOR DELETE TO authenticated USING (true);

-- Create storage bucket for plot-images
INSERT INTO storage.buckets (id, name, public) VALUES ('plot-images', 'plot-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for plot-images (drop-then-create for idempotent re-runs)
DROP POLICY IF EXISTS "Allow public read access on plot-images" ON storage.objects;
CREATE POLICY "Allow public read access on plot-images" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'plot-images');

DROP POLICY IF EXISTS "Allow authenticated users to upload plot-images" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload plot-images" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'plot-images');

DROP POLICY IF EXISTS "Allow authenticated users to update plot-images" ON storage.objects;
CREATE POLICY "Allow authenticated users to update plot-images" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'plot-images') WITH CHECK (bucket_id = 'plot-images');

DROP POLICY IF EXISTS "Allow authenticated users to delete plot-images" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete plot-images" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'plot-images');
