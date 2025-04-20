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
  order?: number | null;
  user_id?: string;
}

interface PhotoGridProps {
  closeSidebar: () => void;
}

declare global {
  interface Window {
    addPhoto: (params: { imageUrl: string }) => Promise<boolean>;
  }
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ closeSidebar }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const { toast } = useToast();
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [allHashtags, setAllHashtags] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const [loadingInitialPhotos, setLoadingInitialPhotos] = useState(true);
  const [hasPhotosLoadedOnce, setHasPhotosLoadedOnce] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPhotos();
    } else {
      setLoadingInitialPhotos(false);
    }
  }, [user]);

  useEffect(() => {
    const handlePhotoAdded = () => {
      fetchPhotos();
    };
    window.addEventListener('photo-added', handlePhotoAdded);
    return () => {
      window.removeEventListener('photo-added', handlePhotoAdded);
    };
  }, []);

  useEffect(() => {
    const tags = new Set<string>();
    photos.forEach(photo => {
      if (photo.hashtags && Array.isArray(photo.hashtags)) {
        photo.hashtags.forEach(tag => {
          if (tag && tag.trim()) {
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
            closeSidebar();
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
                closeSidebar();
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
    if (!user) {
      setLoadingInitialPhotos(false);
      return;
    }
    setLoadingInitialPhotos(true);
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('user_id', user.id)
        .order('order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching photos:', error);
        setLoadingInitialPhotos(false);
        return;
      }
      setPhotos(data || []);
      setHasPhotosLoadedOnce(true); // تم تحميل الصور مرة واحدة على الأقل
    } catch (err) {
      console.error('Exception fetching photos:', err);
    } finally {
      setLoadingInitialPhotos(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    const items = Array.from(photos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((photo, index) => ({
      ...photo,
      order: index
    }));
    setPhotos(updatedItems);

    try {
      for (let i = 0; i < updatedItems.length; i++) {
        const { error } = await supabase
          .from('photos')
          .update({ order: i })
          .eq('id', updatedItems[i].id);
        if (error) {
          toast({
            title: "خطأ في تحديث الترتيب",
            description: `لم نتمكن من تحديث ترتيب الصورة: ${error.message}`,
            variant: "destructive",
          });
        }
      }
      toast({ title: "تم الترتيب", description: "تم حفظ ترتيب الصور بنجاح" });
    } catch {
      toast({
        title: "خطأ في الترتيب",
        description: "حدث خطأ أثناء حفظ الترتيب الجديد",
        variant: "destructive",
      });
    }
  };

  const addPhoto = async (params: { imageUrl: string }): Promise<boolean> => {
    if (!user) {
      toast({ title: "لم تسجل الدخول", description: "يجب تسجيل الدخول لإضافة صور", variant: "destructive" });
      return false;
    }
    try {
      const { data, error } = await supabase
        .from('photos')
        .insert({
          image_url: params.imageUrl,
          likes: 0,
          caption: null,
          hashtags: [],
          user_id: user.id,
          order: 0
        })
        .select();
      if (error) {
        toast({ title: "خطأ في الإضافة", description: "لم نتمكن من إضافة الصورة", variant: "destructive" });
        return false;
      }
      if (data && data.length > 0) {
        setPhotos(prev => [data[0], ...prev]);
        setHasPhotosLoadedOnce(true); // تم إضافة صورة، لذا تم التحميل مرة واحدة
        toast({ title: "تمت الإضافة بنجاح", description: "إلمس الصورة للتعليق عليها, التحريك" });
      }
      return true;
    } catch {
      toast({ title: "خطأ غير متوقع", description: "حدث خطأ أثناء إضافة الصورة", variant: "destructive" });
      return false;
    }
  };

  useEffect(() => {
    window.addPhoto = addPhoto;
    return () => {
      // @ts-ignore
      delete window.addPhoto;
    };
  }, [user]);

  const handleDelete = async (id: string, imageUrl: string) => {
    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);
      if (error) {
        toast({ title: "خطأ في الحذف", description: "لم نتمكن من حذف الصورة", variant: "destructive" });
        return;
      }
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from('photos').remove([fileName]);
      }
      setPhotos(prev => prev.filter(photo => photo.id !== id));
      if (photos.length === 1) { // إذا كانت آخر صورة يتم حذفها
        setHasPhotosLoadedOnce(false); // يمكن اعتبار التطبيق فارغًا مرة أخرى
      }
      toast({ title: "تم الحذف بنجاح", description: "تم حذف الصورة" });
    } catch {
      console.error('Exception deleting photo');
    }
  };

  const handleUpdateCaption = async (id: string, caption: string, hashtags: string[]) => {
    try {
      const cleaned = hashtags.map(t => t.trim()).filter(t => t);
      const { error } = await supabase
        .from('photos')
        .update({ caption, hashtags: cleaned })
        .eq('id', id)
        .eq('user_id', user?.id);
      if (error) {
        toast({ title: "خطأ في التحديث", description: "لم نتمكن من تحديث التعليق", variant: "destructive" });
        return;
      }
      setPhotos(prev =>
        prev.map(photo => photo.id === id ? { ...photo, caption, hashtags: cleaned } : photo)
      );
      toast({ title: "تم التحديث بنجاح", description: "تم تحديث التعليق والهاشتاجات" });
    } catch {
      console.error('Exception updating caption');
    }
  };

  const filteredPhotos = selectedHashtag
    ? photos.filter(photo =>
        photo.hashtags?.some(tag => tag.trim() === selectedHashtag.trim())
      )
    : photos;

  return (
    <div className="w-full" data-testid="photo-grid">
      {selectedHashtag && (
        <h2 className="text-2xl font-semibold text-white/90 text-center mb-8 bg-white/5 backdrop-blur-sm py-3 rounded-lg">
          {selectedHashtag}
        </h2>
      )}

      {renderHashtags()}

      {loadingInitialPhotos ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-gray-400">جارٍ التحميل...</p>
        </div>
      ) : !hasPhotosLoadedOnce || photos.length === 0 ? (
        <div className="flex justify-center items-center h-48">
          <img src="/EmptyCard.gif" alt="لا توجد صور" className="max-w-full max-h-full" />
        </div>
      ) : (
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
                            caption={photo.caption || ""}
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
      )}
    </div>
  );
};

export default PhotoGrid;
