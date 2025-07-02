import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { ImagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";

interface CreateNewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPhotoAdded: () => void;
  selectedGroupId?: string | null;
}

const CreateNewDialog = ({ open, onOpenChange, onPhotoAdded, selectedGroupId }: CreateNewDialogProps) => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [albumName, setAlbumName] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showAlbumInput, setShowAlbumInput] = useState(false);
  // State for managing album selection and visibility
  const [selectedAlbums, setSelectedAlbums] = useState<Set<string>>(new Set());
  const [showSuggestions, setShowSuggestions] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  // مرجع لعنصر label الخاص برفع الصور
  const imageLabelRef = useRef<HTMLLabelElement>(null);

  // إعادة تعيين الحالة وتنشيط التركيز عند فتح الـ Dialog
  useEffect(() => {
    if (open) {
      resetFormState();
      fetchAlbumSuggestions();
      // تنشيط التركيز على label رفع الصور
      if (imageLabelRef.current) {
        imageLabelRef.current.focus();
      }
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchAlbumSuggestions = async () => {
    if (!user) return;
    try {
      // If it's a group, only show albums from this group
      if (selectedGroupId) {
        const { data: groupPhotos, error: groupError } = await supabase
          .from('photos')
          .select('hashtags')
          .eq('group_id', selectedGroupId);

        if (groupError) throw groupError;

        const groupTags = new Set<string>();
        groupPhotos.forEach(photo => {
          if (photo.hashtags && Array.isArray(photo.hashtags)) {
            photo.hashtags.forEach((tag: string) => {
              if (tag && typeof tag === 'string') {
                groupTags.add(tag);
              }
            });
          }
        });
        setSuggestions(Array.from(groupTags));
      } else {
        // For personal photos, only show personal albums (photos without group_id)
        const { data: personalPhotos, error: personalError } = await supabase
          .from('photos')
          .select('hashtags')
          .eq('user_id', user.id)
          .is('group_id', null);

        if (personalError) throw personalError;

        const personalTags = new Set<string>();
        personalPhotos.forEach(photo => {
          if (photo.hashtags && Array.isArray(photo.hashtags)) {
            photo.hashtags.forEach((tag: string) => {
              if (tag && typeof tag === 'string') {
                personalTags.add(tag);
              }
            });
          }
        });
        setSuggestions(Array.from(personalTags));
      }
    } catch (error) {
      console.error('Error fetching album suggestions:', error);
      // Fallback to empty array if there's an error
      setSuggestions([]);
    }
  };

  const resetFormState = () => {
    setImage(null);
    setPreviewUrl("");
    setAlbumName("");
    setSelectedAlbums(new Set());
    setShowAlbumInput(false);
    setIsSubmitting(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const newUrl = URL.createObjectURL(file);
      setPreviewUrl(newUrl);
      // Always show suggestions when an image is selected
      setShowSuggestions(true);
    } else {
      setImage(null);
      setPreviewUrl("");
      setShowSuggestions(false);
    }
  };

  const handleAlbumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAlbumName(value);
    // Keep suggestions visible while typing
    setShowSuggestions(true);
  };

  // Function to add a new album
  const addNewAlbum = () => {
    const newAlbumName = albumName.trim();
    if (!validateAlbumName(newAlbumName)) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم ألبوم صالح',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Update the UI immediately for better UX
      setSelectedAlbums(prev => {
        const newSet = new Set(prev);
        newSet.add(newAlbumName);
        return newSet;
      });
      
      // Add to suggestions if not already present
      if (!suggestions.includes(newAlbumName)) {
        setSuggestions(prev => [...prev, newAlbumName]);
      }
      
      setAlbumName('');
      setShowAlbumInput(false);
      
    } catch (error) {
      console.error('Error adding album:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إضافة الألبوم',
        variant: 'destructive',
      });
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Don't update albumName to prevent filtering the suggestions
    // Just update the selected albums
    setSelectedAlbums(prev => {
      const newSet = new Set(prev);
      if (newSet.has(suggestion)) {
        newSet.delete(suggestion);
      } else {
        newSet.add(suggestion);
      }
      return newSet;
    });
  };

  // Function to validate album name (no longer needs to check database)
  const validateAlbumName = (name: string): boolean => {
    return name.trim().length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || isSubmitting || !user) return;
    
    setIsSubmitting(true);

    try {
      const fileExt = image.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${user.id}/photo_${Date.now()}.${fileExt}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("photos")
        .upload(fileName, image, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        toast({
          title: "خطأ في الرفع",
          description: `فشل رفع الملف: ${uploadError.message}`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const filePath = uploadData?.path;
      if (!filePath) throw new Error("File path not returned after upload.");

      const { data: urlData } = supabase.storage.from("photos").getPublicUrl(filePath);
      const publicUrl = urlData?.publicUrl;
      if (!publicUrl) {
        await supabase.storage.from("photos").remove([filePath]);
        throw new Error("لم يتم العثور على الرابط العام للصورة بعد الرفع.");
      }

      // Convert Set to array of album names
      const selectedAlbumsArray = Array.from(selectedAlbums);
      
      // Add any new albums to suggestions
      const newAlbums = selectedAlbumsArray.filter(album => 
        album && typeof album === 'string' && !suggestions.includes(album)
      );
      
      if (newAlbums.length > 0) {
        setSuggestions(prev => [...new Set([...prev, ...newAlbums])]);
      }

      // For group photos, ensure the user is a member of the group
      if (selectedGroupId) {
        const { data: membership, error: membershipError } = await supabase
          .from('group_members')
          .select('*')
          .eq('group_id', selectedGroupId)
          .eq('user_id', user.id)
          .single();

        if (membershipError || !membership) {
          throw new Error('ليس لديك صلاحية لإضافة صور إلى هذه المجموعة');
        }
      }

      const { data: insertData, error: insertError } = await supabase
        .from("photos")
        .insert({
          image_url: publicUrl,
          hashtags: selectedAlbumsArray,
          user_id: user.id,
          group_id: selectedGroupId || null, // Will be null for personal albums
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        await supabase.storage.from("photos").remove([filePath]);
        throw insertError;
      }

      const isFirstPhoto = !selectedGroupId; // Only show tutorial for personal photos
      
      toast({ 
        title: "🎉 تمت الإضافة بنجاح 🎉", 
        description: isFirstPhoto 
          ? "تهانينا! الصورة الأولى في ألبومك.\n\nإلمس الصورة لإضافة تعليق, التحريك أو الإزالة"
          : selectedGroupId 
            ? "تم إضافة الصورة إلى المجموعة بنجاح"
            : "تم إضافة الصورة بنجاح"
      });
      onPhotoAdded();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "حدث خطأ",
        description: error.message || "لم نتمكن من إضافة الصورة.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show all suggestions when needed, sorted alphabetically
  const filteredSuggestions = showSuggestions 
    ? [...suggestions].sort((a, b) => a.localeCompare(b))
    : [];

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetFormState();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="top-[45%] sm:max-w-[350px] max-h-[85vh] overflow-y-auto bg-gray-900/80 backdrop-blur-lg text-white border border-gray-700 shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-right text-white">
            {selectedGroupId ? "إضافة صورة للمجموعة" : "إضافة صورة جديدة"}
          </DialogTitle>
          <DialogDescription className="text-right text-gray-300">
            {selectedGroupId 
              ? "قم بتحميل صورة وأضفها إلى المجموعة المحددة."
              : "قم بتحميل صورة وأضفها إلى ألبوم (اختياري)."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="flex flex-col items-center gap-4">
            <label
              htmlFor="imageUpload"
              ref={imageLabelRef} // إضافة المرجع
              tabIndex={0} // جعل label قابلة للتركيز
              className="w-full h-40 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors outline-none"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg p-1" />
              ) : (
                <div className="text-center pointer-events-none">
                  <ImagePlus className="w-10 h-10 text-gray-400 mx-auto" />
                  <p className="mt-2 text-sm text-gray-400">اضغط لاختيار صورة</p>
                </div>
              )}
            </label>
            <input
              id="imageUpload"
              type="file"
              accept="image/*,.heic,.heif"
              onChange={handleImageChange}
              className="hidden"
            />

            <div className="w-full relative">
              {showAlbumInput && (
                <div className="w-full mb-2">
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        id="albumName"
                        type="text"
                        value={albumName}
                        onChange={handleAlbumChange}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addNewAlbum();
                          }
                        }}
                        placeholder="اكتب اسم الألبوم الجديد"
                        className="w-full px-4 py-3 text-right text-white bg-gray-800/90 border border-gray-700 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                        autoComplete="off"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addNewAlbum();
                        }}
                        disabled={!albumName.trim()}
                        className={`flex-1 py-2 rounded-lg transition-colors text-sm ${
                          albumName.trim()
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        إضافة
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAlbumInput(false)}
                        className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {image && (
                <div className="mt-3">
                  <p className="text-sm text-gray-300 mb-2">اختر ألبوماً لإضافته للصورة:</p>
                  <div className="flex flex-wrap gap-2 justify-end mb-3">
                    {filteredSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`px-3 py-1.5 rounded-md font-medium text-xs transition-colors border shadow-sm ${
                          selectedAlbums.has(suggestion)
                            ? 'bg-green-600/80 border-green-500 text-white'
                            : 'bg-gray-700/70 hover:bg-gray-600/80 border-gray-600 text-white'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSuggestionClick(suggestion);
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-transparent hover:bg-gray-800/30 rounded-lg text-indigo-300 hover:text-white font-medium text-sm flex items-center gap-1 transition-all border border-indigo-700/50 hover:border-indigo-500/70"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowAlbumInput(true);
                        setAlbumName('');
                        setTimeout(() => {
                          const input = document.getElementById('albumName');
                          input?.focus();
                        }, 100);
                      }}
                    >
                      <span>ألبوم جديد</span>
                      <span className="text-base">+</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-start gap-3 pt-4">
            <Button
              type="submit"
              disabled={!image || isSubmitting}
              className="bg-[#ea384c] hover:bg-[#d93042] text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-[#ea384c]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>جاري الحفظ...</span>
                </div>
              ) : (
                "حفظ الصورة"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700/50 focus:ring-gray-500"
            >
              إغلاق
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewDialog;