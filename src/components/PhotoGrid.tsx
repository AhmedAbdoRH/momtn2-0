
import { useState } from "react";
import PhotoCard from "./PhotoCard";

interface Photo {
  imageUrl: string;
  gratitudeText: string;
}

const initialPhotos = [
  {
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    gratitudeText: "Grateful for moments of focus and creativity in my workspace",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b",
    gratitudeText: "Finding inspiration in the smallest things",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b",
    gratitudeText: "Nature's beauty reminds me to stay grateful",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1721322800607-8c38375eef04",
    gratitudeText: "Thankful for the comfort of home",
  },
];

const PhotoGrid = () => {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);

  // Add this function to expose it to parent components
  const addPhoto = (newPhoto: Photo) => {
    setPhotos(prevPhotos => [newPhoto, ...prevPhotos]);
  };

  // @ts-ignore - Adding to window for demo purposes
  window.addPhoto = addPhoto;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {photos.map((photo, index) => (
        <PhotoCard key={index} {...photo} />
      ))}
    </div>
  );
};

export default PhotoGrid;
