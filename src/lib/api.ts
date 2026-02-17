import { supabase } from './supabase';
import type { Settings, Product, Order, FAQ, Category, CheckoutForm, OrderItem } from './types';
import { generateOrderNumber } from './utils';

function getClient() {
  if (!supabase) throw new Error('لم يتم إعداد الاتصال بقاعدة البيانات');
  return supabase;
}

class SupabaseAPI {
  // ==================== Settings ====================
  async getSettings() {
    const sb = getClient();
    const { data, error } = await sb.from('settings').select('*').single();
    
    // Return default settings if none exist
    if (error || !data) {
      return {
        id: '',
        store_name: 'الأسك كروب',
        logo_url: null,
        logo_shape: 'square' as const,
        logo_position: { x: 0, y: 0, scale: 1 },
        address: 'بغداد، العراق',
        phone: '+964 770 000 0000',
        email: 'info@store.com',
        social_links: {},
        map_location: '',
        created_at: '',
        updated_at: ''
      } as Settings;
    }
    return data as Settings;
  }

  async updateSettings(updates: Partial<Settings>) {
    const sb = getClient();
    // Get the single settings row first
    const { data: current } = await sb.from('settings').select('id').single();
    if (!current) throw new Error('لا توجد إعدادات');

    const { data, error } = await sb
      .from('settings')
      .update(updates as any)
      .eq('id', current.id)
      .select()
      .single();
    if (error) throw new Error('فشل في تحديث الإعدادات');
    return data as Settings;
  }

  // ==================== Products ====================
  async getProducts(filters?: { categoryId?: string; featured?: boolean; isNew?: boolean }) {
    const sb = getClient();
    let query = sb.from('products').select('*');

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    if (filters?.featured) {
      query = query.eq('is_featured', true);
    }
    if (filters?.isNew) {
      query = query.eq('is_new', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error('فشل في جلب المنتجات');
    return (data || []) as Product[];
  }

  async getProduct(id: string) {
    const sb = getClient();
    const { data, error } = await sb.from('products').select('*').eq('id', id).single();
    if (error) return null;
    return data as Product;
  }

  async createProduct(product: {
    name: string;
    description: string;
    price: number;
    discount_type: 'percentage' | 'fixed' | null;
    discount_value: number;
    images: string[];
    category_id: string;
    stock: number;
    available: boolean;
    is_featured: boolean;
    is_new: boolean;
  }) {
    const sb = getClient();
    const { data, error } = await sb.from('products').insert(product as any).select().single();
    if (error) throw new Error('فشل في إنشاء المنتج: ' + error.message);
    return data as Product;
  }

  async updateProduct(id: string, updates: Partial<Product>) {
    const sb = getClient();
    const { data, error } = await sb
      .from('products')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error('فشل في تحديث المنتج: ' + error.message);
    return data as Product;
  }

  async deleteProduct(id: string) {
    const sb = getClient();
    const { error } = await sb.from('products').delete().eq('id', id);
    if (error) throw new Error('فشل في حذف المنتج');
    return true;
  }

  // ==================== Image Upload ====================
  async uploadProductImage(file: File): Promise<string> {
    const sb = getClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error } = await sb.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw new Error('فشل في رفع الصورة: ' + error.message);

    const { data: urlData } = sb.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  async uploadMultipleImages(files: File[]): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
      const url = await this.uploadProductImage(file);
      urls.push(url);
    }
    return urls;
  }

  async deleteProductImage(imageUrl: string): Promise<boolean> {
    const sb = getClient();
    // Extract file path from URL
    const urlParts = imageUrl.split('/product-images/');
    if (urlParts.length < 2) return false;
    
    const filePath = urlParts[1];
    const { error } = await sb.storage
      .from('product-images')
      .remove([filePath]);

    if (error) throw new Error('فشل في حذف الصورة');
    return true;
  }

