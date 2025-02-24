
import { useEffect, useState } from "react";
import PhotoCard from "./PhotoCard";
import { supabase } from "@/integrations/supabase/client";

interface Photo {
  id: string;
  image_url: string;
  gratitude_text: string;
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

  const addPhoto = async (imageUrl: string, gratitudeText: string) => {
    const { data, error } = await supabase
      .from('photos')
      .insert([
        {
          image_url: imageUrl,
          gratitude_text: gratitudeText,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding photo:', error);
      return false;
    }

    setPhotos(prevPhotos => [data, ...prevPhotos]);
    return true;
  };

  // @ts-ignore - Adding to window for demo purposes
  window.addPhoto = async ({ imageUrl, gratitudeText }) => {
    return await addPhoto(imageUrl, gratitudeText);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {photos.map((photo) => (
        <PhotoCard 
          key={photo.id} 
          imageUrl={photo.image_url} 
          gratitudeText={photo.gratitude_text} 
        />
      ))}
    </div>
  );
};

export default PhotoGrid;
