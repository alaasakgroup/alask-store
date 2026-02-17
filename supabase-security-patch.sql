-- ==========================================================
-- PATCH: Secure RLS + Admin role for Alask Store (Supabase)
-- ==========================================================

-- 1) Admins table (links to Supabase Auth users)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins a
    WHERE a.user_id = auth.uid()
  );
$$;

-- Keep admins table locked down (optional policies)
-- Admins can see/manage admin list; non-admin can't.
DROP POLICY IF EXISTS "Admins can read admins" ON public.admins;
CREATE POLICY "Admins can read admins"
ON public.admins
FOR SELECT
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage admins" ON public.admins;
CREATE POLICY "Admins can manage admins"
ON public.admins
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 2) Fix dangerous dev policies (drop old ones)
-- ----------------------------------------------------------
-- settings
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.settings;

-- categories
DROP POLICY IF EXISTS "Allow all for authenticated on categories" ON public.categories;

-- products
DROP POLICY IF EXISTS "Allow all for authenticated on products" ON public.products;

-- orders
DROP POLICY IF EXISTS "Allow all for authenticated on orders" ON public.orders;

-- faqs
DROP POLICY IF EXISTS "Allow all for authenticated on faqs" ON public.faqs;

-- 3) Ensure RLS enabled (idempotent)
-- ----------------------------------------------------------
ALTER TABLE public.settings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs       ENABLE ROW LEVEL SECURITY;

-- If you keep admin_users table, lock it down too
-- (Recommended: use Supabase Auth instead of password_hash in DB)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 4) Public read policies (storefront)
-- ----------------------------------------------------------
-- settings: public can read
DROP POLICY IF EXISTS "Public can read settings" ON public.settings;
CREATE POLICY "Public can read settings"
ON public.settings
FOR SELECT
USING (true);

-- categories: public can read
DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
CREATE POLICY "Public can read categories"
ON public.categories
FOR SELECT
USING (true);

-- products: public can read only available=true
DROP POLICY IF EXISTS "Public can read products" ON public.products;
CREATE POLICY "Public can read products"
ON public.products
FOR SELECT
USING (available = true);

-- faqs: public can read only visible=true
DROP POLICY IF EXISTS "Public can read visible FAQs" ON public.faqs;
CREATE POLICY "Public can read visible FAQs"
ON public.faqs
FOR SELECT
USING (visible = true);

-- 5) Orders: public can INSERT only (no read/update/delete)
-- ----------------------------------------------------------
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
CREATE POLICY "Public can create orders"
ON public.orders
FOR INSERT
WITH CHECK (
  -- force public to create only processing orders and no admin_note
  status = 'processing'
  AND admin_note IS NULL
);

-- Important: NO public SELECT policy on orders (so customers can't read all orders)

-- 6) Admin full access policies (admin only)
-- ----------------------------------------------------------
-- settings
DROP POLICY IF EXISTS "Admin can manage settings" ON public.settings;
CREATE POLICY "Admin can manage settings"
ON public.settings
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- categories
DROP POLICY IF EXISTS "Admin can manage categories" ON public.categories;
CREATE POLICY "Admin can manage categories"
ON public.categories
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- products
DROP POLICY IF EXISTS "Admin can manage products" ON public.products;
CREATE POLICY "Admin can manage products"
ON public.products
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- orders (admin can read/update statuses/notes/print data)
DROP POLICY IF EXISTS "Admin can manage orders" ON public.orders;
CREATE POLICY "Admin can manage orders"
ON public.orders
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- faqs
DROP POLICY IF EXISTS "Admin can manage faqs" ON public.faqs;
CREATE POLICY "Admin can manage faqs"
ON public.faqs
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- admin_users (if kept): admin only
DROP POLICY IF EXISTS "Admin can manage admin_users" ON public.admin_users;
CREATE POLICY "Admin can manage admin_users"
ON public.admin_users
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 7) (Optional but recommended) tighten discount constraints in products
-- ----------------------------------------------------------
-- Ensure percentage discount isn't > 100
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='products' AND column_name='discount_type'
  ) THEN
    -- Add a stricter CHECK using a new constraint name (safe if rerun)
    BEGIN
      ALTER TABLE public.products
      ADD CONSTRAINT products_discount_percentage_max
      CHECK (
        discount_type IS DISTINCT FROM 'percentage'
        OR discount_value <= 100
      );
    EXCEPTION
      WHEN duplicate_object THEN
        -- constraint already exists, ignore
        NULL;
    END;
  END IF;
END $$;

-- ==========================================================
-- HOW TO ADD YOUR FIRST ADMIN
-- 1) Create/login user in Supabase Auth (Dashboard).
-- 2) Copy that user's UUID.
-- 3) Run:
--    INSERT INTO public.admins (user_id) VALUES ('<AUTH_USER_UUID>');
-- ==========================================================
