
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Image, Upload } from 'lucide-react';

interface CreateNewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId?: string;
}

const CreateNewDialog = ({ open, onOpenChange, spaceId }: CreateNewDialogProps) => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      handleFileSelect(selectedFile);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    // التحقق من نوع الملف
    if (!selectedFile.type.startsWith('image/')) {
      toast({
        title: "نوع ملف غير مدعوم",
        description: "يرجى اختيار صورة بصيغة PNG، JPEG، أو WebP",
        variant: "destructive",
      });
      return;
    }

    // التحقق من حجم الملف (10MB كحد أقصى)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "حجم الملف كبير جدًا",
        description: "يجب أن يكون حجم الملف أقل من 10 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    
    // إنشاء معاينة للصورة
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  };

  const uploadFile = async () => {
    if (!file) {
      toast({
        title: "لم يتم اختيار صورة",
        description: "يرجى اختيار صورة لتحميلها",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // إنشاء اسم فريد للملف
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      // تحميل الملف إلى Supabase Storage
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      // الحصول على URL العام للصورة
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // إضافة الصورة إلى جدول Photos مع إدراجها في المساحة المشتركة إذا كانت موجودة
      if (typeof window.addPhoto === 'function') {
        const success = await window.addPhoto({ 
          imageUrl: publicUrl,
          spaceId: spaceId // إضافة معرف المساحة المشتركة إذا كان موجودًا
        });
        
        if (success) {
          // إغلاق النافذة وإعادة تعيين الحالة
          resetState();
          onOpenChange(false);
        }
      } else {
        console.error('addPhoto function is not available on window object');
        toast({
          title: "خطأ في الإضافة",
          description: "حدث خطأ أثناء إضافة الصورة إلى المعرض",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "خطأ في التحميل",
        description: "حدث خطأ أثناء تحميل الصورة",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setPreview('');
    if (preview) URL.revokeObjectURL(preview);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!newOpen) resetState();
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="bg-gray-900/60 backdrop-blur-xl text-white border-gray-800 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-white">إضافة امتنان جديد</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!preview ? (
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                dragging ? 'border-indigo-400 bg-indigo-400/10' : 'border-gray-700 hover:border-indigo-400 hover:bg-gray-800/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInputChange}
              />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-sm text-gray-400 mb-1">اسحب صورة هنا أو انقر للاختيار</p>
              <p className="text-xs text-gray-500">PNG, JPG, WebP (حتى 10MB)</p>
            </div>
          ) : (
            <div className="relative">
              <img 
                src={preview} 
                alt="معاينة الصورة" 
                className="w-full h-auto rounded-lg object-cover max-h-60"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 bg-gray-900/60 hover:bg-gray-900/80 border-gray-700 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  resetState();
                }}
              >
                تغيير الصورة
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetState();
              onOpenChange(false);
            }}
            className="w-full bg-transparent border-gray-700 text-white hover:bg-gray-800"
            disabled={uploading}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            onClick={uploadFile}
            className="w-full bg-[#ea384c] hover:bg-[#ea384c]/90 text-white"
            disabled={!file || uploading}
          >
            {uploading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري التحميل...
              </span>
            ) : (
              <>
                <Image className="mr-2 h-5 w-5" />
                إضافة امتنان
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewDialog;
