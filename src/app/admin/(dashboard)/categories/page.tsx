'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      toast.error('فشل في تحميل التصنيفات');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\u0621-\u064Aa-z0-9-]/g, '');
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, slug: category.slug });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', slug: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', slug: '' });
  };

  const handleNameChange = (name: string) => {
    setFormData({
      name,
      slug: generateSlug(name)
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('يرجى إدخال اسم التصنيف');
      return;
    }

    try {
      if (editingCategory) {
        const updated = await api.updateCategory(editingCategory.id, formData);
        setCategories(categories.map(c => c.id === updated.id ? updated : c));
        toast.success('تم تحديث التصنيف بنجاح');
      } else {
        const created = await api.createCategory(formData);
        setCategories([...categories, created]);
        toast.success('تم إضافة التصنيف بنجاح');
      }
      handleCloseDialog();
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;

    try {
      await api.deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      toast.success('تم حذف التصنيف بنجاح');
    } catch (error) {
      toast.error('فشل في حذف التصنيف. قد يكون مرتبطاً بمنتجات.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة التصنيفات</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة تصنيف جديد
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">اسم التصنيف</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="مثال: أدوات المطبخ"
                />
              </div>
              <div>
                <Label htmlFor="slug">الرابط (Slug)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="kitchen-tools"
                  dir="ltr"
                  className="text-left"
                />
                <p className="text-xs text-gray-500 mt-1">يُستخدم في روابط URL</p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  <Save className="ml-2 h-4 w-4" />
                  حفظ
                </Button>
                <Button variant="outline" onClick={handleCloseDialog}>
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg border">
          <p>لا توجد تصنيفات حالياً</p>
          <p className="text-sm mt-2">قم بإضافة تصنيف جديد للبدء</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">اسم التصنيف</TableHead>
                <TableHead className="text-right">الرابط (Slug)</TableHead>
                <TableHead className="text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map(category => (
                <TableRow key={category.id}>
                  <TableCell className="font-semibold text-right">{category.name}</TableCell>
                  <TableCell className="text-right" dir="ltr">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">{category.slug}</code>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleOpenDialog(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
