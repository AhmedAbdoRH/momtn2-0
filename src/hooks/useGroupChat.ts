import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { NotificationsService } from '@/services/notificationsService';

export interface GroupMessage {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
  likes?: string[]; // Array of user IDs who liked this message
}

export const useGroupChat = (groupId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!groupId || !user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch user names and avatars for messages
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(m => m.user_id))];
        const { data: users } = await supabase
          .from('users')
          .select('id, full_name')
          .in('id', userIds);

        // Fetch avatars from auth metadata
        const userMap = new Map(users?.map(u => [u.id, { name: u.full_name, avatar: null as string | null }]) || []);
        
        // Try to get avatars from profiles table or user_metadata
        for (const userId of userIds) {
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('avatar_url')
              .eq('id', userId)
              .single();
            
            if (profileData?.avatar_url) {
              const existing = userMap.get(userId);
              if (existing) {
                userMap.set(userId, { ...existing, avatar: profileData.avatar_url });
              }
            }
          } catch {
            // Profile might not exist, continue
          }
        }
        
        const messagesWithNames = data.map(m => ({
          ...m,
          user_name: userMap.get(m.user_id)?.name || 'مستخدم',
          user_avatar: userMap.get(m.user_id)?.avatar || undefined,
          likes: [] // Initialize empty likes array
        }));
        
        setMessages(messagesWithNames);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [groupId, user]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!groupId || !user || !content.trim()) return false;
    
    setSending(true);
    try {
      const { error } = await supabase
        .from('group_messages')
        .insert({
          group_id: groupId,
          user_id: user.id,
          content: content.trim()
        });

      if (error) throw error;

      // Get user display name
      const { data: userData } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single();
      
      const senderName = userData?.full_name || user.email?.split('@')[0] || 'مستخدم';

      // Send notification to group members
      NotificationsService.notifyGroupMembers(
        groupId,
        user.id,
        senderName,
        'new_message',
        'رسالة جديدة',
        `${senderName}: ${content.trim().substring(0, 50)}${content.length > 50 ? '...' : ''}`,
        { message_preview: content.trim().substring(0, 100) }
      );

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    } finally {
      setSending(false);
    }
  }, [groupId, user]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('group_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }, []);

  // Toggle like on a message (local only - no DB persistence for now)
  const toggleLike = useCallback((messageId: string) => {
    if (!user) return;
    
    setMessages(prev => prev.map(m => {
      if (m.id === messageId) {
        const likes = m.likes || [];
        const hasLiked = likes.includes(user.id);
        return {
          ...m,
          likes: hasLiked 
            ? likes.filter(id => id !== user.id)
            : [...likes, user.id]
        };
      }
      return m;
    }));
  }, [user]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!groupId || !user) return;

    fetchMessages();

    const channel = supabase
      .channel(`group-chat-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`
        },
        async (payload) => {
          const newMessage = payload.new as GroupMessage;
          
          // Fetch user name and avatar for new message
          const { data: userData } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', newMessage.user_id)
            .single();
          
          // Try to get avatar
          let avatarUrl: string | undefined;
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('avatar_url')
              .eq('id', newMessage.user_id)
              .single();
            avatarUrl = profileData?.avatar_url || undefined;
          } catch {
            // Profile might not exist
          }
          
          setMessages(prev => [...prev, {
            ...newMessage,
            user_name: userData?.full_name || 'مستخدم',
            user_avatar: avatarUrl,
            likes: []
          }]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`
        },
        (payload) => {
          const deletedId = payload.old.id;
          setMessages(prev => prev.filter(m => m.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, user, fetchMessages]);

  return {
    messages,
    loading,
    sending,
    sendMessage,
    deleteMessage,
    toggleLike,
    refetch: fetchMessages
  };
};
