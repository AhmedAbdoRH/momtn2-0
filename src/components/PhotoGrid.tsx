
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
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching photos:', error);
        return;
      }

      console.log('Fetched photos:', data); // للتحقق من البيانات المستردة
      setPhotos(data || []);
    } catch (error) {
      console.error('Error in fetchPhotos:', error);
    }
  };

  const addPhoto = async (imageUrl: string, gratitudeText: string) => {
    try {
      console.log('Adding photo with URL:', imageUrl); // للتحقق من الـURL قبل الإضافة
      
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
    } catch (error) {
      console.error('Error in addPhoto:', error);
      return false;
    }
  };

  // إضافة وظيفة addPhoto إلى window للوصول إليها من CreateNewDialog
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
