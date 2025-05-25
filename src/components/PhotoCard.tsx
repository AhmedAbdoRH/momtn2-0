import { useState } from "react"; // استيراد useState لإدارة الحالة في المكون
import { GripVertical, Heart, MessageCircle, Trash2 } from "lucide-react"; // استيراد أيقونات من مكتبة lucide-react
import { supabase } from "@/integrations/supabase/client"; // استيراد عميل supabase للتفاعل مع قاعدة البيانات
import { Dialog, DialogContent } from "./ui/dialog"; // استيراد مكونات Dialog لعرض نافذة تحرير التعليق والهاشتاجات

// تعريف واجهة (interface) لتحديد خصائص المكون PhotoCard
interface PhotoCardProps {
  imageUrl: string; // رابط الصورة
  likes: number; // عدد الإعجابات الأولية
  caption?: string; // التعليق (اختياري)
  hashtags?: string[]; // الهاشتاجات (اختيارية)
  onDelete?: () => void; // دالة لحذف الصورة (اختيارية)
  dragHandleProps?: any; // خصائص للسحب والإفلات (اختيارية)
  onUpdateCaption?: (caption: string, hashtags: string[]) => Promise<void>; // دالة لتحديث التعليق والهاشتاجات (اختيارية)
}

// تعريف المكون PhotoCard مع خصائصه
const PhotoCard = ({ 
  imageUrl, 
  likes: initialLikes, 
  caption: initialCaption = '', // قيمة افتراضية فارغة إذا لم يُحدد تعليق
  hashtags: initialHashtags = [], // قيمة افتراضية مصفوفة فارغة إذا لم تُحدد هاشتاجات
  onDelete,
  dragHandleProps,
  onUpdateCaption 
}: PhotoCardProps) => {
  // تعريف الحالات باستخدام useState
  const [isLoved, setIsLoved] = useState(false); // حالة لتتبع ما إذا تم الإعجاب بالصورة
  const [likes, setLikes] = useState(initialLikes); // حالة لتتبع عدد الإعجابات
  const [isEditing, setIsEditing] = useState(false); // حالة لتتبع ما إذا كان وضع التحرير مفعلاً
  const [caption, setCaption] = useState(initialCaption); // حالة لتتبع التعليق الحالي
  const [hashtags, setHashtags] = useState(initialHashtags); // حالة لتتبع الهاشتاجات الحالية
  const [isControlsVisible, setIsControlsVisible] = useState(false); // حالة لإظهار/إخفاء الأزرار (مثل الحذف والتحرير)
  const [isHeartAnimating, setIsHeartAnimating] = useState(false); // حالة لتتبع تشغيل أنيميشن القلب

  // دالة لمعالجة الإعجاب بالصورة
  const handleLike = async () => {
    setIsHeartAnimating(true); // تفعيل أنيميشن القلب
    const newLikeCount = likes + 1; // زيادة عدد الإعجابات بـ 1
    setLikes(newLikeCount); // تحديث عدد الإعجابات في الحالة
    setIsLoved(true); // تعيين حالة الإعجاب إلى صحيح

    // تحديث عدد الإعجابات في قاعدة البيانات باستخدام supabase
    const { error } = await supabase
      .from('photos') // الجدول في قاعدة البيانات
      .update({ likes: newLikeCount }) // تحديث حقل الإعجابات
      .eq('image_url', imageUrl); // شرط لتحديد الصورة بناءً على رابطها

    if (error) { // في حالة حدوث خطأ
      console.error('Error updating likes:', error); // تسجيل الخطأ في وحدة التحكم
      setLikes(likes); // إعادة عدد الإعجابات إلى القيمة السابقة
    }

    // إيقاف الأنيميشن بعد ثانية واحدة (1000 مللي ثانية)
    setTimeout(() => {
      setIsHeartAnimating(false); // إيقاف أنيميشن القلب
      setIsLoved(false); // إعادة حالة الإعجاب إلى خطأ
    }, 1000);
  };

  // دالة لتقديم التعليق والهاشتاجات بعد التحرير
  const handleCaptionSubmit = async () => {
    if (onUpdateCaption) { // إذا كانت دالة التحديث موجودة
      await onUpdateCaption(caption, hashtags); // استدعاء الدالة لتحديث التعليق والهاشتاجات
    }
    setIsEditing(false); // إغلاق وضع التحرير
  };

  // دالة لمعالجة تغيير الهاشتاجات
  const handleHashtagsChange = (value: string) => {
    const tags = value.split(' '); // Treat space-separated words as album name
    setHashtags(tags); // تحديث حالة الهاشتاجات
  };

  // دالة لتبديل إظهار/إخفاء الأزرار
  const toggleControls = () => {
    setIsControlsVisible(!isControlsVisible); // تغيير الحالة بين الإظهار والإخفاء
  };

  // العرض (render) للمكون
  return (
    <>
      {/* الحاوية الرئيسية للبطاقة */}
      <div 
        className="relative group overflow-hidden rounded-xl shadow-xl transition-all duration-300"
        onClick={toggleControls} // تبديل إظهار الأزرار عند النقر
      >
        {/* حاوية الصورة */}
        <div className="relative overflow-hidden rounded-xl">
          <img
            src={imageUrl} // رابط الصورة
            alt="Gallery" // نص بديل للصورة
            className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105" // تنسيق الصورة مع تأثير تكبير عند التمرير
            loading="lazy" // تحميل كسول للصورة لتحسين الأداء
          />
          {/* تدرج شفاف فوق الصورة يظهر عند إظهار الأزرار */}
          <div className={`absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70 transition-opacity duration-300 ${
            isControlsVisible ? 'opacity-100' : 'opacity-0'
          }`} />
        </div>
        
        {/* زر السحب (drag handle) */}
        <div 
          {...dragHandleProps} // خصائص السحب والإفلات
          className={`absolute top-2 right-2 p-2 rounded-full bg-black/20 backdrop-blur-sm transition-opacity duration-300 cursor-move ${
            isControlsVisible ? 'opacity-50' : 'opacity-0' // يظهر عند تفعيل الأزرار
          }`}
        >
          <GripVertical className="w-4 h-4 text-white" /> {/* أيقونة السحب */}
        </div>

        {/* زر التحرير (تعليق وهاشتاجات) */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // منع النقر من التأثير على الحاوية الرئيسية
            setIsEditing(true); // فتح وضع التحرير
          }}
          className={`absolute top-2 left-2 p-2 rounded-full bg-black/20 backdrop-blur-sm transition-opacity duration-300 hover:opacity-100 ${
            isControlsVisible ? 'opacity-50' : 'opacity-0' // يظهر عند تفعيل الأزرار
          }`}
        >
          <MessageCircle className="w-4 h-4 text-white" /> {/* أيقونة التعليق */}
        </button>

        {/* زر الحذف */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // منع النقر من التأثير على الحاوية الرئيسية
            onDelete?.(); // استدعاء دالة الحذف إذا كانت موجودة
          }}
          className={`absolute bottom-2 right-2 p-2 rounded-full bg-black/20 backdrop-blur-sm transition-opacity duration-300 hover:bg-red-500/50 ${
            isControlsVisible ? 'opacity-50' : 'opacity-0' // يظهر عند تفعيل الأزرار
          } hover:opacity-100`}
        >
          <Trash2 className="w-4 h-4 text-white" /> {/* أيقونة الحذف */}
        </button>

        {/* قسم الإعجابات */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation(); // منع النقر من التأثير على الحاوية الرئيسية
              handleLike(); // استدعاء دالة الإعجاب
            }}
            className="relative group flex items-center gap-2 text-white/90 hover:text-white transition-colors p-2"
          >
            <div className="relative">
              <Heart
                className={`w-6 h-6 transition-all duration-300 transform ${
                  isLoved ? "fill-[#ea384c] text-[#ea384c] scale-125" : "hover:scale-110" // تغيير شكل القلب عند الإعجاب
                }`}
              />
              {isHeartAnimating && ( // عرض الأنيميشن عند تفعيله
                <div className="absolute inset-0 animate-ping">
                  <Heart className="w-6 h-6 text-[#ea384c]/30" /> {/* أنيميشن ping للقلب */}
                </div>
              )}
            </div>
          </button>
          {/* عرض عدد الإعجابات */}
          <span className="text-sm font-medium bg-black/10 backdrop-blur-sm px-2 py-1 rounded-md text-white/90">
            {likes}
          </span>
        </div>

        {/* عرض التعليق والهاشتاجات إذا وجدت */}
        {(caption || hashtags.length > 0) && (
          <div className={`absolute left-2 right-2 bottom-14 p-2 bg-black/50 backdrop-blur-md rounded-lg transition-opacity duration-300 ${
            isControlsVisible ? 'opacity-80' : 'opacity-0' // يظهر عند تفعيل الأزرار
          }`}>
            {caption && <p className="text-white text-sm mb-1 text-right">{caption}</p>} {/* التعليق */}
            {hashtags.length > 0 && ( // الهاشتاجات
              <div className="flex flex-wrap gap-1 justify-end">
                {hashtags.map((tag) => (
                  <span key={tag} className="text-xs text-white/60 flex items-center">
                    <span className="ml-1">•</span>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* نافذة التحرير (Dialog) */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="bg-gray-900/60 backdrop-blur-xl text-white border-0">
          <div className="space-y-4">
            {/* حقل التعليق */}
            <div>
              <label className="block text-sm font-medium mb-2">التعليق</label>
              <textarea
                value={caption} // قيمة التعليق الحالية
                onChange={(e) => setCaption(e.target.value)} // تحديث التعليق عند التغيير
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm rounded-md text-white text-right"
                rows={3}
                placeholder="أضف تعليقاً..."
                dir="rtl"
              />
            </div>
            {/* حقل الهاشتاجات */}
            <div>
              <label className="block text-sm font-medium mb-2">اسم الالبوم</label>
              <input
                type="text"
                value={hashtags.join(' ')} // عرض الهاشتاجات كسلسلة نصية
                onChange={(e) => handleHashtagsChange(e.target.value)} // تحديث الهاشتاجات عند التغيير
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm rounded-md text-white text-right"
                dir="rtl"
                />
            </div>
            {/* أزرار الإلغاء والحفظ */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)} // إغلاق النافذة بدون حفظ
                className="px-4 py-2 rounded-md bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleCaptionSubmit} // حفظ التغييرات
                className="px-4 py-2 rounded-md bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
              >
                حفظ
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// تصدير المكون لاستخدامه في مكان آخر
export default PhotoCard;
