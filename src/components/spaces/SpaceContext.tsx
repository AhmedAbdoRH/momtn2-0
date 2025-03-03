
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

interface Space {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
}

interface SpaceMember {
  id: string;
  user_id: string;
  space_id: string;
  role: string;
  joined_at: string;
  invited_by: string | null;
  email?: string; // قد نحتاج لهذه المعلومة لعرض البريد الإلكتروني للعضو
}

interface SpaceInvitation {
  id: string;
  space_id: string;
  email: string;
  token: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  expires_at: string;
}

interface InviteResponse {
  success: boolean;
  token?: string;
  message?: string;
}

interface AcceptInvitationResponse {
  success: boolean;
  space_id?: string;
  message?: string;
}

interface SpaceContextType {
  spaces: Space[];
  myOwnedSpaces: Space[];
  myMemberSpaces: Space[];
  currentSpace: Space | null;
  setCurrentSpace: (space: Space | null) => void;
  fetchSpaces: () => Promise<void>;
  createSpace: (name: string, description?: string) => Promise<Space | null>;
  updateSpace: (id: string, data: Partial<Space>) => Promise<boolean>;
  deleteSpace: (id: string) => Promise<boolean>;
  inviteMember: (spaceId: string, email: string) => Promise<{success: boolean; token?: string; message?: string}>;
  fetchMembers: (spaceId: string) => Promise<SpaceMember[]>;
  removeMember: (spaceId: string, userId: string) => Promise<boolean>;
  acceptInvitation: (token: string) => Promise<{success: boolean; spaceId?: string; message?: string}>;
  loading: boolean;
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

export const SpaceProvider = ({ children }: { children: ReactNode }) => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [myOwnedSpaces, setMyOwnedSpaces] = useState<Space[]>([]);
  const [myMemberSpaces, setMyMemberSpaces] = useState<Space[]>([]);
  const [currentSpace, setCurrentSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSpaces();
    } else {
      // إذا كان المستخدم غير مسجل، فنحتاج إلى تفريغ قائمة المساحات
      setSpaces([]);
      setMyOwnedSpaces([]);
      setMyMemberSpaces([]);
      setCurrentSpace(null);
    }
  }, [user]);

  const fetchSpaces = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // جلب المساحات التي يملكها المستخدم
      const { data: ownedSpaces, error: ownedError } = await supabase
        .from('spaces')
        .select('*')
        .eq('owner_id', user.id);

      if (ownedError) throw ownedError;
      
      console.log("Owned spaces:", ownedSpaces);
      setMyOwnedSpaces(ownedSpaces || []);

      // جلب عضويات المساحات للمستخدم الحالي
      const { data: memberSpaceIds, error: memberError } = await supabase
        .from('space_members')
        .select('space_id')
        .eq('user_id', user.id);

      if (memberError) {
        console.error("Error fetching member spaces IDs:", memberError);
        setMyMemberSpaces([]);
        setSpaces([...(ownedSpaces || [])]);
      } else {
        console.log("Member space IDs:", memberSpaceIds);
        
        // جلب تفاصيل المساحات بناءً على المعرفات
        if (memberSpaceIds && memberSpaceIds.length > 0) {
          const spaceIds = memberSpaceIds.map(item => item.space_id);
          
          const { data: memberSpaces, error: memberSpacesError } = await supabase
            .from('spaces')
            .select('*')
            .in('id', spaceIds);
            
          if (memberSpacesError) {
            console.error("Error fetching member spaces details:", memberSpacesError);
            setMyMemberSpaces([]);
          } else {
            console.log("Member spaces details:", memberSpaces);
            setMyMemberSpaces(memberSpaces || []);
            
            // دمج المساحات المملوكة والمساحات المشارك فيها
            const allSpaces = [...(ownedSpaces || [])];
            memberSpaces?.forEach(memberSpace => {
              if (!allSpaces.some(space => space.id === memberSpace.id)) {
                allSpaces.push(memberSpace);
              }
            });
            
            setSpaces(allSpaces);
          }
        } else {
          setMyMemberSpaces([]);
          setSpaces([...(ownedSpaces || [])]);
        }
      }
      
    } catch (error) {
      console.error('Error fetching spaces:', error);
      toast({
        title: "خطأ في جلب المساحات",
        description: "حدث خطأ أثناء جلب المساحات المشتركة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSpace = async (name: string, description?: string): Promise<Space | null> => {
    if (!user) return null;
    
    try {
      const newSpace = {
        name,
        description: description || null,
        owner_id: user.id
      };

      const { data, error } = await supabase
        .from('spaces')
        .insert(newSpace)
        .select()
        .single();

      if (error) throw error;

      // تحديث حالة المساحات المحلية
      setSpaces(prev => [...prev, data]);
      setMyOwnedSpaces(prev => [...prev, data]);
      
      toast({
        title: "تم إنشاء المساحة",
        description: `تم إنشاء المساحة "${name}" بنجاح`,
      });

      return data;
    } catch (error) {
      console.error('Error creating space:', error);
      toast({
        title: "خطأ في إنشاء المساحة",
        description: "حدث خطأ أثناء إنشاء المساحة المشتركة",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateSpace = async (id: string, data: Partial<Space>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('spaces')
        .update(data)
        .eq('id', id)
        .eq('owner_id', user.id);

      if (error) throw error;

      // تحديث حالة المساحات المحلية
      setSpaces(prev => prev.map(space => 
        space.id === id ? { ...space, ...data } : space
      ));
      
      setMyOwnedSpaces(prev => prev.map(space => 
        space.id === id ? { ...space, ...data } : space
      ));

      // تحديث المساحة الحالية إذا كانت هي المُعدّلة
      if (currentSpace?.id === id) {
        setCurrentSpace(prev => prev ? { ...prev, ...data } : null);
      }
      
      toast({
        title: "تم تحديث المساحة",
        description: "تم تحديث معلومات المساحة بنجاح",
      });

      return true;
    } catch (error) {
      console.error('Error updating space:', error);
      toast({
        title: "خطأ في تحديث المساحة",
        description: "حدث خطأ أثناء تحديث المساحة المشتركة",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteSpace = async (id: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('spaces')
        .delete()
        .eq('id', id)
        .eq('owner_id', user.id);

      if (error) throw error;

      // تحديث حالة المساحات المحلية
      setSpaces(prev => prev.filter(space => space.id !== id));
      setMyOwnedSpaces(prev => prev.filter(space => space.id !== id));
      
      // إذا كانت المساحة الحالية هي المحذوفة، نقوم بتفريغها
      if (currentSpace?.id === id) {
        setCurrentSpace(null);
      }
      
      toast({
        title: "تم حذف المساحة",
        description: "تم حذف المساحة المشتركة بنجاح",
      });

      return true;
    } catch (error) {
      console.error('Error deleting space:', error);
      toast({
        title: "خطأ في حذف المساحة",
        description: "حدث خطأ أثناء حذف المساحة المشتركة",
        variant: "destructive",
      });
      return false;
    }
  };

  const inviteMember = async (spaceId: string, email: string): Promise<{success: boolean; token?: string; message?: string}> => {
    if (!user) return { success: false, message: "يجب تسجيل الدخول أولاً" };
    
    try {
      // التحقق من صلاحية المستخدم لإرسال الدعوة
      const { data: spaceData } = await supabase
        .from('spaces')
        .select('*')
        .eq('id', spaceId)
        .eq('owner_id', user.id)
        .single();
      
      if (!spaceData) {
        return { success: false, message: "ليس لديك صلاحية لإضافة أعضاء لهذه المساحة" };
      }

      // إنشاء الدعوة من خلال وظيفة قاعدة البيانات
      const { data, error } = await supabase
        .rpc('invite_to_space', { p_space_id: spaceId, p_email: email });

      if (error) throw error;

      // تحويل البيانات إلى النوع المطلوب بشكل آمن
      const response = data as unknown as InviteResponse;

      if (response.success) {
        // إرسال دعوة بالبريد الإلكتروني
        try {
          console.log("Calling send-invitation-email function with:", {
            invitationToken: response.token,
            spaceId,
            email,
            inviterUserId: user.id,
            spaceName: spaceData?.name || "مساحة مشتركة"
          });
          
          const { data: emailResponse, error: emailError } = await supabase.functions.invoke(
            "send-invitation-email",
            {
              body: JSON.stringify({
                invitationToken: response.token,
                spaceId,
                email,
                inviterUserId: user.id,
                spaceName: spaceData?.name || "مساحة مشتركة"
              })
            }
          );
          
          if (emailError) {
            console.error("Error invoking email function:", emailError);
            toast({
              title: "تم إنشاء الدعوة",
              description: `تم إنشاء دعوة ل ${email} ولكن حدث خطأ أثناء إرسال البريد الإلكتروني.`,
            });
          } else {
            console.log("Email sending response:", emailResponse);
            toast({
              title: "تمت إضافة الدعوة",
              description: `تم إرسال دعوة إلى ${email} للانضمام للمساحة`,
            });
          }
        } catch (emailErr) {
          console.error("Exception in email sending:", emailErr);
          toast({
            title: "تم إنشاء الدعوة",
            description: `تم إنشاء دعوة ل ${email} ولكن حدث خطأ أثناء إرسال البريد الإلكتروني.`,
          });
        }
        
        return { success: true, token: response.token, message: response.message };
      } else {
        throw new Error(response.message || "فشل في إرسال الدعوة");
      }
    } catch (error: any) {
      console.error('Error inviting member:', error);
      toast({
        title: "خطأ في دعوة العضو",
        description: error.message || "حدث خطأ أثناء دعوة العضو للمساحة المشتركة",
        variant: "destructive",
      });
      return { success: false, message: error.message };
    }
  };

  const fetchMembers = async (spaceId: string): Promise<SpaceMember[]> => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('space_members')
        .select('*')
        .eq('space_id', spaceId);

      if (error) throw error;

      // يمكننا أيضًا جلب معلومات المستخدمين مثل البريد الإلكتروني
      // لكن هذا يتطلب عمل إضافي ويعتمد على هيكل قاعدة البيانات

      return data || [];
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: "خطأ في جلب الأعضاء",
        description: "حدث خطأ أثناء جلب أعضاء المساحة المشتركة",
        variant: "destructive",
      });
      return [];
    }
  };

  const removeMember = async (spaceId: string, userId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('space_members')
        .delete()
        .eq('space_id', spaceId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "تم إزالة العضو",
        description: "تم إزالة العضو من المساحة المشتركة بنجاح",
      });

      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "خطأ في إزالة العضو",
        description: "حدث خطأ أثناء إزالة العضو من المساحة المشتركة",
        variant: "destructive",
      });
      return false;
    }
  };

  const acceptInvitation = async (token: string): Promise<{success: boolean; spaceId?: string; message?: string}> => {
    if (!user) return { success: false, message: "يجب تسجيل الدخول أولاً" };
    
    try {
      console.log("Accepting invitation with token:", token);
      
      const { data, error } = await supabase
        .rpc('accept_space_invitation', { invitation_token: token });

      if (error) {
        console.error("Error from RPC:", error);
        throw error;
      }

      console.log("Invitation acceptance response:", data);
      
      // تحويل البيانات إلى النوع المطلوب بشكل آمن
      const response = data as unknown as AcceptInvitationResponse;

      if (response.success) {
        // تحديث قائمة المساحات بعد قبول الدعوة
        await fetchSpaces();
        
        toast({
          title: "تم قبول الدعوة",
          description: "تم الانضمام إلى المساحة المشتركة بنجاح",
        });
        
        return { success: true, spaceId: response.space_id };
      } else {
        throw new Error(response.message || "فشل في قبول الدعوة");
      }
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "خطأ في قبول الدعوة",
        description: error.message || "حدث خطأ أثناء قبول دعوة الانضمام للمساحة المشتركة",
        variant: "destructive",
      });
      return { success: false, message: error.message };
    }
  };

  return (
    <SpaceContext.Provider value={{
      spaces,
      myOwnedSpaces,
      myMemberSpaces,
      currentSpace,
      setCurrentSpace,
      fetchSpaces,
      createSpace,
      updateSpace,
      deleteSpace,
      inviteMember,
      fetchMembers,
      removeMember,
      acceptInvitation,
      loading
    }}>
      {children}
    </SpaceContext.Provider>
  );
};

export const useSpaces = () => {
  const context = useContext(SpaceContext);
  if (context === undefined) {
    throw new Error('useSpaces must be used within a SpaceProvider');
  }
  return context;
};
