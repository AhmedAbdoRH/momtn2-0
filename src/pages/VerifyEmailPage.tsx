
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';

const VerifyEmailPage = () => {
  const { user, signOut, resendConfirmationEmail, isEmailConfirmed } = useAuth();
  const [resending, setResending] = useState(false);
  const { toast: uiToast } = useToast();
  
  const handleResendEmail = async () => {
    if (!user?.email) {
      toast.error("لا يمكن إرسال رسالة التأكيد، يرجى تسجيل الدخول مرة أخرى");
      return;
    }
    
    setResending(true);
    
    try {
      const { error } = await resendConfirmationEmail(user.email);
      
      if (error) {
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
    } catch (error) {
      console.error("Error resending email:", error);
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
          {!isEmailConfirmed && (
            <>
              <div className="bg-gray-800/50 p-6 rounded-xl">
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
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {resending ? 'جاري إعادة الإرسال...' : 'إعادة إرسال رسالة التأكيد'}
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
            <Button 
              onClick={() => window.location.href = '/'} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              الذهاب إلى التطبيق
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
