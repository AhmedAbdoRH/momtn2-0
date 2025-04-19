import { useState } from "react";
import { GripVertical, Heart, MessageCircle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "./ui/dialog";

interface PhotoCardProps {
  imageUrl: string;
  likes: number;
  caption?: string;
  album?: string; // تغيير من مصفوفة هاشتاجات إلى سلسلة ألبوم واحدة
  onDelete?: () => void;
  dragHandleProps?: any;
  onUpdateCaption?: (caption: string, album: string) => Promise<void>; // تحديث الواجهة لقبول ألبوم بدلاً من هاشتاجات
}

const PhotoCard = ({ 
  imageUrl, 
  likes: initialLikes, 
  caption: initialCaption = '',
  album: initialAlbum = '', // قيمة افتراضية فارغة للألبوم
  onDelete,
  dragHandleProps,
  onUpdateCaption 
}: PhotoCardProps) => {
  const [isLoved, setIsLoved] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(initialCaption);
  const [album, setAlbum] = useState(initialAlbum); // حالة للألبوم بدلاً من الهاشتاجات
  const [isControlsVisible, setIsControlsVisible] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  const handleLike = async () => {
    setIsHeartAnimating(true);
    const newLikeCount = likes + 1;
    setLikes(newLikeCount);
    setIsLoved(true);

    const { error } = await supabase
      .from('photos')
      .update({ likes: newLikeCount })
      .eq('image_url', imageUrl);

    if (error) {
      console.error('Error updating likes:', error);
      setLikes(likes);
    }

    setTimeout(() => {
      setIsHeartAnimating(false);
      setIsLoved(false);
    }, 1000);
  };

  const handleCaptionSubmit = async () => {
    if (onUpdateCaption) {
      await onUpdateCaption(caption, album); // تحديث ليشمل الألبوم بدلاً من الهاشتاجات
    }
    setIsEditing(false);
  };

  const toggleControls = () => {
    setIsControlsVisible(!isControlsVisible);
  };

  return (
    <>
      <div 
        className="relative group overflow-hidden rounded-xl shadow-xl transition-all duration-300"
        onClick={toggleControls}
      >
        <div className="relative overflow-hidden rounded-xl">
          <img
            src={imageUrl}
            alt="Gallery"
            className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className={`absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70 transition-opacity duration-300 ${
            isControlsVisible ? 'opacity-100' : 'opacity-0'
          }`} />
        </div>
        
        <div 
          {...dragHandleProps}
          className={`absolute top-2 right-2 p-2 rounded-full bg-black/20 backdrop-blur-sm transition-opacity duration-300 cursor-move ${
            isControlsVisible ? 'opacity-50' : 'opacity-0'
          }`}
        >
          <GripVertical className="w-4 h-4 text-white" />
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className={`absolute top-2 left-2 p-2 rounded-full bg-black/20 backdrop-blur-sm transition-opacity duration-300 hover:opacity-100 ${
            isControlsVisible ? 'opacity-50' : 'opacity-0'
          }`}
        >
          <MessageCircle className="w-4 h-4 text-white" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className={`absolute bottom-2 right-2 p-2 rounded-full bg-black/20 backdrop-blur-sm transition-opacity duration-300 hover:bg-red-500/50 ${
            isControlsVisible ? 'opacity-50' : 'opacity-0'
          } hover:opacity-100`}
        >
          <Trash2 className="w-4 h-4 text-white" />
        </button>

        <div className="absolute bottom-2 left-2 flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
            className="relative group flex items-center gap-2 text-white/90 hover:text-white transition-colors p-2"
          >
            <div className="relative">
              <Heart
                className={`w-6 h-6 transition-all duration-300 transform ${
                  isLoved ? "fill-[#ea384c] text-[#ea384c] scale-125" : "hover:scale-110"
                }`}
              />
              {isHeartAnimating && (
                <div className="absolute inset-0 animate-ping">
                  <Heart className="w-6 h-6 text-[#ea384c]/30" />
                </div>
              )}
            </div>
          </button>
          <span className="text-sm font-medium bg-black/10 backdrop-blur-sm px-2 py-1 rounded-md text-white/90">
            {likes}
          </span>
        </div>

        {(caption || album) && (
          <div className={`absolute left-2 right-2 bottom-14 p-2 bg-black/50 backdrop-blur-md rounded-lg transition-opacity duration-300 ${
            isControlsVisible ? 'opacity-80' : 'opacity-0'
          }`}>
            {caption && <p className="text-white text-sm mb-1">{caption}</p>}
            {album && (
              <div className="flex flex-wrap gap-1">
                <span className="text-xs text-white-300">
                  {album} {/* عرض اسم الألبوم فقط */}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="bg-gray-900/60 backdrop-blur-xl text-white border-0">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">التعليق</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm rounded-md text-white"
                rows={3}
                placeholder="أضف تعليقاً..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">الألبوم</label>
              <input
                type="text"
                value={album}
                onChange={(e) => setAlbum(e.target.value)} // تحديث اسم الألبوم مباشرة
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm rounded-md text-white"
                placeholder="اسم الألبوم"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-md bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleCaptionSubmit}
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

export default PhotoCard;