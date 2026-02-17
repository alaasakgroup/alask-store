import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { api } from '../../lib/api';
import { Package, ShoppingBag, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '../../app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import type { Order } from '../../lib/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    processingOrders: 0,
    lowStockProducts: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [allOrders, products] = await Promise.all([
      api.getOrders(),
      api.getProducts()
    ]);

    const processingOrders = allOrders.filter(o => o.status === 'processing');
    const lowStock = products.filter(p => p.stock < 10);

    setStats({
      totalOrders: allOrders.length,
      processingOrders: processingOrders.length,
      lowStockProducts: lowStock.length
    });

    setRecentOrders(allOrders.slice(0, 5));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">لوحة التحكم</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            <ShoppingBag className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">الطلبات الحالية</CardTitle>
            <Package className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.processingOrders}</div>
            <p className="text-xs text-gray-600 mt-1">قيد التجهيز</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">منتجات منخفضة المخزون</CardTitle>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.lowStockProducts}</div>
            <p className="text-xs text-gray-600 mt-1">أقل من 10 قطع</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link to="/admin/products/new">
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              إضافة منتج
            </Button>
          </Link>
          <Link to="/admin/orders">
            <Button variant="outline">
              <ShoppingBag className="ml-2 h-4 w-4" />
              عرض الطلبات
            </Button>
          </Link>
          <Link to="/admin/inventory">
            <Button variant="outline">
              <Package className="ml-2 h-4 w-4" />
              إدارة المخزون
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>الطلبات الأخيرة</CardTitle>
              <Link to="/admin/orders">
                <Button variant="ghost" size="sm">عرض الكل</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map(order => (
                <Link
                  key={order.id}
                  to={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-semibold">{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">{order.customerName}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{order.total.toLocaleString('ar-IQ')} د.ع</p>
                    <p className="text-xs text-gray-600">{order.province}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}