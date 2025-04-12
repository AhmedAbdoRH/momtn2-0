import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ImagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";

// --- MODIFIED ---: إضافة Prop جديدة لإعلام الأب بالنجاح
interface CreateNewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPhotoAdded: () => void; // <-- Prop جديدة
}

// --- MODIFIED ---: إضافة Prop onPhotoAdded
const CreateNewDialog = ({ open, onOpenChange, onPhotoAdded }: CreateNewDialogProps) => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [albumName, setAlbumName] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // --- REMOVED ---: تم حذف useEffect الخاص بتعديل موضع الـ Dialog لتجنب التعارضات
  // useEffect(() => {
  //   const adjustDialogPosition = () => { ... };
  //   window.visualViewport?.addEventListener('resize', adjustDialogPosition);
  //   return () => {
  //     window.visualViewport?.removeEventListener('resize', adjustDialogPosition);
  //   };
  // }, [open]);

  // جلب اقتراحات الألبومات عند فتح الـ Dialog
  useEffect(() => {
    if (open) {
      fetchAlbumSuggestions();
      // إعادة تعيين النموذج عند الفتح قد يكون مفيدًا أيضًا
      // resetFormState();
    }
  }, [open]);

  // --- ADDED ---: تحرير previewUrl لمنع تسرب الذاكرة
  useEffect(() => {
    // هذه الدالة تُستدعى عندما يتغير previewUrl أو عندما يتم إلغاء تحميل المكون
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        console.log("Revoked URL:", previewUrl); // للتأكد من أنها تعمل
      }
    };
  }, [previewUrl]); // تعتمد على previewUrl

  const fetchAlbumSuggestions = async () => {
    if (!user) return; // لا تجلب الاقتراحات إذا لم يكن المستخدم مسجلاً
    try {
      // يمكنك تحسين هذا لجلب الهاشتاجات الخاصة بالمستخدم فقط إذا أردت
      const { data, error } = await supabase
        .from('photos')
        .select('hashtags')
        // .eq('user_id', user.id) // لإحضار هاشتاجات المستخدم الحالي فقط (اختياري)
        .not('hashtags', 'is', null);

      if (error) throw error;

      const allHashtags = data.flatMap(item => item.hashtags || []).filter(Boolean);
      const uniqueHashtags = [...new Set(allHashtags)].sort(); // فرز الهاشتاجات أبجديًا
      setSuggestions(uniqueHashtags);
    } catch (error) {
      console.error('Error fetching album suggestions:', error);
    }
  };

  // --- ADDED ---: دالة لإعادة تعيين حالة النموذج
  const resetFormState = () => {
    setImage(null);
    setPreviewUrl(""); // سيؤدي هذا إلى استدعاء دالة التنظيف في useEffect لتحرير الـ URL
    setAlbumName("");
    setShowSuggestions(false);
    setIsSubmitting(false); // تأكد من إعادة تعيين حالة الإرسال
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // --- MODIFIED ---: لا حاجة لتحرير الـ URL القديم هنا، useEffect سيهتم بذلك عند تغيير previewUrl
    if (file) {
      setImage(file);
      const newUrl = URL.createObjectURL(file);
      setPreviewUrl(newUrl); // تعيين الـ URL الجديد سي déclencher الـ useEffect لتنظيف القديم (إن وجد)
    } else {
      setImage(null);
      setPreviewUrl(""); // تعيين URL فارغ سي déclencher التنظيف أيضًا
    }
  };

  const handleAlbumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // لا تقم بإضافة # تلقائيًا هنا، دع المستخدم يكتبها أو اختر من القائمة
    // يمكنك إضافة تحقق لاحقًا عند الإرسال إذا كان # مطلوبًا

    // استبدال المسافات بـ _ (إذا كانت هذه هي القاعدة المطلوبة)
    value = value.replace(/\s+/g, '_');

    setAlbumName(value);
    // إظهار الاقتراحات إذا كان هناك نص (حتى لو كان مجرد #)
    setShowSuggestions(value.length > 0 && suggestions.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setAlbumName(suggestion); // قم بتعيين الاقتراح المختار
    setShowSuggestions(false); // أغلق القائمة
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || isSubmitting || !user) {
        console.warn("Submit prevented:", { hasImage: !!image, isSubmitting, hasUser: !!user });
        return;
    }

     // --- ADDED ---: التحقق من أن اسم الألبوم (إذا تم إدخاله) يبدأ بـ #
     if (albumName && !albumName.startsWith('#')) {
      toast({
        title: "خطأ في اسم الألبوم",
        description: "إذا أدخلت اسم ألبوم، فيجب أن يبدأ بعلامة #",
        variant: "destructive",
      });
      return; // أوقف الإرسال
    }

    setIsSubmitting(true);

    try {
      const fileExt = image.name.split('.').pop()?.toLowerCase() || 'jpg';
      // --- MODIFIED ---: استخدام user.id لجعل اسم الملف فريدًا وآمنًا
      const fileName = `${user.id}/photo_${Date.now()}.${fileExt}`;

      console.log('Uploading file:', fileName);
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('photos') // تأكد من اسم الـ Bucket
        .upload(fileName, image, {
          cacheControl: '3600',
          upsert: false // الأفضل لمنع الكتابة فوق ملف موجود بالصدفة
        });

      // --- MODIFIED ---: التعامل مع خطأ الرفع بشكل أفضل
      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        toast({ title: "خطأ في الرفع", description: `فشل رفع الملف: ${uploadError.message}`, variant: "destructive" });
        setIsSubmitting(false); // أوقف الحالة هنا
        return; // اخرج من الدالة
      }

      console.log('Upload completed:', uploadData?.path);
      const filePath = uploadData?.path;
      if (!filePath) {
         throw new Error("File path not returned after upload.");
      }

      // الحصول على الرابط العام
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath); // استخدم المسار الصحيح

      const publicUrl = urlData?.publicUrl;
      console.log('Public URL:', publicUrl);
      if (!publicUrl) {
          // حاول حذف الملف إذا لم يتم الحصول على الرابط لتجنب الملفات المعلقة
          await supabase.storage.from('photos').remove([filePath]);
          throw new Error("لم يتم العثور على الرابط العام للصورة بعد الرفع.");
      }

      // تحضير الهاشتاجات (الألبوم)
      // --- MODIFIED ---: trim() لإزالة المسافات وضمان إدخال null إذا كان فارغًا
      const finalAlbumName = albumName.trim();
      const hashtags = finalAlbumName ? [finalAlbumName] : null; // أدخل null إذا كان فارغًا
      console.log('Using hashtags:', hashtags);

      // إضافة الصورة إلى قاعدة البيانات
      const { data: insertData, error: insertError } = await supabase
        .from('photos') // تأكد من اسم الجدول
        .insert({
          image_url: publicUrl,
          hashtags: hashtags,
          user_id: user.id,
          // "order": 0 // تأكد أن القيمة الافتراضية في قاعدة البيانات صحيحة
        })
        .select() // أعد تحديد البيانات إذا احتجت إليها
        .single(); // توقع نتيجة واحدة

      if (insertError) {
        console.error('Error adding photo to database:', insertError);
        // حاول حذف الصورة من الـ Storage إذا فشل الإدراج (تعويض)
        await supabase.storage.from('photos').remove([filePath]);
        throw insertError; // سيتم التقاطه بواسطة الـ catch الخارجي
      }

      console.log('Photo added successfully to DB:', insertData);

      // إظهار رسالة نجاح
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تمت إضافة صورتك الجديدة.",
      });

       // --- MODIFIED ---: استدعاء onPhotoAdded لإعلام الأب
      onPhotoAdded();

      // --- MODIFIED ---: إغلاق النافذة وإعادة تعيين النموذج
      onOpenChange(false); // أغلق النافذة
      // لا حاجة لاستدعاء resetFormState هنا لأن onOpenChange(false) سيقوم بذلك

      // --- REMOVED ---: تم حذف إعادة تحميل الصفحة
      // window.location.reload();

    } catch (error: any) {
      console.error('Error submitting photo:', error);
      toast({
        title: "حدث خطأ",
        description: error.message || "لم نتمكن من إضافة الصورة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      // تأكد من إعادة تعيين isSubmitting دائمًا
      setIsSubmitting(false);
    }
  };

  // فلترة الاقتراحات بناءً على الإدخال الحالي
  const filteredSuggestions = suggestions.filter(suggestion =>
    // تأكد من أن suggestion هو string قبل استدعاء toLowerCase
    typeof suggestion === 'string' &&
    suggestion.toLowerCase().includes(albumName.replace('#', '').toLowerCase())
  );

  return (
     // --- MODIFIED ---: إضافة معالج لـ onOpenChange لإعادة التعيين عند الإغلاق
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        resetFormState(); // إعادة تعيين النموذج عند إغلاق النافذة
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent
        className="top-[45%] sm:max-w-[350px] max-h-[85vh] overflow-y-auto bg-gray-900/80 backdrop-blur-lg text-white border border-gray-700 shadow-xl rounded-lg" // تعديلات طفيفة على التصميم
        // لا نستخدم data-dialog-content للتعديل المباشر
      >
        <DialogHeader>
          <DialogTitle className="text-right text-white">إضافة صورة جديدة</DialogTitle>
          <DialogDescription className="text-right text-gray-300">
            قم بتحميل صورة وتصنيفها في ألبوم (اختياري).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="flex flex-col items-center gap-4">
            {/* --- MODIFIED ---: استخدام label لتحسين الوصولية */}
            <label htmlFor="imageUpload" className="w-full h-40 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 focus-within:border-indigo-500 transition-colors">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain rounded-lg p-1" // إضافة padding طفيف
                />
              ) : (
                <div className="text-center pointer-events-none"> {/* منع الأحداث على المحتوى الداخلي */}
                  <ImagePlus className="w-10 h-10 text-gray-400 mx-auto" />
                  <p className="mt-2 text-sm text-gray-400">اضغط لاختيار صورة</p>
                </div>
              )}
            </label>
             <input
              id="imageUpload" // ربط مع label
              type="file"
              accept="image/*,.heic,.heif" // قبول أنواع إضافية
              onChange={handleImageChange}
              className="hidden" // إخفاء input الأصلي
            />

            {/* حقل اسم الألبوم مع الاقتراحات المخصصة */}
            <div className="w-full relative">
              <label htmlFor="albumName" className="block text-sm font-medium text-gray-300 mb-1 text-right">
                اسم الألبوم (اختياري, يبدأ بـ #)
              </label>
              <input
                id="albumName"
                type="text"
                value={albumName}
                onChange={handleAlbumChange}
                onFocus={() => setShowSuggestions(albumName.length > 0 && suggestions.length > 0)} // إظهار فقط إذا كان هناك نص واقتراحات
                 // استخدام onMouseDown بدل onClick على القائمة يمنع onBlur من الإغلاق المبكر
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} // تأخير بسيط للسماح بالنقر
                placeholder="مثال: #رحلات_الصيف"
                className="w-full px-3 py-2 bg-gray-800/60 border border-gray-600 rounded-md text-right placeholder:text-gray-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                autoComplete="off" // تعطيل الإكمال التلقائي للمتصفح
                aria-haspopup="listbox" // تحسين وصولية
                aria-expanded={showSuggestions && filteredSuggestions.length > 0} // تحسين وصولية
              />

              {/* --- MODIFIED ---: قائمة الاقتراحات المخصصة مع تحسينات طفيفة */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                 // --- ADDED ---: تحسينات الوصولية والتصميم
                <div
                  role="listbox" // دور القائمة
                  id="suggestions-list"
                  aria-label="Album suggestions"
                  className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto bg-gray-800 border border-gray-700 rounded-md shadow-lg text-right suggestions-list"
                  // إضافة CSS لهذه الفئة ضروري
                >
                  {filteredSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        role="option" // دور العنصر في القائمة
                        aria-selected="false" // يمكن تحديثها بالـ state إذا أردت تظليل الاختيار
                        className="px-3 py-2 cursor-pointer hover:bg-gray-700 suggestion-item"
                        // --- MODIFIED ---: استخدام onMouseDown لمنع onBlur للإدخال من الإغلاق الفوري
                        onMouseDown={(e) => {
                            e.preventDefault(); // منع فقدان التركيز من الحقل الأصلي
                            handleSuggestionClick(suggestion);
                         }}
                      >
                        {suggestion}
                      </div>
                    ))
                  }
                </div>
              )}
               <p className="mt-1 text-xs text-gray-400 text-right">
                  استخدم # في البداية و _ بدل المسافات.
               </p>
            </div>
          </div>
          {/* --- MODIFIED ---: إضافة padding علوي للأزرار */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)} // سيتم استدعاء resetFormState تلقائيًا
              className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700/50 focus:ring-gray-500"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={!image || isSubmitting}
              className="bg-[#ea384c] hover:bg-[#d93042] text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-[#ea384c]"
            >
              {isSubmitting ? (
                 <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>جاري الحفظ...</span>
                 </div>
              ) : "حفظ الصورة"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewDialog;
