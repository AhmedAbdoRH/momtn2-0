
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Check, Mail } from 'lucide-react';

const VerifyEmailPage = () => {
  const { user, signOut, isEmailConfirmed } = useAuth();
  const [resending, setResending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  
  // Check for email confirmation periodically
  useEffect(() => {
    if (isEmailConfirmed) {
      toast.success("تم تأكيد بريدك الإلكتروني بنجاح!");
      // Redirect to home page after email confirmation
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);
    }
    
    if (!isEmailConfirmed && user) {
      const interval = setInterval(async () => {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.email_confirmed_at) {
          window.location.reload();
        }
      }, 5000); // Check every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [isEmailConfirmed, navigate, user]);
  
  const handleResendEmail = async () => {
    if (!user?.email) {
      toast.error("لا يمكن إرسال رسالة التأكيد، يرجى تسجيل الدخول مرة أخرى");
      return;
    }
    
    setResending(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error("Error resending email:", error);
        toast.error(`فشل في إرسال رسالة التأكيد: ${error.message}`);
        uiToast({
          variant: "destructive",
          title: "حدث خطأ",
          description: "فشل في إرسال رسالة التأكيد، يرجى المحاولة مرة أخرى لاحقًا",
        });
      } else {
        toast.success("تم إرسال رسالة التأكيد بنجاح");
        uiToast({
          title: "تم الإرسال",
          description: "تم إرسال رسالة التأكيد، يرجى التحقق من بريدك الإلكتروني",
        });
      }
    } catch (error: any) {
      console.error("Error resending email:", error);
      toast.error("حدث خطأ أثناء إرسال رسالة التأكيد");
    } finally {
      setResending(false);
    }
  };
  
  const handleRefreshStatus = async () => {
    setRefreshing(true);
    
    try {
      await supabase.auth.refreshSession();
      const { data } = await supabase.auth.getUser();
      
      if (data?.user?.email_confirmed_at) {
        toast.success("تم تأكيد بريدك الإلكتروني بنجاح!");
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      } else {
        toast.info("لم يتم تأكيد البريد الإلكتروني بعد");
      }
    } catch (error) {
      console.error("Error refreshing status:", error);
      toast.error("حدث خطأ أثناء تحديث الحالة");
    } finally {
      setRefreshing(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D1F3D] via-[#1A1F2C] to-[#3D1F2C] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-gray-900/60 backdrop-blur-xl p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="inline-block mb-6 w-32 h-32">
            <img
              src="/lovable-uploads/f39108e3-15cc-458c-bb92-7e6b18e100cc.png"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-white">تأكيد البريد الإلكتروني</h2>
          <p className="mt-2 text-gray-400">
            {isEmailConfirmed 
              ? "تم تأكيد بريدك الإلكتروني بنجاح! جاري توجيهك للتطبيق..." 
              : "يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك"}
          </p>
        </div>
        
        {isEmailConfirmed ? (
          <div className="bg-green-900/30 border border-green-500/30 p-6 rounded-xl">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-white text-lg font-medium">تم تأكيد بريدك الإلكتروني بنجاح!</p>
              <p className="text-gray-400">سيتم توجيهك إلى التطبيق تلقائيًا...</p>
            </div>
          </div>
        ) : (
          <>
            <Alert className="bg-blue-900/20 border border-blue-500/30">
              <Mail className="h-5 w-5 text-blue-400" />
              <AlertTitle className="text-blue-300">تم إرسال رسالة تأكيد</AlertTitle>
              <AlertDescription className="text-gray-400">
                لقد أرسلنا رسالة تأكيد إلى بريدك الإلكتروني: <span className="font-bold text-blue-300 block mt-1 text-sm">{user?.email}</span>
                يرجى النقر على الرابط في البريد الإلكتروني لتأكيد حسابك.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <Button 
                onClick={handleResendEmail} 
                disabled={resending} 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {resending ? 'جاري إعادة الإرسال...' : 'إعادة إرسال رسالة التأكيد'}
              </Button>
              
              <Button
                onClick={handleRefreshStatus}
                disabled={refreshing}
                variant="outline"
                className="w-full bg-transparent border-indigo-500/30 text-indigo-300 hover:bg-indigo-950/30 hover:text-indigo-200"
              >
                {refreshing ? 'جاري التحديث...' : 'تحديث الحالة'}
              </Button>
              
              <Button
                onClick={() => signOut()}
                variant="outline"
                className="w-full bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                تسجيل الخروج
              </Button>
            </div>
            
            <div className="text-center text-sm text-gray-500 mt-4">
              <p>لم تستلم البريد الإلكتروني؟ تأكد من مجلد البريد العشوائي (spam) أو انقر على زر "إعادة إرسال رسالة التأكيد"</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
