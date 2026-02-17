import { createBrowserRouter } from 'react-router';
import { StorefrontLayout } from './components/storefront/StorefrontLayout';
import { AdminLayout } from './components/admin/AdminLayout';

// Storefront Pages
import HomePage from './pages/Home';
import ProductsPage from './pages/Products';
import ProductDetailPage from './pages/ProductDetail';
import CartPage from './pages/Cart';
import CheckoutPage from './pages/Checkout';
import OrderConfirmationPage from './pages/OrderConfirmation';
import FAQPage from './pages/FAQ';

// Admin Pages
import AdminLoginPage from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrdersPage from './pages/admin/Orders';
import AdminOrderDetailPage from './pages/admin/OrderDetail';
import AdminProductsPage from './pages/admin/Products';
import AdminProductFormPage from './pages/admin/ProductForm';
import AdminInventoryPage from './pages/admin/Inventory';
import AdminSettingsPage from './pages/admin/Settings';
import AdminFAQPage from './pages/admin/FAQManagement';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: StorefrontLayout,
    children: [
      {
        index: true,
        Component: HomePage
      },
      {
        path: 'products',
        Component: ProductsPage
      },
      {
        path: 'products/:id',
        Component: ProductDetailPage
      },
      {
        path: 'cart',
        Component: CartPage
      },
      {
        path: 'checkout',
        Component: CheckoutPage
      },
      {
        path: 'order-confirmation/:orderId',
        Component: OrderConfirmationPage
      },
      {
        path: 'faq',
        Component: FAQPage
      }
    ]
  },
  {
    path: '/admin/login',
    Component: AdminLoginPage
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      {
        path: 'dashboard',
        Component: AdminDashboard
      },
      {
        path: 'orders',
        Component: AdminOrdersPage
      },
      {
        path: 'orders/:id',
        Component: AdminOrderDetailPage
      },
      {
        path: 'products',
        Component: AdminProductsPage
      },
      {
        path: 'products/new',
        Component: AdminProductFormPage
      },
      {
        path: 'products/:id/edit',
        Component: AdminProductFormPage
      },
      {
        path: 'inventory',
        Component: AdminInventoryPage
      },
      {
        path: 'settings',
        Component: AdminSettingsPage
      },
      {
        path: 'faq',
        Component: AdminFAQPage
      }
    ]
  }
]);