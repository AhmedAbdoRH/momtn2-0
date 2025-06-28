
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Users, Plus, Settings } from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  is_private: boolean;
  invite_code: string | null;
  member_count?: number;
}

interface GroupsDropdownProps {
  selectedGroupId: string | null;
  onGroupChange: (groupId: string | null) => void;
}

const GroupsDropdown: React.FC<GroupsDropdownProps> = ({ selectedGroupId, onGroupChange }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserGroups();
    }
  }, [user]);

  const fetchUserGroups = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members!inner(user_id)
        `)
        .eq('group_members.user_id', user.id);

      if (error) {
        console.error('Error fetching groups:', error);
        return;
      }

      setGroups(data || []);
    } catch (err) {
      console.error('Exception fetching groups:', err);
    }
  };

  const handleCreateGroup = async () => {
    if (!user || !newGroupName.trim()) {
      toast({ title: "خطأ", description: "يجب كتابة اسم المجموعة", variant: "destructive" });
      return;
    }

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
        toast({ title: "خطأ في الإنشاء", description: "لم نتمكن من إنشاء المجموعة", variant: "destructive" });
        return;
      }

      await fetchUserGroups();
      setShowCreateDialog(false);
      setNewGroupName('');
      setNewGroupDescription('');
      setIsPrivate(false);
      
      toast({ 
        title: "تم الإنشاء بنجاح", 
        description: `تم إنشاء مجموعة "${data.name}" بنجاح${data.invite_code ? '. كود الدعوة: ' + data.invite_code : ''}` 
      });
    } catch (err) {
      console.error('Exception creating group:', err);
      toast({ title: "خطأ غير متوقع", description: "حدث خطأ أثناء إنشاء المجموعة", variant: "destructive" });
    }
  };

  const handleJoinGroup = async () => {
    if (!user || !inviteCode.trim()) {
      toast({ title: "خطأ", description: "يجب كتابة كود الدعوة", variant: "destructive" });
      return;
    }

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

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupData.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        toast({ title: "عضو بالفعل", description: "أنت عضو في هذه المجموعة بالفعل" });
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
        toast({ title: "خطأ في الانضمام", description: "لم نتمكن من إضافتك للمجموعة", variant: "destructive" });
        return;
      }

      await fetchUserGroups();
      setShowJoinDialog(false);
      setInviteCode('');
      
      toast({ 
        title: "تم الانضمام بنجاح", 
        description: `تم انضمامك لمجموعة "${groupData.name}" بنجاح` 
      });
    } catch (err) {
      console.error('Exception joining group:', err);
      toast({ title: "خطأ غير متوقع", description: "حدث خطأ أثناء الانضمام للمجموعة", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      {/* Group Selection */}
      <div className="flex flex-col space-y-2">
        <button
          onClick={() => onGroupChange(null)}
          className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
            selectedGroupId === null
              ? 'bg-[#ea384c]/20 text-pink-200'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <span>صوري الشخصية</span>
          <Users className="w-4 h-4" />
        </button>

        {groups.map((group) => (
          <button
            key={group.id}
            onClick={() => onGroupChange(group.id)}
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              selectedGroupId === group.id
                ? 'bg-[#ea384c]/20 text-pink-200'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <span>{group.name}</span>
            <Users className="w-4 h-4" />
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-2">
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
          <Users className="w-4 h-4" />
          الانضمام لمجموعة
        </button>
      </div>

      {/* Create Group Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-gray-900/90 backdrop-blur-xl text-white border-0">
          <DialogHeader>
            <DialogTitle className="text-right">إنشاء مجموعة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-right">اسم المجموعة</label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="bg-white/10 backdrop-blur-sm text-white text-right"
                placeholder="أدخل اسم المجموعة..."
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-right">الوصف (اختياري)</label>
              <Textarea
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                className="bg-white/10 backdrop-blur-sm text-white text-right"
                placeholder="وصف المجموعة..."
                dir="rtl"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">مجموعة خاصة</label>
              <Switch
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleCreateGroup}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              إنشاء المجموعة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Group Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="bg-gray-900/90 backdrop-blur-xl text-white border-0">
          <DialogHeader>
            <DialogTitle className="text-right">الانضمام لمجموعة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-right">كود الدعوة</label>
              <Input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="bg-white/10 backdrop-blur-sm text-white text-center"
                placeholder="أدخل كود الدعوة..."
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowJoinDialog(false)}
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleJoinGroup}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              انضمام
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupsDropdown;
