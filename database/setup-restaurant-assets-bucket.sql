-- Create storage bucket for restaurant assets (logos, images, etc.)
-- This script sets up the Supabase Storage bucket for restaurant branding assets

-- Create the bucket for restaurant assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'restaurant-assets',
  'restaurant-assets', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy to allow public read access
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Public read access for restaurant assets'
  ) THEN
    CREATE POLICY "Public read access for restaurant assets"
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'restaurant-assets');
  END IF;
END $$;

-- Create storage policy to allow authenticated insert/update/delete
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Authenticated users can upload restaurant assets'
  ) THEN
    CREATE POLICY "Authenticated users can upload restaurant assets"
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (bucket_id = 'restaurant-assets' AND auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Authenticated users can update restaurant assets'
  ) THEN
    CREATE POLICY "Authenticated users can update restaurant assets"
    ON storage.objects 
    FOR UPDATE 
    USING (bucket_id = 'restaurant-assets' AND auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Authenticated users can delete restaurant assets'
  ) THEN
    CREATE POLICY "Authenticated users can delete restaurant assets"
    ON storage.objects 
    FOR DELETE 
    USING (bucket_id = 'restaurant-assets' AND auth.role() = 'authenticated');
  END IF;
END $$;
