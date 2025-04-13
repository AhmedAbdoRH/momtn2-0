
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EditAlbumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAlbumName: string;
  onAlbumUpdated: () => void;
}

// Define the type for the parameters we're passing to the RPC function
interface UpdateAlbumNameParams {
  old_name: string;
  new_name: string;
}

const EditAlbumDialog = ({
  open,
  onOpenChange,
  currentAlbumName,
  onAlbumUpdated,
}: EditAlbumDialogProps) => {
  const [newAlbumName, setNewAlbumName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // إعادة تعيين اسم الألبوم الجديد عند فتح النافذة
  useEffect(() => {
    if (open && currentAlbumName) {
      setNewAlbumName(currentAlbumName);
    }
  }, [open, currentAlbumName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAlbumName || isSubmitting || !newAlbumName.trim()) return;

    setIsSubmitting(true);

    try {
      // تحديث جميع الصور التي تستخدم هذا الألبوم
      const { error } = await supabase.rpc<null, UpdateAlbumNameParams>('update_album_name', {
        old_name: currentAlbumName,
        new_name: newAlbumName.trim()
      });

      if (error) throw error;

      toast({
        title: "تم تعديل الألبوم بنجاح",
        description: `تم تغيير اسم الألبوم من "${currentAlbumName}" إلى "${newAlbumName.trim()}".`,
      });
      
      onAlbumUpdated();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "حدث خطأ",
        description: error.message || "لم نتمكن من تعديل اسم الألبوم.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isSubmitting) onOpenChange(isOpen);
      }}
    >
      <DialogContent
        className="top-[45%] sm:max-w-[350px] bg-gray-900/80 backdrop-blur-lg text-white border border-gray-700 shadow-xl rounded-lg no-close-button"
      >
        <DialogHeader>
          <DialogTitle className="text-right text-white">تعديل اسم الألبوم</DialogTitle>
          <DialogDescription className="text-right text-gray-300">
            قم بإدخال اسم الألبوم الجديد.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="w-full">
            <label htmlFor="albumName" className="block text-sm font-medium text-gray-300 mb-1 text-right">
              اسم الألبوم
            </label>
            <input
              id="albumName"
              type="text"
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              placeholder="أدخل اسم الألبوم الجديد"
              className="w-full px-3 py-2 bg-gray-800/60 border border-gray-600 rounded-md text-right placeholder:text-gray-500 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700/50 focus:ring-gray-500"
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !newAlbumName.trim() || newAlbumName === currentAlbumName}
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
                "حفظ التعديلات"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAlbumDialog;
