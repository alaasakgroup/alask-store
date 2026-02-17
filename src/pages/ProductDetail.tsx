import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { api } from '../lib/api';
import type { Product } from '../lib/types';
import { calculateDiscountedPrice, formatPrice } from '../lib/utils';
import { Button } from '../app/components/ui/button';
import { Badge } from '../app/components/ui/badge';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { useCartStore } from '../lib/store';
import { toast } from 'sonner';
import { ProductCard } from '../components/storefront/ProductCard';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../app/components/ui/accordion';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    if (!id) return;

    api.getProduct(id).then(prod => {
      if (!prod) {
        navigate('/products');
        return;
      }
      setProduct(prod);
      
      // Get related products
      api.getProducts({ categoryId: prod.categoryId }).then(products => {
        setRelatedProducts(products.filter(p => p.id !== id).slice(0, 4));
      });
    });
  }, [id, navigate]);

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const discountedPrice = calculateDiscountedPrice(product);
  const hasDiscount = product.discountType && product.discountValue > 0;

  const handleAddToCart = () => {
    if (!product.available || product.stock <= 0) {
      toast.error('المنتج غير متوفر حالياً');
      return;
    }

    if (quantity > product.stock) {
      toast.error(`الكمية المتاحة: ${product.stock} فقط`);
      return;
    }

    addItem(product, quantity);
    toast.success(`تمت إضافة ${quantity} قطعة إلى السلة`);
  };

  return (
    <div className="space-y-12">
      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            {/* Badges */}
            <div className="flex gap-2 mb-4">
              {product.isNew && (
                <Badge className="bg-blue-500">جديد</Badge>
              )}
              {hasDiscount && (
                <Badge className="bg-red-500">
                  {product.discountType === 'percentage' 
                    ? `خصم ${product.discountValue}%`
                    : `وفر ${product.discountValue.toLocaleString('ar-IQ')} د.ع`
                  }
                </Badge>
              )}
              {!product.available && (
                <Badge variant="secondary">غير متوفر</Badge>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(discountedPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>

          {/* Stock Status */}
          {product.available && (
            <p className="text-sm">
              {product.stock > 0 ? (
                <span className="text-green-600">✓ متوفر في المخزون ({product.stock} قطعة)</span>
              ) : (
                <span className="text-red-600">نفذت الكمية</span>
              )}
            </p>
          )}

          {/* Quantity Selector */}
          {product.available && product.stock > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">الكمية</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <Button
            onClick={handleAddToCart}
            disabled={!product.available || product.stock <= 0}
            size="lg"
            className="w-full"
          >
            <ShoppingCart className="ml-2 h-5 w-5" />
            أضف إلى السلة
          </Button>

          {/* Product Info Accordion */}
          <Accordion type="single" collapsible className="border rounded-lg">
            <AccordionItem value="description" className="px-4">
              <AccordionTrigger>الوصف</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {product.description}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="specs" className="px-4">
              <AccordionTrigger>المواصفات</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                <ul className="list-disc list-inside space-y-1">
                  <li>منتج أصلي 100%</li>
                  <li>ضمان الجودة</li>
                  <li>متوفر للشحن فوري</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="shipping" className="px-4">
              <AccordionTrigger>الشحن والإرجاع</AccordionTrigger>
              <AccordionContent className="text-gray-600">
                <p>التوصيل خلال 2-5 أيام عمل حسب المحافظة.</p>
                <p className="mt-2">يمكن الإرجاع خلال 7 أيام من تاريخ الاستلام.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">منتجات ذات صلة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(prod => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}