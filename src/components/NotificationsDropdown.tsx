import React from 'react';
import {
  Bell,
  Check,
  Trash2,
  Image,
  MessageCircle,
  UserPlus,
  Heart,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface NotificationsDropdownProps {
  onOpenGroup?: (groupId: string) => void;
  onOpenGroupChat?: (groupId: string, groupName: string) => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  onOpenGroup,
  onOpenGroupChat,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    // Mark as read first
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    const groupId = notification.group_id;
    if (!groupId) return;

    // Close dropdown
    setIsOpen(false);

    // Navigate based on notification type
    if (notification.type === 'new_message') {
      // Open group chat
      if (onOpenGroupChat) {
        // Fetch group name from notification data or use a default
        const groupName = (notification.data as { group_name?: string })?.group_name || 'المجموعة';
        onOpenGroupChat(groupId, groupName);
      }
    } else if (['new_photo', 'comment', 'like'].includes(notification.type)) {
      // Open the group to see photos
      if (onOpenGroup) {
        onOpenGroup(groupId);
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_photo':
        return <Image className="w-4 h-4 text-pink-400" />;
      case 'new_message':
        return <MessageCircle className="w-4 h-4 text-sky-400" />;
      case 'member_joined':
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
      case 'like':
        return <Heart className="w-4 h-4 text-rose-400" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-violet-400" />;
      default:
        return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTime = (date: string | null) => {
    if (!date) return '';
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: ar,
      });
    } catch {
      return '';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="الإشعارات"
          className="relative"
        >
          <Bell className="h-5 w-5 text-gray-300 hover:text-white transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-80 p-0 max-h-[70vh]
        bg-[#0f1117]
        border border-white/10
        shadow-2xl"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-3 border-b border-white/10"
          dir="rtl"
        >
          <h3 className="font-semibold text-gray-100">الإشعارات</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="text-xs text-gray-400 hover:text-white"
            >
              <Check className="w-3 h-3 ml-1" />
              قراءة الكل
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-[50vh]">
          {loading ? (
            <div className="p-4 text-center text-gray-400">
              جاري التحميل...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-500" />
              <p className="text-gray-400">لا توجد إشعارات</p>
            </div>
          ) : (
            <div className="py-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'flex items-start gap-3 p-3 cursor-pointer transition-colors border-b border-white/5 last:border-0',
                    'hover:bg-white/5',
                    !notification.is_read && 'bg-white/10',
                    notification.group_id && 'hover:bg-white/10'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-100 truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">
                      {notification.body}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(notification.created_at)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-1">
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
