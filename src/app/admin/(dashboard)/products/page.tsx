'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await api.getProducts();
    setProducts(data);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteProduct(id);
      toast.success('تم حذف المنتج');
      loadProducts();
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة المنتجات</h1>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            إضافة منتج جديد
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg border">
          <p>لا توجد منتجات حالياً</p>
          <Link href="/admin/products/new">
            <Button className="mt-4">
              <Plus className="ml-2 h-4 w-4" />
              إضافة منتج
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المنتج</TableHead>
                <TableHead className="text-center">السعر</TableHead>
                <TableHead className="text-center">المخزون</TableHead>
                <TableHead className="text-center">الحالة</TableHead>
                <TableHead className="text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        {product.is_new && (
                          <Badge className="bg-blue-500 mt-1">جديد</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div>
                      <p className="font-semibold">{formatPrice(product.price)}</p>
                      {product.discount_type && (
                        <p className="text-xs text-red-600">
                          {product.discount_type === 'percentage' 
                            ? `خصم ${product.discount_value}%`
                            : `خصم ${product.discount_value.toLocaleString('ar-IQ')} د.ع`
                          }
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={product.stock < 10 ? 'text-orange-600 font-semibold' : ''}>
                      {product.stock} قطعة
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {product.available ? (
                      <Badge className="bg-green-500">متوفر</Badge>
                    ) : (
                      <Badge variant="secondary">غير متوفر</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-2 justify-center">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button variant="outline" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(product.id)}>
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
