import { useState, useEffect } from "react"; // استيراد useState و useEffect لإدارة الحالة في المكون
import { GripVertical, Heart, MessageCircle, Trash2, MoreVertical, Plus } from "lucide-react"; // استيراد أيقونات من مكتبة lucide-react
import { supabase } from "@/integrations/supabase/client"; // استيراد عميل supabase للتفاعل مع قاعدة البيانات
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"; // استيراد مكونات Dialog لعرض نافذة تحرير التعليق والهاشتاجات
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

// تعريف واجهة (interface) لتحديد خصائص المكون PhotoCard
interface PhotoCardProps {
  imageUrl: string; // رابط الصورة
  likes: number; // عدد الإعجابات الأولية
  caption?: string; // التعليق (اختياري)
  hashtags?: string[]; // الهاشتاجات (اختيارية)
  onDelete?: () => void; // دالة لحذف الصورة (اختيارية)
  dragHandleProps?: any; // خصائص للسحب والإفلات (اختيارية)
  onUpdateCaption?: (caption: string, hashtags: string[]) => Promise<void>; // دالة لتحديث التعليق والهاشتاجات (اختيارية)
  isGroupPhoto?: boolean; // هل هذه صورة في مجموعة
  userEmail?: string; // إيميل المستخدم (للمجموعات)
  userDisplayName?: string; // الاسم الشخصي للمستخدم (للمجموعات)
}

// تعريف المكون PhotoCard مع خصائصه
const PhotoCard = ({ 
  imageUrl, 
  likes: initialLikes, 
  caption: initialCaption = '', // قيمة افتراضية فارغة إذا لم يُحدد تعليق
  hashtags: initialHashtags = [], // قيمة افتراضية مصفوفة فارغة إذا لم تُحدد هاشتاجات
  onDelete,
  dragHandleProps,
  onUpdateCaption,
  isGroupPhoto = false, // افتراضي false
  userEmail, // إيميل المستخدم
  userDisplayName // الاسم الشخصي للمستخدم
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

  // الحصول على الاسم المعروض (الجزء الأول من الإيميل كقيمة افتراضية إذا لم يتم تحديد اسم)
  const getDisplayName = () => {
    // إذا كان هناك إيميل، نستخدم الجزء الأول منه كاسم افتراضي
    if (userEmail) {
      const emailUsername = userEmail.split('@')[0];
      // إذا كان هناك اسم معرّف، نستخدمه، وإلا نستخدم اسم المستخدم من الإيميل
      return (userDisplayName && userDisplayName.trim()) ? userDisplayName.trim() : emailUsername;
    }
    // إذا لم يكن هناك إيميل، نستخدم الاسم المعرّف إن وجد
    return (userDisplayName && userDisplayName.trim()) ? userDisplayName.trim() : '';
  };

  // حالة لحفظ قائمة الألبومات
  const [albums, setAlbums] = useState<string[]>([]);
  const [showAlbumDialog, setShowAlbumDialog] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [showNewAlbumInput, setShowNewAlbumInput] = useState(false);

  // جلب الألبومات بناءً على نوع الصورة (شخصية أو مشتركة)
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const { data, error } = await supabase
          .from('photos')
          .select('hashtags')
          .not('hashtags', 'is', null)
          .eq('group_id', isGroupPhoto ? (window.location.pathname !== '/' ? 'not_null' : null) : null);

        if (error) throw error;

        const allAlbums = data
          .flatMap(photo => photo.hashtags || [])
          .filter((album): album is string => Boolean(album));
        
        const uniqueAlbums = [...new Set(allAlbums)];
        setAlbums(uniqueAlbums);
      } catch (error) {
        console.error('Error fetching albums:', error);
      }
    };

    if (showAlbumDialog) {
      fetchAlbums();
    }
  }, [showAlbumDialog, isGroupPhoto]);

  // معالجة إضافة صورة إلى ألبوم
  const handleAddToAlbum = async () => {
    if (!selectedAlbum) return;
    
    try {
      if (onUpdateCaption) {
        await onUpdateCaption(caption, [selectedAlbum]);
      }
      setShowAlbumDialog(false);
    } catch (error) {
      console.error('Error adding to album:', error);
    }
  };

  // معالجة إنشاء ألبوم جديد
  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) return;
    
    try {
      setAlbums(prev => [...prev, newAlbumName]);
      setSelectedAlbum(newAlbumName);
      setNewAlbumName('');
      setShowNewAlbumInput(false);
    } catch (error) {
      console.error('Error creating album:', error);
    }
  };

  // إظهار/إخفاء حقل الإدخال للألبوم الجديد
  const toggleNewAlbumInput = () => {
    setShowNewAlbumInput(!showNewAlbumInput);
    if (!showNewAlbumInput) {
      setSelectedAlbum(null);
      setTimeout(() => document.getElementById('newAlbumInput')?.focus(), 100);
    }
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
        
        {/* زر السحب (drag handle) - موحد لجميع الصور */}
        <div 
          {...dragHandleProps} // خصائص السحب والإفلات
          className={`absolute top-2 right-2 p-2 rounded-full bg-black/20 backdrop-blur-sm transition-opacity duration-300 cursor-move ${
            isControlsVisible ? 'opacity-50' : 'opacity-0' // يظهر عند تفعيل الأزرار
          }`}
        >
          <GripVertical className="w-4 h-4 text-white" /> {/* أيقونة السحب */}
        </div>

        {/* زر الخيارات - موحد لجميع الصور */}
        <div className={`absolute top-2 left-2 transition-opacity duration-300 ${
          isControlsVisible ? 'opacity-100' : 'opacity-0'
        }`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-white" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-black/90 backdrop-blur-xl border border-white/20">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAlbumDialog(true);
                }}
                className="text-white hover:bg-white/20 cursor-pointer"
              >
