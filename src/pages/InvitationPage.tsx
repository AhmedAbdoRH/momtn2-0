
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useSpaces } from '@/components/spaces/SpaceContext';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const InvitationPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { acceptInvitation } = useSpaces();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // إذا لم يكن هناك رمز، نعرض خطأ
    if (!token) {
      setError("رمز الدعوة غير صالح");
      return;
    }

    // إذا كان المستخدم مسجل دخوله، نقوم بمعالجة الدعوة تلقائيًا
    if (user && !authLoading && token && !processing && !success && !error) {
      console.log("User is logged in, accepting invitation automatically");
      handleAcceptInvitation();
    }
  }, [user, authLoading, token]);

  const handleAcceptInvitation = async () => {
    if (!token || !user) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      console.log("Accepting invitation for token:", token);
      
      const result = await acceptInvitation(token);
      console.log("Invitation acceptance result:", result);
      
      if (result.success) {
        setSuccess(true);
        toast({
          title: "تم قبول الدعوة",
          description: "تم الانضمام إلى المساحة المشتركة بنجاح",
        });
        
        // انتظر قليلاً ثم انتقل إلى المساحة المشتركة
        setTimeout(() => {
          if (result.spaceId) {
            navigate(`/spaces/${result.spaceId}`);
          } else {
            navigate('/spaces');
          }
        }, 2000);
      } else {
        console.error("Error in accepting invitation:", result.message);
        setError(result.message || "حدث خطأ أثناء قبول الدعوة");
      }
    } catch (err: any) {
      console.error("Exception in accepting invitation:", err);
      setError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setProcessing(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2D1F3D] via-[#1A1F2C] to-[#3D1F2C] flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 bg-gray-900/60 backdrop-blur-xl rounded-xl shadow-lg text-white border border-gray-800">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">رمز الدعوة غير صالح</h1>
            <p className="text-gray-400 mt-2">لم يتم العثور على رمز الدعوة في الرابط</p>
          </div>
          <Button variant="default" className="w-full bg-[#ea384c] hover:bg-[#ea384c]/90" asChild>
            <Link to="/spaces">العودة إلى المساحات المشتركة</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2D1F3D] via-[#1A1F2C] to-[#3D1F2C] flex items-center justify-center">
        <div className="text-white text-xl">جاري التحميل...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2D1F3D] via-[#1A1F2C] to-[#3D1F2C] flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 bg-gray-900/60 backdrop-blur-xl rounded-xl shadow-lg text-white border border-gray-800">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">دعوة للانضمام إلى مساحة مشتركة</h1>
            <p className="text-gray-400 mt-2">يجب تسجيل الدخول أولاً لقبول هذه الدعوة</p>
          </div>
          <Button variant="default" className="w-full bg-[#ea384c] hover:bg-[#ea384c]/90" asChild>
            <Link to={`/auth?returnUrl=${encodeURIComponent(`/invitation?token=${token}`)}`}>تسجيل الدخول</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D1F3D] via-[#1A1F2C] to-[#3D1F2C] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8 bg-gray-900/60 backdrop-blur-xl rounded-xl shadow-lg text-white border border-gray-800">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">
            {success 
              ? "تم قبول الدعوة" 
              : error 
                ? "خطأ في قبول الدعوة" 
                : "دعوة للانضمام إلى مساحة مشتركة"}
          </h1>
          <p className="text-gray-400 mt-2">
            {success 
              ? "تم الانضمام إلى المساحة المشتركة بنجاح" 
              : error 
                ? error 
                : "جاري معالجة دعوة الانضمام..."}
          </p>
        </div>
        
        {success ? (
          <Button variant="default" className="w-full bg-[#ea384c] hover:bg-[#ea384c]/90" asChild>
            <Link to="/spaces">الذهاب إلى المساحات المشتركة</Link>
          </Button>
        ) : error ? (
          <div className="space-y-4">
            <Button variant="outline" className="w-full bg-transparent border-gray-700 text-white hover:bg-gray-800" asChild>
              <Link to="/spaces">العودة إلى المساحات المشتركة</Link>
            </Button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ea384c]"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationPage;