  // ==================== Categories ====================
  async getCategories() {
    const sb = getClient();
    const { data, error } = await sb.from('categories').select('*').order('name');
    if (error) throw new Error('فشل في جلب التصنيفات');
    return (data || []) as Category[];
  }

  async createCategory(category: { name: string; slug: string }) {
    const sb = getClient();
    const { data, error } = await sb.from('categories').insert(category as any).select().single();
    if (error) throw new Error('فشل في إنشاء التصنيف: ' + error.message);
    return data as Category;
  }

  async updateCategory(id: string, updates: Partial<Category>) {
    const sb = getClient();
    const { data, error } = await sb
      .from('categories')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error('فشل في تحديث التصنيف: ' + error.message);
    return data as Category;
  }

  async deleteCategory(id: string) {
    const sb = getClient();
    const { error } = await sb.from('categories').delete().eq('id', id);
    if (error) throw new Error('فشل في حذف التصنيف: ' + error.message);
    return true;
  }

  // ==================== FAQs ====================
  async getFAQs(visibleOnly = false) {
    const sb = getClient();
    let query = sb.from('faqs').select('*');
    if (visibleOnly) {
      query = query.eq('visible', true);
    }
    const { data, error } = await query.order('order', { ascending: true });
    if (error) throw new Error('فشل في جلب الأسئلة الشائعة');
    return (data || []) as FAQ[];
  }

  async createFAQ(faq: { question: string; answer: string; order: number; visible: boolean }) {
    const sb = getClient();
    const { data, error } = await sb.from('faqs').insert(faq as any).select().single();
    if (error) throw new Error('فشل في إنشاء السؤال: ' + error.message);
    return data as FAQ;
  }

  async updateFAQ(id: string, updates: Partial<FAQ>) {
    const sb = getClient();
    const { data, error } = await sb
      .from('faqs')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error('فشل في تحديث السؤال: ' + error.message);
    return data as FAQ;
  }

  async deleteFAQ(id: string) {
    const sb = getClient();
    const { error } = await sb.from('faqs').delete().eq('id', id);
    if (error) throw new Error('فشل في حذف السؤال');
    return true;
  }

  // ==================== Orders ====================
  async createOrder(formData: CheckoutForm, items: OrderItem[], total: number) {
    const sb = getClient();
    const { data, error } = await sb
      .from('orders')
      .insert({
        order_number: generateOrderNumber(),
        customer_name: formData.customerName,
        customer_phone: formData.customerPhone,
        province: formData.province,
        address: formData.address,
        note: formData.note || null,
        items: items as any,
        total,
        status: 'processing' as const,
        admin_note: null,
      })
      .select()
      .single();
    if (error) throw new Error('فشل في إنشاء الطلب: ' + error.message);
    return data as Order;
  }

  async getOrders(status?: Order['status']) {
    const sb = getClient();
    let query = sb.from('orders').select('*');
    if (status) {
      query = query.eq('status', status);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error('فشل في جلب الطلبات');
    return (data || []) as Order[];
  }

  async getOrder(id: string) {
    const sb = getClient();
    const { data, error } = await sb.from('orders').select('*').eq('id', id).single();
    if (error) return null;
    return data as Order;
  }

  async updateOrder(id: string, updates: Partial<Order>) {
    const sb = getClient();
    const { data, error } = await sb
      .from('orders')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error('فشل في تحديث الطلب: ' + error.message);
    return data as Order;
  }

  // ==================== Admin Auth ====================
  async adminLogin(email: string, password: string) {
    const sb = getClient();

    const { data: authData, error: authError } = await sb.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    const { data: adminRow, error: adminError } = await sb
      .from('admins')
      .select('user_id')
      .eq('user_id', authData.user.id)
      .single();

    if (adminError || !adminRow) {
      await sb.auth.signOut();
      throw new Error('ليس لديك صلاحيات الدخول كمدير');
    }

    return { success: true, email: authData.user.email! };
  }

  async adminLogout() {
    const sb = getClient();
    await sb.auth.signOut();
  }
}

export const api = new SupabaseAPI();
