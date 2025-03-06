
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function JoinSpace() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      joinSpace();
    }
  }, [token]);

  const joinSpace = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .rpc('join_space_by_token', { invitation_token: token });
      
      if (error) throw error;
      
      // Type assertion to handle the JSON response structure
      const result = data as { success: boolean; space_id?: string; message?: string };
      
      if (result.success) {
        toast.success('تم الانضمام إلى المساحة المشتركة بنجاح');
        navigate(`/spaces/${result.space_id}`);
      } else {
        setError(result.message || 'حدث خطأ أثناء الانضمام إلى المساحة المشتركة');
        toast.error(result.message || 'حدث خطأ أثناء الانضمام إلى المساحة المشتركة');
      }
    } catch (error: any) {
      console.error('Error joining space:', error);
      setError(error.message || 'حدث خطأ أثناء الانضمام إلى المساحة المشتركة');
      toast.error('حدث خطأ أثناء الانضمام إلى المساحة المشتركة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white/80 backdrop-blur-lg rounded-lg shadow p-6 mt-16">
      <h1 className="text-2xl font-bold mb-6 text-center">الانضمام إلى مساحة مشتركة</h1>
      
      <div className="text-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <p className="text-gray-600">جاري الانضمام إلى المساحة المشتركة...</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <p className="text-red-500">{error}</p>
            <Button onClick={() => navigate('/')}>العودة إلى الصفحة الرئيسية</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-green-500">تم الانضمام إلى المساحة المشتركة بنجاح</p>
            <Button onClick={() => navigate('/')}>العودة إلى الصفحة الرئيسية</Button>
          </div>
        )}
      </div>
    </div>
  );
}
