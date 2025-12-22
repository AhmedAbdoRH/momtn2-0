import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

type NotificationType = 'new_photo' | 'new_message' | 'member_joined' | 'like' | 'comment' | 'group_invite';

interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  groupId?: string;
  senderId?: string;
  senderName?: string;
  data?: Json;
}

export const NotificationsService = {
  /**
   * Send notification to a single user
   */
  async sendNotification(params: SendNotificationParams): Promise<boolean> {
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: params.userId,
        type: params.type,
        title: params.title,
        body: params.body,
        group_id: params.groupId || null,
        sender_id: params.senderId || null,
        sender_name: params.senderName || null,
        data: params.data || {},
      });

      if (error) {
        console.error('Error sending notification:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Exception sending notification:', err);
      return false;
    }
  },

  /**
   * Notify all members of a group (except the sender)
   */
  async notifyGroupMembers(params: {
    groupId: string;
    senderId: string;
    senderName: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Json;
  }): Promise<boolean> {
    try {
      // Get all group members except the sender
      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', params.groupId)
        .neq('user_id', params.senderId);

      if (membersError) {
        console.error('Error fetching group members:', membersError);
        return false;
      }

      if (!members || members.length === 0) {
        return true; // No one to notify
      }

      // Create notifications for all members
      const notifications = members.map(member => ({
        user_id: member.user_id,
        type: params.type,
        title: params.title,
        body: params.body,
        group_id: params.groupId,
        sender_id: params.senderId,
        sender_name: params.senderName,
        data: params.data || {},
      }));

      const { error } = await supabase.from('notifications').insert(notifications);

      if (error) {
        console.error('Error sending notifications to group members:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Exception notifying group members:', err);
      return false;
    }
  },
};
