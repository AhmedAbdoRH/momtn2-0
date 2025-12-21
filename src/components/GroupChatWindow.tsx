import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Trash2, Smile, Image as ImageIcon, MoreVertical } from 'lucide-react';
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  };

  const isMyMessage = (message: GroupMessage) => message.user_id === user?.id;

  return (
    <div className="fixed inset-4 md:inset-10 z-50 flex flex-col bg-gradient-to-br from-[#0f172a]/95 via-[#020617]/95 to-black/95 backdrop-blur-2xl rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3" dir="rtl">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d94550] to-[#ff7a7a] flex items-center justify-center font-bold text-white">
            {groupName.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{groupName}</h2>
            <p className="text-xs text-emerald-400">نشط الآن</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
            <MoreVertical className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full" />
          </div>
        ) : (
          <div className="space-y-4" dir="rtl">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn('flex', isMyMessage(message) ? 'justify-start' : 'justify-end')}
                >
                  <div
                    className={cn(
                      'relative max-w-[75%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-lg group',
                      isMyMessage(message)
                        ? 'bg-gradient-to-br from-[#d94550] to-[#ff6b6b] text-white rounded-br-md'
                        : 'bg-[#1f2933] text-white rounded-bl-md'
                    )}
                  >
                    {!isMyMessage(message) && (
                      <div className="text-xs text-white/60 mb-1 font-semibold">
                        {message.user_name}
                      </div>
                    )}
                    <p className="break-words">{message.content}</p>
                    <div className="flex items-center justify-between mt-2 gap-2">
                      <span className="text-[10px] text-white/40">{formatTime(message.created_at)}</span>
                      {isMyMessage(message) && (
                        <button
                          onClick={() => deleteMessage(message.id)}
                          className="opacity-0 group-hover:opacity-100 transition text-white/50 hover:text-white"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-white/10 bg-gradient-to-t from-black/40 to-white/5">
        <div className="flex items-center gap-2" dir="rtl">
          <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
            <Smile className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/10">
            <ImageIcon className="w-5 h-5" />
          </Button>
          <Input
            ref={inputRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب رسالة..."
            className="flex-1 bg-[#020617]/60 border-white/10 text-white placeholder:text-white/40 focus:border-[#d94550] focus:ring-[#d94550]/30 rounded-full px-4"
            disabled={sending}
          />
          <Button
            onClick={handleSend}
            disabled={!messageText.trim() || sending}
            className="bg-gradient-to-br from-[#d94550] to-[#ff6b6b] hover:opacity-90 text-white rounded-full px-5"
          >
            {sending ? (
              <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupChatWindow;

