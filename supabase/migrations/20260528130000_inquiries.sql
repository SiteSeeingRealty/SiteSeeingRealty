-- Inquiries submitted from the public contact form
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fullname TEXT NOT NULL,
    phone TEXT,
    message TEXT
);

-- Expose to the Data API (RLS still governs access).
GRANT INSERT ON public.inquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiries TO authenticated;

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone (anon) may submit an inquiry...
DROP POLICY IF EXISTS "Allow public insert on inquiries" ON public.inquiries;
CREATE POLICY "Allow public insert on inquiries" ON public.inquiries
    FOR INSERT TO anon WITH CHECK (true);

-- ...but only the authenticated broker may read / manage them.
DROP POLICY IF EXISTS "Allow authenticated read on inquiries" ON public.inquiries;
CREATE POLICY "Allow authenticated read on inquiries" ON public.inquiries
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated update on inquiries" ON public.inquiries;
CREATE POLICY "Allow authenticated update on inquiries" ON public.inquiries
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated delete on inquiries" ON public.inquiries;
CREATE POLICY "Allow authenticated delete on inquiries" ON public.inquiries
    FOR DELETE TO authenticated USING (true);
