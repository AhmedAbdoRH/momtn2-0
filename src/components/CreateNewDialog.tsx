
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      console.log('Uploading file:', fileName);

      // إنشاء سياسة RLS للدلو إذا لم يكن موجودًا
      try {
        // محاولة إنشاء دلو التخزين إذا لم يكن موجودًا
        await supabase.storage.createBucket('photos', {
          public: true
        });
        console.log('Created photos bucket or it already exists');
      } catch (bucketError) {
        console.log('Bucket already exists or error creating bucket:', bucketError);
        // استمر في التنفيذ حتى لو فشل إنشاء الدلو (قد يكون موجودًا بالفعل)
      }
      
      // تحميل الملف
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('photos')
        .upload(fileName, image, {
          cacheControl: '3600',
          upsert: true // استخدام upsert بدلاً من false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // الحصول على رابط عام للصورة
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);

      // إضافة الصورة إلى قاعدة البيانات
      if (typeof window.addPhoto === 'function') {
        const success = await window.addPhoto({
          imageUrl: publicUrl,
        });

        if (success) {
          toast({
            title: "تمت الإضافة بنجاح",
            description: "تمت إضافة الصورة الجديدة إلى المعرض",
          });

          // إعادة تعيين النموذج
          setImage(null);
          setPreviewUrl("");
          onOpenChange(false);
        } else {
          throw new Error("فشل في إضافة الصورة إلى قاعدة البيانات");
        }
      } else {
        throw new Error("وظيفة addPhoto غير متوفرة");
      }
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
      <DialogContent className="sm:max-w-[425px] bg-gray-900/40 backdrop-blur-xl text-white border-0 shadow-xl">
        <DialogHeader>
          <DialogTitle>إضافة صورة جديدة</DialogTitle>
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
              className="w-full h-48 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition-colors"
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
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white"
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
