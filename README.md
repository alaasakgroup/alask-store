# متجر الأسك كروب - متجر إلكتروني عربي RTL

متجر إلكتروني متكامل لإكسسوارات المطبخ مع لوحة تحكم إدارية شاملة، مبني بـ React + TypeScript + Supabase.

## المميزات الرئيسية

### 🛍️ واجهة المتجر (Storefront)
- **واجهة عربية كاملة RTL** - جميع النصوص والتخطيطات بالعربية
- **عرض دوّار تلقائي للمنتجات المميزة** (Hero Carousel) مع انتقالات سلسة
- **أقسام منتجات متعددة**: الأكثر طلباً، وصل حديثاً
- **نظام خصومات مرن**: نسبة مئوية أو مبلغ ثابت
- **سلة تسوق ديناميكية** مع حفظ تلقائي
- **نظام طلبات كامل** مع تتبع الحالة
- **صفحة أسئلة شائعة** قابلة للإدارة
- **فوتر ديناميكي** مع روابط اجتماعية وخريطة Google

### 🔧 لوحة التحكم الإدارية
- **تسجيل دخول آمن** للمسؤولين
- **إدارة الطلبات الكاملة**:
  - عرض حسب الحالة (قيد التجهيز، مجهز، راجع)
  - تغيير حالة الطلبات
  - إضافة ملاحظات إدارية
  - طباعة فواتير احترافية
- **إدارة المنتجات**:
  - إضافة/تعديل/حذف المنتجات
  - نظام خصومات متقدم مع معاينة فورية
  - رفع صور متعددة
  - إدارة المخزون
- **إدارة العلامة التجارية**:
  - تغيير اسم المتجر (يظهر في كل الصفحات)
  - رفع الشعار مع خيارات:
    - اختيار الشكل (مربع/دائري)
    - تحريك وتكبير/تصغير الشعار
    - حذف/استبدال الشعار
- **إدارة المحتوى الكامل** (CMS):
  - تعديل معلومات التواصل
  - روابط وسائل التواصل الاجتماعي
  - إدارة الأسئلة الشائعة (إضافة/تعديل/حذف/إخفاء)

## التقنيات المستخدمة

- **React 18.3** - مكتبة واجهة المستخدم
- **TypeScript** - للكتابة الآمنة
- **React Router 7** - للتوجيه
- **Tailwind CSS 4** - للتنسيق
- **Zustand** - لإدارة الحالة
- **Radix UI** - مكونات واجهة المستخدم
- **Supabase** - قاعدة البيانات والمصادقة
- **Lucide React** - الأيقونات
- **Sonner** - إشعارات Toast

## البدء

### المتطلبات الأساسية
- Node.js 18+ و pnpm

### التثبيت

```bash
# تثبيت الحزم
pnpm install

# تشغيل خادم التطوير
pnpm dev
```

### إعداد Supabase

1. أنشئ مشروع Supabase جديد على [supabase.com](https://supabase.com)

2. أنشئ ملف `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. قم بتشغيل SQL التالي في محرر SQL بـ Supabase لإنشاء الجداول:

```sql
-- Settings Table
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_name TEXT NOT NULL,
  logo_url TEXT,
  logo_shape TEXT CHECK (logo_shape IN ('square', 'circle')) DEFAULT 'square',
  logo_position JSONB DEFAULT '{"x": 0, "y": 0, "scale": 1}',
  address TEXT,
  phone TEXT,
  email TEXT,
  social_links JSONB DEFAULT '{}',
  map_location TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC DEFAULT 0,
  images TEXT[] NOT NULL,
  category_id UUID REFERENCES categories(id),
  stock INTEGER DEFAULT 0,
  available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  province TEXT NOT NULL,
  address TEXT NOT NULL,
  note TEXT,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('processing', 'ready', 'returned')) DEFAULT 'processing',
  admin_note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- FAQs Table
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Admin Users Table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (store_name, address, phone, email)
VALUES ('الأسك كروب', 'بغداد، العراق', '+964 770 123 4567', 'info@alask-group.com');

-- Insert default categories
INSERT INTO categories (name, slug) VALUES
('منظمات المطبخ', 'organizers'),
('أدوات التحضير', 'prep-tools'),
('أدوات التقديم', 'serving'),
('التخزين', 'storage'),
('إكسسوارات الطبخ', 'cooking-accessories');
```

## بيانات الدخول الافتراضية للإدارة

```
البريد الإلكتروني: admin@alask.com
كلمة المرور: admin123
```

> **ملاحظة**: في الوضع التجريبي الحالي، يتم استخدام بيانات وهمية (mock data). قم بتوصيل Supabase للحصول على قاعدة بيانات حقيقية.

## هيكل المشروع

```
src/
├── app/
│   ├── App.tsx              # التطبيق الرئيسي
│   └── components/          # مكونات واجهة المستخدم
├── components/
│   ├── storefront/          # مكونات واجهة المتجر
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroCarousel.tsx
│   │   └── ProductCard.tsx
│   └── admin/               # مكونات لوحة التحكم
│       └── AdminLayout.tsx
├── pages/                   # صفحات التطبيق
│   ├── Home.tsx
│   ├── ProductDetail.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   └── admin/               # صفحات الإدارة
│       ├── Dashboard.tsx
│       ├── Orders.tsx
│       ├── Products.tsx
│       └── Settings.tsx
├── lib/                     # المكتبات والأدوات
│   ├── supabase.ts         # إعداد Supabase
│   ├── api.ts              # API calls
│   ├── store.ts            # Zustand store
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # دوال مساعدة
├── routes.ts               # إعداد React Router
└── styles/                 # ملفات CSS
```

## الميزات الإدارية المتقدمة

### نظام الخصومات
- دعم نوعين من الخصومات:
  1. **نسبة مئوية** (مثال: خصم 15%)
  2. **مبلغ ثابت** (مثال: خصم 10,000 د.ع)
- معاينة فورية للسعر الجديد عند إضافة خصم
- عرض شارة الخصم في بطاقات المنتجات

### إدارة الشعار
- رفع صورة الشعار
- اختيار شكل العرض (مربع أو دائري)
- أدوات تحريك وتكبير/تصغير الشعار
- معاينة مباشرة للشعار في جميع الصفحات

### طباعة الفواتير
- تصميم فاتورة احترافي بصيغة A4
- يتضمن:
  - شعار المتجر واسمه
  - رقم الطلب والتاريخ
  - معلومات الزبون الكاملة
  - جدول المنتجات مع الأسعار
  - الإجمالي النهائي
  - ملاحظة الزبون (إذا وُجدت)

## التخصيص

### تغيير ألوان الموقع
عدّل ملف `/src/styles/theme.css` لتغيير نظام الألوان.

### إضافة تصنيفات جديدة
استخدم لوحة التحكم أو أضف مباشرة في قاعدة بيانات Supabase.

### تعديل المحافظات العراقية
عدّل المصفوفة `IRAQI_PROVINCES` في `/src/lib/types.ts`.

## الإنتاج

```bash
# بناء المشروع
pnpm build

# معاينة البناء
pnpm preview
```

## الدعم الفني

للأسئلة أو المشاكل التقنية، يرجى فتح issue في المستودع.

## الترخيص

هذا المشروع مفتوح المصدر ومتاح للاستخدام التجاري والشخصي.

---

تم التطوير بـ ❤️ للمتاجر العربية
