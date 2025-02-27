
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateNewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateNewDialog = ({ open, onOpenChange }: CreateNewDialogProps) => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const fileExt = image.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('photos')
        .upload(filePath, image);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      // @ts-ignore - Using window.addPhoto from PhotoGrid
      const success = await window.addPhoto({
        imageUrl: publicUrl,
      });

      if (success) {
        toast({
          title: "تمت الإضافة بنجاح",
          description: "تمت إضافة الصورة الجديدة إلى المعرض",
        });

        // Reset form
        setImage(null);
        setPreviewUrl("");
        onOpenChange(false);
      } else {
        toast({
          title: "حدث خطأ",
          description: "لم نتمكن من إضافة الصورة. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting photo:', error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من إضافة الصورة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900/80 backdrop-blur-xl text-white border-0">
        <DialogHeader>
          <DialogTitle>إضافة صورة جديدة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <div 
              className="w-full h-48 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 transition-colors"
              onClick={() => document.getElementById('image')?.click()}
            >
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <>
                  <ImagePlus className="w-10 h-10 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-400">اضغط لاختيار صورة</p>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                onOpenChange(false);
                setPreviewUrl("");
                setImage(null);
              }}
              className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={!image || isSubmitting}
              className="bg-pink-500/80 hover:bg-pink-600/80 text-white"
            >
              {isSubmitting ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewDialog;
