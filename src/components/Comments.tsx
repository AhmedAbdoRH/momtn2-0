import React, { useState, useEffect } from "react";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useAuth } from "./AuthProvider";
import { useToast } from "../hooks/use-toast";
import { supabase } from "../integrations/supabase/client";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_display_name?: string;
}

interface CommentsProps {
  photoId: string;
  isVisible: boolean;
  onClose: () => void;
}

export const Comments: React.FC<CommentsProps> = ({ photoId, isVisible, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load comments
  useEffect(() => {
    if (!isVisible || !photoId) return;
    
    loadComments();
  }, [photoId, isVisible]);

  const loadComments = async () => {
    if (!photoId) return;
    
    setIsLoading(true);
    try {
      // Get comments with user information
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          users!inner(
            full_name,
            email
          )
        `)
        .eq('photo_id', photoId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading comments:', error);
        return;
      }

      // Format comments with display names
      const formattedComments = commentsData?.map(comment => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user_id: comment.user_id,
        user_display_name: comment.users?.full_name || comment.users?.email?.split('@')[0] || 'مستخدم'
      })) || [];

      setComments(formattedComments);
    } catch (err) {
      console.error('Exception loading comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          photo_id: photoId,
          user_id: user.id,
          content: newComment.trim()
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding comment:', error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء إضافة التعليق",
          variant: "destructive"
        });
        return;
      }

      // Add the new comment to the list with user display name
      const userDisplayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'مستخدم';
      const newCommentItem: Comment = {
        id: data.id,
        content: data.content,
        created_at: data.created_at,
        user_id: data.user_id,
        user_display_name: userDisplayName
      };

      setComments(prev => [...prev, newCommentItem]);
      setNewComment("");
      
      toast({
        title: "تم بنجاح",
        description: "تم إضافة التعليق"
      });
    } catch (err) {
      console.error('Exception adding comment:', err);
      toast({
        title: "خطأ غير متوقع",
        description: "حدث خطأ أثناء إضافة التعليق",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Error deleting comment:', error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء حذف التعليق",
          variant: "destructive"
        });
        return;
      }

      setComments(prev => prev.filter(comment => comment.id !== commentId));
      toast({
        title: "تم الحذف",
        description: "تم حذف التعليق بنجاح"
      });
    } catch (err) {
      console.error('Exception deleting comment:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'الآن';
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `منذ ${diffInDays} يوم`;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-md border border-white/10 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            التعليقات
          </h3>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white"
          >
            ✕
          </Button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
          {isLoading ? (
            <div className="text-center text-gray-400 py-8">
              جاري تحميل التعليقات...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              لا توجد تعليقات بعد
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600">
                  <AvatarFallback className="bg-transparent text-white text-sm font-bold">
                    {comment.user_display_name?.charAt(0)?.toUpperCase() || 'م'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-blue-300 text-sm">
                        {comment.user_display_name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {formatDate(comment.created_at)}
                        </span>
                        {user?.id === comment.user_id && (
                          <Button
                            onClick={() => handleDeleteComment(comment.id)}
                            variant="ghost"
                            size="sm"
                            className="p-1 h-auto text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-white text-sm leading-relaxed" dir="rtl">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form */}
        {user && (
          <div className="p-6 border-t border-white/10">
            <form onSubmit={handleSubmitComment} className="flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="اكتب تعليقك..."
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-400 text-right"
                dir="rtl"
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                {isSubmitting ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};