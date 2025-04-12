
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { ImagePlus, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthProvider";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CreateNewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPhotoAdded: () => void;
}

const CreateNewDialog = ({ open, onOpenChange, onPhotoAdded }: CreateNewDialogProps) => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [albumName, setAlbumName] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      fetchAlbumSuggestions();
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
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('hashtags')
        .not('hashtags', 'is', null);

      if (error) throw error;

      const allHashtags: string[] = [];
      if (data && Array.isArray(data)) {
        data.forEach(item => {
          if (item.hashtags && Array.isArray(item.hashtags)) {
            item.hashtags.forEach(tag => {
              if (tag && typeof tag === 'string' && tag.trim()) {
                allHashtags.push(tag.trim());
              }
            });
          }
        });
      }
      
      const uniqueHashtags = [...new Set(allHashtags)];
      setSuggestions(uniqueHashtags);
    } catch (error) {
      console.error('Error fetching album suggestions:', error);
      setSuggestions([]); // Set to empty array on error
    }
  };

  const resetFormState = () => {
    setImage(null);
    setPreviewUrl("");
    setAlbumName("");
    setIsSubmitting(false);
    setPopoverOpen(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (file) {
      setImage(file);
      const newUrl = URL.createObjectURL(file);
      setPreviewUrl(newUrl);
    } else {
      setImage(null);
      setPreviewUrl("");
    }
  };

  const handleAlbumChange = (value: string) => {
    let formattedValue = value;
    if (formattedValue && !formattedValue.startsWith('#')) {
      formattedValue = '#' + formattedValue;
    }
    formattedValue = formattedValue.replace(/\s+/g, '_');
    setAlbumName(formattedValue);
  };

  const handleAlbumSelect = (album: string) => {
    setAlbumName(album);
    setPopoverOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || isSubmitting || !user) {
      console.warn("Submit prevented:", { hasImage: !!image, isSubmitting, hasUser: !!user });
      return;
    }

    if (albumName && !albumName.startsWith('#')) {
      toast({
        title: "خطأ في اسم الألبوم",
        description: "يجب أن يبدأ اسم الألبوم بعلامة #",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const fileExt = image.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/photo_${Date.now()}.${fileExt}`;

      console.log('Uploading file:', fileName);
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('photos')
        .upload(fileName, image, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        let userMessage = "لم نتمكن من رفع الصورة. يرجى المحاولة مرة أخرى.";
        if (uploadError.message.includes("exceeds the maximum allowed size")) {
          userMessage = "حجم الملف كبير جدًا. يرجى اختيار ملف أصغر.";
        } else if (uploadError.message.includes("mime type")) {
          userMessage = "نوع الملف غير مدعوم. يرجى اختيار صورة.";
        }
        toast({ title: "خطأ في الرفع", description: userMessage, variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      console.log('Upload completed:', uploadData?.path);
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(uploadData!.path);

      console.log('Public URL:', publicUrl);
      if (!publicUrl) {
        throw new Error("Failed to get public URL for the uploaded image.");
      }

      const hashtags = albumName ? [albumName.trim()] : [];

      console.log('Adding photo to database with user_id:', user.id, 'and hashtags:', hashtags);

      const { data: insertData, error: insertError } = await supabase
        .from('photos')
        .insert({
          image_url: publicUrl,
          likes: 0,
          caption: null,
          hashtags: hashtags.length > 0 ? hashtags : null,
          user_id: user.id,
          order: 0
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error adding photo to database:', insertError);
        throw insertError;
      }

      console.log('Photo added successfully to DB:', insertData);

      toast({
        title: "تمت الإضافة بنجاح",
        description: "تمت إضافة صورتك الجديدة.",
      });

      resetFormState();
      onOpenChange(false);

      onPhotoAdded();

    } catch (error: any) {
      console.error('Error submitting photo:', error);
      toast({
        title: "حدث خطأ",
        description: error.message || "لم نتمكن من إضافة الصورة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
            resetFormState();
        }
        onOpenChange(isOpen);
    }}>
      <DialogContent
        className="top-[45%] sm:max-w-[350px] max-h-[80vh] bg-gray-900/70 backdrop-blur-xl text-white border-0 shadow-xl overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>إضافة صورة جديدة</DialogTitle>
          <DialogDescription className="text-gray-300">
            قم بتحميل صورة لإضافتها إلى المعرض.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="flex flex-col items-center gap-4">
            <input
              id="image"
              type="file"
              accept="image/*,.heic,.heif"
              onChange={handleImageChange}
              className="hidden"
            />
            <label
              htmlFor="image"
              className="w-full h-40 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition-colors focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-indigo-500"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <ImagePlus className="w-10 h-10 text-gray-400 mx-auto" />
                  <p className="mt-2 text-sm text-gray-400">اضغط لاختيار صورة</p>
                </div>
              )}
            </label>

            <div className="w-full">
              <label htmlFor="albumNameInput" className="block text-sm font-medium text-gray-300 mb-1 text-right">
                اسم الألبوم (اختياري)
              </label>

              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <div className="flex items-center relative w-full">
                    <Hash className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                    <input
                      id="albumNameInput"
                      ref={inputRef}
                      type="text"
                      value={albumName}
                      onChange={(e) => handleAlbumChange(e.target.value)}
                      onFocus={() => {
                        if (suggestions && suggestions.length > 0) setPopoverOpen(true);
                      }}
                      placeholder="مثال: #رحلات_2025"
                      className="w-full px-3 py-2 pr-9 bg-gray-800/60 border border-gray-600 rounded-md text-right placeholder:text-gray-500 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                      aria-autocomplete="list"
                      aria-controls="album-suggestions"
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  id="album-suggestions"
                  className="w-[calc(100%-2rem)] sm:w-[300px] p-0 bg-gray-800 border border-gray-700 max-h-60 overflow-y-auto text-right shadow-lg"
                  align="end"
                  style={{ zIndex: 51 }}
                >
                  <Command className="bg-transparent">
                    <CommandInput
                      placeholder="ابحث أو أنشئ ألبومًا..."
                      className="text-right bg-gray-800 border-b border-gray-700 text-white h-10 px-3 placeholder:text-gray-500 focus:outline-none"
                    />
                    <CommandEmpty className="text-gray-400 text-center py-4 px-2">
                      لا توجد نتائج. يمكنك إنشاء ألبوم جديد.
                    </CommandEmpty>
                    {suggestions && suggestions.length > 0 ? (
                      <CommandGroup heading="الألبومات المقترحة">
                        {suggestions.map((album, index) => (
                          <CommandItem
                            key={index}
                            value={album || ""}
                            onSelect={() => handleAlbumSelect(album)}
                            className="text-right cursor-pointer px-3 py-2 hover:bg-gray-700 data-[selected=true]:bg-indigo-600 data-[selected=true]:text-white"
                          >
                            {album}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ) : null}
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="mt-1 text-xs text-gray-400 text-right">
                يبدأ بـ #، استخدم _ بدل المسافة.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                  onOpenChange(false);
              }}
              className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700/50 focus:ring-gray-500"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={!image || isSubmitting}
              className="bg-[#ea384c] hover:bg-[#d93042] text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-[#ea384c]"
            >
              {isSubmitting ? (
                 <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     <span>جاري الحفظ...</span>
                 </div>
              ) : "حفظ الصورة"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewDialog;
