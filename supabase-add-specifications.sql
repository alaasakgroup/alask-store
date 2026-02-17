-- Add specifications and shipping_info columns to products table
-- Run this in Supabase SQL Editor

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '[]'::jsonb;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS shipping_info TEXT DEFAULT '';

-- Update existing products to have empty specifications array
UPDATE products 
SET specifications = '[]'::jsonb 
WHERE specifications IS NULL;

-- Update existing products to have empty shipping_info
UPDATE products 
SET shipping_info = '' 
WHERE shipping_info IS NULL;
