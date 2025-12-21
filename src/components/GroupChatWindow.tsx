import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, Send, Trash2, Smile, Paperclip, Mic, MoreVertical,
  Image, Search, Phone, Video, Users, ArrowDown, Reply,
  Check, CheckCheck, Heart, ThumbsUp, Laugh, MessageCircle,
  Settings, Bell, BellOff, Pin, Copy, Forward, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGroupChat, GroupMessage } from '@/hooks/useGroupChat';
import { useAuth } from '@/components/AuthProvider';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface GroupChatWindowProps {
  groupId: string;
  groupName: string;
  groupImage?: string;
  membersCount?: number;
  onClose: () => void;
}

// مكون الإيموجي
const EMOJI_LIST = ['😀', '😂', '😍', '🥰', '😊', '🤔', '😢', '😡', '👍', '👎', '❤️', '🔥', '🎉', '✨', '💪', '🙏'];

const EmojiPicker: React.FC<{ onSelect: (emoji: string) => void; onClose: () => void }> = ({ onSelect, onClose }) => (
  <div className="absolute bottom-full right-0 mb-2 p-3 bg-gray-800 rounded-2xl shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-200">
    <div className="grid grid-cols-8 gap-1">
      {EMOJI_LIST.map((emoji) => (
        <button
          key={emoji}
          onClick={() => { onSelect(emoji); onClose(); }}
          className="w-8 h-8 flex items-center justify-center text-xl hover:bg-white/10 rounded-lg transition-all hover:scale-125"
        >
          {emoji}
        </button>
      ))}
    </div>
  </div>
);

// مكون ردود الفعل السريعة
const QuickReactions = ['❤️', '😂', '😮', '😢', '😡', '👍'];

const MessageReactions: React.FC<{ 
  reactions?: Record<string, string[]>;
  onReact: (emoji: string) => void;
  messageId: string;
}> = ({ reactions, onReact }) => {
  if (!reactions || Object.keys(reactions).length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(reactions).map(([emoji, users]) => (
        <button
          key={emoji}
          onClick={() => onReact(emoji)}
          className="flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded-full text-xs hover:bg-white/20 transition-colors"
        >
          <span>{emoji}</span>
          <span className="text-white/70">{users.length}</span>
        </button>
      ))}
    </div>
  );
};

