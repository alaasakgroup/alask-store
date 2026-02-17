'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRight, Printer } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_LABELS = {
  processing: 'قيد التجهيز',
  ready: 'مجهز',
  returned: 'راجع'
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<Order['status']>('processing');
  const [adminNote, setAdminNote] = useState('');
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (id) {
      api.getOrder(id).then(order => {
        if (order) {
          setOrder(order);
          setStatus(order.status);
          setAdminNote(order.admin_note || '');
        }
      });
    }
    api.getSettings().then(setSettings);
  }, [id]);

  const handleSave = async () => {
    if (!order) return;

    try {
      await api.updateOrder(order.id, { status, admin_note: adminNote });
      toast.success('تم حفظ التغييرات');
      setOrder({ ...order, status, admin_note: adminNote });
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!order || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const items = order.items as any[];

  return (
    <div>
      {/* Header - Hide on print */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/admin/orders')}
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">تفاصيل الطلب</h1>
        </div>
        <Button onClick={handlePrint}>
          <Printer className="ml-2 h-4 w-4" />
          طباعة الفاتورة
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice View - Shows on print */}
          <div className="bg-white rounded-lg border p-8 print:border-0 print:shadow-none" id="invoice">
            {/* Invoice Header */}
            <div className="flex items-start justify-between mb-8 pb-6 border-b">
              <div className="flex items-center gap-3">
                {settings.logo_url && (
                  <div className={`overflow-hidden ${settings.logo_shape === 'circle' ? 'rounded-full' : 'rounded-lg'}`}>
                    <img 
                      src={settings.logo_url} 
                      alt={settings.store_name}
                      className="h-16 w-16 object-cover"
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{settings.store_name}</h2>
                  <p className="text-sm text-gray-600">{settings.address}</p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-600">رقم الطلب</p>
                <p className="text-xl font-bold">{order.order_number}</p>
                <p className="text-sm text-gray-600 mt-1">{formatDate(order.created_at)}</p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-6">
              <h3 className="font-bold mb-3">معلومات الزبون</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">الاسم</p>
                  <p className="font-semibold">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-gray-600">رقم الهاتف</p>
                  <p className="font-semibold" dir="ltr">{order.customer_phone}</p>
                </div>
                <div>
                  <p className="text-gray-600">المحافظة</p>
                  <p className="font-semibold">{order.province}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">العنوان</p>
                  <p className="font-semibold">{order.address}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
              <h3 className="font-bold mb-3">المنتجات</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-right py-2">المنتج</th>
                    <th className="text-center py-2">الكمية</th>
                    <th className="text-right py-2">السعر</th>
                    <th className="text-right py-2">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3">{item.name}</td>
                      <td className="text-center py-3">{item.quantity}</td>
                      <td className="py-3">{formatPrice(item.price)}</td>
                      <td className="py-3 font-semibold">{formatPrice(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2">
                    <td colSpan={3} className="py-3 font-bold text-lg">الإجمالي الكلي</td>
                    <td className="py-3 font-bold text-lg text-primary">{formatPrice(order.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Customer Note */}
            {order.note && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-semibold mb-1">ملاحظة الزبون:</p>
                <p className="text-sm">{order.note}</p>
              </div>
            )}
          </div>
        </div>

        {/* Admin Actions - Hide on print */}
        <div className="lg:col-span-1 print:hidden">
          <div className="bg-white rounded-lg border p-6 space-y-6 sticky top-6">
            <div>
              <Label htmlFor="status">حالة الطلب</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Order['status'])}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="processing">{STATUS_LABELS.processing}</SelectItem>
                  <SelectItem value="ready">{STATUS_LABELS.ready}</SelectItem>
                  <SelectItem value="returned">{STATUS_LABELS.returned}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="adminNote">ملاحظة إدارية (داخلية)</Label>
              <Textarea
                id="adminNote"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="ملاحظات داخلية للإدارة فقط..."
                rows={4}
              />
            </div>

            <Button onClick={handleSave} className="w-full">
              حفظ التغييرات
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
