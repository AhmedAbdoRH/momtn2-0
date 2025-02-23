
import { Heart } from "lucide-react";
import { useState } from "react";

interface PhotoCardProps {
  imageUrl: string;
  gratitudeText: string;
}

const PhotoCard = ({ imageUrl, gratitudeText }: PhotoCardProps) => {
  const [isLoved, setIsLoved] = useState(false);

  return (
    <div className="relative group overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-lg">
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={imageUrl}
          alt={gratitudeText}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
        <div className="backdrop-blur-md bg-white/10 rounded-xl p-4">
          <p className="text-white text-sm mb-2 line-clamp-2">{gratitudeText}</p>
          <button
            onClick={() => setIsLoved(!isLoved)}
            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
          >
            <Heart
              className={`w-5 h-5 transition-all duration-300 ${
                isLoved ? "fill-soft-pink text-soft-pink animate-scale" : ""
              }`}
            />
            <span className="text-sm">{isLoved ? "Loved" : "Love this"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoCard;
