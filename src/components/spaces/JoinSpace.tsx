
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function JoinSpace() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && user) {
      joinSpaceWithToken();
    }
  }, [token, user]);

  const joinSpaceWithToken = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.rpc('join_space_by_token', {
        invitation_token: token
      });
      
      if (error) throw error;
      
      if (data.success) {
        toast.success('تم الانضمام إلى المساحة المشتركة بنجاح');
        navigate(`/spaces/${data.space_id}`);
      } else {
        setError(data.message || 'فشل في الانضمام إلى المساحة المشتركة');
      }
    } catch (error) {
      console.error('Error joining space:', error);
      setError('حدث خطأ أثناء الانضمام إلى المساحة المشتركة');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto bg-white/80 backdrop-blur-lg rounded-lg shadow p-6 mt-16 text-center">
        <h1 className="text-2xl font-bold mb-4">الانضمام إلى مساحة مشتركة</h1>
        <p className="mb-6 text-gray-600">يرجى تسجيل الدخول للانضمام إلى المساحة المشتركة</p>
        <Button onClick={() => navigate('/auth')}>
          تسجيل الدخول
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white/80 backdrop-blur-lg rounded-lg shadow p-6 mt-16 text-center">
      <h1 className="text-2xl font-bold mb-4">الانضمام إلى مساحة مشتركة</h1>
      
      {loading ? (
        <div className="flex justify-center my-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <>
          <p className="text-red-500 mb-6">{error}</p>
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
          >
            العودة إلى الرئيسية
          </Button>
        </>
      ) : (
        <>
          <p className="mb-6 text-gray-600">جاري التحقق من الدعوة...</p>
          <Button 
            onClick={joinSpaceWithToken}
            disabled={loading}
          >
            محاولة مرة أخرى
          </Button>
        </>
      )}
    </div>
  );
}
