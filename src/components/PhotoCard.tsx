import { useState } from "react";
import { GripVertical, Heart, MessageCircle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "./ui/dialog";

interface PhotoCardProps {
  imageUrl: string;
  likes: number;
  caption?: string;
  hashtags?: string[];
  onDelete?: () => void;
  dragHandleProps?: any;
  onUpdateCaption?: (caption: string, hashtags: string[]) => Promise<void>;
}

const PhotoCard = ({ 
  imageUrl, 
  likes: initialLikes, 
  caption: initialCaption = '',
  hashtags: initialHashtags = [],
  onDelete,
  dragHandleProps,
  onUpdateCaption 
}: PhotoCardProps) => {
  const [isLoved, setIsLoved] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(initialCaption);
  const [hashtags, setHashtags] = useState(initialHashtags);
  const [isControlsVisible, setIsControlsVisible] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);

  const handleLike = async () => {
    // فقط إذا لم يكن قد تم الضغط عليه من قبل
    if (!isLoved) {
      setIsHeartAnimating(true);
      const newLikeCount = likes + 1;
      setLikes(newLikeCount);
      setIsLoved(true); // يبقى محبوبًا بعد الضغط

      const { error } = await supabase
        .from('photos')
        .update({ likes: newLikeCount })
        .eq('image_url', imageUrl);

      if (error) {
        console.error('Error updating likes:', error);
        setLikes(likes);
        setIsLoved(false); // إعادة الحالة إذا فشل التحديث
      }

      // إنهاء الأنيميشن بعد 1000 مللي ثانية
      setTimeout(() => {
        setIsHeartAnimating(false);
      }, 1000);
    }
  };

  const handleCaptionSubmit = async () => {
    if (onUpdateCaption) {
      await onUpdateCaption(caption, hashtags);
    }
    setIsEditing(false);
  };

  const handleHashtagsChange = (value: string) => {
    const tags = value.split(' ').filter(tag => tag.startsWith('#'));
    setHashtags(tags);
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
            className="relative group 
   
flex items-center gap-2 text-white/90 hover:text-white transition-colors p-2"
          >
            <div className="relative">
              <Heart
                className={`w-6 h-6 transition-all duration-500 ease-in-out ${
                  isLoved ? "fill-[#ea384c] text-[#ea384c] scale-110" : "hover:scale-110"
                }`}
              />
              {isHeartAnimating && (
                <div className="absolute inset-0">
                  <Heart 
                    className="w-6 h-6 text-[#ea384c]/50 animate-[ping_1s_ease-in-out_1]" 
                  />
                </div>
              )}
            </div>
          </button>
          <span className="text-sm font-medium bg-black/10 backdrop-blur-sm px-2 py-1 rounded-full text-white/90">
            {likes}
          </span>
        </div>

        {(caption || hashtags.length > 0) && (
          <div className={`absolute left-2 right-2 bottom-14 p-2 bg-black/50 backdrop-blur-md rounded-lg transition-opacity duration-300 ${
            isControlsVisible ? 'opacity-80' : 'opacity-0'
          }`}>
            {caption && <p className="text-white text-sm mb-1">{caption}</p>}
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {hashtags.map((tag) => (
                  <span key={tag} className="text-xs text-blue-300">
                    {tag}
                  </span>
                ))}
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
              <label className="block text-sm font-medium mb-2">الهاشتاجات</label>
              <input
                type="text"
                value={hashtags.join(' ')}
                onChange={(e) => handleHashtagsChange(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm rounded-md text-white"
                placeholder="#رمضان #عبادة"
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