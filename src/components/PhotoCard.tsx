
import { Heart } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PhotoCardProps {
  imageUrl: string;
  likes: number;
}

const PhotoCard = ({ imageUrl, likes: initialLikes }: PhotoCardProps) => {
  const [isLoved, setIsLoved] = useState(false);
  const [likes, setLikes] = useState(initialLikes);

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
    <div className="relative group overflow-hidden rounded-xl bg-gray-800/50">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imageUrl}
          alt="Gallery"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
        >
          <Heart
            className={`w-6 h-6 transition-all duration-300 ${
              isLoved ? "fill-pink-500 text-pink-500 animate-scale" : ""
            }`}
          />
          <span className="text-sm font-medium">{likes}</span>
        </button>
      </div>
    </div>
  );
};

export default PhotoCard;

