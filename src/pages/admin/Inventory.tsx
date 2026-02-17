import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Product } from '../../lib/types';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Badge } from '../../app/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../app/components/ui/table';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingStock, setEditingStock] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await api.getProducts();
    setProducts(data.sort((a, b) => a.stock - b.stock));
  };

  const handleStockChange = (productId: string, value: string) => {
    setEditingStock(prev => ({ ...prev, [productId]: value }));
  };

  const handleSaveStock = async (product: Product) => {
    const newStock = editingStock[product.id];
    if (!newStock || parseInt(newStock) < 0) {
      toast.error('الرجاء إدخال كمية صحيحة');
      return;
    }

    try {
      await api.updateProduct(product.id, { stock: parseInt(newStock) });
      toast.success('تم تحديث المخزون');
      setEditingStock(prev => {
        const updated = { ...prev };
        delete updated[product.id];
        return updated;
      });
      loadProducts();
    } catch (error) {
      toast.error('حدث خطأ أثناء التحديث');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">إدارة المخزون</h1>

      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المنتج</TableHead>
              <TableHead>المخزون الحالي</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>تحديث الكمية</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map(product => {
              const currentStock = editingStock[product.id] !== undefined 
                ? editingStock[product.id] 
                : product.stock.toString();
              const isLowStock = product.stock < 10;
              const isEditing = editingStock[product.id] !== undefined;

              return (
                <TableRow key={product.id} className={isLowStock ? 'bg-orange-50' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <span className="font-semibold">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-lg font-bold ${isLowStock ? 'text-orange-600' : ''}`}>
                      {product.stock} قطعة
                    </span>
                  </TableCell>
                  <TableCell>
                    {isLowStock ? (
                      <Badge className="bg-orange-500">منخفض المخزون</Badge>
                    ) : product.stock === 0 ? (
                      <Badge variant="secondary">نفذ</Badge>
                    ) : (
                      <Badge className="bg-green-500">جيد</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={currentStock}
                        onChange={(e) => handleStockChange(product.id, e.target.value)}
                        className="w-24"
                        min="0"
                      />
                      <Button
                        onClick={() => handleSaveStock(product)}
                        disabled={!isEditing}
                        size="icon"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}