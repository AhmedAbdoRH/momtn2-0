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
  onPhotoAdded: () => void; // <-- Prop جديدة لإعلام الأب بالنجاح
}

const CreateNewDialog = ({ open, onOpenChange, onPhotoAdded }: CreateNewDialogProps) => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [albumName, setAlbumName] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null); // لا يزال مفيدًا للتحكم بالتركيز إذا لزم الأمر

  // --- تم حذف useEffect الخاص بتعديل موضع الـ Dialog ---
  // اعتمد على قدرات مكتبة الواجهة لمعالجة الموضع

  // جلب اقتراحات الألبومات عند فتح الـ Dialog
  useEffect(() => {
    if (open) {
      fetchAlbumSuggestions();
      // إعادة تعيين الحالة عند الفتح (اختياري لكن جيد)
      // resetFormState();
    }
  }, [open]);

  // تحرير previewUrl لمنع تسرب الذاكرة
  useEffect(() => {
    // يتم استدعاء هذه الدالة عند تغيير previewUrl أو عند إلغاء تحميل المكون
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]); // يعتمد على previewUrl

  const fetchAlbumSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('hashtags')
        .not('hashtags', 'is', null); // تأكد من أن هذا الفلتر صحيح لاحتياجاتك

      if (error) throw error;

      // استخراج الهاشتاجات الفريدة (نفس المنطق السابق)
      const allHashtags = data.flatMap(item => item.hashtags || []).filter(Boolean); // أضفت filter(Boolean) لإزالة أي قيم فارغة محتملة
      const uniqueHashtags = [...new Set(allHashtags)];
      setSuggestions(uniqueHashtags);
    } catch (error) {
      console.error('Error fetching album suggestions:', error);
      // يمكنك إظهار رسالة للمستخدم هنا إذا أردت
      // toast({ title: "خطأ", description: "لم نتمكن من جلب اقتراحات الألبومات.", variant: "destructive" });
    }
  };

  const resetFormState = () => {
    setImage(null);
    // لا تقم بإلغاء previewUrl هنا مباشرة، useEffect سيهتم بذلك
    setPreviewUrl("");
    setAlbumName("");
    setIsSubmitting(false);
    // أغلق الـ popover إذا كان مفتوحًا
    setPopoverOpen(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // تحرير الـ URL القديم قبل تعيين الجديد
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (file) {
      setImage(file);
      const newUrl = URL.createObjectURL(file);
      setPreviewUrl(newUrl);
    } else {
      setImage(null);
      setPreviewUrl("");
    }
  };

  const handleAlbumChange = (value: string) => {
    let formattedValue = value;
    if (formattedValue && !formattedValue.startsWith('#')) {
      formattedValue = '#' + formattedValue;
    }
    formattedValue = formattedValue.replace(/\s+/g, '_');
    setAlbumName(formattedValue);
  };

  const handleAlbumSelect = (album: string) => {
    setAlbumName(album);
    setPopoverOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // تحقق من المستخدم والصورة والحالة قبل البدء
    if (!image || isSubmitting || !user) {
       console.warn("Submit prevented:", { hasImage: !!image, isSubmitting, hasUser: !!user });
       return;
    }

    // التحقق من اسم الألبوم
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
      const fileExt = image.name.split('.').pop()?.toLowerCase() || 'jpg';
      // استخدام user.id لجعل اسم الملف فريدًا لكل مستخدم (أكثر أمانًا)
      const fileName = `${user.id}/photo_${Date.now()}.${fileExt}`;

      console.log('Uploading file:', fileName);
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('photos') // تأكد من أن اسم الـ bucket صحيح
        .upload(fileName, image, {
          cacheControl: '3600',
          upsert: false // عادةً ما يكون false أفضل لمنع الكتابة فوق ملف موجود بنفس الاسم بالصدفة
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        // حاول تحليل رسالة الخطأ لتقديم معلومات أفضل للمستخدم
        let userMessage = "لم نتمكن من رفع الصورة. يرجى المحاولة مرة أخرى.";
        if (uploadError.message.includes("exceeds the maximum allowed size")) {
            userMessage = "حجم الملف كبير جدًا. يرجى اختيار ملف أصغر.";
        } else if (uploadError.message.includes("mime type")) {
            userMessage = "نوع الملف غير مدعوم. يرجى اختيار صورة.";
        }
        toast({ title: "خطأ في الرفع", description: userMessage, variant: "destructive" });
        setIsSubmitting(false); // أوقف العملية هنا
        return; // اخرج من الدالة
      }

      console.log('Upload completed:', uploadData?.path); // استخدم uploadData.path إذا كانت متوفرة

      // الحصول على الرابط العام - تأكد من أن لديك RLS policies تسمح بذلك
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(uploadData!.path); // استخدم المسار من بيانات الرفع

      console.log('Public URL:', publicUrl);
      if (!publicUrl) {
          throw new Error("Failed to get public URL for the uploaded image.");
      }

      // تحضير الهاشتاجات
      const hashtags = albumName ? [albumName.trim()] : []; // trim() لإزالة أي مسافات زائدة

      console.log('Adding photo to database with user_id:', user.id, 'and hashtags:', hashtags);

      // إضافة الصورة إلى قاعدة البيانات
      const { data: insertData, error: insertError } = await supabase
        .from('photos') // تأكد من اسم الجدول
        .insert({
          image_url: publicUrl,
          // likes: 0, // يمكن تعيين القيمة الافتراضية في قاعدة البيانات
          // caption: null, // يمكن تعيين القيمة الافتراضية في قاعدة البيانات
          hashtags: hashtags.length > 0 ? hashtags : null, // أدخل null إذا لم تكن هناك هاشتاجات
          user_id: user.id,
          // "order": 0 // تأكد من أن هذا الحقل ضروري أو له قيمة افتراضية
        })
        .select() // أعد تحديد البيانات المدخلة إذا احتجت إليها
        .single(); // توقع نتيجة واحدة

      if (insertError) {
        console.error('Error adding photo to database:', insertError);
        // قد تحتاج إلى حذف الصورة من الـ Storage إذا فشل الإدراج في قاعدة البيانات (تعويض)
        // await supabase.storage.from('photos').remove([fileName]);
        throw insertError; // سيتم التقاطه بواسطة الـ catch الخارجي
      }

      console.log('Photo added successfully to DB:', insertData);

      // إظهار رسالة نجاح
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تمت إضافة صورتك الجديدة.", // رسالة أبسط
      });

      // إعادة تعيين النموذج وإغلاق الـ Dialog
      resetFormState();
      onOpenChange(false);

      // !!! إعلام المكون الأب بالنجاح لتحديث الواجهة !!!
      onPhotoAdded();

      // --- تم حذف window.location.reload() ---

    } catch (error: any) {
      console.error('Error submitting photo:', error);
      toast({
        title: "حدث خطأ",
        // حاول تقديم رسالة أكثر تحديدًا إذا أمكن
        description: error.message || "لم نتمكن من إضافة الصورة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      // تأكد من إعادة تعيين isSubmitting دائمًا
      setIsSubmitting(false);
    }
  };

  // --- باقي الكود (الجزء الخاص بالـ JSX) يبقى كما هو في الغالب ---
  // تأكد فقط من أن `DialogContent` لا يزال يحتوي على `data-dialog-content` إذا كانت هناك
  // أجزاء أخرى من الكود تعتمد عليه (لكن يُفضل عدم الاعتماد عليه).
  // الكود الخاص بـ Popover و Command يبدو جيدًا.

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
            // قم بإعادة تعيين الحالة عند الإغلاق أيضًا
            resetFormState();
        }
        onOpenChange(isOpen);
    }}>
      <DialogContent
        className="top-[45%] sm:max-w-[350px] max-h-[80vh] bg-gray-900/70 backdrop-blur-xl text-white border-0 shadow-xl overflow-y-auto" // أضفت overflow-y-auto
        // data-dialog-content // يمكنك إزالته إذا لم يعد هناك حاجة إليه
      >
        <DialogHeader>
          <DialogTitle>إضافة صورة جديدة</DialogTitle>
          <DialogDescription className="text-gray-300">
            قم بتحميل صورة لإضافتها إلى المعرض.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2"> {/* زيادة المسافة قليلًا */}
          <div className="flex flex-col items-center gap-4"> {/* زيادة المسافة */}
            <input
              id="image"
              type="file"
              accept="image/*,.heic,.heif" // السماح بأنواع إضافية شائعة من Apple
              onChange={handleImageChange}
              className="hidden"
            />
            <label // استخدام label بدل div لتحسين الوصولية
              htmlFor="image"
              className="w-full h-40 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition-colors focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-indigo-500" // تحسينات للتركيز
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-center"> {/* تغليف الأيقونة والنص */}
                  <ImagePlus className="w-10 h-10 text-gray-400 mx-auto" /> {/* تكبير الأيقونة */}
                  <p className="mt-2 text-sm text-gray-400">اضغط لاختيار صورة</p>
                </div>
              )}
            </label>

            {/* حقل اسم الألبوم مع القائمة المنسدلة */}
            <div className="w-full">
              <label htmlFor="albumNameInput" className="block text-sm font-medium text-gray-300 mb-1 text-right"> {/* استخدام htmlFor */}
                اسم الألبوم (اختياري)
              </label>

              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  {/* استخدام Button كـ trigger يمكن أن يكون أفضل للوصولية، لكن div تعمل */}
                   <div className="flex items-center relative w-full">
                    <Hash className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} /> {/* تعديل الموضع */}
                    <input
                      id="albumNameInput" // ربط بـ label
                      ref={inputRef} // ref لا يزال ممكنًا
                      type="text"
                      value={albumName}
                      onChange={(e) => handleAlbumChange(e.target.value)}
                      onFocus={() => {
                        if (suggestions.length > 0) setPopoverOpen(true); // الفتح فقط إذا كانت هناك اقتراحات
                      }}
                      placeholder="مثال: #رحلات_2025" // مثال أوضح
                      className="w-full px-3 py-2 pr-9 bg-gray-800/60 border border-gray-600 rounded-md text-right placeholder:text-gray-500 text-sm focus:border-indigo-500 focus:ring-indigo-500" // تحسينات focus
                      aria-autocomplete="list" // تحسين وصولية
                      aria-controls="album-suggestions" // تحسين وصولية
                    />
                  </div>
                </PopoverTrigger>
                {/* تأكد من أن المحتوى يظهر بشكل صحيح */}
                <PopoverContent
                  id="album-suggestions" // للربط مع aria-controls
                  className="w-[calc(100%-2rem)] sm:w-[300px] p-0 bg-gray-800 border border-gray-700 max-h-60 overflow-y-auto text-right shadow-lg" // تعديل العرض والـ z-index إذا لزم الأمر
                  align="end" // تأكد من المحاذاة
                  // sideOffset={5} // تعديل المسافة إذا لزم الأمر
                  style={{ zIndex: 51 }} // تأكد من أن القائمة المنسدلة فوق كل شيء آخر
                >
                  <Command className="bg-transparent">
                    <CommandInput
                      placeholder="ابحث أو أنشئ ألبومًا..."
                      className="text-right bg-gray-800 border-b border-gray-700 text-white h-10 px-3 placeholder:text-gray-500 focus:outline-none" // تنسيق أفضل
                    />
                    <CommandEmpty className="text-gray-400 text-center py-4 px-2"> {/* توسيط النص */}
                      لا توجد نتائج. يمكنك إنشاء ألبوم جديد.
                    </CommandEmpty>
                    <CommandGroup heading={suggestions.length > 0 ? "الألبومات المقترحة" : ""}> {/* إضافة عنوان */}
                      {suggestions.map((album, index) => (
                        <CommandItem
                          key={index}
                          value={album} // القيمة التي سيتم البحث بها
                          onSelect={() => handleAlbumSelect(album)}
                          className="text-right cursor-pointer px-3 py-2 hover:bg-gray-700 data-[selected=true]:bg-indigo-600 data-[selected=true]:text-white" // تحسينات hover/selected
                        >
                          {album}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="mt-1 text-xs text-gray-400 text-right">
                يبدأ بـ #، استخدم _ بدل المسافة.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3"> {/* إضافة padding */}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                  // resetFormState(); // تم نقله إلى onOpenChange
                  onOpenChange(false);
              }}
              className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700/50 focus:ring-gray-500" // تحسين hover/focus
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={!image || isSubmitting}
              className="bg-[#ea384c] hover:bg-[#d93042] text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-[#ea384c]" // تحسين hover/disabled/focus
            >
              {isSubmitting ? (
                 // إضافة spinner بسيط
                 <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
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
