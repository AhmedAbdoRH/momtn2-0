
import { GripVertical, Heart, Trash2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PhotoCardProps {
  imageUrl: string;
  likes: number;
  onDelete?: () => void;
  dragHandleProps?: any;
}

const PhotoCard = ({ imageUrl, likes: initialLikes, onDelete, dragHandleProps }: PhotoCardProps) => {
  const [isLoved, setIsLoved] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [isHovered, setIsHovered] = useState(false);

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

  return (
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

      {/* Delete Button */}
      <button
        onClick={onDelete}
        className={`absolute bottom-2 left-2 p-2 rounded-full bg-black/50 backdrop-blur-sm transition-opacity duration-300 hover:bg-red-500/50 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Trash2 className="w-4 h-4 text-white" />
      </button>

      {/* Heart Button */}
      <div className="absolute bottom-2 right-2 p-2">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
        >
          <Heart
            className={`w-6 h-6 transition-all duration-300 transform ${
              isLoved ? "fill-pink-500 text-pink-500 scale-125" : "hover:scale-110"
            } ${isLoved ? "animate-heartBeat" : ""}`}
          />
          <span className="text-sm font-medium bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
            {likes}
          </span>
        </button>
      </div>
    </div>
  );
};

export default PhotoCard;
