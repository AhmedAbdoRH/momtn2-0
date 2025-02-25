
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import PhotoCard from "./PhotoCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(photos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPhotos(items);
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء حذف الصورة",
        variant: "destructive",
      });
      return;
    }

    // Delete the file from storage
    const fileName = imageUrl.split('/').pop();
    if (fileName) {
      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove([fileName]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
      }
    }

    setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== id));
    toast({
      title: "تم الحذف بنجاح",
      description: "تم حذف الصورة بنجاح",
    });
  };

  // Add to window for CreateNewDialog access
  window.addPhoto = async ({ imageUrl }) => {
    return await addPhoto(imageUrl);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="photos">
        {(provided) => (
          <div 
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {photos.map((photo, index) => (
              <Draggable key={photo.id} draggableId={photo.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <PhotoCard 
                      imageUrl={photo.image_url}
                      likes={photo.likes}
                      dragHandleProps={provided.dragHandleProps}
                      onDelete={() => handleDelete(photo.id, photo.image_url)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default PhotoGrid;
