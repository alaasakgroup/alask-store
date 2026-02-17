'use client';

import Link from 'next/link';
import { Facebook, Instagram, MapPin, Phone, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export function StorefrontFooter() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    api.getSettings().then(setSettings);
  }, []);

  if (!settings) return null;

  const showSocialLinks = settings.social_links?.facebook || settings.social_links?.instagram || settings.social_links?.whatsapp;
  
  // Check if map_location is a valid Google Maps embed URL
  const isValidMapUrl = settings.map_location && 
    (settings.map_location.includes('google.com/maps/embed') || 
     settings.map_location.includes('maps.google.com/maps?') ||
     settings.map_location.includes('google.com/maps?'));
  const showMap = isValidMapUrl;

  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Store Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {settings.logo_url && (
                <div className={`overflow-hidden  ${settings.logo_shape === 'circle' ? 'rounded-full' : 'rounded-lg'}`}>
                  <img 
                    src={settings.logo_url} 
                    alt={settings.store_name}
                    className="h-12 w-12 object-cover"
                  />
                </div>
              )}
              <h3 className="text-xl font-bold">{settings.store_name}</h3>
            </div>
            <p className="text-gray-300 mb-4">
              متجرك الموثوق لإكسسوارات المطبخ عالية الجودة
            </p>
            {showSocialLinks && (
              <div className="flex gap-3">
                {settings.social_links?.facebook && (
                  <a 
                    href={settings.social_links.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {settings.social_links?.instagram && (
                  <a 
                    href={settings.social_links.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-pink-400 transition-colors"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">روابط سريعة</h4>
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                الرئيسية
              </Link>
              <Link href="/products" className="text-gray-300 hover:text-white transition-colors">
                المنتجات
              </Link>
              <Link href="/faq" className="text-gray-300 hover:text-white transition-colors">
                الأسئلة الشائعة
              </Link>
              <Link href="/faq" className="text-gray-300 hover:text-white transition-colors">
                اتصل بنا
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold mb-4">تواصل معنا</h4>
            <div className="flex flex-col gap-3 text-gray-300">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 flex-shrink-0" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <span dir="ltr">{settings.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span>{settings.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        {showMap && (
          <div className="mt-8 rounded-lg overflow-hidden h-48">
            <iframe
              src={settings.map_location}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>© 2026 {settings.store_name}. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}
