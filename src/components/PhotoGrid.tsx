import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import PhotoCard from "./PhotoCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";

interface Photo {
  id: string;
  image_url: string;
  likes: number;
  caption?: string | null;
  hashtags?: string[] | null;
  created_at: string;
  order?: number;
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
  const [sidebarVisible, setSidebarVisible] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    const tags = new Set<string>();
    photos.forEach(photo => {
      if (photo.hashtags) {
        photo.hashtags.forEach(tag => {
          if (tag.trim()) {
            tags.add(tag.trim());
          }
        });
      }
    });
    setAllHashtags(tags);
  }, [photos]);

  const renderHashtags = () => {
    const hashtagsContainer = document.getElementById('hashtags-container');
    if (!hashtagsContainer) return null;

    return createPortal(
      <>
        <button
          onClick={() => {
            setSelectedHashtag(null);
            setSidebarVisible(false);
          }}
          className="block w-full text-right px-3 py-2 mb-4 rounded-lg transition-colors bg-white/10 text-white hover:bg-white/20"
        >
          إظهار الكل
        </button>
        <div className="flex flex-wrap gap-2 justify-end">
          {Array.from(allHashtags).map(tag => (
            <button
              key={tag}
              onClick={() => {
                setSelectedHashtag(prevTag => tag === prevTag ? null : tag);
                setSidebarVisible(false);
              }}
              className={`px-3 py-2 rounded-lg transition-colors ${
                tag === selectedHashtag
                  ? 'bg-pink-500/20 text-pink-200'
                  : 'text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </>,
      hashtagsContainer
    );
  };

  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching photos:', error);
      return;
    }

    setPhotos(data || []);
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(photos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPhotos(items);

    const updates = items.map((photo, index) => ({
      id: photo.id,
      order: index
    }));

    const { error } = await supabase
      .from('photos')
      .upsert(updates, { onConflict: 'id' });

    if (error) {
      console.error('Error updating order:', error);
      toast({
        title: "خطأ في الترتيب",
        description: "حدث خطأ أثناء حفظ الترتيب الجديد",
        variant: "destructive",
      });
    }
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
    const cleanedHashtags = hashtags.map(tag => tag.trim()).filter(tag => tag);

    const { error } = await supabase
      .from('photos')
      .update({ caption, hashtags: cleanedHashtags })
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
        photo.id === id ? { ...photo, caption, hashtags: cleanedHashtags } : photo
      )
    );

    toast({
      title: "تم التحديث بنجاح",
      description: "تم تحديث التعليق والهاشتاجات بنجاح",
    });
  };

  const handleCreateNew = () => {
    const createNewDialog = document.getElementById('create-new-dialog');
    if (createNewDialog) {
      createNewDialog.click();
    }
  };

  const filteredPhotos = selectedHashtag
    ? photos.filter(photo => photo.hashtags?.some(tag => 
        tag.trim() === selectedHashtag.trim()
      ))
    : photos;

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <Button
          onClick={handleCreateNew}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-2" />
          إضافة امتنان جديد
        </Button>
      </div>

      {selectedHashtag && (
        <h2 className="text-2xl font-semibold text-white/90 text-center mb-8 bg-white/5 backdrop-blur-sm py-3 rounded-lg">
          {selectedHashtag}
        </h2>
      )}

      {renderHashtags()}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="photos">
          {(provided) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredPhotos.map((photo, index) => (
                <Draggable key={photo.id} draggableId={photo.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="transform transition-all duration-300 hover:scale-[0.98]"
                    >
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl shadow-lg border border-white/10">
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
