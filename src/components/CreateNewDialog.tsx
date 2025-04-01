
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";

interface CreateNewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateNewDialog = ({ open, onOpenChange }: CreateNewDialogProps) => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || isSubmitting || !user) return;

    setIsSubmitting(true);

    try {
      // تسجيل معلومات عن الملف للتصحيح
      console.log('File info:', {
        name: image.name,
        type: image.type,
        size: image.size
      });

      // التأكد من امتداد الملف
      const fileExt = image.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `photo_${Date.now()}.${fileExt}`;
      
      console.log('Uploading file:', fileName);
      
      // تحميل الملف
      console.log('Starting file upload...');
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('photos')
        .upload(fileName, image, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload completed:', uploadData);

      // الحصول على رابط عام للصورة
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);

      // إضافة الصورة إلى قاعدة البيانات
      console.log('Adding photo to database:', publicUrl);
      
      const { data, error } = await supabase
        .from('photos')
        .insert({
          image_url: publicUrl,
          likes: 0,
          caption: null,
          hashtags: [],
          user_id: user.id,
          order: 0
        })
        .select();

      if (error) {
        console.error('Error adding photo to database:', error);
        throw error;
      }

      console.log('Photo added successfully:', data);

      // إعادة تعيين النموذج
      setImage(null);
      setPreviewUrl("");
      onOpenChange(false);

      // إظهار رسالة نجاح
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تمت إضافة الصورة الجديدة إلى المعرض",
      });

      // إعادة تحميل الصفحة لإظهار الصورة الجديدة
      window.location.reload();

    } catch (error) {
      console.error('Error submitting photo:', error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من إضافة الصورة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[20%] sm:max-w-[400px] bg-gray-900/70 backdrop-blur-xl text-white border-0 shadow-xl">
        <DialogHeader>
          <DialogTitle>إضافة صورة جديدة</DialogTitle>
          <DialogDescription className="text-gray-300">
            قم بتحميل صورة لإضافتها إلى المعرض.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <div 
              className="w-full h-44 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition-colors"
              onClick={() => document.getElementById('image')?.click()}
            >
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <>
                  <ImagePlus className="w-10 h-10 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-400">اضغط لاختيار صورة</p>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                onOpenChange(false);
                setPreviewUrl("");
                setImage(null);
              }}
              className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={!image || isSubmitting}
              className="bg-[#ea384c] hover:bg-[#ea384c]/90 text-white"
            >
              {isSubmitting ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewDialog;
