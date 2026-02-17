import { Outlet } from 'react-router';
import { StorefrontHeader } from './Header';
import { StorefrontFooter } from './Footer';

export function StorefrontLayout() {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <StorefrontHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <StorefrontFooter />
    </div>
  );
}
