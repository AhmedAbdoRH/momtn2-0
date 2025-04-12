import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ImagePlus } from "lucide-react"; // أبقيت أيقونة Hash لأنها قد تكون مفيدة بصريًا، أو يمكن إزالتها لاحقًا
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";

// واجهة الخصائص تبقى كما هي (مع onPhotoAdded)
interface CreateNewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPhotoAdded: () => void;
}

const CreateNewDialog = ({ open, onOpenChange, onPhotoAdded }: CreateNewDialogProps) => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // --- CHANGED ---: اسم الألبوم الآن نص عادي
  const [albumName, setAlbumName] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // useEffect لجلب الاقتراحات يبقى كما هو
  useEffect(() => {
    if (open) {
      fetchAlbumSuggestions();
    }
  }, [open]);

  // useEffect لتحرير previewUrl يبقى كما هو
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchAlbumSuggestions = async () => {
    if (!user) return;
    try {
      // --- CHANGED ---: اسم العمود في قاعدة البيانات لا يزال 'hashtags'
      // ولكنه سيحتوي الآن على أسماء ألبومات عادية داخل المصفوفة
      const { data, error } = await supabase
        .from('photos')
        .select('hashtags')
        .not('hashtags', 'is', null);

      if (error) throw error;

      // استخراج الأسماء الفريدة (التي هي الآن أسماء ألبومات عادية)
      const allAlbumNames = data.flatMap(item => item.hashtags || []).filter(Boolean);
      const uniqueAlbumNames = [...new Set(allAlbumNames)].sort();
      setSuggestions(uniqueAlbumNames);
      console.log("Fetched suggestions:", uniqueAlbumNames); // للتأكد
    } catch (error) {
      console.error('Error fetching album suggestions:', error);
    }
  };

  // دالة إعادة تعيين النموذج تبقى كما هي
  const resetFormState = () => {
    setImage(null);
    setPreviewUrl("");
    setAlbumName("");
    setShowSuggestions(false);
    setIsSubmitting(false);
  };

  // دالة تغيير الصورة تبقى كما هي
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const newUrl = URL.createObjectURL(file);
      setPreviewUrl(newUrl);
    } else {
      setImage(null);
      setPreviewUrl("");
    }
  };

  // --- CHANGED ---: التعامل مع تغيير اسم الألبوم (بدون # أو _)
  const handleAlbumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAlbumName(value);
    // إبقاء الاقتراحات ظاهرة طالما الحقل في حالة التركيز وهناك اقتراحات
    setShowSuggestions(suggestions.length > 0);
  };

  // اختيار اقتراح يبقى كما هو
  const handleSuggestionClick = (suggestion: string) => {
    setAlbumName(suggestion);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || isSubmitting || !user) return;

    // --- REMOVED ---: تم حذف التحقق من صيغة الهاشتاج #
    // if (albumName && !albumName.startsWith('#')) { ... }

    setIsSubmitting(true);

    try {
      const fileExt = image.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/photo_${Date.now()}.${fileExt}`;

      console.log('Uploading file:', fileName);
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('photos')
        .upload(fileName, image, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        toast({ title: "خطأ في الرفع", description: `فشل رفع الملف: ${uploadError.message}`, variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      const filePath = uploadData?.path;
      if (!filePath) throw new Error("File path not returned after upload.");

      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(filePath);
      const publicUrl = urlData?.publicUrl;
      if (!publicUrl) {
        await supabase.storage.from('photos').remove([filePath]);
        throw new Error("لم يتم العثور على الرابط العام للصورة بعد الرفع.");
      }
      console.log('Public URL:', publicUrl);

      // --- CHANGED ---: تحضير اسم الألبوم كنص عادي داخل مصفوفة
      const finalAlbumName = albumName.trim();
      // لا يزال اسم العمود في Supabase هو 'hashtags', ولكنه سيحتوي على اسم الألبوم العادي
      const albumDataForDB = finalAlbumName ? [finalAlbumName] : null;
      console.log('Album data for DB:', albumDataForDB);

      const { data: insertData, error: insertError } = await supabase
        .from('photos')
        .insert({
          image_url: publicUrl,
          hashtags: albumDataForDB, // إرسال المصفوفة التي تحتوي على الاسم العادي
          user_id: user.id,
        })
        .select().single();

      if (insertError) {
        console.error('Error adding photo to database:', insertError);
        await supabase.storage.from('photos').remove([filePath]);
        throw insertError;
      }

      console.log('Photo added successfully to DB:', insertData);
      toast({ title: "تمت الإضافة بنجاح", description: "تمت إضافة صورتك الجديدة." });
      onPhotoAdded();
      onOpenChange(false); // سيقوم بإعادة تعيين النموذج

    } catch (error: any) {
      console.error('Error submitting photo:', error);
      toast({ title: "حدث خطأ", description: error.message || "لم نتمكن من إضافة الصورة.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- CHANGED ---: فلترة الاقتراحات (تبقى كما هي تقريبًا، تطابق أي جزء من النص)
  const filteredSuggestions = albumName
    ? suggestions.filter(suggestion =>
        typeof suggestion === 'string' &&
        suggestion.toLowerCase().includes(albumName.toLowerCase())
      )
    : suggestions; // إظهار كل الاقتراحات إذا كان الحقل فارغًا

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetFormState();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="top-[45%] sm:max-w-[350px] max-h-[85vh] overflow-y-auto bg-gray-900/80 backdrop-blur-lg text-white border border-gray-700 shadow-xl rounded-lg">
        <DialogHeader>
          {/* --- CHANGED ---: تحديث العناوين */}
          <DialogTitle className="text-right text-white">إضافة صورة جديدة</DialogTitle>
          <DialogDescription className="text-right text-gray-300">
            قم بتحميل صورة وأضفها إلى ألبوم (اختياري).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="flex flex-col items-center gap-4">
            {/* جزء تحميل الصورة يبقى كما هو */}
             <label htmlFor="imageUpload" className="w-full h-40 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 focus-within:border-indigo-500 transition-colors">
              {previewUrl ? ( <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg p-1"/> ) : (
                <div className="text-center pointer-events-none"> <ImagePlus className="w-10 h-10 text-gray-400 mx-auto" /> <p className="mt-2 text-sm text-gray-400">اضغط لاختيار صورة</p> </div>
              )}
            </label>
             <input id="imageUpload" type="file" accept="image/*,.heic,.heif" onChange={handleImageChange} className="hidden"/>

            {/* حقل اسم الألبوم */}
            <div className="w-full relative">
              {/* --- CHANGED ---: تحديث التسمية والنص المساعد */}
              <label htmlFor="albumName" className="block text-sm font-medium text-gray-300 mb-1 text-right">
                اسم الألبوم (اختياري)
              </label>
              <input
                id="albumName"
                type="text"
                value={albumName}
                onChange={handleAlbumChange}
                // --- CHANGED ---: إظهار الاقتراحات عند التركيز إذا كانت موجودة
                onFocus={() => setShowSuggestions(suggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                // --- CHANGED ---: تحديث placeholder
                placeholder="مثال: رحلات الصيف"
                className="w-full px-3 py-2 bg-gray-800/60 border border-gray-600 rounded-md text-right placeholder:text-gray-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                autoComplete="off"
                aria-haspopup="listbox"
                aria-expanded={showSuggestions && filteredSuggestions.length > 0}
              />

              {/* قائمة الاقتراحات */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div
                  role="listbox"
                  id="suggestions-list"
                  aria-label="Album suggestions"
                  // تأكد من وجود تصميم CSS لهذه الفئة
                  className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto bg-gray-800 border border-gray-700 rounded-md shadow-lg text-right suggestions-list"
                >
                  {filteredSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        role="option"
                        aria-selected="false"
                        // تأكد من وجود تصميم CSS لهذه الفئة
                        className="px-3 py-2 cursor-pointer hover:bg-gray-700 suggestion-item"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            handleSuggestionClick(suggestion);
                         }}
                      >
                        {/* عرض اسم الألبوم العادي */}
                        {suggestion}
                      </div>
                    ))
                  }
                </div>
              )}
              {/* --- REMOVED ---: تم حذف النص المساعد الخاص بـ # و _ */}
              {/* <p className="mt-1 text-xs text-gray-400 text-right">...</p> */}
            </div>
          </div>
          {/* الأزرار تبقى كما هي */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700/50 focus:ring-gray-500">إلغاء</Button>
            <Button type="submit" disabled={!image || isSubmitting} className="bg-[#ea384c] hover:bg-[#d93042] text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-[#ea384c]">
              {isSubmitting ? ( <div className="flex items-center gap-2"><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>جاري الحفظ...</span></div> ) : "حفظ الصورة"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewDialog;
