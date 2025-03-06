
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Space } from '@/types/spaces';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Users, Copy, Check, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';

export default function SpaceDetail() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const [space, setSpace] = useState<Space | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (spaceId) {
      fetchSpaceDetails();
    }
  }, [spaceId]);

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

      // Check if user is the owner
      const { data: userData } = await supabase.auth.getUser();
      setIsOwner(userData.user?.id === spaceData.owner_id);

      // تعديل طريقة جلب بيانات الأعضاء
      const { data: membersData, error: membersError } = await supabase
        .from('space_members')
        .select('id, user_id, role, joined_at')
        .eq('space_id', spaceId);

      if (membersError) throw membersError;
      
      // إذا كان هناك أعضاء، جلب معلومات المستخدمين
      if (membersData && membersData.length > 0) {
        // استخراج معرفات المستخدمين
        const userIds = membersData.map(member => member.user_id);
        
        // جلب معلومات المستخدمين من جدول profiles
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);
          
        if (usersError) throw usersError;
        
        // دمج بيانات الأعضاء مع بيانات المستخدمين
        const enrichedMembers = membersData.map(member => {
          const userData = usersData?.find(user => user.id === member.user_id);
          return {
            ...member,
            username: userData?.username || 'مستخدم'
          };
        });
        
        setMembers(enrichedMembers);
      } else {
        setMembers([]);
      }

    } catch (error) {
      console.error('Error fetching space details:', error);
      toast.error('حدث خطأ أثناء جلب تفاصيل المساحة المشتركة');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('يرجى إدخال البريد الإلكتروني');
      return;
    }
    
    try {
      setInviteLoading(true);
      
      const { data, error } = await supabase
        .rpc('invite_to_space', { 
          p_space_id: spaceId, 
          p_email: email.trim() 
        });
      
      if (error) throw error;
      
      // Type assertion to handle the JSON response
      const result = data as { success: boolean; message?: string };
      
      if (result.success) {
        toast.success('تم إرسال الدعوة بنجاح');
        setEmail('');
      } else {
        toast.error(result.message || 'حدث خطأ أثناء إرسال الدعوة');
      }
    } catch (error: any) {
      console.error('Error inviting to space:', error);
      toast.error('حدث خطأ أثناء إرسال الدعوة');
    } finally {
      setInviteLoading(false);
    }
  };

  const generateInviteLink = async () => {
    try {
      const { data, error } = await supabase
        .rpc('generate_space_invite_token', { 
          p_space_id: spaceId
        });
      
      if (error) throw error;
      
      // Type assertion to handle the JSON response
      const result = data as { success: boolean; token?: string; message?: string };
      
      if (result.success && result.token) {
        // تعديل رابط الدعوة ليستخدم الصيغة الصحيحة
        const link = `${window.location.origin}/join-space/${result.token}`;
        setInviteLink(link);
        toast.success('تم إنشاء رابط الدعوة بنجاح');
      } else {
        toast.error(result.message || 'حدث خطأ أثناء إنشاء رابط الدعوة');
      }
    } catch (error: any) {
      console.error('Error generating invite link:', error);
      toast.error('حدث خطأ أثناء إنشاء رابط الدعوة');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!space) {
    return (
      <div className="max-w-md mx-auto bg-white/80 backdrop-blur-lg rounded-lg shadow p-6 mt-16">
        <p className="text-center text-red-500">المساحة المشتركة غير موجودة</p>
        <Button 
          onClick={() => navigate('/')} 
          className="mt-4 mx-auto block"
        >
          العودة إلى الصفحة الرئيسية
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 mt-8">
      <div className="bg-white/80 backdrop-blur-lg rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
          >
            العودة
          </Button>
          <h1 className="text-2xl font-bold">{space.name}</h1>
        </div>
        
        {space.description && (
          <p className="text-gray-600 mb-6 text-center">{space.description}</p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Members Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Users className="mr-2 h-5 w-5" />
              الأعضاء
            </h2>
            
            <div className="space-y-2">
              {/* Owner */}
              <div className="p-3 bg-indigo-50 rounded-md flex justify-between items-center">
                <span className="font-medium">
                  {/* عرض اسم المالك إذا كان متوفراً */}
                  {space.owner_id}
                </span>
                <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded">مالك</span>
              </div>
              
              {/* Members */}
              {members.map((member) => (
                <div key={member.id} className="p-3 bg-gray-50 rounded-md">
                  {member.username || member.user_id}
                </div>
              ))}
              
              {members.length === 0 && (
                <p className="text-gray-500 text-center p-3">لا يوجد أعضاء آخرين</p>
              )}
            </div>
          </div>
          
          {/* Invite Section - Only visible to owner */}
          {isOwner && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">دعوة أعضاء جدد</h2>
              
              <form onSubmit={handleInvite} className="space-y-3">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    البريد الإلكتروني
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="أدخل البريد الإلكتروني"
                    className="w-full"
                    dir="rtl"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={inviteLoading}
                >
                  {inviteLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري إرسال الدعوة...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      دعوة
                    </>
                  )}
                </Button>
              </form>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-medium mb-2">رابط دعوة عام</h3>
                
                {inviteLink ? (
                  <div className="space-y-2">
                    <div className="flex">
                      <Input 
                        value={inviteLink} 
                        readOnly 
                        className="flex-1 bg-gray-50"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={copyToClipboard}
                        className="ml-2"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      يمكن لأي شخص لديه هذا الرابط الانضمام إلى المساحة المشتركة
                    </p>
                  </div>
                ) : (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={generateInviteLink}
                    className="w-full"
                  >
                    إنشاء رابط دعوة
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
