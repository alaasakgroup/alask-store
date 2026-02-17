-- =============================================
-- Supabase Storage Setup for Product Images
-- =============================================
-- Run this in your Supabase SQL Editor

-- 1. Create a storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,  -- Public bucket (images can be viewed without auth)
  5242880,  -- 5MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- 2. Create policy to allow public read access
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- 3. Create policy to allow authenticated users (admins) to upload
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- 4. Create policy to allow authenticated users (admins) to update
CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images');

-- 5. Create policy to allow authenticated users (admins) to delete
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');

-- =============================================
-- IMPORTANT: Run this SQL in Supabase Dashboard
-- Go to: SQL Editor > New Query > Paste & Run
-- =============================================
