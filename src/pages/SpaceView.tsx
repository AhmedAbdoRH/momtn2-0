
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SpaceProvider, useSpaces } from '@/components/spaces/SpaceContext';
import PhotoGrid from '@/components/PhotoGrid';
import InviteMemberDialog from '@/components/spaces/InviteMemberDialog';
import CreateNewDialog from '@/components/CreateNewDialog';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// تعريف واجهة عضو المساحة
type SpaceMember = {
  id: string;
  user_id: string;
  role: string;
  email?: string;
};

// واجهة البيانات المرتبطة بالبريد الإلكتروني
interface MemberData {
  user_id: string;
  users: {
    email: string;
  };
}

const SpaceViewContent = () => {
  const { spaceId } = useParams<{ spaceId: string }>();
  const [members, setMembers] = useState<SpaceMember[]>([]);
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const { currentSpace, setCurrentSpace, fetchSpaces, loading } = useSpaces();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchSpaceDetails = useCallback(async () => {
    if (!spaceId || !user) return;

    setFetchingData(true);
    try {
      console.log("Fetching space details for:", spaceId);
      
      // جلب تفاصيل المساحة
      const { data: spaceData, error: spaceError } = await supabase
        .from('spaces')
        .select('*')
        .eq('id', spaceId)
        .maybeSingle();

      if (spaceError || !spaceData) {
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
      console.log("Space data:", spaceData);

      try {
        // جلب أعضاء المساحة
        const { data: membersData, error: membersError } = await supabase
          .from('space_members')
          .select('*')
          .eq('space_id', spaceId);

        if (membersError) {
          console.error('Error fetching members:', membersError);
        } else {
          setMembers(membersData || []);
          console.log("Members data:", membersData);
          
          // جلب بيانات البريد الإلكتروني للأعضاء
          if (membersData && membersData.length > 0) {
            try {
              // استخدام استعلام SQL مباشر بدلاً من وظيفة RPC
              const { data: emailsData, error: emailsError } = await supabase
                .from('space_members')
                .select('user_id, users:auth.users!inner(email)')
                .eq('space_id', spaceId);
              
              if (emailsError) {
                console.error('Error fetching member emails:', emailsError);
              } else if (emailsData) {
                const emailsMap: Record<string, string> = {};
                
                // معالجة البيانات المستردة لاستخراج عناوين البريد الإلكتروني
                emailsData.forEach((item: MemberData) => {
                  if (item.users && item.users.email) {
                    emailsMap[item.user_id] = item.users.email;
                  }
                });
                
                setUserEmails(emailsMap);
                console.log("User emails:", emailsMap);
              }
            } catch (emailErr) {
              console.error('Error in fetching member emails:', emailErr);
            }
          }
        }
      } catch (memberErr) {
        console.error('Exception in fetching members:', memberErr);
      }
    } catch (error) {
      console.error('Error in fetchSpaceDetails:', error);
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ أثناء جلب بيانات المساحة",
        variant: "destructive",
      });
    } finally {
      setFetchingData(false);
    }
  }, [spaceId, user, navigate, setCurrentSpace, toast]);

  // جلب تفاصيل المساحة عند تحميل الصفحة
  useEffect(() => {
    if (spaceId) {
      fetchSpaceDetails();
    }
  }, [spaceId, fetchSpaceDetails]);

  // إعادة تحميل البيانات عند الحاجة
  const refreshData = () => {
    fetchSpaceDetails();
  };

  // إذا لم يتم العثور على المساحة
  if (!fetchingData && !currentSpace && !loading) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-white mb-4">لم يتم العثور على المساحة</h2>
        <Button variant="outline" asChild>
          <Link to="/spaces">العودة إلى المساحات</Link>
        </Button>
      </div>
    );
  }

  if (loading || fetchingData || !currentSpace) {
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
        
        {/* عرض الأعضاء */}
        {members.length > 0 && (
          <div className="mb-8 bg-gray-800/30 p-4 rounded-lg backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-white mb-4 text-right">الأعضاء ({members.length})</h2>
            <div className="space-y-2 text-right">
              {members.map(member => (
                <div key={member.id} className="flex justify-end items-center py-2 border-b border-gray-700/50">
                  <span className="text-gray-300">{userEmails[member.user_id] || 'عضو'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* صور المساحة */}
        <PhotoGrid spaceId={spaceId} />
        
        {/* نوافذ الحوار */}
        {isOwner && (
          <InviteMemberDialog 
            open={showInviteDialog} 
            onOpenChange={setShowInviteDialog} 
            spaceId={currentSpace.id}
            spaceName={currentSpace.name}
            onInviteSuccess={refreshData}
          />
        )}
        <CreateNewDialog 
          open={showCreateDialog} 
          onOpenChange={setShowCreateDialog} 
          spaceId={currentSpace.id}
          onCreateSuccess={refreshData}
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
