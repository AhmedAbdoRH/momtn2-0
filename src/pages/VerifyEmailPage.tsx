
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, MailCheck, Check } from 'lucide-react';

const VerifyEmailPage = () => {
  const { user, signOut, isEmailConfirmed } = useAuth();
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already confirmed
    if (isEmailConfirmed) {
      setVerifying(false);
      return;
    }

    // Check verification status periodically
    const checkEmailConfirmation = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Error checking user:", error);
          return;
        }
        
        if (data.user?.email_confirmed_at) {
          // Email is confirmed, refresh page or redirect
          uiToast({
            title: "تم التأكيد",
            description: "تم تأكيد بريدك الإلكتروني بنجاح!",
          });
          window.location.href = '/';
        }
      } catch (err) {
        console.error("Error checking email confirmation:", err);
      }
    };
    
    // Check immediately
    checkEmailConfirmation();
    
    // Then set up an interval to check periodically
    const interval = setInterval(checkEmailConfirmation, 5000);
    setVerifying(false);
    
    return () => clearInterval(interval);
  }, [user, isEmailConfirmed, uiToast]);
  
  const handleResendEmail = async () => {
    if (!user?.email) {
      setError("لا يمكن إرسال رسالة التأكيد، يرجى تسجيل الدخول مرة أخرى");
      toast.error("لا يمكن إرسال رسالة التأكيد، يرجى تسجيل الدخول مرة أخرى");
      return;
    }
    
    setResending(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        setError(`فشل في إرسال رسالة التأكيد: ${error.message}`);
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
      setError("حدث خطأ أثناء إرسال رسالة التأكيد");
      toast.error("حدث خطأ أثناء إرسال رسالة التأكيد");
    } finally {
      setResending(false);
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
              ? "تم تأكيد بريدك الإلكتروني بنجاح! يمكنك الآن استخدام التطبيق" 
              : "يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك"}
          </p>
        </div>
        
        <div className="space-y-6 mt-8">
          {verifying && (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {!isEmailConfirmed && !verifying && (
            <>
              <div className="bg-gray-800/50 p-6 rounded-xl">
                <div className="flex justify-center mb-4">
                  <Mail className="h-16 w-16 text-indigo-400" />
                </div>
                <p className="text-white text-center leading-relaxed">
                  لقد أرسلنا رسالة تأكيد إلى:
                  <br />
                  <span className="font-bold text-indigo-300 block mt-2">{user?.email}</span>
                  <br />
                  يرجى النقر على الرابط في البريد الإلكتروني لتأكيد حسابك
                </p>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={handleResendEmail} 
                  disabled={resending} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center"
                >
                  {resending ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                      جاري إعادة الإرسال...
                    </>
                  ) : (
                    <>
                      <MailCheck className="mr-2 h-5 w-5" />
                      إعادة إرسال رسالة التأكيد
                    </>
                  )}
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
          
          {isEmailConfirmed && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="bg-green-500/20 p-4 rounded-full">
                  <Check className="h-16 w-16 text-green-500" />
                </div>
              </div>
              <p className="text-center text-white text-lg">تم تأكيد بريدك الإلكتروني بنجاح!</p>
              <Button 
                onClick={() => navigate('/')} 
                className="w-full bg-green-600 hover:bg-green-700"
              >
                الذهاب إلى التطبيق
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
