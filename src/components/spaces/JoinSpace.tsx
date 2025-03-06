
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthProvider';

export default function JoinSpace() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [spaceId, setSpaceId] = useState<string | null>(null);
  const [spaceName, setSpaceName] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (token && user) {
      joinSpace();
    } else if (!user) {
      setError('يجب عليك تسجيل الدخول أولاً للانضمام إلى المساحة المشتركة');
      setLoading(false);
    }
  }, [token, user]);

  const joinSpace = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        setError('يجب عليك تسجيل الدخول أولاً للانضمام إلى المساحة المشتركة');
        toast.error('يجب عليك تسجيل الدخول أولاً للانضمام إلى المساحة المشتركة');
        return;
      }
      
      console.log("Attempting to join space with token:", token);
      
      // استدعاء الـ Edge Function المخصصة للانضمام
      const { data, error: funcError } = await supabase.functions.invoke('join-space-by-token', {
        body: { token }
      });
      
      console.log("Join space response:", data);
      
      if (funcError) {
        console.error("Function error:", funcError);
        throw new Error(funcError.message);
      }
      
      // التحقق من استجابة الدالة
      if (data.success && data.space_id) {
        setSuccess(true);
        setSpaceId(data.space_id);
        setSpaceName(data.space_name || 'المساحة المشتركة');
        toast.success('تم الانضمام إلى المساحة المشتركة بنجاح');
        
        // تأخير قليل قبل التوجيه للتأكد من اكتمال عملية الانضمام
        setTimeout(() => {
          navigate(`/spaces/${data.space_id}`);
        }, 2000);
      } else {
        setError(data.message || 'حدث خطأ أثناء الانضمام إلى المساحة المشتركة');
        toast.error(data.message || 'حدث خطأ أثناء الانضمام إلى المساحة المشتركة');
      }
    } catch (error: any) {
      console.error('Error joining space:', error);
      setError(error.message || 'حدث خطأ أثناء الانضمام إلى المساحة المشتركة');
      toast.error('حدث خطأ أثناء الانضمام إلى المساحة المشتركة');
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setError(null);
    setLoading(true);
    joinSpace();
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
            <div className="flex flex-col space-y-2">
              {!error.includes('تسجيل الدخول') && (
                <Button onClick={handleTryAgain}>
                  حاول مرة أخرى
                </Button>
              )}
              <Button onClick={() => navigate('/')}>
                العودة إلى الصفحة الرئيسية
              </Button>
              {error.includes('تسجيل الدخول') && (
                <Button onClick={() => navigate('/auth')} variant="outline">
                  انتقل إلى صفحة تسجيل الدخول
                </Button>
              )}
            </div>
          </div>
        ) : success ? (
          <div className="space-y-4">
            <p className="text-green-500">تم الانضمام إلى {spaceName} بنجاح</p>
            <p className="text-gray-500">جاري التوجيه...</p>
            <Button onClick={() => navigate(`/spaces/${spaceId}`)}>
              الانتقال إلى المساحة المشتركة
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-500">جاري التحقق من رمز الدعوة...</p>
          </div>
        )}
      </div>
    </div>
  );
}
