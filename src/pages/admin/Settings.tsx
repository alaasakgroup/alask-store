import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Button } from '../../app/components/ui/button';
import { Input } from '../../app/components/ui/input';
import { Label } from '../../app/components/ui/label';
import { Textarea } from '../../app/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, X, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../app/components/ui/tabs';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [logoPosition, setLogoPosition] = useState({ x: 0, y: 0, scale: 1 });

  useEffect(() => {
    api.getSettings().then(data => {
      setSettings(data);
      setLogoPosition(data.logoPosition);
    });
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setSettings((prev: any) => ({ ...prev, logoUrl: null }));
  };

  const handleSave = async () => {
    if (!settings) return;

    setIsSubmitting(true);
    try {
      const updates = {
        ...settings,
        logoUrl: logoFile || settings.logoUrl,
        logoPosition
      };
      await api.updateSettings(updates);
      toast.success('تم حفظ الإعدادات بنجاح');
      window.location.reload(); // Reload to update header/footer
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const displayLogo = logoFile || settings.logoUrl;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">إعدادات المتجر</h1>

      <Tabs defaultValue="branding">
        <TabsList>
          <TabsTrigger value="branding">العلامة التجارية</TabsTrigger>
          <TabsTrigger value="contact">معلومات التواصل</TabsTrigger>
          <TabsTrigger value="social">وسائل التواصل</TabsTrigger>
        </TabsList>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <div className="bg-white rounded-lg border p-6 space-y-6">
            <div>
              <Label htmlFor="storeName">اسم المتجر</Label>
              <Input
                id="storeName"
                value={settings.storeName}
                onChange={(e) => setSettings((prev: any) => ({ ...prev, storeName: e.target.value }))}
                placeholder="اسم المتجر"
              />
            </div>

            {/* Logo Upload */}
            <div>
              <Label>شعار المتجر</Label>
              
              {displayLogo ? (
                <div className="space-y-4">
                  {/* Logo Preview */}
                  <div className="relative w-48 h-48 border-2 border-dashed rounded-lg overflow-hidden bg-gray-50">
                    <div 
                      className={`w-full h-full ${settings.logoShape === 'circle' ? 'rounded-full' : 'rounded-lg'} overflow-hidden`}
                    >
                      <img
                        src={displayLogo}
                        alt="Logo"
                        className="w-full h-full object-cover"
                        style={{
                          transform: `translate(${logoPosition.x}px, ${logoPosition.y}px) scale(${logoPosition.scale})`
                        }}
                      />
                    </div>
                  </div>

                  {/* Logo Controls */}
                  <div className="space-y-3">
                    <div>
                      <Label>شكل الشعار</Label>
                      <div className="flex gap-3 mt-2">
                        <Button
                          type="button"
                          variant={settings.logoShape === 'square' ? 'default' : 'outline'}
                          onClick={() => setSettings((prev: any) => ({ ...prev, logoShape: 'square' }))}
                        >
                          مربع
                        </Button>
                        <Button
                          type="button"
                          variant={settings.logoShape === 'circle' ? 'default' : 'outline'}
                          onClick={() => setSettings((prev: any) => ({ ...prev, logoShape: 'circle' }))}
                        >
                          دائري
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>تحكم في الموضع والحجم</Label>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setLogoPosition(prev => ({ ...prev, y: prev.y - 5 }))}
                        >
                          ↑
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setLogoPosition(prev => ({ ...prev, y: prev.y + 5 }))}
                        >
                          ↓
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setLogoPosition(prev => ({ ...prev, x: prev.x - 5 }))}
                        >
                          →
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setLogoPosition(prev => ({ ...prev, x: prev.x + 5 }))}
                        >
                          ←
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setLogoPosition(prev => ({ ...prev, scale: Math.min(2, prev.scale + 0.1) }))}
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setLogoPosition(prev => ({ ...prev, scale: Math.max(0.5, prev.scale - 0.1) }))}
                        >
                          <ZoomOut className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setLogoPosition({ x: 0, y: 0, scale: 1 })}
                        >
                          إعادة تعيين
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <label htmlFor="logo-change" className="cursor-pointer">
                        <Button type="button" variant="outline" asChild>
                          <span>
                            <Upload className="ml-2 h-4 w-4" />
                            تغيير الشعار
                          </span>
                        </Button>
                      </label>
                      <input
                        id="logo-change"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveLogo}
                        className="text-red-600"
                      >
                        <X className="ml-2 h-4 w-4" />
                        حذف الشعار
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <label htmlFor="logo-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
                    <Upload className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-1">اضغط لرفع الشعار</p>
                    <p className="text-xs text-gray-500">PNG, JPG أو GIF (حد أقصى 2MB)</p>
                  </div>
                </label>
              )}
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
          </div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <div className="bg-white rounded-lg border p-6 space-y-6">
            <div>
              <Label htmlFor="address">العنوان</Label>
              <Textarea
                id="address"
                value={settings.address}
                onChange={(e) => setSettings((prev: any) => ({ ...prev, address: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  dir="ltr"
                  value={settings.phone}
                  onChange={(e) => setSettings((prev: any) => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  dir="ltr"
                  value={settings.email}
                  onChange={(e) => setSettings((prev: any) => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="mapLocation">رابط خريطة Google (iframe src)</Label>
              <Input
                id="mapLocation"
                dir="ltr"
                value={settings.mapLocation}
                onChange={(e) => setSettings((prev: any) => ({ ...prev, mapLocation: e.target.value }))}
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
              <p className="text-xs text-gray-500 mt-1">
                اترك فارغاً لإخفاء الخريطة من الفوتر
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="space-y-6">
          <div className="bg-white rounded-lg border p-6 space-y-6">
            <div>
              <Label htmlFor="facebook">رابط Facebook</Label>
              <Input
                id="facebook"
                dir="ltr"
                value={settings.socialLinks?.facebook || ''}
                onChange={(e) => setSettings((prev: any) => ({ 
                  ...prev, 
                  socialLinks: { ...prev.socialLinks, facebook: e.target.value }
                }))}
                placeholder="https://facebook.com/yourpage"
              />
            </div>

            <div>
              <Label htmlFor="instagram">رابط Instagram</Label>
              <Input
                id="instagram"
                dir="ltr"
                value={settings.socialLinks?.instagram || ''}
                onChange={(e) => setSettings((prev: any) => ({ 
                  ...prev, 
                  socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                }))}
                placeholder="https://instagram.com/yourpage"
              />
            </div>

            <div>
              <Label htmlFor="whatsapp">رقم WhatsApp</Label>
              <Input
                id="whatsapp"
                dir="ltr"
                value={settings.socialLinks?.whatsapp || ''}
                onChange={(e) => setSettings((prev: any) => ({ 
                  ...prev, 
                  socialLinks: { ...prev.socialLinks, whatsapp: e.target.value }
                }))}
                placeholder="+964xxxxxxxxxx"
              />
            </div>

            <p className="text-xs text-gray-500">
              اترك الحقول فارغة لإخفاء الأيقونات من الفوتر
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-4">
        <Button onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </div>
    </div>
  );
}