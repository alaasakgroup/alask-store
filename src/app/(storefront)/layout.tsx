'use client';

import { StorefrontHeader } from '@/components/storefront/Header';
import { StorefrontFooter } from '@/components/storefront/Footer';
import { WhatsAppButton } from '@/components/storefront/WhatsAppButton';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <StorefrontHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <StorefrontFooter />
      <WhatsAppButton />
    </div>
  );
}
