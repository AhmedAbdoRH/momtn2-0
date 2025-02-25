
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import PhotoCard from "./PhotoCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Photo {
  id: string;
  image_url: string;
  likes: number;
  caption?: string | null;
  hashtags?: string[] | null;
  created_at: string;
}

declare global {
  interface Window {
    addPhoto: (params: { imageUrl: string }) => Promise<boolean>;
  }
}

const PhotoGrid = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const { toast } = useToast();
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [allHashtags, setAllHashtags] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    // Update unique hashtags whenever photos change
    const tags = new Set<string>();
    photos.forEach(photo => {
      photo.hashtags?.forEach(tag => tags.add(tag));
    });
    setAllHashtags(tags);
  }, [photos]);

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
      .insert([{ 
        image_url: imageUrl,
        likes: 0,
        caption: null,
        hashtags: []
      }])
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

  const handleUpdateCaption = async (id: string, caption: string, hashtags: string[]) => {
    const { error } = await supabase
      .from('photos')
      .update({ caption, hashtags })
      .eq('id', id);

    if (error) {
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث التعليق",
        variant: "destructive",
      });
      return;
    }

    setPhotos(prevPhotos => 
      prevPhotos.map(photo => 
        photo.id === id ? { ...photo, caption, hashtags } : photo
      )
    );

    toast({
      title: "تم التحديث بنجاح",
      description: "تم تحديث التعليق والهاشتاجات بنجاح",
    });
  };

  // Add to window for CreateNewDialog access
  window.addPhoto = async ({ imageUrl }) => {
    return await addPhoto(imageUrl);
  };

  const filteredPhotos = selectedHashtag
    ? photos.filter(photo => photo.hashtags?.includes(selectedHashtag))
    : photos;

  return (
    <div className="flex gap-6">
      {/* Hashtags Sidebar */}
      <div className="hidden lg:block w-64 bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl h-fit sticky top-6">
        <h3 className="text-white font-semibold mb-4">الهاشتاجات</h3>
        <div className="space-y-2">
          {Array.from(allHashtags).map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedHashtag(tag === selectedHashtag ? null : tag)}
              className={`block w-full text-right px-3 py-2 rounded-lg transition-colors ${
                tag === selectedHashtag
                  ? 'bg-pink-500/20 text-pink-200'
                  : 'text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Photos Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="photos">
          {(provided) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredPhotos.map((photo, index) => (
                <Draggable key={photo.id} draggableId={photo.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <PhotoCard 
                        imageUrl={photo.image_url}
                        likes={photo.likes || 0}
                        caption={photo.caption || ''}
                        hashtags={photo.hashtags || []}
                        dragHandleProps={provided.dragHandleProps}
                        onDelete={() => handleDelete(photo.id, photo.image_url)}
                        onUpdateCaption={(caption, hashtags) => 
                          handleUpdateCaption(photo.id, caption, hashtags)
                        }
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
    </div>
  );
};

export default PhotoGrid;
