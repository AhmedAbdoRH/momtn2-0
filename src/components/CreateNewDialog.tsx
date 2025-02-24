
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateNewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateNewDialog = ({ open, onOpenChange }: CreateNewDialogProps) => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [gratitudeText, setGratitudeText] = useState("");
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
    if (!image || !gratitudeText || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // @ts-ignore - Using window.addPhoto from PhotoGrid
      const success = await window.addPhoto({
        imageUrl: previewUrl,
        gratitudeText: gratitudeText,
      });

      if (success) {
        toast({
          title: "تمت الإضافة بنجاح",
          description: "تمت إضافة الصورة الجديدة إلى المعرض",
        });

        // Reset form
        setImage(null);
        setPreviewUrl("");
        setGratitudeText("");
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة لحظة جديدة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">الصورة</Label>
            <div className="flex flex-col items-center gap-4">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div 
                className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
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
                    <p className="mt-2 text-sm text-gray-500">اضغط لاختيار صورة</p>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gratitudeText">رسالة الامتنان</Label>
            <Input
              id="gratitudeText"
              value={gratitudeText}
              onChange={(e) => setGratitudeText(e.target.value)}
              placeholder="اكتب عن ماذا تشعر بالامتنان"
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                onOpenChange(false);
                setPreviewUrl("");
                setImage(null);
                setGratitudeText("");
              }}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={!image || isSubmitting}>
              {isSubmitting ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewDialog;
