
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
      <div className="overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl relative">
        <div
          {...dragHandleProps}
          className="absolute top-2 right-2 cursor-grab active:cursor-grabbing z-10 p-1 rounded-full bg-white/80 backdrop-blur-sm text-gray-600"
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
        <div className="p-4 space-y-3 bg-gradient-to-b from-[#FFDEE2] to-[#F1F0FB]">
          {caption && (
            <p className="text-gray-700 text-sm line-clamp-2 min-h-[2.5rem]" dir="rtl">
              {caption}
            </p>
          )}
          <div className="flex flex-wrap gap-1 justify-end">
            {hashtags.map(
              (tag, idx) =>
                tag && (
                  <span
                    key={idx}
                    className="text-xs bg-white/50 backdrop-blur-sm px-2 py-1 rounded-full text-gray-600"
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
                className="group relative hover:bg-pink-100"
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${
                    isLiked
                      ? "fill-pink-500 text-pink-500"
                      : "fill-none text-gray-500 group-hover:text-pink-400"
                  } ${heartAnimation ? "animate-heartBeat" : ""}`}
                />
              </Button>
              <span className="text-gray-600 text-sm self-center">
                {currentLikes}
              </span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditDialogOpen(true)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  className="text-gray-500 hover:text-red-500 hover:bg-gray-100"
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
        <DialogContent className="top-[30%] max-w-md bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-800">تعديل التعليق والهاشتاجات</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="caption" className="block text-sm text-gray-600 mb-1 text-right">
                التعليق
              </label>
              <textarea
                id="caption"
                className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-md text-gray-700 resize-none focus:outline-none focus:ring-1 focus:ring-pink-300 text-right"
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                rows={3}
                dir="rtl"
              />
            </div>
            <div>
              <label htmlFor="hashtags" className="block text-sm text-gray-600 mb-1 text-right">
                الهاشتاجات (مفصولة بمسافة)
              </label>
              <input
                id="hashtags"
                className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-1 focus:ring-pink-300 text-right"
                value={newHashtags}
                onChange={(e) => setNewHashtags(e.target.value)}
                dir="rtl"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setEditDialogOpen(false)}
                className="bg-transparent border-gray-300 text-gray-600 hover:bg-gray-100"
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
