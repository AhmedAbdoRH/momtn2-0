
import { useState, useEffect } from "react";
import PhotoCard from "./PhotoCard";
import { supabase } from "@/integrations/supabase/client";

interface Photo {
  id: string;
  image_url: string;
  likes: number;
}

declare global {
  interface Window {
    addPhoto: (params: { imageUrl: string }) => Promise<boolean>;
  }
}

const PhotoGrid = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching photos:', error);
      return;
    }

    setPhotos(data || []);
  };

  const addPhoto = async (imageUrl: string) => {
    const { data, error } = await supabase
      .from('photos')
      .insert([{ image_url: imageUrl }])
      .select()
      .single();

    if (error) {
      console.error('Error adding photo:', error);
      return false;
    }

    setPhotos(prevPhotos => [data, ...prevPhotos]);
    return true;
  };

  // Add to window for CreateNewDialog access
  window.addPhoto = async ({ imageUrl }) => {
    return await addPhoto(imageUrl);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {photos.map((photo) => (
        <PhotoCard 
          key={photo.id} 
          imageUrl={photo.image_url} 
          likes={photo.likes} 
        />
      ))}
    </div>
  );
};

export default PhotoGrid;
