
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import PhotoCard from "./PhotoCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthProvider";

interface Photo {
  id: string;
  image_url: string;
  likes: number;
  caption?: string | null;
  hashtags?: string[] | null;
  created_at: string;
  order?: number;
  user_id?: string;
}

// إعلان عالمي لوظيفة addPhoto
declare global {
  interface Window {
    addPhoto: (params: { imageUrl: string }) => Promise<boolean>;
    playHeartSound: () => void;
  }
}

const PhotoGrid = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const { toast } = useToast();
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [allHashtags, setAllHashtags] = useState<Set<string>>(new Set());
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPhotos();
    }
  }, [user]);

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
        <div className="flex flex-col space-y-2 items-end w-full">
          {Array.from(allHashtags).map(tag => (
            <button
              key={tag}
              onClick={() => {
                setSelectedHashtag(prevTag => tag === prevTag ? null : tag);
                setSidebarVisible(false);
              }}
              className={`px-3 py-2 rounded-lg transition-colors w-full text-right ${
                tag === selectedHashtag
                  ? 'bg-[#ea384c]/20 text-pink-200'
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
    if (!user) return;
    
    try {
      // نحصل على الصور مرتبة حسب الحقل order
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('user_id', user.id)
        .order('order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching photos:', error);
        return;
      }

      console.log('Successfully fetched photos:', data);
      setPhotos(data || []);
    } catch (err) {
      console.error('Exception fetching photos:', err);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(photos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // تحديث الترتيب في واجهة المستخدم أولاً
    setPhotos(items);

    try {
      console.log('Updating order for photos');
      
      // تحديث الصور بترتيبها الجديد
      for (let i = 0; i < items.length; i++) {
        console.log(`Setting order ${i} for photo ${items[i].id}`);
        
        const { error } = await supabase
          .from('photos')
          .update({ order: i })
          .eq('id', items[i].id)
          .eq('user_id', user?.id);
        
        if (error) {
          console.error(`Error updating order for photo ${items[i].id}:`, error);
        }
      }
      
      // إعادة جلب الصور بعد التحديث
      await fetchPhotos();
      
      toast({
        title: "تم تحديث الترتيب",
        description: "تم حفظ ترتيب الصور بنجاح",
      });
    } catch (err) {
      console.error('Exception updating photo order:', err);
      toast({
        title: "خطأ في الترتيب",
        description: "حدث خطأ أثناء حفظ الترتيب الجديد",
        variant: "destructive",
      });
    }
  };

  // تعريف وظيفة إضافة صورة جديدة
  const addPhoto = async (params: { imageUrl: string }): Promise<boolean> => {
    try {
      if (!user) {
        toast({
          title: "لم تسجل الدخول",
          description: "يجب تسجيل الدخول لإضافة صور",
          variant: "destructive",
        });
        return false;
      }
      
      console.log('Adding photo to database:', params.imageUrl);
      
      // حساب أعلى ترتيب حالي للصور
      const maxOrder = photos.length > 0 
        ? Math.max(...photos.map(p => p.order !== undefined ? p.order : 0))
        : -1;
      
      // إضافة الصورة إلى الجدول
      const { data, error } = await supabase
        .from('photos')
        .insert({
          image_url: params.imageUrl,
          likes: 0,
          caption: null,
          hashtags: [],
          user_id: user.id,
          order: maxOrder + 1  // وضع الصورة الجديدة في آخر الترتيب
        })
        .select();

      if (error) {
        console.error('Error adding photo to database:', error);
        toast({
          title: "خطأ في الإضافة",
          description: "لم نتمكن من إضافة الصورة إلى قاعدة البيانات",
          variant: "destructive",
        });
        return false;
      }

      console.log('Photo added successfully:', data);
      
      // تحديث واجهة المستخدم بالصورة الجديدة
      if (data && data.length > 0) {
        setPhotos(prevPhotos => [data[0], ...prevPhotos]);
        
        toast({
          title: "تمت الإضافة بنجاح",
          description: "تمت إضافة الصورة الجديدة إلى المعرض",
        });
      }
      
      return true;
    } catch (error) {
      console.error('Exception when adding photo:', error);
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ غير متوقع أثناء إضافة الصورة",
        variant: "destructive",
      });
      return false;
    }
  };

  // تسجيل وظيفة addPhoto في كائن النافذة
  useEffect(() => {
    window.addPhoto = addPhoto;
    
    return () => {
      // @ts-ignore - تنظيف عند تفكيك المكون
      delete window.addPhoto;
    };
  }, [user, photos]);

  const handleDelete = async (id: string, imageUrl: string) => {
    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error deleting photo:', error);
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
    } catch (err) {
      console.error('Exception deleting photo:', err);
    }
  };

  const handleUpdateCaption = async (id: string, caption: string, hashtags: string[]) => {
    try {
      const cleanedHashtags = hashtags.map(tag => tag.trim()).filter(tag => tag);

      const { error } = await supabase
        .from('photos')
        .update({ caption, hashtags: cleanedHashtags })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error updating caption:', error);
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
    } catch (err) {
      console.error('Exception updating caption:', err);
    }
  };

  const filteredPhotos = selectedHashtag
    ? photos.filter(photo => photo.hashtags?.some(tag => 
        tag.trim() === selectedHashtag.trim()
      ))
    : photos;

  return (
    <div className="w-full">
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
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            >
              {filteredPhotos.map((photo, index) => (
                <Draggable key={photo.id} draggableId={photo.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="transform transition-all duration-300 hover:scale-[0.98]"
                    >
                      <div className="rounded-xl overflow-hidden shadow-lg scale-95">
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
