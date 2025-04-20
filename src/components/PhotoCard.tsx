// src/components/PhotoCard.tsx
import React, { useState, useEffect } from "react";
import { GripVertical, Heart, MessageCircle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client"; // تأكد من صحة المسار
import { Dialog, DialogContent } from "./ui/dialog"; // تأكد من صحة المسار

interface PhotoCardProps {
  id: string; // معرف الصورة الفريد من قاعدة البيانات
  imageUrl: string;
  likes: number;
  caption?: string;
  album?: string; // اسم الألبوم كسلسلة نصية (يتم استخراجه من hashtags في المكون الأب)
  onDelete?: (id: string) => void; // دالة الحذف تستقبل ID
  dragHandleProps?: any;
  onUpdateCaption?: (id: string, caption: string, album: string) => Promise<void>; // دالة التحديث تستقبل ID
}

const PhotoCard = ({
  id, // استقبال ID
  imageUrl,
  likes: initialLikes,
  caption: initialCaption = '',
  album: initialAlbum = '',
  onDelete,
  dragHandleProps,
  onUpdateCaption
}: PhotoCardProps) => {
  const [isLoved, setIsLoved] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [isEditing, setIsEditing] = useState(false);
  // حالات منفصلة لـ input داخل النافذة المنبثقة
  const [editCaption, setEditCaption] = useState(initialCaption);
  const [editAlbum, setEditAlbum] = useState(initialAlbum);
  const [isControlsVisible, setIsControlsVisible] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  // --- State and Logic for Album Suggestions ---
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const fetchAlbumSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from("photos")
        .select("hashtags")
        .not("hashtags", "is", null);

      if (error) throw error;
      const allAlbumNames = data.flatMap((item) => item.hashtags || []).filter(Boolean);
      const uniqueAlbumNames = [...new Set(allAlbumNames)].sort();
      setSuggestions(uniqueAlbumNames);
    } catch (error) {
      console.error("Error fetching album suggestions:", error);
      setSuggestions([]);
    }
  };

  useEffect(() => {
    if (isEditing) {
      // جلب الاقتراحات وتعيين القيم الأولية عند فتح النافذة
      fetchAlbumSuggestions();
      setEditCaption(initialCaption);
      setEditAlbum(initialAlbum);
    } else {
      setShowSuggestions(false);
    }
  }, [isEditing, initialCaption, initialAlbum]);


  const handleAlbumInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditAlbum(value); // تحديث حالة الألبوم المؤقتة للنافذة
    setShowSuggestions(suggestions.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setEditAlbum(suggestion); // تحديث حالة الألبوم المؤقتة للنافذة
    setShowSuggestions(false);
  };

  const filteredSuggestions = editAlbum
    ? suggestions.filter((suggestion) =>
        typeof suggestion === "string" &&
        suggestion.toLowerCase().includes(editAlbum.toLowerCase())
      )
    : suggestions;

  // --- End: State and Logic for Album Suggestions ---


  const handleLike = async () => {
    // (من الأفضل نقل هذا المنطق للمكون الأب إذا كان يؤثر على بيانات شاملة)
    setIsHeartAnimating(true);
    const newLikeCount = likes + 1; // تحديث مؤقت
    setLikes(newLikeCount);
    setIsLoved(true); // حالة مؤقتة للأنيميشن

    const { error } = await supabase
      .from('photos')
      .update({ likes: newLikeCount })
      .eq('id', id); // استخدام ID لتحديث اللايكات

    if (error) {
      console.error('Error updating likes:', error);
      setLikes(likes); // التراجع في حالة الخطأ
    }

    setTimeout(() => {
      setIsHeartAnimating(false);
      setIsLoved(false); // إيقاف الأنيميشن
    }, 1000);
  };

  // استدعاء دالة التحديث من المكون الأب عند الحفظ
  const handleCaptionSubmit = async () => {
    if (onUpdateCaption) {
      // تمرير ID والقيم الجديدة من حالات النافذة
      await onUpdateCaption(id, editCaption, editAlbum);
    }
    setIsEditing(false); // إغلاق النافذة بعد الحفظ
  };

  // استدعاء دالة الحذف من المكون الأب
  const handleDeleteClick = () => {
    if (onDelete) {
        onDelete(id); // تمرير ID للدالة
    }
  }

  const toggleControls = () => {
    setIsControlsVisible(!isControlsVisible);
  };

  const handleCancelEdit = () => {
      setIsEditing(false);
      // لا حاجة لإعادة التعيين هنا لأن useEffect سيفعل ذلك عند الفتح التالي
  };


  return (
    <>
      {/* Card Display */}
      <div
        className="relative group overflow-hidden rounded-xl shadow-xl transition-all duration-300"
        onClick={toggleControls}
      >
        {/* Image and Gradient Overlay */}
        <div className="relative overflow-hidden rounded-xl">
          <img
            src={imageUrl}
            alt={initialCaption || "Gallery image"}
            className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className={`absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70 transition-opacity duration-300 ${
            isControlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`} />
        </div>

        {/* Controls visible on hover/click */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${
            isControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>

            {/* Drag Handle */}
             {dragHandleProps && (
                <div
                {...dragHandleProps}
                className={`absolute top-2 right-2 p-2 rounded-full bg-black/20 backdrop-blur-sm cursor-move opacity-50 hover:opacity-100 transition-opacity`}
                >
                <GripVertical className="w-4 h-4 text-white" />
                </div>
            )}


            {/* Edit Button */}
            {onUpdateCaption && (
                <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                }}
                className={`absolute top-2 left-2 p-2 rounded-full bg-black/20 backdrop-blur-sm opacity-50 hover:opacity-100 transition-opacity`}
                aria-label="Edit caption and album"
                >
                <MessageCircle className="w-4 h-4 text-white" />
                </button>
            )}


            {/* Delete Button */}
             {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(); // استدعاء الدالة الوسيطة
                }}
                className={`absolute bottom-2 right-2 p-2 rounded-full bg-black/20 backdrop-blur-sm opacity-50 hover:bg-red-500/50 hover:opacity-100 transition-opacity`}
                aria-label="Delete photo"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
             )}


            {/* Like Button and Count */}
            <div className="absolute bottom-2 left-2 flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike();
                }}
                className="relative group flex items-center gap-2 text-white/90 hover:text-white transition-colors p-1 rounded-full bg-black/20 backdrop-blur-sm"
                aria-label="Like photo"
              >
                <div className="relative">
                  <Heart
                    className={`w-5 h-5 transition-all duration-300 transform ${
                      isLoved ? "fill-[#ea384c] text-[#ea384c] scale-125" : "hover:scale-110"
                    }`}
                  />
                  {isHeartAnimating && (
                    <div className="absolute inset-0 animate-ping">
                      <Heart className="w-5 h-5 text-[#ea384c]/30" />
                    </div>
                  )}
                </div>
              </button>
              <span className="text-xs font-medium bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded-md text-white/90">
                {likes}
              </span>
            </div>

             {/* Caption and Album Display */}
            {(initialCaption || initialAlbum) && (
              <div className={`absolute left-2 right-2 bottom-14 p-2 bg-black/50 backdrop-blur-md rounded-lg text-sm text-white opacity-80`}>
                {initialCaption && <p className="mb-1">{initialCaption}</p>}
                {initialAlbum && (
                  <div className="flex flex-wrap gap-1 mt-1">
                     <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded">
                       #{initialAlbum}
                     </span>
                  </div>
                )}
              </div>
            )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={(open) => {
          if (!open) handleCancelEdit();
          setIsEditing(open);
      }}>
        <DialogContent className="bg-gray-900/60 backdrop-blur-xl text-white border-0 sm:max-w-[425px]">
          <div className="space-y-4 p-2">
             <h3 className="text-lg font-medium leading-6 text-white mb-4 text-right">تعديل الصورة</h3>
            <div>
              <label htmlFor={`caption-${id}`} className="block text-sm font-medium mb-1 text-right">التعليق</label>
              <textarea
                id={`caption-${id}`}
                value={editCaption} // استخدام حالة النافذة
                onChange={(e) => setEditCaption(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm rounded-md text-white focus:ring-1 focus:ring-white/50 outline-none text-right"
                rows={3}
                placeholder="أضف تعليقاً..."
              />
            </div>

            {/* Album Input with Suggestions */}
            <div className="relative">
              <label htmlFor={`album-${id}`} className="block text-sm font-medium mb-1 text-right">الألبوم</label>
              <input
                id={`album-${id}`}
                type="text"
                value={editAlbum} // استخدام حالة النافذة
                onChange={handleAlbumInputChange}
                onFocus={() => setShowSuggestions(suggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm rounded-md text-white focus:ring-1 focus:ring-white/50 outline-none text-right"
                placeholder="اسم الألبوم (اختياري)"
                autoComplete="off"
                aria-haspopup="listbox"
                aria-expanded={showSuggestions && filteredSuggestions.length > 0}
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div
                  role="listbox"
                  aria-label="Album suggestions"
                  className="absolute z-20 w-full mt-1 max-h-40 overflow-y-auto bg-gray-800/90 backdrop-blur-lg border border-white/20 rounded-md shadow-lg text-right suggestions-list"
                >
                  {filteredSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      role="option"
                      aria-selected="false"
                      className="px-3 py-2 cursor-pointer hover:bg-white/20 suggestion-item text-sm"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSuggestionClick(suggestion);
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 rounded-md bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleCaptionSubmit} // استدعاء الدالة التي تتصل بالأب
                className="px-4 py-2 rounded-md bg-[#ea384c]/80 backdrop-blur-sm text-white hover:bg-[#ea384c] transition-colors"
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhotoCard;

