import { useCartStore } from '../lib/store';
import { calculateDiscountedPrice, formatPrice } from '../lib/utils';
import { Button } from '../app/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-2">السلة فارغة</h2>
        <p className="text-gray-600 mb-6">لم تقم بإضافة أي منتجات بعد</p>
        <Link to="/">
          <Button>تصفح المنتجات</Button>
        </Link>
      </div>
    );
  }

  const total = getTotalPrice();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">سلة التسوق</h1>

      <div className="space-y-4 mb-8">
        {items.map(item => {
          const itemPrice = item.discountType === 'percentage'
            ? item.price * (1 - item.discountValue / 100)
            : item.discountType === 'fixed'
            ? item.price - item.discountValue
            : item.price;

          return (
            <div key={item.productId} className="bg-white border rounded-lg p-4">
              <div className="flex gap-4">
                {/* Image */}
                <Link 
                  to={`/products/${item.productId}`}
                  className="flex-shrink-0"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/products/${item.productId}`}
                    className="font-semibold hover:text-primary"
                  >
                    {item.name}
                  </Link>
                  
                  <div className="mt-2">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(itemPrice)}
                    </span>
                    {(item.discountType && item.discountValue > 0) && (
                      <span className="text-sm text-gray-500 line-through mr-2">
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mt-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="font-semibold w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Subtotal & Remove */}
                <div className="flex flex-col items-end justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.productId)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                  <div className="text-lg font-bold">
                    {formatPrice(itemPrice * item.quantity)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-6 sticky bottom-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg">الإجمالي:</span>
          <span className="text-2xl font-bold text-primary">
            {formatPrice(total)}
          </span>
        </div>
        <Link to="/checkout">
          <Button size="lg" className="w-full">
            إتمام الطلب
          </Button>
        </Link>
      </div>
    </div>
  );
}