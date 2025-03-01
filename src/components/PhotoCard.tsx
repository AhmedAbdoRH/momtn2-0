
import { useState } from "react";
import { Heart, Trash2, Edit, GripVertical } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
  likes = 0,
  caption = '',
  hashtags = [],
  dragHandleProps,
  onDelete,
  onUpdateCaption,
}: PhotoCardProps) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCaption, setNewCaption] = useState(caption);
  const [newHashtags, setNewHashtags] = useState(hashtags.join(' '));

  const handleLike = () => {
    // تشغيل الصوت عند الضغط على القلب
    if (window.playHeartSound) {
      window.playHeartSound();
    }
    
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  const handleCaptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewCaption(event.target.value);
  };

  const handleHashtagsChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewHashtags(event.target.value);
  };

  const handleSaveCaption = () => {
    const hashtagsArray = newHashtags
      .split(/[\s,]+/)
      .map(tag => (tag.startsWith('#') ? tag : `#${tag}`))
      .filter(tag => tag !== '#');

    if (onUpdateCaption) {
      onUpdateCaption(newCaption, hashtagsArray);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="relative group">
        <img
          src={imageUrl}
          alt="Photo"
          className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-0 right-0 p-2">
          <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="w-5 h-5 text-white opacity-70 hover:opacity-100" />
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex space-x-2">
            {onDelete && (
              <Button
                onClick={onDelete}
                variant="outline"
                size="icon"
                className="rounded-full bg-black/50 border-0 hover:bg-black/70 text-white"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
            {onUpdateCaption && (
              <Button
                onClick={() => setIsDialogOpen(true)}
                variant="outline"
                size="icon"
                className="rounded-full bg-black/50 border-0 hover:bg-black/70 text-white"
              >
                <Edit className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <button
            onClick={handleLike}
            className="flex items-center space-x-1 group"
          >
            <Heart
              className={`w-6 h-6 transition-all duration-300 ${
                liked
                  ? "fill-[#ea384c] text-[#ea384c] animate-heartBeat"
                  : "text-gray-300 group-hover:scale-110"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                liked ? "text-[#ea384c]" : "text-gray-300"
              }`}
            >
              {likeCount}
            </span>
          </button>

          <div className="text-right flex-1">
            {caption && (
              <p className="text-gray-200 text-sm line-clamp-2">{caption}</p>
            )}
          </div>
        </div>

        {hashtags.length > 0 && (
          <div className="flex flex-wrap justify-end gap-1">
            {hashtags.map((tag, index) => (
              <span
                key={index}
                className="text-xs text-gray-300 bg-white/10 px-2 py-1 rounded-full"
              >
                {!tag.startsWith('#') ? '#' : ''}
                {tag.startsWith('#') ? tag.substring(1) : tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Edit Caption Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm bg-gray-900/40 backdrop-blur-2xl text-white border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">تعديل التعليق</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm text-gray-300 text-right block">التعليق</label>
              <Textarea
                value={newCaption}
                onChange={handleCaptionChange}
                placeholder="اكتب تعليقًا..."
                className="resize-none h-20 bg-white/10 border-gray-700 text-white placeholder:text-gray-500 text-right"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-gray-300 text-right block">الوسوم</label>
              <Textarea
                value={newHashtags}
                onChange={handleHashtagsChange}
                placeholder="#قلب #امتنان #شكر"
                className="resize-none h-20 bg-white/10 border-gray-700 text-white placeholder:text-gray-500 text-right dir-rtl"
              />
              <p className="text-xs text-gray-400 text-right">افصل بين الوسوم بمسافات</p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                onClick={() => setIsDialogOpen(false)}
                variant="outline" 
                className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                إلغاء
              </Button>
              <Button 
                onClick={handleSaveCaption}
                className="bg-[#ea384c] hover:bg-[#ea384c]/90 text-white border-0"
              >
                حفظ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhotoCard;
