
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Space } from '@/types/spaces';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

export default function SpacesMenu() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSpaces();
    }
  }, [user]);

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      
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
      toast({
        variant: "destructive",
        title: "خطأ في جلب المساحات",
        description: "حدث خطأ أثناء جلب المساحات المشتركة."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpace = () => {
    navigate('/spaces/new');
  };

  const handleSpaceSelect = (spaceId: string) => {
    navigate(`/spaces/${spaceId}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="bg-white/70 backdrop-blur-lg hover:bg-white/90 text-gray-700 mr-2"
        >
          <Users className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white/90 backdrop-blur-xl text-gray-700 border-gray-200">
        <DropdownMenuItem 
          onClick={handleCreateSpace}
          className="cursor-pointer focus:bg-gray-100 text-indigo-600 focus:text-indigo-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span>إنشاء مساحة جديدة</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <div className="p-2">
          <h2 className="text-sm font-medium">المساحات المشتركة</h2>
        </div>
        
        {loading ? (
          <div className="p-2 text-center text-sm text-gray-500">جاري التحميل...</div>
        ) : spaces.length === 0 ? (
          <div className="p-2 text-center text-sm text-gray-500">لا توجد مساحات مشتركة بعد</div>
        ) : (
          spaces.map(space => (
            <DropdownMenuItem 
              key={space.id} 
              onClick={() => handleSpaceSelect(space.id)}
              className="cursor-pointer focus:bg-gray-100"
            >
              <Users className="mr-2 h-4 w-4 text-gray-500" />
              <span className="truncate">{space.name}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
