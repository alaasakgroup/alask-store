'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRight, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProductFormPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const isEdit = Boolean(id);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock: '',
    discount_type: '' as '' | 'percentage' | 'fixed',
    discount_value: '',
    available: true,
    is_featured: false,
    is_new: false,
    shipping_info: ''
  });
  const [specifications, setSpecifications] = useState<string[]>([]);

  useEffect(() => {
    api.getCategories().then(setCategories);
    
    if (isEdit && id) {
      api.getProduct(id).then(product => {
        if (product) {
          setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            category_id: product.category_id,
            stock: product.stock.toString(),
            discount_type: product.discount_type || '',
            discount_value: product.discount_value > 0 ? product.discount_value.toString() : '',
            available: product.available,
            is_featured: product.is_featured,
            is_new: product.is_new,
            shipping_info: product.shipping_info || ''
          });
          setExistingImages(product.images || []);
          // Load specifications
          const specs = product.specifications as string[] | null;
          if (specs && Array.isArray(specs)) {
            setSpecifications(specs);
          }
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
    if (!formData.category_id) {
      toast.error('الرجاء اختيار التصنيف');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload new images first
      let uploadedUrls: string[] = [];
      if (imageFiles.length > 0) {
        setUploadingImages(true);
        try {
          uploadedUrls = await api.uploadMultipleImages(imageFiles);
        } catch (uploadError) {
          toast.error('فشل في رفع الصور');
          setIsSubmitting(false);
          setUploadingImages(false);
          return;
        }
        setUploadingImages(false);
      }

      // Combine existing images with newly uploaded ones
      const allImages = [...existingImages, ...uploadedUrls];

      const productData = {
        name: formData.name,
        description: formData.description,
        specifications: specifications.filter(s => s.trim()),
        shipping_info: formData.shipping_info,
        price: parseFloat(formData.price),
        category_id: formData.category_id,
        stock: parseInt(formData.stock) || 0,
        images: allImages,
        discount_type: formData.discount_type || null,
        discount_value: formData.discount_value ? parseFloat(formData.discount_value) : 0,
        available: formData.available,
        is_featured: formData.is_featured,
        is_new: formData.is_new
      };

      if (isEdit && id) {
        await api.updateProduct(id, productData as any);
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        await api.createProduct(productData as any);
        toast.success('تم إضافة المنتج بنجاح');
      }

      router.push('/admin/products');
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate new price for preview
  const basePrice = parseFloat(formData.price) || 0;
  let newPrice = basePrice;
  if (formData.discount_type === 'percentage' && formData.discount_value) {
    newPrice = basePrice * (1 - parseFloat(formData.discount_value) / 100);
  } else if (formData.discount_type === 'fixed' && formData.discount_value) {
    newPrice = basePrice - parseFloat(formData.discount_value);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin/products')}
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
              value={formData.category_id}
              onValueChange={(value: string) => setFormData(prev => ({ ...prev, category_id: value }))}
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
                value={formData.discount_type || 'none'}
                onValueChange={(value: any) => setFormData(prev => ({ 
                  ...prev, 
                  discount_type: value === 'none' ? '' : value,
                  discount_value: value === 'none' ? '' : prev.discount_value
                }))}
              >
                <SelectTrigger id="discountType">
                  <SelectValue placeholder="بدون خصم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون خصم</SelectItem>
                  <SelectItem value="percentage">نسبة مئوية (%)</SelectItem>
                  <SelectItem value="fixed">مبلغ ثابت (د.ع)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.discount_type && (
              <div>
                <Label htmlFor="discount_value">
                  قيمة الخصم {formData.discount_type === 'percentage' ? '(%)' : '(د.ع)'}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  step="0.01"
                  value={formData.discount_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                  placeholder="0"
                />
              </div>
            )}
          </div>

          {/* Price Preview */}
          {formData.discount_type && formData.discount_value && basePrice > 0 && (
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
                  {formData.discount_type === 'percentage' 
                    ? `${formData.discount_value}%`
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

        {/* Specifications Section */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">مواصفات المنتج</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSpecifications([...specifications, ''])}
            >
              + إضافة مواصفة
            </Button>
          </div>
          
          {specifications.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              لا توجد مواصفات. اضغط على "إضافة مواصفة" لإضافة مواصفات المنتج.
            </p>
          ) : (
            <div className="space-y-3">
              {specifications.map((spec, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <div className="flex-1">
                    <Input
                      placeholder="مثال: منتج أصلي 100%"
                      value={spec}
                      onChange={(e) => {
                        const newSpecs = [...specifications];
                        newSpecs[index] = e.target.value;
                        setSpecifications(newSpecs);
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="text-red-600 hover:text-red-700 shrink-0"
                    onClick={() => setSpecifications(specifications.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shipping Info Section */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-semibold mb-4">الشحن والإرجاع</h3>
          <Textarea
            placeholder="مثال: التوصيل خلال 5-7 أيام عمل. يمكن الإرجاع خلال 14 يوم من تاريخ الاستلام."
            value={formData.shipping_info}
            onChange={(e) => setFormData(prev => ({ ...prev, shipping_info: e.target.value }))}
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-2">
            اكتب معلومات الشحن والإرجاع الخاصة بهذا المنتج. إذا تركته فارغاً سيظهر النص الافتراضي.
          </p>
        </div>

        <div>
          <Label>صور المنتج</Label>
          
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">الصور الحالية:</p>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={url} 
                      alt={`صورة ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== index))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Preview */}
          {imageFiles.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">صور جديدة (سيتم رفعها):</p>
              <div className="flex flex-wrap gap-3">
                {imageFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={`صورة جديدة ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border border-blue-300"
                    />
                    <button
                      type="button"
                      onClick={() => setImageFiles(prev => prev.filter((_, i) => i !== index))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <label className="cursor-pointer">
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">اضغط لاختيار الصور</p>
              <p className="text-xs text-gray-500 mt-1">يمكنك اختيار صورة واحدة أو أكثر (PNG, JPG, GIF, WebP)</p>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setImageFiles(prev => [...prev, ...files]);
                e.target.value = ''; // Reset input
              }}
              className="hidden"
            />
          </label>

          {(existingImages.length === 0 && imageFiles.length === 0) && (
            <p className="text-xs text-orange-500 mt-2">
              <ImageIcon className="h-3 w-3 inline ml-1" />
              يجب إضافة صورة واحدة على الأقل
            </p>
          )}
        </div>

        {/* Toggles */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <Label htmlFor="available">المنتج متوفر</Label>
            <Switch
              id="available"
              checked={formData.available}
              onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, available: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isFeatured">عرض في "الأكثر طلباً"</Label>
            <Switch
              id="isFeatured"
              checked={formData.is_featured}
              onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, is_featured: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isNew">عرض في "وصل حديثاً"</Label>
            <Switch
              id="isNew"
              checked={formData.is_new}
              onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, is_new: checked }))}
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
            onClick={() => router.push('/admin/products')}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  );
}
