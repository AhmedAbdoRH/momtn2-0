import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import GroupChatWindow from './GroupChatWindow';

interface FloatingChatButtonProps {
  groupId: string;
  groupName: string;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  groupId,
  groupName
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-20 left-1/2 -translate-x-1/2 z-30",
          "flex items-center gap-2 px-4 py-2",
          "bg-white/10 backdrop-blur-sm border border-white/20",
          "rounded-full shadow-lg",
          "text-white/80 hover:text-white hover:bg-white/20",
          "transition-all duration-300 hover:scale-105",
          "group"
        )}
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-medium" dir="rtl">محادثة المجموعة</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Chat Window */}
          <GroupChatWindow
            groupId={groupId}
            groupName={groupName}
            onClose={() => setIsOpen(false)}
          />
        </>
      )}
    </>
  );
};

export default FloatingChatButton;