<Plus className="w-4 h-4 ml-2" />
                <span>إضافة إلى ألبوم</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                className="text-red-400 hover:bg-red-500/20 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 ml-2" />
                <span>حذف</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* زر التعليق - موحد لجميع الصور */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className={`absolute bottom-2 right-2 p-2 rounded-full bg-black/20 backdrop-blur-sm transition-opacity duration-300 hover:bg-blue-500/50 ${
            isControlsVisible ? 'opacity-50' : 'opacity-0'
          } hover:opacity-100`}
        >
          <MessageCircle className="w-4 h-4 text-white" />
        </button>

        {/* قسم الإعجابات - في الموضع القديم */}
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

        {/* عرض التعليق والهاشتاجات مع اسم المستخدم بجانب التعليق */}
        {(caption || hashtags.length > 0) && (
          <div className={`absolute left-2 right-2 bottom-14 p-2 bg-black/50 backdrop-blur-md rounded-lg transition-opacity duration-300 ${
            isControlsVisible ? 'opacity-80' : 'opacity-0' // يظهر عند تفعيل الأزرار
          }`}>
            {caption && (
              <div className="flex items-start gap-2 mb-1 text-right" dir="rtl">
                {isGroupPhoto && getDisplayName() ? (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-100 text-xs font-medium bg-black/30 px-2 py-1 rounded whitespace-nowrap">
                      {getDisplayName()}:
                    </span>
                    <p className="text-white text-sm">{caption}</p>
                  </div>
                ) : (
                  <p className="text-white text-sm">{caption}</p>
                )}
              </div>
            )}
            {hashtags.length > 0 && ( // الهاشتاجات
              <div className="flex flex-wrap gap-1 justify-end">
                {hashtags.map((tag) => (
                  <span key={tag} className="text-xs text-white/60" dir="rtl">
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
          <DialogHeader>
            <DialogTitle className="text-right text-xl">
              أضف تعليقا
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* حقل التعليق */}
            <div>
              <label className="block text-sm font-medium mb-2"></label>
              <textarea
                value={caption} // قيمة التعليق الحالية
                onChange={(e) => setCaption(e.target.value)} // تحديث التعليق عند التغيير
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm rounded-md text-white text-right"
                rows={3}
                placeholder="أضف تعليقاً..."
                dir="rtl"
              />
            </div>
            {/* حقل الهاشتاجات للصور الشخصية فقط - تمت إزالته حسب الطلب */}
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

      {/* نافذة اختيار الألبوم المشترك */}
      <Dialog open={showAlbumDialog} onOpenChange={(open) => {
        setShowAlbumDialog(open);
        if (!open) {
          setShowNewAlbumInput(false);
          setNewAlbumName('');
        }
      }}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl text-white border-0 max-w-2xl p-4">
          <DialogHeader>
            <DialogTitle className="text-right text-xl">
              {isGroupPhoto ? 'اختر ألبوم مشترك' : 'اختر ألبوماً شخصياً'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* إشعار للمستخدم */}
            <div className={`${isGroupPhoto ? 'bg-blue-500/10 border-blue-500/30' : 'bg-green-500/10 border-green-500/30'} border rounded-lg p-3 text-center`}>
              <p className={`${isGroupPhoto ? 'text-blue-300' : 'text-green-300'} text-sm`}>
                {isGroupPhoto 
                  ? 'هذه الألبومات خاصة بالمساحة المشتركة فقط'
                  : 'هذه الألبومات خاصة بمساحتك الشخصية فقط'
                }
              </p>
            </div>
            
            {/* قائمة الألبومات */}
            <div className="max-h-96 overflow-y-auto p-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* New Album Card */}
                <div 
                  onClick={toggleNewAlbumInput}
                  className={`flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all h-20 ${
                    showNewAlbumInput 
                      ? 'border-emerald-500 bg-emerald-500/10' 
                      : 'border-emerald-500/50 hover:bg-emerald-500/10'
                  }`}
                >
                  <Plus className={`w-5 h-5 mb-1 ${showNewAlbumInput ? 'text-emerald-400' : 'text-emerald-400'}`} />
                  <span className={`text-sm font-medium ${showNewAlbumInput ? 'text-emerald-300' : 'text-emerald-400'}`}>
                    {showNewAlbumInput ? 'إلغاء' : 'ألبوم جديد'}
                  </span>
                </div>
                
                {/* Existing Albums */}
                {albums.map((album) => (
                  <div 
                    key={album}
                    onClick={() => {
                      setSelectedAlbum(album);
                      setShowNewAlbumInput(false);
                    }}
                    className={`relative p-3 rounded-lg cursor-pointer transition-all overflow-hidden group h-20 flex items-center ${
                      selectedAlbum === album 
                        ? 'ring-2 ring-blue-400 bg-blue-500/10' 
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <p className="relative z-10 text-right font-medium text-white text-sm flex-1 line-clamp-2 pr-2">{album}</p>
                    {selectedAlbum === album && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex-shrink-0 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
                
                {albums.length === 0 && !showNewAlbumInput && (
                  <div className="col-span-3 py-8 text-center">
                    <p className="text-white/50">
                      {isGroupPhoto 
                        ? 'لا توجد ألبومات مشتركة متاحة'
                        : 'لا توجد ألبومات شخصية متاحة'
                      }
                    </p>
                    <p className="text-white/30 text-sm mt-2">
                      {isGroupPhoto
                        ? 'يمكنك إنشاء ألبوم جديد للمساحة المشتركة'
                        : 'يمكنك إنشاء ألبوم جديد لمساحتك الشخصية'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* New Album Input - Only shown when showNewAlbumInput is true */}
            {showNewAlbumInput && (
              <div className="pt-4 border-t border-white/10 animate-fadeIn">
                <div className="flex gap-2">
                  <input
                    id="newAlbumInput"
                    type="text"
                    value={newAlbumName}
                    onChange={(e) => setNewAlbumName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && newAlbumName.trim() && handleCreateAlbum()}
                    placeholder={isGroupPhoto 
                      ? "اكتب اسم الألبوم المشترك الجديد"
                      : "اكتب اسم الألبوم الشخصي الجديد"
                    }
                    className="flex-1 px-3 py-2 bg-white/5 border border-emerald-500/30 rounded-lg text-white text-right focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm"
                    dir="rtl"
                    autoFocus
                  />
                  <button
                    onClick={handleCreateAlbum}
                    disabled={!newAlbumName.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
                  >
                    <span>إضافة</span>
                  </button>
                </div>
              </div>
            )}

            {/* أزرار الإجراءات */}
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setShowAlbumDialog(false)}
                className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddToAlbum}
                disabled={!selectedAlbum}
                className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                تأكيد
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
