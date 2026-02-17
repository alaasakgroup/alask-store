export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      settings: {
        Row: {
          id: string
          store_name: string
          logo_url: string | null
          logo_shape: 'square' | 'circle'
          logo_position: Json
          address: string
          phone: string
          email: string
          social_links: Json
          map_location: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['settings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['settings']['Insert']>
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      products: {
        Row: {
          id: string
          name: string
          description: string
          specifications: Json
          shipping_info: string
          price: number
          discount_type: 'percentage' | 'fixed' | null
          discount_value: number
          images: string[]
          category_id: string
          stock: number
          available: boolean
          is_featured: boolean
          is_new: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_name: string
          customer_phone: string
          province: string
          address: string
          note: string | null
          items: Json
          total: number
          status: 'processing' | 'ready' | 'returned'
          admin_note: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'order_number' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      faqs: {
        Row: {
          id: string
          question: string
          answer: string
          order: number
          visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['faqs']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['faqs']['Insert']>
      }
      admin_users: {
        Row: {
          id: string
          email: string
          password_hash: string
          name: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['admin_users']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['admin_users']['Insert']>
      }
      admins: {
        Row: {
          user_id: string
          created_at: string
        }
        Insert: { user_id: string }
        Update: Partial<{ user_id: string }>
      }
    }
  }
}

// Type exports for easier use
export type Settings = Database['public']['Tables']['settings']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type FAQ = Database['public']['Tables']['faqs']['Row'];
export type AdminUser = Database['public']['Tables']['admin_users']['Row'];

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  discountType: 'percentage' | 'fixed' | null;
  discountValue: number;
  image: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface CheckoutForm {
  customerName: string;
  customerPhone: string;
  province: string;
  address: string;
  note?: string;
}

export const IRAQI_PROVINCES = [
  'بغداد',
  'البصرة',
  'نينوى',
  'أربيل',
  'النجف',
  'كربلاء',
  'ذي قار',
  'الأنبار',
  'بابل',
  'ديالى',
  'ميسان',
  'واسط',
  'صلاح الدين',
  'السليمانية',
  'دهوك',
  'المثنى',
  'القادسية',
  'كركوك'
];
