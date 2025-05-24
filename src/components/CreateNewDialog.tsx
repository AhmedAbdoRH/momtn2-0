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
}

const CreateNewDialog = ({ open, onOpenChange, onPhotoAdded }: CreateNewDialogProps) => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [albumName, setAlbumName] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
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
      const { data, error } = await supabase
        .from("photos")
        .select("hashtags")
        .not("hashtags", "is", null);

      if (error) throw error;

      const allAlbumNames = data.flatMap((item) => item.hashtags || []).filter(Boolean);
      const uniqueAlbumNames = [...new Set(allAlbumNames)].sort();
      setSuggestions(uniqueAlbumNames);
    } catch (error) {
      console.error("Error fetching album suggestions:", error);
    }
  };

  const resetFormState = () => {
    setImage(null);
    setPreviewUrl("");
    setAlbumName("");
    setShowSuggestions(false);
    setIsSubmitting(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const newUrl = URL.createObjectURL(file);
      setPreviewUrl(newUrl);
    } else {
      setImage(null);
      setPreviewUrl("");
    }
  };

  const handleAlbumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAlbumName(value);
    setShowSuggestions(suggestions.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setAlbumName(suggestion);
    setShowSuggestions(false);
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

      const finalAlbumName = albumName.trim();
      const albumDataForDB = finalAlbumName ? [finalAlbumName] : null;

      const { data: insertData, error: insertError } = await supabase
        .from("photos")
        .insert({
          image_url: publicUrl,
          hashtags: albumDataForDB,
          user_id: user.id,
        })
        .select()
        .single();

      if (insertError) {
        await supabase.storage.from("photos").remove([filePath]);
        throw insertError;
      }

      toast({ 
        title: "🎉 تمت الإضافة بنجاح 🎉", 
        description: "تهانينا! الصورة الأولى في ألبومك.\n\nإلمس الصورة لإضافة تعليق, التحريك أو الإزالة" 
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

  const filteredSuggestions = albumName
    ? suggestions.filter((suggestion) =>
        typeof suggestion === "string" &&
        suggestion.toLowerCase().includes(albumName.toLowerCase())
      )
    : suggestions;

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
          <DialogTitle className="text-right text-white">إضافة صورة جديدة</DialogTitle>
          <DialogDescription className="text-right text-gray-300">
            قم بتحميل صورة وأضفها إلى ألبوم (اختياري).
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
              <label htmlFor="albumName" className="block text-sm font-medium text-gray-300 mb-1 text-right">
                اسم الألبوم (اختياري)
              </label>
              <input
                id="albumName"
                type="text"
                value={albumName}
                onChange={handleAlbumChange}
                onFocus={() => setShowSuggestions(suggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="مثال: رحلات الصيف"
                className="w-full px-3 py-2 bg-gray-800/60 border border-gray-600 rounded-md text-right placeholder:text-gray-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                autoComplete="off"
                aria-haspopup="listbox"
                aria-expanded={showSuggestions && filteredSuggestions.length > 0}
              />
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div
                  role="listbox"
                  id="suggestions-list"
                  aria-label="Album suggestions"
                  className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto bg-gray-800 border border-gray-700 rounded-md shadow-lg text-right suggestions-list"
                >
                  {filteredSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      role="option"
                      aria-selected="false"
                      className="px-3 py-2 cursor-pointer hover:bg-gray-700 suggestion-item"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSuggestionClick(suggestion);
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewDialog;