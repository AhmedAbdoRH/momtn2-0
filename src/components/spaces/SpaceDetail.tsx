
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Space, SpaceMember } from '@/types/spaces';
import { Users, UserPlus, ArrowLeft, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import PhotoGrid from '@/components/PhotoGrid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

export default function SpaceDetail() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const [space, setSpace] = useState<Space | null>(null);
  const [members, setMembers] = useState<SpaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [processingInvite, setProcessingInvite] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (spaceId && user) {
      fetchSpaceDetails();
    }
  }, [spaceId, user]);

  const fetchSpaceDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch space details
      const { data: spaceData, error: spaceError } = await supabase
        .from('spaces')
        .select('*')
        .eq('id', spaceId)
        .single();
      
      if (spaceError) throw spaceError;
      
      setSpace(spaceData);
      setIsOwner(spaceData.owner_id === user?.id);
      
      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from('space_members')
        .select('*')
        .eq('space_id', spaceId);
      
      if (membersError) throw membersError;
      
      setMembers(membersData || []);
      
      // Fetch user emails
      const userIds = [
        spaceData.owner_id,
        ...(membersData?.map(m => m.user_id) || [])
      ];
      
      // We can't directly query auth.users, so we'll need to request this information
      // from profiles or use an edge function in a real app
      // For this example, we'll just show user IDs
      const mockEmails: Record<string, string> = {};
      userIds.forEach(id => {
        mockEmails[id] = `user-${id.substring(0, 6)}@example.com`;
      });
      setUserEmails(mockEmails);
      
    } catch (error) {
      console.error('Error fetching space details:', error);
      toast.error('حدث خطأ أثناء جلب تفاصيل المساحة المشتركة');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      toast.error('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }
    
    try {
      setProcessingInvite(true);
      
      const { data, error } = await supabase.rpc('invite_to_space', {
        p_space_id: spaceId,
        p_email: inviteEmail.trim()
      });
      
      if (error) throw error;
      
      if (data.success) {
        toast.success('تم إرسال الدعوة بنجاح');
        setInviteEmail('');
        setInviteDialogOpen(false);
      } else {
        toast.error(data.message || 'فشل في إرسال الدعوة');
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      toast.error('حدث خطأ أثناء إرسال الدعوة');
    } finally {
      setProcessingInvite(false);
    }
  };

  const generateInviteLink = async () => {
    try {
      setProcessingInvite(true);
      
      const { data, error } = await supabase.rpc('generate_space_invite_token', {
        p_space_id: spaceId
      });
      
      if (error) throw error;
      
      if (data.success) {
        const link = `${window.location.origin}/join-space/${data.token}`;
        setInviteLink(link);
        toast.success('تم إنشاء رابط الدعوة بنجاح');
      } else {
        toast.error(data.message || 'فشل في إنشاء رابط الدعوة');
      }
    } catch (error) {
      console.error('Error generating invite link:', error);
      toast.error('حدث خطأ أثناء إنشاء رابط الدعوة');
    } finally {
      setProcessingInvite(false);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success('تم نسخ الرابط إلى الحافظة');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-700">المساحة المشتركة غير موجودة</h2>
        <p className="mt-2 text-gray-500">قد تكون المساحة محذوفة أو ليس لديك صلاحية الوصول إليها</p>
        <Button 
          onClick={() => navigate('/')} 
          className="mt-4"
          variant="outline"
        >
          العودة إلى الرئيسية
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة
        </Button>
        
        <h1 className="text-2xl font-bold text-center flex-1">{space.name}</h1>
        
        {isOwner && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                دعوة أعضاء
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-center">دعوة أعضاء إلى المساحة المشتركة</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    البريد الإلكتروني
                  </label>
                  <div className="flex">
                    <Input
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="أدخل البريد الإلكتروني"
                      className="flex-1"
                      dir="rtl"
                    />
                    <Button 
                      onClick={handleInviteUser}
                      disabled={processingInvite}
                      className="mr-2"
                    >
                      دعوة
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 text-center">أو</div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    رابط دعوة عام
                  </label>
                  {inviteLink ? (
                    <div className="flex">
                      <Input
                        value={inviteLink}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={copyInviteLink}
                        className="mr-1"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={generateInviteLink}
                      disabled={processingInvite}
                      variant="outline"
                      className="w-full"
                    >
                      إنشاء رابط دعوة
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {space.description && (
        <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
          {space.description}
        </p>
      )}
      
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Users className="h-5 w-5 mr-2 text-gray-700" />
          <h2 className="text-xl font-semibold">الأعضاء</h2>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow p-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded mb-2">
            <span className="font-medium">{userEmails[space.owner_id] || space.owner_id}</span>
            <span className="text-sm bg-blue-100 text-blue-800 rounded-full px-3 py-1">مالك</span>
          </div>
          
          {members.length > 0 ? (
            members.map(member => (
              <div key={member.user_id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
                <span>{userEmails[member.user_id] || member.user_id}</span>
                <span className="text-sm bg-gray-100 text-gray-800 rounded-full px-3 py-1">عضو</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">لا يوجد أعضاء آخرين بعد</p>
          )}
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">الامتنانات المشتركة</h2>
        <PhotoGrid spaceId={spaceId} />
      </div>
    </div>
  );
}
