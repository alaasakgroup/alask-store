import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { FAQ } from '../../lib/types';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { Textarea } from '../../app/components/ui/textarea';
import { Switch } from '../../app/components/ui/switch';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../app/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../app/components/ui/dialog';

export default function AdminFAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    visible: true
  });

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    const data = await api.getFAQs(false);
    setFaqs(data);
  };

  const handleOpenDialog = (faq?: FAQ) => {
    if (faq) {
      setEditingFaq(faq);
      setFormData({
        question: faq.question,
        answer: faq.answer,
        visible: faq.visible
      });
    } else {
      setEditingFaq(null);
      setFormData({
        question: '',
        answer: '',
        visible: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      visible: true
    });
  };

  const handleSave = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('الرجاء ملء جميع الحقول');
      return;
    }

    try {
      if (editingFaq) {
        await api.updateFAQ(editingFaq.id, formData);
        toast.success('تم تحديث السؤال');
      } else {
        await api.createFAQ({
          ...formData,
          order: faqs.length + 1
        } as any);
        toast.success('تم إضافة السؤال');
      }
      handleCloseDialog();
      loadFAQs();
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
      return;
    }

    try {
      await api.deleteFAQ(id);
      toast.success('تم حذف السؤال');
      loadFAQs();
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const handleToggleVisible = async (faq: FAQ) => {
    try {
      await api.updateFAQ(faq.id, { visible: !faq.visible });
      loadFAQs();
    } catch (error) {
      toast.error('حدث خطأ أثناء التحديث');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة الأسئلة الشائعة</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة سؤال جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingFaq ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="question">السؤال</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="أدخل السؤال"
                />
              </div>

              <div>
                <Label htmlFor="answer">الإجابة</Label>
                <Textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                  placeholder="أدخل الإجابة"
                  rows={5}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="visible">عرض في الصفحة الرئيسية</Label>
                <Switch
                  id="visible"
                  checked={formData.visible}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, visible: checked }))}
                />
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

      {faqs.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg border">
          <p>لا توجد أسئلة شائعة حالياً</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>السؤال</TableHead>
                <TableHead>الإجابة</TableHead>
                <TableHead>مرئي</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faqs.map(faq => (
                <TableRow key={faq.id}>
                  <TableCell className="font-semibold max-w-xs">
                    {faq.question}
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="line-clamp-2 text-sm text-gray-600">
                      {faq.answer}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={faq.visible}
                      onCheckedChange={() => handleToggleVisible(faq)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleOpenDialog(faq)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(faq.id)}
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