// مكون فقاعة الرسالة
const MessageBubble: React.FC<{
  message: GroupMessage;
  isMe: boolean;
  showAvatar: boolean;
  showName: boolean;
  onDelete: (id: string) => void;
  onReply: (message: GroupMessage) => void;
  onReact: (messageId: string, emoji: string) => void;
}> = ({ message, isMe, showAvatar, showName, onDelete, onReply, onReact }) => {
  const [showReactions, setShowReactions] = useState(false);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-EG', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-gradient-to-br from-pink-500 to-rose-500',
      'bg-gradient-to-br from-purple-500 to-indigo-500',
      'bg-gradient-to-br from-blue-500 to-cyan-500',
      'bg-gradient-to-br from-green-500 to-emerald-500',
      'bg-gradient-to-br from-yellow-500 to-orange-500',
      'bg-gradient-to-br from-red-500 to-pink-500',
    ];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  return (
    <div
      className={cn(
        "flex gap-2 group animate-in fade-in slide-in-from-bottom-2 duration-300",
        isMe ? "flex-row" : "flex-row-reverse"
      )}
      onMouseLeave={() => setShowReactions(false)}
    >
      {/* الصورة الرمزية */}
      <div className={cn("flex-shrink-0 w-8", !showAvatar && "invisible")}>
        {showAvatar && (
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg",
            getAvatarColor(message.user_name)
          )}>
            {message.user_avatar ? (
              <img src={message.user_avatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              getInitials(message.user_name)
            )}
          </div>
        )}
      </div>

      {/* محتوى الرسالة */}
      <div className={cn("max-w-[70%] relative", isMe ? "items-start" : "items-end")}>
        {/* اسم المرسل */}
        {showName && !isMe && (
          <div className="text-xs text-white/60 mb-1 mr-3 font-medium">
            {message.user_name}
          </div>
        )}

        {/* الرد على رسالة */}
        {message.reply_to && (
          <div className={cn(
            "text-xs p-2 mb-1 rounded-xl border-r-2",
            isMe 
              ? "bg-white/5 border-[#d94550] text-white/60" 
              : "bg-white/5 border-gray-500 text-white/60"
          )}>
            <span className="font-medium">{message.reply_to.user_name}</span>
            <p className="truncate">{message.reply_to.content}</p>
          </div>
        )}

        {/* فقاعة الرسالة */}
        <div
          className={cn(
            "relative rounded-2xl px-4 py-2.5 shadow-lg",
            isMe
              ? "bg-gradient-to-br from-[#d94550] to-[#c13540] text-white rounded-tr-sm"
              : "bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-tl-sm"
          )}
        >
          {/* أزرار الإجراءات */}
          <div className={cn(
            "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1",
            isMe ? "-left-20" : "-right-20"
          )}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowReactions(!showReactions)}
                    className="p-1.5 rounded-full bg-gray-800/80 hover:bg-gray-700 text-white/70 hover:text-white transition-colors"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>تفاعل</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onReply(message)}
                    className="p-1.5 rounded-full bg-gray-800/80 hover:bg-gray-700 text-white/70 hover:text-white transition-colors"
                  >
                    <Reply className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>رد</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-full bg-gray-800/80 hover:bg-gray-700 text-white/70 hover:text-white transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                <DropdownMenuItem className="text-white hover:bg-white/10 gap-2">
                  <Copy className="w-4 h-4" /> نسخ
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-white/10 gap-2">
                  <Forward className="w-4 h-4" /> إعادة توجيه
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-white/10 gap-2">
                  <Star className="w-4 h-4" /> تمييز
                </DropdownMenuItem>
                {isMe && (
                  <>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem 
                      onClick={() => onDelete(message.id)}
                      className="text-red-400 hover:bg-red-500/20 gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> حذف
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* التفاعلات السريعة */}
          {showReactions && (
            <div className={cn(
              "absolute bottom-full mb-2 flex gap-1 p-2 bg-gray-800 rounded-full shadow-xl border border-white/10 animate-in fade-in zoom-in-95 duration-200",
              isMe ? "right-0" : "left-0"
            )}>
              {QuickReactions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => { onReact(message.id, emoji); setShowReactions(false); }}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* نص الرسالة */}
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
            {message.content}
          </p>

          {/* الوقت وحالة القراءة */}
          <div className={cn(
            "flex items-center gap-1.5 mt-1",
            isMe ? "justify-start" : "justify-end"
          )}>
            <span className="text-[10px] text-white/50">
              {formatTime(message.created_at)}
            </span>
            {isMe && (
              <span className="text-white/50">
                {message.read_by?.length > 0 ? (
                  <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* ردود الفعل */}
        <MessageReactions 
          reactions={message.reactions} 
          onReact={(emoji) => onReact(message.id, emoji)}
          messageId={message.id}
        />
      </div>
    </div>
  );
};

// مكون مؤشر الكتابة
const TypingIndicator: React.FC<{ users: string[] }> = ({ users }) => {
  if (users.length === 0) return null;

  const text = users.length === 1 
    ? `${users[0]} يكتب...`
    : users.length === 2
    ? `${users[0]} و ${users[1]} يكتبان...`
    : `${users[0]} و ${users.length - 1} آخرين يكتبون...`;

  return (
    <div className="flex items-center gap-2 text-white/50 text-sm px-4 py-2" dir="rtl">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{text}</span>
    </div>
  );
};

// المكون الرئيسي
const GroupChatWindow: React.FC<GroupChatWindowProps> = ({
  groupId,
  groupName,
  groupImage,
  membersCount = 0,
  onClose
}) => {
  const { user } = useAuth();
  const { messages, loading, sending, sendMessage, deleteMessage } = useGroupChat(groupId);
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState<GroupMessage | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [typingUsers] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // تجميع الرسائل حسب التاريخ
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: GroupMessage[] }[] = [];
    let currentDate = '';

    messages.forEach((message) => {
      const messageDate = new Date(message.created_at).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (messageDate !== currentDate) {
        currentDate = messageDate;
        groups.push({ date: messageDate, messages: [message] });
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });

    return groups;
  }, [messages]);

  // التمرير للأسفل
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!messageText.trim() || sending) return;
    
    const success = await sendMessage(messageText, replyTo?.id);
    if (success) {
      setMessageText('');
      setReplyTo(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReply = (message: GroupMessage) => {
    setReplyTo(message);
    inputRef.current?.focus();
  };

  const handleReact = (messageId: string, emoji: string) => {
    // تنفيذ التفاعل
    console.log('React to', messageId, 'with', emoji);
  };

  const isMyMessage = (message: GroupMessage) => message.user_id === user?.id;

  const shouldShowAvatar = (message: GroupMessage, index: number, allMessages: GroupMessage[]) => {
    if (index === allMessages.length - 1) return true;
    const nextMessage = allMessages[index + 1];
    return nextMessage.user_id !== message.user_id;
  };

  const shouldShowName = (message: GroupMessage, index: number, allMessages: GroupMessage[]) => {
    if (index === 0) return true;
    const prevMessage = allMessages[index - 1];
    return prevMessage.user_id !== message.user_id;
  };

  return (
    <TooltipProvider>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-2xl h-[90vh] flex flex-col bg-gradient-to-b from-gray-900 to-gray-950 rounded-3xl shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-300">
          
          {/* الهيدر */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-3" dir="rtl">
              {/* صورة المجموعة */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d94550] to-[#ff6b6b] flex items-center justify-center shadow-lg">
                  {groupImage ? (
                    <img src={groupImage} alt={groupName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <Users className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
              </div>

              {/* معلومات المجموعة */}
              <div>
                <h2 className="text-lg font-bold text-white">{groupName}</h2>
                <p className="text-xs text-white/50">
                  {membersCount} عضو • {messages.filter(m => new Date(m.created_at) > new Date(Date.now() - 24*60*60*1000)).length} رسالة اليوم
                </p>
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSearch(!showSearch)}
                    className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
                  >
                    <Search className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>بحث</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
                  >
                    <Phone className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>مكالمة صوتية</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
                  >
                    <Video className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>مكالمة فيديو</TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 w-48">
                  <DropdownMenuItem className="text-white hover:bg-white/10 gap-2">
                    <Users className="w-4 h-4" /> عرض الأعضاء
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-white/10 gap-2">
                    <Pin className="w-4 h-4" /> الرسائل المثبتة
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-white hover:bg-white/10 gap-2"
                  >
                    {isMuted ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                    {isMuted ? 'تفعيل الإشعارات' : 'كتم الإشعارات'}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-white/10 gap-2">
                    <Settings className="w-4 h-4" /> الإعدادات
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white/70 hover:text-white hover:bg-red-500/20 rounded-xl mr-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* شريط البحث */}
          {showSearch && (
            <div className="p-3 border-b border-white/10 bg-white/5 animate-in slide-in-from-top duration-200">
              <div className="relative" dir="rtl">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث في الرسائل..."
                  className="pr-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-white/40 rounded-xl"
                />
              </div>
            </div>
          )}

          {/* منطقة الرسائل */}
          <ScrollArea 
            ref={scrollAreaRef}
            className="flex-1 p-4"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-white/10 border-t-[#d94550] rounded-full animate-spin" />
                  <MessageCircle className="absolute inset-0 m-auto w-6 h-6 text-white/50" />
                </div>
                <p className="text-white/50">جاري تحميل الرسائل...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center" dir="rtl">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#d94550]/20 to-[#ff6b6b]/20 flex items-center justify-center">
                  <MessageCircle className="w-10 h-10 text-[#d94550]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">لا توجد رسائل بعد</h3>
                  <p className="text-white/50 text-sm">ابدأ المحادثة مع أعضاء المجموعة!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4" dir="rtl">
                {groupedMessages.map(({ date, messages: dayMessages }) => (
                  <div key={date}>
                    {/* فاصل التاريخ */}
                    <div className="flex items-center gap-4 my-6">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      <span className="text-xs text-white/40 bg-gray-800/50 px-3 py-1 rounded-full">
                        {date}
                      </span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>

                    {/* رسائل اليوم */}
                    <div className="space-y-2">
                      {dayMessages.map((message, index) => (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          isMe={isMyMessage(message)}
                          showAvatar={shouldShowAvatar(message, index, dayMessages)}
                          showName={shouldShowName(message, index, dayMessages)}
                          onDelete={deleteMessage}
                          onReply={handleReply}
                          onReact={handleReact}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                <TypingIndicator users={typingUsers} />
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* زر التمرير للأسفل */}
          {showScrollButton && (
            <button
              onClick={() => scrollToBottom()}
              className="absolute bottom-28 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#d94550] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform animate-in fade-in zoom-in duration-200"
            >
              <ArrowDown className="w-5 h-5 text-white" />
            </button>
          )}

          {/* شريط الرد */}
          {replyTo && (
            <div className="px-4 py-2 border-t border-white/10 bg-white/5 animate-in slide-in-from-bottom duration-200" dir="rtl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Reply className="w-4 h-4 text-[#d94550]" />
                  <div>
                    <span className="text-xs text-[#d94550] font-medium">رد على {replyTo.user_name}</span>
                    <p className="text-xs text-white/50 truncate max-w-xs">{replyTo.content}</p>
                  </div>
                </div>
                <button
                  onClick={() => setReplyTo(null)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-white/50" />
                </button>
              </div>
            </div>
          )}

          {/* شريط الإدخال */}
          <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-2" dir="rtl">
              {/* أزرار المرفقات */}
              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/50 hover:text-white hover:bg-white/10 rounded-xl h-10 w-10"
                    >
                      <Paperclip className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>إرفاق ملف</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/50 hover:text-white hover:bg-white/10 rounded-xl h-10 w-10"
                    >
                      <Image className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>إرسال صورة</TooltipContent>
                </Tooltip>
              </div>

              {/* حقل الإدخال */}
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="اكتب رسالتك..."
                  className="w-full bg-gray-800/80 border-gray-700 text-white placeholder:text-white/40 focus:border-[#d94550] rounded-2xl py-6 pr-4 pl-12 transition-all"
                  disabled={sending}
                />

                {/* زر الإيموجي */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-white/50 hover:text-white transition-colors"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  {showEmojiPicker && (
                    <EmojiPicker
                      onSelect={(emoji) => setMessageText(prev => prev + emoji)}
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  )}
                </div>
              </div>

              {/* أزرار الإرسال */}
              {messageText.trim() ? (
                <Button
                  onClick={handleSend}
                  disabled={sending}
                  className="bg-gradient-to-r from-[#d94550] to-[#ff6b6b] hover:from-[#c13540] hover:to-[#e85a5a] text-white rounded-2xl h-12 w-12 p-0 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/50 hover:text-white hover:bg-white/10 rounded-2xl h-12 w-12"
                    >
                      <Mic className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>رسالة صوتية</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default GroupChatWindow;
