
import { GripVertical, Heart, MessageCircle, Trash2 } from "lucide-react";
import { useState } from "react";
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
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(initialCaption);
  const [hashtags, setHashtags] = useState(initialHashtags);

  const handleLike = async () => {
    const newLikeCount = likes + (isLoved ? -1 : 1);
    setIsLoved(!isLoved);
    setLikes(newLikeCount);

    const { error } = await supabase
      .from('photos')
      .update({ likes: newLikeCount })
      .eq('image_url', imageUrl);

    if (error) {
      console.error('Error updating likes:', error);
      setIsLoved(isLoved);
      setLikes(likes);
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

  return (
    <>
      <div 
        className="relative group overflow-hidden rounded-xl bg-gray-800/50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square overflow-hidden">
          <img
            src={imageUrl}
            alt="Gallery"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        {/* Drag Handle */}
        <div 
          {...dragHandleProps}
          className={`absolute top-2 right-2 p-2 rounded-full bg-black/50 backdrop-blur-sm transition-opacity duration-300 cursor-move ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <GripVertical className="w-4 h-4 text-white" />
        </div>

        {/* Caption Button */}
        <button
          onClick={() => setIsEditing(true)}
          className={`absolute top-2 left-2 p-2 rounded-full bg-black/50 backdrop-blur-sm transition-opacity duration-300 hover:bg-white/20 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <MessageCircle className="w-4 h-4 text-white" />
        </button>

        {/* Delete Button */}
        <button
          onClick={onDelete}
          className={`absolute bottom-2 right-2 p-2 rounded-full bg-black/50 backdrop-blur-sm transition-opacity duration-300 hover:bg-red-500/50 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Trash2 className="w-4 h-4 text-white" />
        </button>

        {/* Heart Button */}
        <div className="absolute bottom-2 left-2">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors p-2"
          >
            <Heart
              className={`w-6 h-6 transition-all duration-700 transform ${
                isLoved ? "fill-pink-500 text-pink-500 scale-125" : "hover:scale-110"
              } ${isLoved ? "animate-heartBeat" : ""}`}
            />
            <span className="text-sm font-medium bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
              {likes}
            </span>
          </button>
        </div>

        {/* Caption and Hashtags Display */}
        {(caption || hashtags.length > 0) && isHovered && (
          <div className="absolute left-2 right-2 bottom-14 p-2 bg-black/50 backdrop-blur-sm rounded-lg transition-opacity duration-300">
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
        <DialogContent className="bg-gray-900 text-white">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">التعليق</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 rounded-md text-white"
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
                className="w-full px-3 py-2 bg-gray-800 rounded-md text-white"
                placeholder="#رمضان #عبادة"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleCaptionSubmit}
                className="px-4 py-2 rounded-md bg-pink-500 text-white hover:bg-pink-600 transition-colors"
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
