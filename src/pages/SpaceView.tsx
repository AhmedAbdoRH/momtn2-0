
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Users, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SpaceProvider, useSpaces } from '@/components/spaces/SpaceContext';
import PhotoGrid from '@/components/PhotoGrid';
import InviteMemberDialog from '@/components/spaces/InviteMemberDialog';
import CreateNewDialog from '@/components/CreateNewDialog';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type SpaceMember = {
  id: string;
  user_id: string;
  role: string;
  email?: string;
};

const SpaceViewContent = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const [members, setMembers] = useState<SpaceMember[]>([]);
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const { currentSpace, setCurrentSpace, fetchSpaces, loading } = useSpaces();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchSpaceDetails = useCallback(async () => {
    if (!spaceId || !user) return;

    try {
      // جلب تفاصيل المساحة
      const { data: spaceData, error: spaceError } = await supabase
        .from('spaces')
        .select('*')
        .eq('id', spaceId)
        .single();

      if (spaceError) {
        console.error('Error fetching space:', spaceError);
        toast({
          title: "خطأ في جلب المساحة",
          description: "لم نتمكن من العثور على المساحة المطلوبة",
          variant: "destructive",
        });
        navigate('/spaces');
        return;
      }

      setCurrentSpace(spaceData);
      setIsOwner(spaceData.owner_id === user.id);

      // جلب أعضاء المساحة
      const { data: membersData, error: membersError } = await supabase
        .from('space_members')
        .select('*')
        .eq('space_id', spaceId);

      if (membersError) {
        console.error('Error fetching members:', membersError);
        return;
      }

      setMembers(membersData || []);

      // جلب بريد المستخدمين لعرضه
      if (membersData && membersData.length > 0) {
        const userIds = membersData.map(member => member.user_id);
        
        // We can't query the auth.users table directly with supabase client
        // Instead, we need a custom function or endpoint to get user emails
        // For now, let's use a workaround by creating a profiles table or a custom function

        // جلب معلومات المستخدمين من auth.users عبر RPC
        // You would need to create a Postgres function to securely get this data
        // For now, let's leave this part commented out until we create the necessary function

        // This is a placeholder for when you add that functionality
        const tempEmails: Record<string, string> = {};
        userIds.forEach(id => {
          tempEmails[id] = `user-${id.substring(0, 8)}@example.com`;
        });
        setUserEmails(tempEmails);
      }
    } catch (error) {
      console.error('Error in fetchSpaceDetails:', error);
    }
  }, [spaceId, user, navigate, setCurrentSpace, toast]);

  // جلب تفاصيل المساحة عند تحميل الصفحة
  useEffect(() => {
    if (spaceId) {
      fetchSpaces().then(() => fetchSpaceDetails());
    }
  }, [spaceId, fetchSpaces, fetchSpaceDetails]);

  // إذا لم يتم العثور على المساحة
  if (!currentSpace && !loading) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-white mb-4">لم يتم العثور على المساحة</h2>
        <Button variant="outline" asChild>
          <Link to="/spaces">العودة إلى المساحات</Link>
        </Button>
      </div>
    );
  }

  if (loading || !currentSpace) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D1F3D] via-[#1A1F2C] to-[#3D1F2C] animate-gradient">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <div className="flex items-center mb-2">
              <Link to="/spaces" className="text-gray-400 hover:text-white">
                <span className="sr-only">العودة إلى المساحات</span>
                <ChevronRight className="w-5 h-5 transform rotate-180" />
              </Link>
              <h1 className="text-2xl font-bold text-white mr-2">{currentSpace.name}</h1>
            </div>
            {currentSpace.description && (
              <p className="text-gray-400">{currentSpace.description}</p>
            )}
          </div>
          
          <div className="flex mt-4 md:mt-0 space-x-2 rtl:space-x-reverse">
            {isOwner && (
              <Button 
                onClick={() => setShowInviteDialog(true)}
                variant="outline"
                className="bg-transparent border-gray-700 text-white hover:bg-gray-800"
              >
                <Users className="w-5 h-5 mr-2" />
                دعوة أعضاء
              </Button>
            )}
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-[#ea384c] hover:bg-[#ea384c]/90 text-white shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              إضافة امتنان جديد
            </Button>
          </div>
        </div>
        
        {/* صور المساحة */}
        <PhotoGrid spaceId={spaceId} />
        
        {/* نوافذ الحوار */}
        {isOwner && (
          <InviteMemberDialog 
            open={showInviteDialog} 
            onOpenChange={setShowInviteDialog} 
            spaceId={currentSpace.id}
            spaceName={currentSpace.name}
          />
        )}
        <CreateNewDialog 
          open={showCreateDialog} 
          onOpenChange={setShowCreateDialog} 
          spaceId={currentSpace.id}
        />
      </main>
    </div>
  );
};

const SpaceView = () => {
  return (
    <SpaceProvider>
      <SpaceViewContent />
    </SpaceProvider>
  );
};

export default SpaceView;
