'use client';

import Link from 'next/link';
import { ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/store';
import { calculateDiscountedPrice, formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore(state => state.addItem);
  const discountedPrice = calculateDiscountedPrice(product);
  const hasDiscount = product.discount_type && product.discount_value > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product.available || product.stock <= 0) {
      toast.error('المنتج غير متوفر حالياً');
      return;
    }

    addItem(product);
    toast.success('تمت الإضافة إلى السلة');
  };

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <div className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {product.is_new && (
              <Badge className="bg-blue-500">جديد</Badge>
            )}
            {hasDiscount && (
              <Badge className="bg-red-500">
                {product.discount_type === 'percentage' 
                  ? `خصم ${product.discount_value}%`
                  : `وفر ${product.discount_value.toLocaleString('ar-IQ')} د.ع`
                }
              </Badge>
            )}
            {!product.available && (
              <Badge variant="secondary">غير متوفر</Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-primary">
              {formatPrice(discountedPrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          {product.available && product.stock > 0 && (
            <p className="text-xs text-gray-500 mb-3">
              {product.stock < 10 ? `متبقي ${product.stock} فقط` : 'متوفر في المخزون'}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              asChild
            >
              <Link href={`/products/${product.id}`} onClick={(e) => e.stopPropagation()}>
                <Eye className="ml-2 h-4 w-4" />
                تفاصيل أكثر
              </Link>
            </Button>
            <Button
              onClick={handleAddToCart}
              disabled={!product.available || product.stock <= 0}
              className="flex-1"
            >
              <ShoppingCart className="ml-2 h-4 w-4" />
              أضف إلى السلة
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}