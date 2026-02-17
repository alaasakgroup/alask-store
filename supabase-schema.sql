-- ==========================================
-- Supabase Database Schema for Alask Store
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. Settings Table
-- ==========================================
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_name TEXT NOT NULL DEFAULT 'الأسك كروب',
  logo_url TEXT,
  logo_shape TEXT CHECK (logo_shape IN ('square', 'circle')) DEFAULT 'square',
  logo_position JSONB DEFAULT '{"x": 0, "y": 0, "scale": 1}'::jsonb,
  address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  social_links JSONB DEFAULT '{}'::jsonb,
  map_location TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ==========================================
-- 2. Categories Table
-- ==========================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ==========================================
-- 3. Products Table
-- ==========================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed', NULL)),
  discount_value NUMERIC(10, 2) DEFAULT 0 CHECK (discount_value >= 0),
  images TEXT[] NOT NULL DEFAULT '{}',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index for faster queries
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_new ON products(is_new) WHERE is_new = true;

-- ==========================================
-- 4. Orders Table
-- ==========================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  province TEXT NOT NULL,
  address TEXT NOT NULL,
  note TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  status TEXT CHECK (status IN ('processing', 'ready', 'returned')) DEFAULT 'processing',
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index for order queries
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- ==========================================
-- 5. FAQs Table
-- ==========================================
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index for FAQ ordering
CREATE INDEX idx_faqs_order ON faqs("order");

-- ==========================================
-- 6. Admin Users Table (for authentication)
-- ==========================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ==========================================
-- Triggers for updated_at
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- Initial Data
-- ==========================================

-- Insert default settings
INSERT INTO settings (store_name, address, phone, email, social_links)
VALUES (
  'الأسك كروب',
  'بغداد، العراق',
  '+964 770 123 4567',
  'info@alask-group.com',
  '{"facebook": "", "instagram": "", "whatsapp": ""}'::jsonb
);

-- Insert categories
INSERT INTO categories (name, slug) VALUES
  ('منظمات المطبخ', 'organizers'),
  ('أدوات التحضير', 'prep-tools'),
  ('أدوات التقديم', 'serving'),
  ('التخزين', 'storage'),
  ('إكسسوارات الطبخ', 'cooking-accessories');

-- Insert sample products (optional)
WITH cat AS (SELECT id FROM categories WHERE slug = 'organizers' LIMIT 1)
INSERT INTO products (name, description, price, images, category_id, stock, is_featured)
SELECT 
  'منظم أدراج المطبخ - قابل للتعديل',
  'منظم أدراج عملي قابل للتعديل حسب حجم الدرج، مصنوع من مواد عالية الجودة',
  45000,
  ARRAY['https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800'],
  cat.id,
  25,
  true
FROM cat;

-- Insert sample FAQs
INSERT INTO faqs (question, answer, "order", visible) VALUES
  ('كيف يمكنني تقديم طلب؟', 'يمكنك إضافة المنتجات إلى السلة ثم الانتقال إلى صفحة إتمام الطلب وتعبئة البيانات المطلوبة.', 1, true),
  ('ما هي مدة التوصيل؟', 'عادة يتم التوصيل خلال 2-3 أيام عمل داخل بغداد، و3-5 أيام للمحافظات الأخرى.', 2, true),
  ('هل يمكنني إرجاع المنتج؟', 'نعم، يمكنك إرجاع المنتج خلال 7 أيام من تاريخ الاستلام إذا كان بحالته الأصلية.', 3, true),
  ('ما هي طرق الدفع المتاحة؟', 'الدفع عند الاستلام هو الطريقة الوحيدة المتاحة حالياً.', 4, true),
  ('هل المنتجات مضمونة؟', 'نعم، جميع منتجاتنا أصلية ومضمونة 100%.', 5, true);

-- ==========================================
-- Row Level Security (RLS) Policies
-- ==========================================

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Public read access for storefront
CREATE POLICY "Public can read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can read products" ON products FOR SELECT USING (available = true);
CREATE POLICY "Public can read visible FAQs" ON faqs FOR SELECT USING (visible = true);

-- Public can create orders
CREATE POLICY "Public can create orders" ON orders FOR INSERT WITH CHECK (true);

-- Admin full access (you'll need to implement proper auth)
-- For now, allow all operations for development
CREATE POLICY "Allow all for authenticated" ON settings FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated on categories" ON categories FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated on products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated on orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated on faqs" ON faqs FOR ALL USING (true);

-- ==========================================
-- Storage Bucket for Product Images (Optional)
-- ==========================================
-- Run this in the Storage section of Supabase Dashboard:
-- 1. Create a bucket called "product-images"
-- 2. Make it public
-- 3. Set MIME types: image/*

-- ==========================================
-- Helpful Queries
-- ==========================================

-- Get all orders with their items
-- SELECT 
--   o.order_number,
--   o.customer_name,
--   o.total,
--   o.status,
--   o.items
-- FROM orders o
-- ORDER BY o.created_at DESC;

-- Get low stock products
-- SELECT name, stock FROM products WHERE stock < 10 ORDER BY stock ASC;

-- Get featured products
-- SELECT * FROM products WHERE is_featured = true AND available = true;

-- ==========================================
-- END OF SCHEMA
-- ==========================================
