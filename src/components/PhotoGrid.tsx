import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useHeartSound } from "@/components/HeartSound";
import { Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface PhotoGridProps {
  spaceId?: string;
}

const PhotoGrid = ({ spaceId }: PhotoGridProps) => {
  const [photos, setPhotos] = useState<any[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPhotos, setFilteredPhotos] = useState<any[]>([]);
  const { user } = useAuth();
  const { playHeartSound } = useHeartSound();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  const [editedCaption, setEditedCaption] = useState('');

  useEffect(() => {
    fetchPhotos();
    window.addEventListener('refresh-photos', fetchPhotos);
    return () => {
      window.removeEventListener('refresh-photos', fetchPhotos);
    };
  }, [user?.id, spaceId]); // Add spaceId dependency

  const fetchPhotos = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      let query = supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Filter by space_id if provided, otherwise show user's personal photos
      if (spaceId) {
        query = query.eq('space_id', spaceId);
      } else {
        query = query.eq('user_id', user.id).is('space_id', null);
      }
        
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching photos:', error);
        return;
      }
      
      setPhotos(data || []);
      
      // Extract unique hashtags
      const allTags = data?.flatMap(photo => photo.hashtags || []) || [];
      const uniqueTags = [...new Set(allTags)];
      setHashtags(uniqueTags);
      
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchTerm(tag);
  };

  useEffect(() => {
    const results = photos.filter(photo =>
      photo.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.hashtags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredPhotos(results);
  }, [searchTerm, photos]);

  const renderCards = () => {
    const photosToDisplay = searchTerm ? filteredPhotos : photos;

    if (loading) {
      return <p>Loading...</p>;
    }

    if (photosToDisplay.length === 0) {
      return <p>No gratitude items found.</p>;
    }

    return photosToDisplay.map(photo => (
      <Card key={photo.id} className="bg-white/80 backdrop-blur-sm shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 text-right">
            {photo.caption || 'بدون عنوان'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <img
            src={photo.image_url}
            alt={photo.caption || 'Gratitude Image'}
            className="object-cover rounded-md w-full h-48"
          />
          {photo.hashtags && photo.hashtags.length > 0 && (
            <div className="flex flex-wrap justify-center mt-2">
              {photo.hashtags.map((tag, index) => (
                <Badge
                  key={index}
                  className="mr-1 mb-1 cursor-pointer hover:bg-secondary-foreground hover:text-secondary"
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {new Date(photo.created_at).toLocaleDateString()}
          </div>
          <div className="space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedPhoto(photo);
                    setEditedCaption(photo.caption || '');
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>تعديل الامتنان</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      تعديل العنوان
                    </Label>
                    <Input
                      id="name"
                      value={editedCaption}
                      onChange={(e) => setEditedCaption(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={() => handleEdit(photo.id)}>
                    حفظ التعديلات
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleDelete(photo.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    ));
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting photo:', error);
        return;
      }

      // Optimistically update the UI
      setPhotos(photos.filter(photo => photo.id !== id));
      setFilteredPhotos(filteredPhotos.filter(photo => photo.id !== id));

      // Play heart sound on successful deletion
      playHeartSound();

    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('photos')
        .update({ caption: editedCaption })
        .eq('id', id);

      if (error) {
        console.error('Error updating photo:', error);
        return;
      }

      // Optimistically update the UI
      setPhotos(photos.map(photo =>
        photo.id === id ? { ...photo, caption: editedCaption } : photo
      ));
      setFilteredPhotos(filteredPhotos.map(photo =>
        photo.id === id ? { ...photo, caption: editedCaption } : photo
      ));

      // Play heart sound on successful edit
      playHeartSound();

      setEditDialogOpen(false);

    } catch (error) {
      console.error('Error updating photo:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Search Input */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="ابحث عن طريق العنوان أو الوسم"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {/* Hashtags Section */}
      {hashtags.length > 0 && (
        <div className="mb-4">
          <Label>الوسوم الشائعة:</Label>
          <div className="flex flex-wrap">
            {hashtags.map((tag) => (
              <Badge
                key={tag}
                className="mr-2 mt-1 cursor-pointer hover:bg-secondary-foreground hover:text-secondary"
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {renderCards()}
      </div>
    </div>
  );
};

export default PhotoGrid;
