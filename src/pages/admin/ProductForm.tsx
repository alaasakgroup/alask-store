import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { api } from '../../lib/api';
import { calculateDiscountedPrice, formatPrice } from '../../lib/utils';
import type { Product } from '../../lib/types';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { Textarea } from '../../app/components/ui/textarea';
import { Switch } from '../../app/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../app/components/ui/select';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    stock: '',
    images: '',
    discountType: '' as '' | 'percentage' | 'fixed',
    discountValue: '',
    available: true,
    isFeatured: false,
    isNew: false
  });

  useEffect(() => {
    api.getCategories().then(setCategories);
    
    if (isEdit && id) {
      api.getProduct(id).then(product => {
        if (product) {
          setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            categoryId: product.categoryId,
            stock: product.stock.toString(),
            images: product.images.join('\n'),
            discountType: product.discountType || '',
            discountValue: product.discountValue > 0 ? product.discountValue.toString() : '',
            available: product.available,
            isFeatured: product.isFeatured,
            isNew: product.isNew
          });
        }
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('الرجاء إدخال اسم المنتج');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('الرجاء إدخال سعر صحيح');
      return;
    }
    if (!formData.categoryId) {
      toast.error('الرجاء اختيار التصنيف');
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        stock: parseInt(formData.stock) || 0,
        images: formData.images.split('\n').filter(url => url.trim()),
        discountType: formData.discountType || null,
        discountValue: formData.discountValue ? parseFloat(formData.discountValue) : 0,
        available: formData.available,
        isFeatured: formData.isFeatured,
        isNew: formData.isNew
      };

      if (isEdit && id) {
        await api.updateProduct(id, productData as any);
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        await api.createProduct(productData as any);
        toast.success('تم إضافة المنتج بنجاح');
      }

      navigate('/admin/products');
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate new price for preview
  const basePrice = parseFloat(formData.price) || 0;
  let newPrice = basePrice;
  if (formData.discountType === 'percentage' && formData.discountValue) {
    newPrice = basePrice * (1 - parseFloat(formData.discountValue) / 100);
  } else if (formData.discountType === 'fixed' && formData.discountValue) {
    newPrice = basePrice - parseFloat(formData.discountValue);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/admin/products')}
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isEdit ? 'تعديل المنتج' : 'إضافة منتج جديد'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 space-y-6">
        <div>
          <Label htmlFor="name">اسم المنتج *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="أدخل اسم المنتج"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">الوصف</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="وصف المنتج..."
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">السعر الأساسي (د.ع) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0"
              required
            />
          </div>

          <div>
            <Label htmlFor="categoryId">التصنيف *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
              required
            >
              <SelectTrigger id="categoryId">
                <SelectValue placeholder="اختر التصنيف" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Discount Section */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-semibold mb-4">إعدادات الخصم</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discountType">نوع الخصم</Label>
              <Select
                value={formData.discountType}
                onValueChange={(value: any) => setFormData(prev => ({ 
                  ...prev, 
                  discountType: value,
                  discountValue: value === '' ? '' : prev.discountValue
                }))}
              >
                <SelectTrigger id="discountType">
                  <SelectValue placeholder="بدون خصم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">بدون خصم</SelectItem>
                  <SelectItem value="percentage">نسبة مئوية (%)</SelectItem>
                  <SelectItem value="fixed">مبلغ ثابت (د.ع)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.discountType && (
              <div>
                <Label htmlFor="discountValue">
                  قيمة الخصم {formData.discountType === 'percentage' ? '(%)' : '(د.ع)'}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  step="0.01"
                  value={formData.discountValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                  placeholder="0"
                />
              </div>
            )}
          </div>

          {/* Price Preview */}
          {formData.discountType && formData.discountValue && basePrice > 0 && (
            <div className="mt-4 p-3 bg-white rounded border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">السعر الأساسي:</span>
                <span className="font-semibold line-through">{formatPrice(basePrice)}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-semibold">السعر الجديد:</span>
                <span className="text-xl font-bold text-green-600">{formatPrice(newPrice)}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">التوفير:</span>
                <span className="text-sm text-red-600 font-semibold">
                  {formData.discountType === 'percentage' 
                    ? `${formData.discountValue}%`
                    : formatPrice(basePrice - newPrice)
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="stock">المخزون (الكمية)</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="images">صور المنتج (URL لكل صورة في سطر)</Label>
          <Textarea
            id="images"
            value={formData.images}
            onChange={(e) => setFormData(prev => ({ ...prev, images: e.target.value }))}
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            rows={4}
            dir="ltr"
          />
          <p className="text-xs text-gray-500 mt-1">
            أضف رابط صورة واحدة في كل سطر
          </p>
        </div>

        {/* Toggles */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <Label htmlFor="available">المنتج متوفر</Label>
            <Switch
              id="available"
              checked={formData.available}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, available: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isFeatured">عرض في "الأكثر طلباً"</Label>
            <Switch
              id="isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isNew">عرض في "وصل حديثاً"</Label>
            <Switch
              id="isNew"
              checked={formData.isNew}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isNew: checked }))}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? 'جاري الحفظ...' : isEdit ? 'حفظ التغييرات' : 'إضافة المنتج'}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate('/admin/products')}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  );
}