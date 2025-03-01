
import { useState } from "react";
import { Heart, Pencil, Trash, GripVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useHeartSound } from "./HeartSound";

interface PhotoCardProps {
  imageUrl: string;
  likes: number;
  caption: string;
  hashtags: string[];
  dragHandleProps?: any;
  onDelete?: () => void;
  onUpdateCaption?: (caption: string, hashtags: string[]) => void;
}

const PhotoCard = ({
  imageUrl,
  likes,
  caption,
  hashtags,
  dragHandleProps,
  onDelete,
  onUpdateCaption,
}: PhotoCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(likes);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newCaption, setNewCaption] = useState(caption);
  const [newHashtags, setNewHashtags] = useState(hashtags.join(" "));
  const [heartAnimation, setHeartAnimation] = useState(false);
  const { playHeartSound } = useHeartSound();

  const handleLike = () => {
    setIsLiked(!isLiked);
    setCurrentLikes(isLiked ? currentLikes - 1 : currentLikes + 1);
    setHeartAnimation(true);
    playHeartSound();
    setTimeout(() => setHeartAnimation(false), 600);
  };

  const handleUpdateCaption = () => {
    if (onUpdateCaption) {
      const hashtagsArray = newHashtags
        .split(/\s+/)
        .filter(tag => tag.trim() !== "")
        .map(tag => tag.startsWith("#") ? tag : `#${tag}`);
      
      onUpdateCaption(newCaption, hashtagsArray);
    }
    setEditDialogOpen(false);
  };

  return (
    <>
      <div className="overflow-hidden rounded-lg shadow-xl bg-gray-900/60 backdrop-blur-lg transition-all hover:shadow-2xl relative">
        <div
          {...dragHandleProps}
          className="absolute top-2 right-2 cursor-grab active:cursor-grabbing z-10 p-1 rounded-full backdrop-blur-md bg-black/30 text-white"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <div
          className="relative w-full h-48 sm:h-56 cursor-pointer overflow-hidden"
          onClick={() => setEditDialogOpen(true)}
        >
          <img
            src={imageUrl}
            alt={caption || "Gratitude image"}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
        </div>
        <div className="p-3 space-y-2">
          {caption && (
            <p className="text-white text-sm line-clamp-2 min-h-[2.5rem]" dir="rtl">
              {caption}
            </p>
          )}
          <div className="flex flex-wrap gap-1 justify-end">
            {hashtags.map(
              (tag, idx) =>
                tag && (
                  <span
                    key={idx}
                    className="text-xs bg-white/10 backdrop-blur-sm px-2 py-1 rounded-full text-gray-300"
                  >
                    {tag}
                  </span>
                )
            )}
          </div>
          <div className="flex justify-between items-center pt-2">
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLike}
                className="group relative"
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${
                    isLiked
                      ? "fill-red-500 text-red-500"
                      : "fill-none text-gray-400 group-hover:text-red-400"
                  } ${heartAnimation ? "animate-heartBeat" : ""}`}
                />
              </Button>
              <span className="text-gray-400 text-sm self-center">
                {currentLikes}
              </span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditDialogOpen(true)}
                className="text-gray-400 hover:text-white"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  className="text-gray-400 hover:text-red-400"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="top-[20%] max-w-md bg-gray-900/70 backdrop-blur-xl text-white border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle>تعديل التعليق والهاشتاجات</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="caption" className="block text-sm text-gray-400 mb-1 text-right">
                التعليق
              </label>
              <textarea
                id="caption"
                className="w-full px-3 py-2 bg-black/20 border border-gray-700 rounded-md text-white resize-none focus:outline-none focus:ring-1 focus:ring-gray-500 text-right"
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                rows={3}
                dir="rtl"
              />
            </div>
            <div>
              <label htmlFor="hashtags" className="block text-sm text-gray-400 mb-1 text-right">
                الهاشتاجات (مفصولة بمسافة)
              </label>
              <input
                id="hashtags"
                className="w-full px-3 py-2 bg-black/20 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-gray-500 text-right"
                value={newHashtags}
                onChange={(e) => setNewHashtags(e.target.value)}
                dir="rtl"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setEditDialogOpen(false)}
                className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800/70"
              >
                إلغاء
              </Button>
              <Button 
                onClick={handleUpdateCaption}
                className="bg-[#ea384c] hover:bg-[#ea384c]/90 text-white"
              >
                حفظ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhotoCard;
