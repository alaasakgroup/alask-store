import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Product } from './types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(item => item.productId === product.id);
          
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.productId === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            };
          }
          
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                name: product.name,
                price: product.price,
                discountType: product.discount_type,
                discountValue: product.discount_value,
                image: product.images[0],
                quantity
              }
            ]
          };
        });
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(item => item.productId !== productId)
        }));
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        set((state) => ({
          items: state.items.map(item =>
            item.productId === productId
              ? { ...item, quantity }
              : item
          )
        }));
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          let itemPrice = item.price;
          
          if (item.discountType === 'percentage') {
            itemPrice = item.price * (1 - item.discountValue / 100);
          } else if (item.discountType === 'fixed') {
            itemPrice = item.price - item.discountValue;
          }
          
          return total + (itemPrice * item.quantity);
        }, 0);
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);

interface AdminAuthState {
  isAuthenticated: boolean;
  adminEmail: string | null;
  login: (email: string) => void;
  logout: () => Promise<void>;
}

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      adminEmail: null,
      
      login: (email) => {
        set({ isAuthenticated: true, adminEmail: email });
      },
      
      logout: async () => {
        const { api } = await import('./api');
        await api.adminLogout();
        set({ isAuthenticated: false, adminEmail: null });
      }
    }),
    {
      name: 'admin-auth-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);