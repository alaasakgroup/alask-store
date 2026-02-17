'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IRAQI_PROVINCES } from '@/lib/types';
import type { CheckoutForm, OrderItem } from '@/lib/types';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, getTotalPrice } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CheckoutForm>({
    customerName: '',
    customerPhone: '',
    province: '',
    address: '',
    note: ''
  });

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, router]);

  if (items.length === 0) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.customerName.trim()) {
      toast.error('الرجاء إدخال الاسم');
      return;
    }
    if (!formData.customerPhone.trim()) {
      toast.error('الرجاء إدخال رقم الهاتف');
      return;
    }
    if (!formData.province) {
      toast.error('الرجاء اختيار المحافظة');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('الرجاء إدخال العنوان');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order items
      const orderItems: OrderItem[] = items.map(item => {
        const itemPrice = item.discountType === 'percentage'
          ? item.price * (1 - item.discountValue / 100)
          : item.discountType === 'fixed'
          ? item.price - item.discountValue
          : item.price;

        return {
          productId: item.productId,
          name: item.name,
          price: itemPrice,
          quantity: item.quantity,
          total: itemPrice * item.quantity
        };
      });

      const total = getTotalPrice();

      // Create order
      const order = await api.createOrder(formData, orderItems, total);

      // Clear cart
      clearCart();

      // Navigate to confirmation
      router.push(`/order-confirmation/${order.id}`);
      
      toast.success('تم إرسال طلبك بنجاح!');
    } catch (error) {
      toast.error('حدث خطأ أثناء إرسال الطلب');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = getTotalPrice();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">إتمام الطلب</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="customerName">اسم الزبون *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="أدخل اسمك الكامل"
                required
              />
            </div>

            <div>
              <Label htmlFor="customerPhone">رقم الهاتف *</Label>
              <Input
                id="customerPhone"
                type="tel"
                dir="ltr"
                value={formData.customerPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="+964 770 123 4567"
                required
              />
            </div>

            <div>
              <Label htmlFor="province">المحافظة *</Label>
              <Select
                value={formData.province}
                onValueChange={(value: string) => setFormData(prev => ({ ...prev, province: value }))}
                required
              >
                <SelectTrigger id="province">
                  <SelectValue placeholder="اختر المحافظة" />
                </SelectTrigger>
                <SelectContent>
                  {IRAQI_PROVINCES.map(province => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="address">العنوان *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="الحي، الشارع، رقم المنزل..."
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="note">ملاحظة للطلب (اختياري)</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                placeholder="أي ملاحظات إضافية..."
                rows={2}
              />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
            </Button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">ملخص الطلب</h2>
            
            <div className="space-y-3 mb-6">
              {items.map(item => {
                const itemPrice = item.discountType === 'percentage'
                  ? item.price * (1 - item.discountValue / 100)
                  : item.discountType === 'fixed'
                  ? item.price - item.discountValue
                  : item.price;

                return (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-semibold">
                      {formatPrice(itemPrice * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>الإجمالي:</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-900">
              <p className="font-semibold mb-1">الدفع عند الاستلام</p>
              <p>سيتم التواصل معك لتأكيد الطلب</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
