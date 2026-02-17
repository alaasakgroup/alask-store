'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Order } from '@/lib/types';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderId) {
      api.getOrder(orderId).then(setOrder);
    }
  }, [orderId]);

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const items = order.items as any[];

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>

      <h1 className="text-3xl font-bold mb-2">تم استلام طلبك بنجاح!</h1>
      <p className="text-gray-600 mb-8">
        شكراً لك، سيتم التواصل معك قريباً لتأكيد الطلب
      </p>

      <div className="bg-gray-50 rounded-lg p-6 text-right mb-8">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">رقم الطلب</p>
            <p className="font-bold">{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">التاريخ</p>
            <p className="font-semibold">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">الحالة</p>
            <p className="font-semibold text-blue-600">قيد التجهيز</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">الإجمالي</p>
            <p className="font-bold text-primary text-lg">{formatPrice(order.total)}</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-gray-600 mb-1">معلومات التوصيل</p>
          <p className="font-semibold">{order.customerName}</p>
          <p className="text-sm">{order.customerPhone}</p>
          <p className="text-sm">{order.province} - {order.address}</p>
          {order.note && (
            <p className="text-sm text-gray-600 mt-2">ملاحظة: {order.note}</p>
          )}
        </div>

        <div className="border-t pt-4 mt-4">
          <p className="font-semibold mb-3">المنتجات</p>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span className="font-semibold">{formatPrice(item.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <Link href="/">
          <Button>العودة للرئيسية</Button>
        </Link>
        <Link href="/products">
          <Button variant="outline">تصفح المنتجات</Button>
        </Link>
      </div>
    </div>
  );
}
