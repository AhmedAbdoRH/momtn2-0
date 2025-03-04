
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Users, Trash2, Link, Plus } from 'lucide-react';
import { useSpaces } from './SpaceContext';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import InviteMemberDialog from './InviteMemberDialog';
import { useToast } from '@/hooks/use-toast';

interface Space {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
}

interface SpaceCardProps {
  space: Space;
  isOwner: boolean;
}

const SpaceCard = ({ space, isOwner }: SpaceCardProps) => {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const { deleteSpace } = useSpaces();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // اختصار الوصف إذا كان طويلاً
  const truncatedDescription = space.description && space.description.length > 100
    ? `${space.description.substring(0, 100)}...`
    : space.description;

  const handleOpenSpace = () => {
    navigate(`/spaces/${space.id}`);
  };

  const handleDelete = async () => {
    if (window.confirm(`هل أنت متأكد من حذف المساحة "${space.name}"؟`)) {
      const success = await deleteSpace(space.id);
      if (success) {
        toast({
          title: "تم الحذف",
          description: `تم حذف المساحة "${space.name}" بنجاح`,
        });
      }
    }
  };

  return (
    <>
      <div className="relative bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[0.99] group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2D1F3D]/20 via-[#1A1F2C]/20 to-[#3D1F2C]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Users className="w-5 h-5 text-indigo-400" />
              <h3 className="text-xl font-bold text-white">{space.name}</h3>
            </div>
            
            {/* قائمة الإجراءات */}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-900/60 backdrop-blur-xl text-white border-gray-800">
                  <DropdownMenuItem 
                    onClick={() => setShowInviteDialog(true)}
                    className="cursor-pointer focus:bg-gray-800/80"
                  >
                    <Link className="mr-2 h-4 w-4" />
                    <span>مشاركة رابط الدعوة</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-red-400 focus:text-red-400 cursor-pointer focus:bg-gray-800/80"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>حذف المساحة</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          {truncatedDescription && (
            <p className="text-gray-300 mb-4 text-right">{truncatedDescription}</p>
          )}
          
          <div className="flex justify-end mt-4">
            <Button 
              variant="ghost" 
              onClick={handleOpenSpace}
              className="text-indigo-300 hover:text-indigo-200 hover:bg-white/10"
            >
              فتح المساحة
            </Button>
          </div>
        </div>
      </div>

      <InviteMemberDialog 
        open={showInviteDialog} 
        onOpenChange={setShowInviteDialog} 
        spaceId={space.id}
        spaceName={space.name}
      />
    </>
  );
};

export default SpaceCard;
