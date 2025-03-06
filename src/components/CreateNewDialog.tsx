
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { useHeartSound } from "@/components/HeartSound";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// Import additional components
import { useLocation } from 'react-router-dom';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Space } from '@/types/spaces';

interface CreateNewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateNewDialog = ({ open, onOpenChange }: CreateNewDialogProps) => {
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isTagInputActive, setIsTagInputActive] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { playHeartSound } = useHeartSound();
  const { toast } = useToast();
  
  // Add new state for spaces
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  const location = useLocation();
  
  // Extract space ID from URL if we're on a space page
  const pathSpaceId = location.pathname.startsWith('/spaces/') 
    ? location.pathname.split('/')[2] 
    : null;

  useEffect(() => {
    // Initialize selectedSpace if we're on a space page
    if (pathSpaceId && pathSpaceId !== 'new') {
      setSelectedSpace(pathSpaceId);
    }
    
    // Fetch user's spaces
    if (user) {
      fetchUserSpaces();
    }
  }, [user, pathSpaceId, open]);

  const fetchUserSpaces = async () => {
    try {
      // Fetch spaces where the user is the owner
      const { data: ownedSpaces, error: ownedError } = await supabase
        .from('spaces')
        .select('*')
        .eq('owner_id', user?.id);
      
      if (ownedError) throw ownedError;
      
      // Fetch spaces where the user is a member
      const { data: memberSpaces, error: memberError } = await supabase
        .from('spaces')
        .select('*')
        .not('owner_id', 'eq', user?.id)
        .in('id', (await supabase
          .from('space_members')
          .select('space_id')
          .eq('user_id', user?.id))
          .data?.map(sm => sm.space_id) || []);
      
      if (memberError) throw memberError;
      
      setSpaces([...(ownedSpaces || []), ...(memberSpaces || [])]);
    } catch (error) {
      console.error('Error fetching spaces:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadPhoto = async () => {
    if (!selectedFile) {
      console.error("No file selected");
      return { photoUrl: null, photoId: null };
    }

    const fileExt = selectedFile.name.split('.').pop();
    const newName = `${Math.random()}.${fileExt}`;
    const filePath = `lovable-uploads/${newName}`;

    try {
      let { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, selectedFile);

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        return { photoUrl: null, photoId: null };
      }

      // Fix: Construct the URL properly instead of using the protected storageUrl property
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      return { photoUrl: publicUrl, photoId: newName };
    } catch (error) {
      console.error("Unexpected error:", error);
      return { photoUrl: null, photoId: null };
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !hashtags.includes(currentTag.trim())) {
      setHashtags([...hashtags, currentTag.trim()]);
      setCurrentTag('');
    }
    setIsTagInputActive(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove));
  };

  const toggleTagInput = () => {
    setIsTagInputActive(!isTagInputActive);
  };

  // Modify the handleSubmit function to include space_id
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "الرجاء اختيار صورة أولاً"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload the photo
      const { photoUrl, photoId } = await uploadPhoto();
      
      if (!photoUrl) {
        throw new Error("Failed to upload photo");
      }
      
      // Insert record into photos table
      const { error: insertError } = await supabase
        .from('photos')
        .insert([
          {
            image_url: photoUrl,
            caption: caption || null,
            hashtags: hashtags.length > 0 ? hashtags : null,
            user_id: user?.id,
            space_id: selectedSpace
          }
        ]);
      
      if (insertError) throw insertError;
      
      // Play heart sound on successful submission
      playHeartSound();
      
      toast({
        title: "تم بنجاح",
        description: "تم حفظ الامتنان بنجاح"
      });
      
      // Reset form
      setCaption('');
      setHashtags([]);
      setSelectedFile(null);
      setPreviewUrl('');
      setIsTagInputActive(false);
      setCurrentTag('');
      setSelectedSpace(pathSpaceId);
      
      // Close dialog
      onOpenChange(false);
      
      // Refresh photos
      window.dispatchEvent(new Event('refresh-photos'));
      
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ الامتنان"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">إضافة امتنان جديد</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo upload section */}
          <div className="flex flex-col items-center space-y-2">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-auto rounded-md"
                style={{ maxHeight: '200px' }}
              />
            ) : (
              <div className="border-2 border-dashed rounded-md p-4 text-center">
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <Plus className="mx-auto w-6 h-6 text-gray-500" />
                  <span className="text-sm text-gray-500">
                    {selectedFile ? selectedFile.name : 'إضغط لرفع صورة'}
                  </span>
                </Label>
              </div>
            )}

            <Input
              type="file"
              id="image-upload"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              ref={fileInputRef}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              تغيير الصورة
            </Button>
          </div>
          
          {/* Caption input */}
          <div className="space-y-2">
            <Label htmlFor="caption">
              وصف الصورة (اختياري)
            </Label>
            <Input
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="أضف وصفا للصورة"
              dir="rtl"
            />
          </div>
          
          {/* Hashtag input */}
          <div className="space-y-2">
            <Label>
              الهاشتاجات (اختياري)
            </Label>
            <div className="flex items-center space-x-2">
              {hashtags.map(tag => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag}
                </Button>
              ))}
              {!isTagInputActive ? (
                <Button variant="ghost" size="sm" onClick={toggleTagInput}>
                  إضافة هاشتاج
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="أدخل هاشتاج"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    dir="rtl"
                  />
                  <Button size="sm" onClick={handleAddTag}>
                    حفظ
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Space selection - new section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              المساحة المشتركة (اختياري)
            </label>
            <Select
              value={selectedSpace || ''}
              onValueChange={(value) => setSelectedSpace(value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر مساحة مشتركة (اختياري)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">الصفحة الشخصية</SelectItem>
                {spaces.map((space) => (
                  <SelectItem key={space.id} value={space.id}>
                    {space.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center">
                  <span className="animate-spin mr-2">●</span>
                  جاري الحفظ...
                </div>
              ) : (
                'حفظ الامتنان'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewDialog;
