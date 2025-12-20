import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGroupChat, GroupMessage } from '@/hooks/useGroupChat';
import { useAuth } from '@/components/AuthProvider';
import { cn } from '@/lib/utils';

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

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on open
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!messageText.trim() || sending) return;
    
    const success = await sendMessage(messageText);
    if (success) {
      setMessageText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-EG', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isMyMessage = (message: GroupMessage) => message.user_id === user?.id;

  return (
    <div className="fixed inset-4 md:inset-10 z-50 flex flex-col bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
        <h2 className="text-lg font-bold text-white" dir="rtl">
          محادثة {groupName}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-white/50" dir="rtl">
            لا توجد رسائل بعد. ابدأ المحادثة!
          </div>
        ) : (
          <div className="space-y-3" dir="rtl">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  isMyMessage(message) ? "justify-start" : "justify-end"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2 group relative",
                    isMyMessage(message)
                      ? "bg-[#d94550] text-white rounded-br-sm"
                      : "bg-gray-700 text-white rounded-bl-sm"
                  )}
                >
                  {!isMyMessage(message) && (
                    <div className="text-xs text-white/70 mb-1 font-medium">
                      {message.user_name}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed break-words">
                    {message.content}
                  </p>
                  <div className="flex items-center justify-between mt-1 gap-2">
                    <span className="text-[10px] text-white/50">
                      {formatTime(message.created_at)}
                    </span>
                    {isMyMessage(message) && (
                      <button
                        onClick={() => deleteMessage(message.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-white/50 hover:text-white"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="flex gap-2" dir="rtl">
          <Input
            ref={inputRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب رسالتك..."
            className="flex-1 bg-gray-800/50 border-gray-700 text-white placeholder:text-white/40 focus:border-[#d94550]"
            disabled={sending}
          />
          <Button
            onClick={handleSend}
            disabled={!messageText.trim() || sending}
            className="bg-[#d94550] hover:bg-[#d94550]/90 text-white px-4"
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
