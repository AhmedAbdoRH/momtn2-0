import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

type NotificationType = 'new_photo' | 'new_message' | 'member_joined' | 'like' | 'comment' | 'group_invite';

interface SaveNotificationParams {
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  group_id?: string;
  sender_id?: string;
  sender_name?: string;
  data?: Json;
}

export const NotificationsService = {
  /**
   * Save a notification for a single user
   */
  async saveNotification(params: SaveNotificationParams): Promise<boolean> {
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: params.user_id,
        type: params.type,
        title: params.title,
        body: params.body,
        group_id: params.group_id || null,
        sender_id: params.sender_id || null,
        sender_name: params.sender_name || null,
        data: params.data || {},
      });

      if (error) {
        console.error('Error saving notification:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Exception saving notification:', err);
      return false;
    }
  },

  /**
   * Notify all members of a group (except the sender)
   */
  async notifyGroupMembers(
    groupId: string,
    excludeUserId: string,
    senderName: string,
    type: NotificationType,
    title: string,
    body: string,
    extraData?: Record<string, unknown>
  ): Promise<boolean> {
    try {
      // Get all group members except the sender
      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId)
        .neq('user_id', excludeUserId);

      if (membersError) {
        console.error('Error fetching group members:', membersError);
        return false;
      }

      if (!members || members.length === 0) {
        return true; // No one to notify
      }

      // Send notification to each member
      for (const member of members) {
        await this.saveNotification({
          user_id: member.user_id,
          type,
          title,
          body,
          sender_id: excludeUserId,
          sender_name: senderName,
          group_id: groupId,
          data: { group_id: groupId, ...extraData } as Json,
        });
      }

      return true;
    } catch (err) {
      console.error('Exception notifying group members:', err);
      return false;
    }
  },
};
