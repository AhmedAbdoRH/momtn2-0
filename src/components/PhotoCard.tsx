import { useState } from "react";
import { Menu, MoreVertical, Trash, Edit, Heart, GripVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PhotoCardProps {
  imageUrl: string;
  likes: number;
  caption: string;
  hashtags: string[];
  dragHandleProps?: any;
  onDelete: () => void;
  onUpdateCaption: (caption: string, hashtags: string[]) => void;
}

const PhotoCard: React.FC<PhotoCardProps> = ({
  imageUrl,
  likes,
  caption,
  hashtags,
  dragHandleProps,
  onDelete,
  onUpdateCaption,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newCaption, setNewCaption] = useState(caption);
  const [newHashtags, setNewHashtags] = useState(hashtags.join(', '));

  const handleSaveCaption = () => {
    const cleanedHashtags = newHashtags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '');
    onUpdateCaption(newCaption, cleanedHashtags);
    setEditDialogOpen(false);
  };

  return (
    <>
      <div className="relative group overflow-hidden rounded-xl">
        <img
          src={imageUrl}
          alt="Gratitude Photo"
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute top-2 left-2 flex items-center justify-between w-[calc(100%-1rem)]">
          {dragHandleProps ? (
            <div className="cursor-grab active:cursor-grabbing">
              <GripVertical className="text-gray-500 hover:text-gray-300 transition-colors duration-200" {...dragHandleProps} />
            </div>
          ) : (
            <div />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 data-[state=open]:bg-muted">
                <MoreVertical className="h-4 w-4 text-gray-500 hover:text-gray-300 transition-colors duration-200" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>تعديل</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="focus:text-red-500">
                <Trash className="mr-2 h-4 w-4" />
                <span>حذف</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="absolute bottom-0 left-0 w-full bg-black/50 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Heart className="mr-2 h-5 w-5" />
              <span>{likes}</span>
            </div>
            <div>{caption}</div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="top-[40%] bg-gray-900/80 backdrop-blur-lg text-white border border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">تعديل الصورة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 mb-1 text-right">التعليق</label>
              <textarea
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800/60 border border-gray-600 rounded-md text-right placeholder:text-gray-500 resize-none"
                dir="rtl"
              ></textarea>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 mb-1 text-right">الألبومات (مفصولة بفواصل)</label>
              <input
                type="text"
                value={newHashtags}
                onChange={(e) => setNewHashtags(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/60 border border-gray-600 rounded-md text-right placeholder:text-gray-500"
                dir="rtl"
              />
            </div>
            <div className="flex justify-end space-x-2 space-x-reverse">
              <Button
                onClick={() => setEditDialogOpen(false)}
                variant="ghost"
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSaveCaption}
                className="bg-[#ea384c] hover:bg-[#d93042] text-white"
              >
                حفظ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="top-[40%] bg-gray-900/80 backdrop-blur-lg text-white border border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-right text-gray-400">
              هل أنت متأكد أنك تريد حذف هذه الصورة؟
            </p>
            <div className="flex justify-end space-x-2 space-x-reverse">
              <Button
                onClick={() => setIsDeleteDialogOpen(false)}
                variant="ghost"
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                إلغاء
              </Button>
              <Button
                onClick={onDelete}
                className="bg-red-500 hover:bg-red-700 text-white"
              >
                حذف
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhotoCard;
