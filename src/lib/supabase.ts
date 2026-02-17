import { createClient } from '@supabase/supabase-js';

// استبدل هذه القيم بمعلومات Supabase الخاصة بك
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create Supabase client if valid credentials are provided
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

export const supabase = (isValidUrl(supabaseUrl) && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Mock data for development (will be replaced with real Supabase data)
export const mockData = {
  settings: {
    storeName: 'الأسك كروب',
    logoUrl: null,
    logoShape: 'square' as 'square' | 'circle',
    logoPosition: { x: 0, y: 0, scale: 1 },
    address: 'بغداد، العراق',
    phone: '+964 770 123 4567',
    email: 'info@alask-group.com',
    socialLinks: {
      facebook: '',
      instagram: '',
      whatsapp: ''
    },
    mapLocation: ''
  },
  
  categories: [
    { id: '1', name: 'منظمات المطبخ', slug: 'organizers' },
    { id: '2', name: 'أدوات التحضير', slug: 'prep-tools' },
    { id: '3', name: 'أدوات التقديم', slug: 'serving' },
    { id: '4', name: 'التخزين', slug: 'storage' },
    { id: '5', name: 'إكسسوارات الطبخ', slug: 'cooking-accessories' }
  ],

  products: [
    {
      id: '1',
      name: 'منظم أدراج المطبخ - قابل للتعديل',
      description: 'منظم أدراج عملي قابل للتعديل حسب حجم الدرج، مصنوع من مواد عالية الجودة',
      price: 45000,
      discountType: null,
      discountValue: 0,
      images: ['https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800'],
      categoryId: '1',
      stock: 25,
      available: true,
      isFeatured: true,
      isNew: false,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'طقم سكاكين احترافي 5 قطع',
      description: 'طقم سكاكين احترافي من الفولاذ المقاوم للصدأ مع حامل خشبي أنيق',
      price: 120000,
      discountType: 'percentage',
      discountValue: 15,
      images: ['https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800'],
      categoryId: '2',
      stock: 15,
      available: true,
      isFeatured: true,
      isNew: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'طقم صحون تقديم سيراميك',
      description: 'طقم صحون تقديم فاخر من السيراميك بتصميم عصري، 6 قطع',
      price: 85000,
      discountType: 'fixed',
      discountValue: 10000,
      images: ['https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800'],
      categoryId: '3',
      stock: 30,
      available: true,
      isFeatured: true,
      isNew: false,
      createdAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'علب تخزين زجاجية - 3 أحجام',
      description: 'مجموعة علب تخزين زجاجية محكمة الإغلاق بأحجام مختلفة',
      price: 35000,
      discountType: null,
      discountValue: 0,
      images: ['https://images.unsplash.com/photo-1584990347449-39f154baa789?w=800'],
      categoryId: '4',
      stock: 8,
      available: true,
      isFeatured: false,
      isNew: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '5',
      name: 'مجموعة ملاعق قياس ملونة',
      description: 'مجموعة ملاعق قياس بألوان زاهية مع حلقة تعليق',
      price: 18000,
      discountType: null,
      discountValue: 0,
      images: ['https://images.unsplash.com/photo-1556910638-92e0c42c0ee5?w=800'],
      categoryId: '2',
      stock: 40,
      available: true,
      isFeatured: false,
      isNew: true,
      createdAt: new Date().toISOString()
    }
  ],

  faqs: [
    {
      id: '1',
      question: 'كيف يمكنني تقديم طلب؟',
      answer: 'يمكنك إضافة المنتجات إلى السلة ثم الانتقال إلى صفحة إتمام الطلب وتعبئة البيانات المطلوبة.',
      order: 1,
      visible: true
    },
    {
      id: '2',
      question: 'ما هي مدة التوصيل؟',
      answer: 'عادة يتم التوصيل خلال 2-3 أيام عمل داخل بغداد، و3-5 أيام للمحافظات الأخرى.',
      order: 2,
      visible: true
    },
    {
      id: '3',
      question: 'هل يمكنني إرجاع المنتج؟',
      answer: 'نعم، يمكنك إرجاع المنتج خلال 7 أيام من تاريخ الاستلام إذا كان بحالته الأصلية.',
      order: 3,
      visible: true
    },
    {
      id: '4',
      question: 'ما هي طرق الدفع المتاحة؟',
      answer: 'الدفع عند الاستلام هو الطريقة الوحيدة المتاحة حالياً.',
      order: 4,
      visible: true
    },
    {
      id: '5',
      question: 'هل المنتجات مضمونة؟',
      answer: 'نعم، جميع منتج��تنا أصلية ومضمونة 100%.',
      order: 5,
      visible: true
    }
  ]
};