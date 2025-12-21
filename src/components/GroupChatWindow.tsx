import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Trash2, Users, MoreVertical, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGroupChat, GroupMessage } from '@/hooks/useGroupChat';
import { useAuth } from '@/components/AuthProvider';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface GroupChatWindowProps {
  groupId: string;
  groupName: string;
  onClose: () => void;
}

// دالة مساعدة لاستخراج الحروف الأولى من الاسم للأفاتار
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

// دالة لتوليد لون خلفية عشوائي للأفاتار بناءً على الاسم
const stringToColor = (string: string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
};

const GroupChatWindow: React.FC<GroupChatWindowProps> = ({
  groupId,
  groupName,
  onClose
}) => {
  const { user } = useAuth();
  const { messages, loading, sending, sendMessage, deleteMessage } = useGroupChat(groupId);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom with smooth behavior
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!messageText.trim() || sending) return;
    const success = await sendMessage(messageText);
    if (success) setMessageText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isMyMessage = (message: GroupMessage) => message.user_id === user?.id;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 md:inset-10 z-50 flex items-center justify-center p-4 md:p-0"
    >
      {/* Container with Glassmorphism */}
      <div className="w-full h-full md:h-[85vh] md:max-w-4xl bg-[#0f172a]/90 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col overflow-hidden relative">
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#d94550]/20 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-30"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5 backdrop-blur-md z-10" dir="rtl">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#d94550] to-orange-600 flex items-center justify-center shadow-lg">
                <Users className="text-white w-6 h-6" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0f172a] rounded-full"></span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">{groupName}</h2>
              <p className="text-xs text-white/50 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                نشط الآن
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10 rounded-full hidden md:flex">
                <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10 rounded-full">
                <MoreVertical className="w-5 h-5" />
            </Button>
            <div className="w-px h-6 bg-white/10 mx-2"></div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Chat Area */}
        <ScrollArea className="flex-1 px-4 py-6 bg-gradient-to-b from-transparent to-black/20">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="animate-spin w-10 h-10 border-4 border-[#d94550]/30 border-t-[#d94550] rounded-full" />
              <p className="text-white/40 text-sm">جاري تحميل المحادثة...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/30 gap-4 opacity-50">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10" />
              </div>
              <p>لا توجد رسائل بعد. كن أول من يبدأ الحديث!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4" dir="rtl">
              <AnimatePresence initial={false}>
                {messages.map((message) => {
                  const isMe = isMyMessage(message);
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className={cn(
                        "flex items-end gap-3",
                        isMe ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      {/* Avatar */}
                      {!isMe && (
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md shrink-0"
                          style={{ backgroundColor: stringToColor(message.user_name || 'U') }}
                        >
                          {getInitials(message.user_name || 'User')}
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div className={cn(
                        "flex flex-col max-w-[75%] md:max-w-[60%]",
                        isMe ? "items-start" : "items-end"
                      )}>
                        {!isMe && (
                          <span className="text-[11px] text-white/40 mb-1 px-1 block">
                            {message.user_name}
                          </span>
                        )}
                        
                        <div
                          className={cn(
                            "relative px-5 py-3 shadow-lg group transition-all duration-200",
                            isMe 
                              ? "bg-gradient-to-br from-[#d94550] to-[#b9323c] text-white rounded-2xl rounded-tr-sm" 
                              : "bg-gray-800/80 backdrop-blur-sm border border-white/5 text-gray-100 rounded-2xl rounded-tl-sm hover:bg-gray-800"
                          )}
                        >
                          <p className="text-sm md:text-[15px] leading-relaxed break-words font-normal">
                            {message.content}
                          </p>
                          
                          <div className={cn(
                            "flex items-center gap-2 mt-1.5 opacity-60",
                            isMe ? "justify-end text-red-100" : "justify-start text-gray-400"
                          )}>
                            <span className="text-[10px] font-medium tracking-wide">
                              {formatTime(message.created_at)}
                            </span>
                          </div>

                          {/* Action Buttons (Delete) */}
                          {isMe && (
                             <button
                                onClick={() => deleteMessage(message.id)}
                                className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 text-white/30 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-white/5"
                                title="حذف الرسالة"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 md:p-5 bg-black/20 backdrop-blur-xl border-t border-white/5">
          <div className="flex items-center gap-3 relative" dir="rtl">
            <div className="flex-1 relative group">
                <Input
                ref={inputRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب رسالتك هنا..."
                className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-full py-6 pr-6 pl-12 focus:bg-white/10 focus:border-[#d94550]/50 transition-all shadow-inner"
                disabled={sending}
                />
            </div>
            
            <Button
              onClick={handleSend}
              disabled={!messageText.trim() || sending}
              size="icon"
              className={cn(
                "h-12 w-12 rounded-full shadow-lg shadow-red-900/20 transition-all duration-300",
                messageText.trim() 
                    ? "bg-[#d94550] hover:bg-[#c03540] hover:scale-105 hover:rotate-[-10deg]" 
                    : "bg-gray-800 text-gray-500"
              )}
            >
              {sending ? (
                <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <Send className={cn("w-5 h-5", messageText.trim() && "ml-1")} /> // ml-1 to visually center icon
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GroupChatWindow;
