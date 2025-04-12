
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { ImagePlus, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CreateNewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateNewDialog = ({ open, onOpenChange }: CreateNewDialogProps) => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [albumName, setAlbumName] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // تعديل لاستجابة النافذة للوحة المفاتيح
  useEffect(() => {
    const adjustDialogPosition = () => {
      const dialogElement = document.querySelector('[data-dialog-content]');
      if (dialogElement && window.visualViewport) {
        const currentVisualViewport = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        
        if (currentVisualViewport < windowHeight) {
          // لوحة المفاتيح مفتوحة
          const keyboardHeight = windowHeight - currentVisualViewport;
          const newTop = `calc(45% - ${keyboardHeight / 2}px)`;
          (dialogElement as HTMLElement).style.top = newTop;
        } else {
          // لوحة المفاتيح مغلقة
          (dialogElement as HTMLElement).style.top = '45%';
        }
      }
    };

    // إضافة مستمع للتغيير في حجم الشاشة
    window.visualViewport?.addEventListener('resize', adjustDialogPosition);
    
    return () => {
      window.visualViewport?.removeEventListener('resize', adjustDialogPosition);
    };
  }, [open]);

  // جلب اقتراحات الألبومات من قاعدة البيانات
  useEffect(() => {
    if (open) {
      fetchAlbumSuggestions();
    }
  }, [open]);

  const fetchAlbumSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('hashtags')
        .not('hashtags', 'is', null);
      
      if (error) throw error;
      
      // استخراج جميع الهاشتاجات الفريدة من النتائج
      const allHashtags = data.flatMap(item => item.hashtags || []);
      const uniqueHashtags = [...new Set(allHashtags)];
      setSuggestions(uniqueHashtags);
    } catch (error) {
      console.error('Error fetching album suggestions:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleAlbumChange = (value: string) => {
    let formattedValue = value;
    
    // تأكد من وجود # في البداية
    if (formattedValue && !formattedValue.startsWith('#')) {
      formattedValue = '#' + formattedValue;
    }
    
    // استبدال المسافات بعلامة _
    formattedValue = formattedValue.replace(/\s+/g, '_');
    
    setAlbumName(formattedValue);
  };

  const handleAlbumSelect = (album: string) => {
    setAlbumName(album);
    setPopoverOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || isSubmitting || !user) return;

    // التحقق من أن اسم الألبوم يبدأ بـ #
    if (albumName && !albumName.startsWith('#')) {
      toast({
        title: "خطأ في اسم الألبوم",
        description: "يجب أن يبدأ اسم الألبوم بعلامة #",
        variant: "destructive",
      });
      return;
    }

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

      // تحضير الهاشتاجات (الألبومات)
      const hashtags = albumName ? [albumName] : [];
      console.log('Albums:', hashtags);

      // إضافة الصورة إلى قاعدة البيانات
      console.log('Adding photo to database with albums:', hashtags);
      
      const { data, error } = await supabase
        .from('photos')
        .insert({
          image_url: publicUrl,
          likes: 0,
          caption: null,
          hashtags: hashtags,
          user_id: user.id,
          "order": 0
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
      setAlbumName("");
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
      <DialogContent 
        className="top-[45%] sm:max-w-[350px] max-h-[80vh] bg-gray-900/70 backdrop-blur-xl text-white border-0 shadow-xl"
        data-dialog-content
      >
        <DialogHeader>
          <DialogTitle>إضافة صورة جديدة</DialogTitle>
          <DialogDescription className="text-gray-300">
            قم بتحميل صورة لإضافتها إلى المعرض.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col items-center gap-3">
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <div 
              className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition-colors"
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
                  <ImagePlus className="w-8 h-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-400">اضغط لاختيار صورة</p>
                </>
              )}
            </div>
            
            {/* حقل اسم الألبوم مع القائمة المنسدلة */}
            <div className="w-full">
              <label htmlFor="albumName" className="block text-sm text-gray-300 mb-1 text-right">
                اسم الألبوم (#اسم_الألبوم)
              </label>
              
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <div className="flex items-center relative w-full">
                    <Hash className="absolute right-3 text-gray-500 pointer-events-none" size={16} />
                    <input
                      ref={inputRef}
                      type="text"
                      value={albumName}
                      onChange={(e) => handleAlbumChange(e.target.value)}
                      onFocus={() => setPopoverOpen(true)}
                      placeholder="أدخل اسم الألبوم"
                      className="w-full px-3 py-2 pr-9 bg-gray-800/50 border border-gray-600 rounded-md text-right placeholder:text-gray-500 text-sm"
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-full p-0 bg-gray-800 border border-gray-700 max-h-72 overflow-y-auto text-right"
                  align="end"
                >
                  <Command className="bg-transparent">
                    <CommandInput 
                      placeholder="البحث عن الألبومات..." 
                      className="text-right bg-transparent border-b border-gray-700 text-white"
                    />
                    <CommandEmpty className="text-gray-400 text-right py-2 px-2">
                      لا توجد ألبومات مطابقة
                    </CommandEmpty>
                    <CommandGroup>
                      {suggestions.map((album, index) => (
                        <CommandItem 
                          key={index}
                          value={album}
                          onSelect={() => handleAlbumSelect(album)}
                          className="text-right cursor-pointer px-2 py-2 hover:bg-gray-700"
                        >
                          {album}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="mt-1 text-xs text-gray-400 text-right">
                يجب أن يبدأ بـ # وبدون مسافات (استخدم _ بدلاً من المسافة)
              </p>
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
                setAlbumName("");
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
