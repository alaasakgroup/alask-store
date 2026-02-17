'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, Menu } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

export function StorefrontHeader() {
  const router = useRouter();
  const cartItems = useCartStore(state => state.getTotalItems());
  const [settings, setSettings] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    api.getSettings().then(setSettings);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Cart & Search - Left */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/cart')}
              className="relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
          </div>

          {/* Logo & Store Name - Center */}
          <Link href="/" className="flex items-center gap-3">
            {settings?.logo_url && (
              <div className={`overflow-hidden ${settings.logo_shape === 'circle' ? 'rounded-full' : 'rounded-lg'}`}>
                <img 
                  src={settings.logo_url} 
                  alt={settings.store_name}
                  className="h-10 w-10 object-cover"
                />
              </div>
            )}
            <h1 className="text-xl font-bold">{settings?.store_name || 'الأسك كروب'}</h1>
          </Link>

          {/* Mobile Menu - Right */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Desktop Navigation - Right */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="hover:text-primary transition-colors">
              الرئيسية
            </Link>
            <Link href="/products" className="hover:text-primary transition-colors">
              المنتجات
            </Link>
            <Link href="/faq" className="hover:text-primary transition-colors">
              الأسئلة الشائعة
            </Link>
            <Link href="/faq" className="hover:text-primary transition-colors">
              اتصل بنا
            </Link>
          </nav>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <Link 
                href="/" 
                className="hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                الرئيسية
              </Link>
              <Link 
                href="/products" 
                className="hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                المنتجات
              </Link>
              <Link 
                href="/faq" 
                className="hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                الأسئلة الشائعة
              </Link>
              <Link 
                href="/faq" 
                className="hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                اتصل بنا
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}