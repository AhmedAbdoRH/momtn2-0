import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import PhotoCard from "./PhotoCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";

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
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [hasShownFirstTimeModal, setHasShownFirstTimeModal] = useState(false);
  const [isFirstPhotoAdded, setIsFirstPhotoAdded] = useState(false);
  // Use a ref to track if we've shown the first time modal
  const hasShownFirstTimeModalRef = useRef(false);
  const [dontShowAgain, setDontShowAgain] = useState(true);

  // Check if user has chosen to not see the tutorial again
  useEffect(() => {
    if (user) {
      const dontShowTutorial = localStorage.getItem(`dontShowTutorial_${user.id}`) === 'true';
      if (dontShowTutorial) {
        console.log('User has chosen to not see the tutorial again');
        setHasShownFirstTimeModal(true);
        hasShownFirstTimeModalRef.current = true;
      }
    }
  }, [user]);

  useEffect(() => {
    const initialize = async () => {
      if (user) {
        const photosData = await fetchPhotos();
        // Check if we should show the tutorial modal
        if (photosData && photosData.length === 1) {
          const dontShowTutorial = localStorage.getItem(`dontShowTutorial_${user.id}`) === 'true';
          if (!dontShowTutorial && !hasShownFirstTimeModalRef.current) {
            console.log('Showing first time tutorial modal');
            setShowFirstTimeModal(true);
            setHasShownFirstTimeModal(true);
            hasShownFirstTimeModalRef.current = true;
          }
        }
      } else {
        setLoadingInitialPhotos(false);
      }
    };
    
    initialize();
  }, [user]);

  useEffect(() => {
    const handlePhotoAdded = async () => {
      const newPhotos = await fetchPhotos();
      // After fetching, check if this is the first photo and we haven't shown the modal yet
      if (newPhotos && newPhotos.length === 1 && !hasShownFirstTimeModalRef.current) {
        setShowFirstTimeModal(true);
        setHasShownFirstTimeModal(true);
        hasShownFirstTimeModalRef.current = true;
      }
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
      return [];
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
        return [];
      }

      const photosData = data || [];
      setPhotos(photosData);
      setHasPhotosLoadedOnce(true);
      
      // Check if this is the first photo being loaded
      if (photosData.length === 1 && !hasShownFirstTimeModal) {
        setShowFirstTimeModal(true);
        setHasShownFirstTimeModal(true);
      }
      
      return photosData;
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
    console.log('addPhoto called with params:', params);
    if (!user) {
      toast({ title: "لم تسجل الدخول", description: "يجب تسجيل الدخول لإضافة صور", variant: "destructive" });
      return false;
    }
    try {
      const isFirstPhoto = photos.length === 0;
      console.log('isFirstPhoto:', isFirstPhoto, 'photos.length:', photos.length);
      console.log('hasShownFirstTimeModal:', hasShownFirstTimeModal);
      
      // Don't show tutorial if user has chosen not to see it
      const dontShowTutorial = localStorage.getItem(`dontShowTutorial_${user.id}`) === 'true';
      if (dontShowTutorial) {
        console.log('Skipping tutorial as user has chosen to not see it');
        setHasShownFirstTimeModal(true);
        hasShownFirstTimeModalRef.current = true;
      }
      
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
        setHasPhotosLoadedOnce(true);
        
        // Show first-time modal if it's the first photo and we haven't shown it before
        console.log('Before showing modal - isFirstPhoto:', isFirstPhoto, '!hasShownFirstTimeModal:', !hasShownFirstTimeModal);
        if (isFirstPhoto && !hasShownFirstTimeModal) {
          console.log('Showing first time modal');
          setShowFirstTimeModal(true);
          setHasShownFirstTimeModal(true);
        }
        
        toast({ 
          title: "✨ تمت الإضافة بنجاح", 
          description: isFirstPhoto ? "تهانينا! لقد أضفت صورتك الأولى" : "إلمس الصورة للتعليق عليها أو تحريكها",
          className: "animate-pulse border-2 border-green-400/50 bg-green-900/80 backdrop-blur-sm"
        });
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
      if (photos.length === 1) {
        setHasPhotosLoadedOnce(false);
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
          <p className="text-gray-300">جارٍ التحميل...</p>
        </div>
      ) : !hasPhotosLoadedOnce || photos.length === 0 ? (
        <div className="flex justify-center items-center h-50 mt-10">
          <img src="/EmptyCard.gif" alt="لا توجد صور" className="max-w-full max-h-full opacity-80" />
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="photos">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4"
              >
                {filteredPhotos.map((photo, index) => (
                  <Draggable key={photo.id} draggableId={photo.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="relative group"
                      >
                        <PhotoCard
                          imageUrl={photo.image_url}
                          likes={photo.likes}
                          caption={photo.caption || ''}
                          hashtags={photo.hashtags || []}
                          onDelete={() => handleDelete(photo.id, photo.image_url)}
                          dragHandleProps={provided.dragHandleProps}
                          onUpdateCaption={(caption, hashtags) => handleUpdateCaption(photo.id, caption, hashtags)}
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
      )}

      {/* First Time User Modal */}
      <Dialog open={showFirstTimeModal} onOpenChange={setShowFirstTimeModal}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-green-900/40 to-blue-900/40 backdrop-blur-lg border border-white/20 shadow-2xl shadow-black/50 text-white">
          <DialogHeader>
            <div className="space-y-6 text-right">
              <div className="text-center mb-4">
                <p className="text-2xl font-bold text-green-400 mb-2">🎉 مبروك! 🎉</p>
                <p className="text-base text-white/90">لقد أضفت أول صورة لك بنجاح</p>
              </div>
              <DialogDescription className="text-gray-200">
                <p className="text-lg font-bold text-center text-white/90 mb-4 border-b border-white/20 pb-3">
                  يمكنك إجراء التعديلات من خلال لمس الصورة
                </p>
                <ul className="space-y-4 pr-0">
                  <li className="flex justify-end items-center gap-2">
                    <span>إضافة تعليق / اضافتها للألبوم</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </li>
                  <li className="flex justify-end items-center gap-2">
                    <span>سحب الصورة وتحريكها</span>
                    <span className="text-2xl text-white -mt-1">⋮⋮</span>
                  </li>
                  <li className="flex justify-end items-center gap-2">
                    <span>حذف الصورة</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </li>
                </ul>
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-6">
            <div className="w-full flex flex-col items-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <input
                  type="checkbox"
                  id="dontShowAgain"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="dontShowAgain" className="text-sm text-gray-300 hover:cursor-pointer">
                  لا تظهر لي مرة أخرى
                </label>
              </div>
              <Button 
                type="button" 
                onClick={() => {
                  if (dontShowAgain && user) {
                    localStorage.setItem(`dontShowTutorial_${user.id}`, 'true');
                  }
                  setShowFirstTimeModal(false);
                }}
                className="bg-red-800 hover:bg-red-900 text-white px-8 py-2 text-lg transition-colors w-full max-w-xs"
              >
                فهمت، شكراً لك
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhotoGrid;
