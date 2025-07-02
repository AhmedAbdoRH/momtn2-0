
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Users, Plus, Loader2, Settings, Copy, UserPlus, Trash2, Crown, Shield, User, LogOut, Clipboard } from 'lucide-react';
import { Badge } from './ui/badge';

interface Group {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  is_private: boolean;
  invite_code: string | null;
  member_count?: number;
  user_role?: string;
}

interface GroupMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  users: {
    email: string;
    full_name: string | null;
  } | null;
}

interface GroupsDropdownProps {
  selectedGroupId: string | null;
  onGroupChange: (groupId: string | null) => void;
}

export default function GroupsDropdown({ selectedGroupId, onGroupChange }: GroupsDropdownProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserGroups();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Listen for display name updates to refresh group member data
  useEffect(() => {
    const handleDisplayNameUpdated = () => {
      if (user) {
        fetchUserGroups();
      }
    };
    
    window.addEventListener('displayNameUpdated', handleDisplayNameUpdated);
    return () => {
      window.removeEventListener('displayNameUpdated', handleDisplayNameUpdated);
    };
  }, [user]);

  const fetchUserGroups = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch groups where user is a member
      const { data: memberGroups, error: memberError } = await supabase
        .from('group_members')
        .select(`
          groups!inner(
            id,
            name,
            description,
            created_by,
            is_private,
            invite_code
          ),
          role
        `)
        .eq('user_id', user.id);

      if (memberError) {
        console.error('Error fetching member groups:', memberError);
        toast({ 
          title: "خطأ في التحميل", 
          description: "لم نتمكن من تحميل المجموعات", 
          variant: "destructive" 
        });
        return;
      }

      // Transform the data
      const transformedGroups = memberGroups?.map(item => ({
        ...item.groups,
        user_role: item.role
      })) || [];

      // Get member counts for each group
      const groupsWithCounts = await Promise.all(
        transformedGroups.map(async (group) => {
          const { count } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);
          
          return {
            ...group,
            member_count: count || 0
          };
        })
      );

      setGroups(groupsWithCounts);
    } catch (err) {
      console.error('Exception fetching groups:', err);
      toast({ 
        title: "خطأ غير متوقع", 
        description: "حدث خطأ أثناء تحميل المجموعات", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupMembers = async (groupId: string) => {
    setLoadingMembers(true);
    try {
      // First fetch group members
      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('id, user_id, role, joined_at')
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true });

      if (membersError) {
        console.error('Error fetching group members:', membersError);
        toast({ 
          title: "خطأ في التحميل", 
          description: "لم نتمكن من تحميل أعضاء المجموعة", 
          variant: "destructive" 
        });
        return;
      }

      // Then fetch user details for each member
      const membersWithUsers: GroupMember[] = [];
      
      for (const member of members || []) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email, full_name')
          .eq('id', member.user_id)
          .maybeSingle();

        if (userError) {
          console.error('Error fetching user data:', userError);
        }

        membersWithUsers.push({
          ...member,
          users: userData || null
        });
      }

      setGroupMembers(membersWithUsers);
    } catch (err) {
      console.error('Exception fetching group members:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!user || !newGroupName.trim()) {
      toast({ title: "خطأ", description: "يجب كتابة اسم المجموعة", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert({
          name: newGroupName.trim(),
          description: newGroupDescription.trim() || null,
          created_by: user.id,
          is_private: isPrivate
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating group:', error);
        toast({ title: "خطأ في الإنشاء", description: "لم نتمكن من إنشاء المجموعة", variant: "destructive" });
        return;
      }

      await fetchUserGroups();
      setShowCreateDialog(false);
      setNewGroupName('');
      setNewGroupDescription('');
      setIsPrivate(false);
      
      toast({ 
        title: "تم الإنشاء بنجاح! 🎉", 
        description: `تم إنشاء مجموعة "${data.name}" بنجاح${data.invite_code ? '. كود الدعوة: ' + data.invite_code : ''}`,
        className: "border-green-400/50 bg-green-900/80"
      });
    } catch (err) {
      console.error('Exception creating group:', err);
      toast({ title: "خطأ غير متوقع", description: "حدث خطأ أثناء إنشاء المجموعة", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!user || !inviteCode.trim()) {
      toast({ title: "خطأ", description: "يجب كتابة كود الدعوة", variant: "destructive" });
      return;
    }

    setJoining(true);
    try {
      // First, find the group by invite code
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('id, name')
        .eq('invite_code', inviteCode.trim())
        .single();

      if (groupError || !groupData) {
        toast({ title: "كود خاطئ", description: "كود الدعوة غير صحيح", variant: "destructive" });
        return;
      }

      // Check if user is already a member - using maybeSingle() instead of single()
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupData.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingMember) {
        toast({ 
          title: "عضو بالفعل", 
          description: "أنت عضو في هذه المجموعة بالفعل",
          className: "border-blue-400/50 bg-blue-900/80"
        });
        setShowJoinDialog(false);
        setInviteCode('');
        return;
      }

      // Join the group
      const { error: joinError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          role: 'member'
        });

      if (joinError) {
        console.error('Error joining group:', joinError);
        toast({ title: "خطأ في الانضمام", description: "لم نتمكن من إضافتك للمجموعة", variant: "destructive" });
        return;
      }

      await fetchUserGroups();
      setShowJoinDialog(false);
      setInviteCode('');
      
      toast({ 
        title: "تم الانضمام بنجاح! 🎉", 
        description: `تم انضمامك لمجموعة "${groupData.name}" بنجاح`,
        className: "border-blue-400/50 bg-blue-900/80"
      });
    } catch (err) {
      console.error('Exception joining group:', err);
      toast({ title: "خطأ غير متوقع", description: "حدث خطأ أثناء الانضمام للمجموعة", variant: "destructive" });
    } finally {
      setJoining(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId)
        .eq('created_by', user.id);

      if (error) {
        console.error('Error deleting group:', error);
        toast({ title: "خطأ في الحذف", description: "لم نتمكن من حذف المجموعة", variant: "destructive" });
        return;
      }

      await fetchUserGroups();
      setShowSettingsDialog(false);
      if (selectedGroupId === groupId) {
        onGroupChange(null);
      }
      
      toast({ 
        title: "تم الحذف", 
        description: "تم حذف المجموعة بنجاح",
        className: "border-red-400/50 bg-red-900/80"
      });
    } catch (err) {
      console.error('Exception deleting group:', err);
      toast({ title: "خطأ غير متوقع", description: "حدث خطأ أثناء حذف المجموعة", variant: "destructive" });
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error leaving group:', error);
        toast({ title: "خطأ في المغادرة", description: "لم نتمكن من مغادرة المجموعة", variant: "destructive" });
        return;
      }

      await fetchUserGroups();
      setShowSettingsDialog(false);
      if (selectedGroupId === groupId) {
        onGroupChange(null);
      }
      
      toast({ 
        title: "تم المغادرة", 
        description: "تم مغادرة المجموعة بنجاح",
        className: "border-yellow-400/50 bg-yellow-900/80"
      });
    } catch (err) {
      console.error('Exception leaving group:', err);
      toast({ title: "خطأ غير متوقع", description: "حدث خطأ أثناء مغادرة المجموعة", variant: "destructive" });
    }
  };

  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', memberId);

      if (error) {
        console.error('Error removing member:', error);
        toast({ title: "خطأ في الإزالة", description: "لم نتمكن من إزالة العضو", variant: "destructive" });
        return;
      }

      if (selectedGroup) {
        await fetchGroupMembers(selectedGroup.id);
      }
      
      toast({ 
        title: "تم إزالة العضو", 
        description: `تم إزالة ${memberEmail} من المجموعة`,
        className: "border-orange-400/50 bg-orange-900/80"
      });
    } catch (err) {
      console.error('Exception removing member:', err);
      toast({ title: "خطأ غير متوقع", description: "حدث خطأ أثناء إزالة العضو", variant: "destructive" });
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ 
      title: "تم النسخ", 
      description: "تم نسخ كود الدعوة إلى الحافظة",
      className: "border-blue-400/50 bg-blue-900/80"
    });
  };

  const pasteInviteCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInviteCode(text.trim());
      toast({ 
        title: "تم اللصق", 
        description: "تم لصق كود الدعوة من الحافظة",
        className: "border-green-400/50 bg-green-900/80"
      });
    } catch (err) {
      toast({ 
        title: "خطأ في اللصق", 
        description: "لم نتمكن من لصق النص من الحافظة", 
        variant: "destructive" 
      });
    }
  };

  const openGroupSettings = (group: Group) => {
    setSelectedGroup(group);
    setShowSettingsDialog(true);
    fetchGroupMembers(group.id);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'moderator':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مدير';
      case 'moderator':
        return 'مشرف';
      default:
        return 'عضو';
    }
  };

  // Helper function to get display name
  const getDisplayName = (member: GroupMember) => {
    if (!member.users) {
      return 'مستخدم غير معروف';
    }
    if (member.users.full_name && member.users.full_name.trim()) {
      return member.users.full_name.trim();
    }
    return member.users.email.split('@')[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Scrollable Group Selection */}
      <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
        {groups.map((group) => (
          <div key={group.id} className="relative">
            <button
              onClick={() => onGroupChange(group.id)}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors w-full ${
                selectedGroupId === group.id
                  ? 'bg-[#ea384c]/20 text-pink-200 ring-2 ring-pink-400/50'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <div className="text-right flex-1">
                <div className="font-medium flex items-center gap-2 justify-end">
                  {group.name}
                  {getRoleIcon(group.user_role || 'member')}
                </div>
                
                {group.description && (
                  <div className="text-sm text-gray-300 mt-1">{group.description}</div>
                )}
                <div className="flex items-center gap-2 justify-end mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {group.member_count} عضو
                  </Badge>
                  {group.is_private && (
                    <Badge variant="outline" className="text-xs">
                      خاصة
                    </Badge>
                  )}
                </div>
              </div>
              <Users className="w-4 h-4 flex-shrink-0 ml-2" />
            </button>
            
            {/* Settings and Leave buttons */}
            <div className="absolute top-2 left-2 flex gap-1">
              {/* Settings button for group creators and admins */}
              {(group.created_by === user?.id || group.user_role === 'admin') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openGroupSettings(group);
                  }}
                  className="p-1 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
                  title="إعدادات المجموعة"
                >
                  <Settings className="w-3 h-3 text-white" />
                </button>
              )}
              
              {/* Leave button for non-creators */}
              {group.created_by !== user?.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLeaveGroup(group.id);
                  }}
                  className="p-1 rounded-full bg-red-600/20 hover:bg-red-600/40 transition-colors"
                  title="مغادرة المجموعة"
                >
                  <LogOut className="w-3 h-3 text-red-400" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-2 pt-4 border-t border-white/20">
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 p-3 rounded-lg bg-green-600/20 text-green-200 hover:bg-green-600/30 transition-colors"
        >
          <Plus className="w-4 h-4" />
          إنشاء مجموعة جديدة
        </button>
        
        <button
          onClick={() => setShowJoinDialog(true)}
          className="flex items-center gap-2 p-3 rounded-lg bg-blue-600/20 text-blue-200 hover:bg-blue-600/30 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          الانضمام لمجموعة
        </button>
      </div>

      {/* Create Group Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl text-white border border-white/20">
          <DialogHeader>
            <DialogTitle className="text-right text-xl">إنشاء مجموعة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="w-full">
              <label className="block text-sm font-medium mb-2 text-right">اسم المجموعة *</label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-sm text-white text-right border-white/20"
                placeholder="أدخل اسم المجموعة..."
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-right">الوصف (اختياري)</label>
              <Textarea
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                className="bg-white/10 backdrop-blur-sm text-white text-right border-white/20"
                placeholder="وصف المجموعة..."
                dir="rtl"
                rows={3}
              />
            </div>

          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
              disabled={creating}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleCreateGroup}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={creating || !newGroupName.trim()}
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  جارٍ الإنشاء...
                </>
              ) : (
                'إنشاء المجموعة'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Group Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl text-white border border-white/20 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-right text-xl">الانضمام لمجموعة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-right">كود الدعوة *</label>
              <div className="flex gap-2 items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={pasteInviteCode}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-3 py-2 h-12"
                  title="لصق من الحافظة"
                >
                  <Clipboard className="w-4 h-4" />
                </Button>
                <Input
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="bg-white/10 backdrop-blur-sm text-white text-center border-white/20 h-12 text-lg font-mono tracking-wider flex-1"
                  placeholder="أدخل كود الدعوة..."
                />
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                اطلب كود الدعوة من مدير المجموعة أو استخدم زر اللصق
              </p>
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowJoinDialog(false)}
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
              disabled={joining}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleJoinGroup}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={joining || !inviteCode.trim()}
            >
              {joining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  جارٍ الانضمام...
                </>
              ) : (
                'انضمام'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Group Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl text-white border border-white/20 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right text-xl">إعدادات المجموعة</DialogTitle>
          </DialogHeader>
          
          {selectedGroup && (
            <div className="space-y-6">
              {/* Group Info */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-right">{selectedGroup.name}</h3>
                {selectedGroup.description && (
                  <p className="text-gray-300 text-right">{selectedGroup.description}</p>
                )}
                
                {/* Invite Code */}
                {selectedGroup.invite_code && (
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyInviteCode(selectedGroup.invite_code!)}
                      className="bg-transparent border-white/20 text-white hover:bg-white/10"
                    >
                      <Copy className="w-4 h-4 ml-1" />
                      نسخ
                    </Button>
                    <code className="bg-white/10 px-3 py-2 rounded text-sm font-mono tracking-wider">
                      {selectedGroup.invite_code}
                    </code>
                    <span className="text-sm text-gray-300">كود الدعوة:</span>
                  </div>
                )}
              </div>

              {/* Members List */}
              <div className="space-y-3">
                <h4 className="text-md font-medium text-right">الأعضاء ({groupMembers.length})</h4>
                
                {loadingMembers ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {groupMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2">
                          {/* Remove button for admins (except themselves) */}
                          {selectedGroup.created_by === user?.id && member.user_id !== user?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member.id, member.users?.email || 'مستخدم غير معروف')}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {getRoleText(member.role)}
                          </Badge>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm font-medium flex items-center gap-2">
                            {getDisplayName(member)}
                            {getRoleIcon(member.role)}
                          </div>
                          <div className="text-xs text-gray-400">{member.users?.email || 'بريد غير معروف'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-white/20">
                {selectedGroup.created_by === user?.id ? (
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteGroup(selectedGroup.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 ml-2" />
                    حذف المجموعة
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => handleLeaveGroup(selectedGroup.id)}
                    className="bg-transparent border-yellow-500/50 text-yellow-400 hover:bg-yellow-900/20"
                  >
                    <LogOut className="w-4 h-4 ml-2" />
                    مغادرة المجموعة
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => setShowSettingsDialog(false)}
                  className="bg-transparent border-white/20 text-white hover:bg-white/10"
                >
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
