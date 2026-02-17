'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Order } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const STATUS_LABELS = {
  processing: 'قيد التجهيز',
  ready: 'مجهز',
  returned: 'راجع'
};

const STATUS_COLORS = {
  processing: 'bg-blue-500',
  ready: 'bg-green-500',
  returned: 'bg-red-500'
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<Order['status']>('processing');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const data = await api.getOrders();
    setOrders(data);
  };

  const filteredOrders = orders.filter(o => o.status === activeTab);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">إدارة الطلبات</h1>

      <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as Order['status'])}>
        <TabsList>
          <TabsTrigger value="processing">
            قيد التجهيز ({orders.filter(o => o.status === 'processing').length})
          </TabsTrigger>
          <TabsTrigger value="ready">
            مجهز ({orders.filter(o => o.status === 'ready').length})
          </TabsTrigger>
          <TabsTrigger value="returned">
            راجع ({orders.filter(o => o.status === 'returned').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              لا توجد طلبات {STATUS_LABELS[activeTab]}
            </div>
          ) : (
            <div className="bg-white rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">رقم الطلب</TableHead>
                    <TableHead className="text-center">اسم الزبون</TableHead>
                    <TableHead className="text-center">رقم الهاتف</TableHead>
                    <TableHead className="text-center">المحافظة</TableHead>
                    <TableHead className="text-center">التاريخ</TableHead>
                    <TableHead className="text-center">الإجمالي</TableHead>
                    <TableHead className="text-center">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="text-center">
                        <Link 
                          href={`/admin/orders/${order.id}`}
                          className="font-semibold text-primary hover:underline"
                        >
                          {order.order_number}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">{order.customer_name}</TableCell>
                      <TableCell dir="ltr" className="text-center">{order.customer_phone}</TableCell>
                      <TableCell className="text-center">{order.province}</TableCell>
                      <TableCell className="text-center">{formatDate(order.created_at)}</TableCell>
                      <TableCell className="text-center font-semibold">{formatPrice(order.total)}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={STATUS_COLORS[order.status]}>
                          {STATUS_LABELS[order.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
