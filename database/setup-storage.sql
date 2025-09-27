-- Setup Supabase Storage for menu images
-- This script creates the storage bucket and policies for menu item images

-- Create storage bucket for menu images
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow public read access to menu images
CREATE POLICY "Public read access for menu images" ON storage.objects
FOR SELECT USING (bucket_id = 'menu-images');

-- Create policy to allow authenticated users to upload menu images
CREATE POLICY "Authenticated users can upload menu images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update menu images
CREATE POLICY "Authenticated users can update menu images" ON storage.objects
FOR UPDATE USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete menu images
CREATE POLICY "Authenticated users can delete menu images" ON storage.objects
FOR DELETE USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');