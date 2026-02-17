import { Link, Outlet, useNavigate, useLocation } from 'react-router';
import { useAdminAuth } from '../../lib/store';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Settings, 
  HelpCircle,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '../../app/components/ui/button';
import { useEffect, useState } from 'react';

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/admin/dashboard' },
    { icon: ShoppingBag, label: 'الطلبات', path: '/admin/orders' },
    { icon: Package, label: 'المنتجات', path: '/admin/products' },
    { icon: Package, label: 'المخزون', path: '/admin/inventory' },
    { icon: HelpCircle, label: 'الأسئلة الشائعة', path: '/admin/faq' },
    { icon: Settings, label: 'إعدادات المتجر', path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
        <h1 className="font-bold">لوحة التحكم</h1>
        <div className="w-10" />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-0 right-0 h-screen bg-white border-l w-64 z-40
          transition-transform duration-300 lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold">الأسك كروب</h1>
            <p className="text-sm text-gray-600">لوحة التحكم الإدارية</p>
          </div>

          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary text-white' 
                      : 'hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="ml-3 h-5 w-5" />
              تسجيل الخروج
            </Button>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}