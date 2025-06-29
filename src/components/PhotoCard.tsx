
import { useState } from "react";
import { GripVertical, Heart, MessageCircle, Trash2, MoreVertical, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface PhotoCardProps {
  imageUrl: string;
  likes: number;
  caption?: string;
  hashtags?: string[];
  onDelete?: () => void;
  dragHandleProps?: any;
  onUpdateCaption?: (caption: string, hashtags: string[]) => Promise<void>;
  isGroupPhoto?: boolean;
  userEmail?: string;
  userDisplayName?: string;
}

const PhotoCard = ({ 
  imageUrl, 
  likes: initialLikes, 
  caption: initialCaption = '',
  hashtags: initialHashtags = [],
  onDelete,
  dragHandleProps,
  onUpdateCaption,
  isGroupPhoto = false,
  userEmail,
  userDisplayName
}: PhotoCardProps) => {
  const [isLoved, setIsLoved] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(initialCaption);
  const [hashtags, setHashtags] = useState(initialHashtags);
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
      await onUpdateCaption(caption, hashtags);
    }
    setIsEditing(false);
  };

  const handleHashtagsChange = (value: string) => {
    const tags = value.split(' ');
    setHashtags(tags);
  };

  const toggleControls = () => {
    setIsControlsVisible(!isControlsVisible);
  };

  const getDisplayName = () => {
    if (userDisplayName && userDisplayName.trim()) {
      return userDisplayName.trim();
    }
    if (userEmail) {
      return userEmail.split('@')[0];
    }
    return '';
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
        
        {/* Unified Design - Drag Handle (Top Right) */}
        <div 
          {...dragHandleProps}
          className={`absolute top-2 right-2 p-2 rounded-full bg-black/20 backdrop-blur-sm transition-opacity duration-300 cursor-move ${
            isControlsVisible ? 'opacity-50' : 'opacity-0'
          }`}
        >
          <GripVertical className="w-4 h-4 text-white" />
        </div>

        {/* Options/Edit Button (Top Left) */}
        <div className={`absolute top-2 left-2 transition-opacity duration-300 ${
          isControlsVisible ? 'opacity-100' : 'opacity-0'
        }`}>
          {isGroupPhoto ? (
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
                    setIsEditing(true);
                  }}
                  className="text-white hover:bg-white/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  <span>إضافة تعليق</span>
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
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-2 rounded-full bg-black/20 backdrop-blur-sm transition-opacity duration-300 hover:opacity-100"
            >
              <MessageCircle className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        {/* Comment Button (Bottom Right) */}
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

        {/* Likes Section (Bottom Left) */}
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

        {/* User Info and Caption Section */}
        {(isGroupPhoto && getDisplayName()) || (caption || hashtags.length > 0) ? (
          <div className={`absolute left-2 right-2 bottom-16 transition-opacity duration-300 ${
            isControlsVisible ? 'opacity-80' : 'opacity-0'
          }`}>
            {/* User Info for Group Photos */}
            {isGroupPhoto && getDisplayName() && (
              <div className="bg-black/50 backdrop-blur-md rounded-lg px-3 py-2 mb-2">
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <span className="text-white text-sm font-medium block">{getDisplayName()}</span>
                    {caption && (
                      <p className="text-white/80 text-xs mt-1" dir="rtl">{caption}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Caption Section for Personal Photos */}
            {!isGroupPhoto && (caption || hashtags.length > 0) && (
              <div className="bg-black/50 backdrop-blur-md rounded-lg px-3 py-2">
                {caption && <p className="text-white text-sm mb-1 text-right" dir="rtl">{caption}</p>}
                {hashtags.length > 0 && (
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
        ) : null}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="bg-gray-900/60 backdrop-blur-xl text-white border-0">
          <DialogHeader>
            <DialogTitle className="text-right text-xl">
              {isGroupPhoto ? "إضافة تعليق" : "تعديل تفاصيل الصورة"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Comment Field */}
            <div>
              <label className="block text-sm font-medium mb-2">التعليق</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm rounded-md text-white text-right"
                rows={3}
                placeholder="أضف تعليقاً..."
                dir="rtl"
              />
            </div>
            {/* Album Field for Personal Photos Only */}
            {!isGroupPhoto && (
              <div>
                <label className="block text-sm font-medium mb-2">اسم الالبوم</label>
                <input
                  type="text"
                  value={hashtags.join(' ')}
                  onChange={(e) => handleHashtagsChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm rounded-md text-white text-right"
                  dir="rtl"
                />
              </div>
            )}
            {/* Action Buttons */}
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
