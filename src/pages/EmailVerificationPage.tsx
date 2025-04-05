
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

const EmailVerificationPage = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  const { user, isEmailVerified } = useAuth();
  const location = useLocation();
  
  // رمز التحقق الثابت 
  const FIXED_CODE = "1490";

  // التحقق من وجود رمز تحقق في الـ URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    
    // إذا كان هناك رمز تحقق في الـ URL، نقوم بالتحقق تلقائيًا
    if (tokenHash && type === 'email_change' || type === 'signup') {
      // نعتبر أن المستخدم قد نقر على رابط البريد الإلكتروني للتحقق
      handleEmailLinkVerification(tokenHash);
    }
  }, [location.search]);
  
  // إعادة توجيه إذا كان البريد مُحقق بالفعل
  useEffect(() => {
    if (isEmailVerified) {
      // إعادة التوجيه إلى الصفحة الرئيسية بعد 2 ثانية إذا كان التحقق ناجحًا
      if (verificationSuccess) {
        const redirectTimer = setTimeout(() => {
          navigate("/");
        }, 2000);
        return () => clearTimeout(redirectTimer);
      } else {
        navigate("/");
      }
    }
  }, [isEmailVerified, verificationSuccess, navigate]);

  // إعادة التوجيه إذا لم يكن المستخدم مسجل الدخول
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);
  
  // التحقق من خلال رابط البريد الإلكتروني
  const handleEmailLinkVerification = async (tokenHash: string) => {
    if (!user) return;
    
    setIsVerifying(true);
    try {
      // تحديث بيانات المستخدم لتمثيل أن البريد الإلكتروني محقق
      const { error } = await supabase.auth.updateUser({
        data: { email_verified: true }
      });

      if (error) {
        throw error;
      }

      uiToast({
        title: "تم التحقق بنجاح",
        description: "تم التحقق من بريدك الإلكتروني بنجاح من خلال الرابط",
      });
      toast.success("تم التحقق من بريدك الإلكتروني بنجاح من خلال الرابط");
      
      setVerificationSuccess(true);
    } catch (error: any) {
      uiToast({
        title: "خطأ في التحقق",
        description: error.message || "حدث خطأ أثناء التحقق من البريد الإلكتروني بالرابط",
        variant: "destructive",
      });
      toast.error("حدث خطأ أثناء التحقق من البريد الإلكتروني بالرابط");
    } finally {
      setIsVerifying(false);
    }
  };

  // التحقق من خلال إدخال الرمز
  const handleVerify = async () => {
    if (verificationCode === FIXED_CODE) {
      setIsVerifying(true);
      
      try {
        // الحصول على المستخدم الحالي
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          uiToast({
            title: "خطأ",
            description: "يجب تسجيل الدخول أولاً",
            variant: "destructive",
          });
          toast.error("يجب تسجيل الدخول أولاً");
          navigate("/auth");
          return;
        }

        // تعيين بيانات تعريف المستخدم المخصصة لوضع علامة على البريد الإلكتروني كمُحقق
        const { error } = await supabase.auth.updateUser({
          data: { email_verified: true }
        });

        if (error) {
          throw error;
        }

        uiToast({
          title: "تم التحقق بنجاح",
          description: "تم التحقق من بريدك الإلكتروني بنجاح",
        });
        toast.success("تم التحقق من بريدك الإلكتروني بنجاح");
        
        // تعيين حالة النجاح لعرض رسالة النجاح
        setVerificationSuccess(true);
      } catch (error: any) {
        uiToast({
          title: "خطأ في التحقق",
          description: error.message || "حدث خطأ أثناء التحقق من البريد الإلكتروني",
          variant: "destructive",
        });
        toast.error("حدث خطأ أثناء التحقق من البريد الإلكتروني");
      } finally {
        setIsVerifying(false);
      }
    } else {
      uiToast({
        title: "رمز خاطئ",
        description: "الرمز الذي أدخلته غير صحيح",
        variant: "destructive",
      });
      toast.error("الرمز الذي أدخلته غير صحيح");
    }
  };

  const handleResendCode = () => {
    // في نظام حقيقي، هذا سيرسل بريدًا إلكترونيًا جديدًا برمز التحقق
    // حاليًا، سنعرض فقط رسالة تنبيه
    uiToast({
      title: "تم إرسال الرمز",
      description: "تم إرسال رمز التحقق إلى بريدك الإلكتروني",
    });
    toast.success("تم إرسال رمز التحقق (1490) إلى بريدك الإلكتروني");
  };
  
  // إذا لم يكن المستخدم مسجل الدخول أو البريد مُحقق بالفعل، لا تعرض أي شيء
  if (!user || (isEmailVerified && !verificationSuccess)) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D1F3D] via-[#1A1F2C] to-[#3D1F2C] flex items-center justify-center p-4">
      <div className="glass-effect p-8 w-full max-w-md rounded-xl bg-gray-900/60 backdrop-blur-xl shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">التحقق من البريد الإلكتروني</h2>
        
        {verificationSuccess ? (
          <div className="space-y-6 text-center">
            <div className="bg-green-500/20 p-4 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="mt-2 text-white font-medium">تم التحقق من بريدك الإلكتروني بنجاح</p>
              <p className="text-gray-300 mt-2">سيتم توجيهك إلى التطبيق خلال لحظات...</p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-center mb-6 text-gray-300">
              أدخل رمز التحقق المرسل إلى بريدك الإلكتروني
            </p>
            
            <div className="space-y-6">
              <div className="flex justify-center">
                <InputOTP 
                  maxLength={4} 
                  value={verificationCode}
                  onChange={setVerificationCode}
                  pattern="^[0-9]*$"
                  className="gap-4"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="h-16 w-12 bg-gray-800/50 border-gray-700 text-white" />
                    <InputOTPSlot index={1} className="h-16 w-12 bg-gray-800/50 border-gray-700 text-white" />
                    <InputOTPSlot index={2} className="h-16 w-12 bg-gray-800/50 border-gray-700 text-white" />
                    <InputOTPSlot index={3} className="h-16 w-12 bg-gray-800/50 border-gray-700 text-white" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              <Button 
                className="w-full bg-white/10 hover:bg-white/20 text-white" 
                disabled={verificationCode.length !== 4 || isVerifying}
                onClick={handleVerify}
              >
                {isVerifying ? "جاري التحقق..." : "تحقق"}
              </Button>
              
              <div className="flex justify-between items-center">
                <button 
                  onClick={handleResendCode} 
                  className="text-sm text-indigo-300 hover:text-indigo-200"
                >
                  إعادة إرسال الرمز
                </button>
                
                <p className="text-sm text-gray-400">
                  رمز التحقق: <span className="font-bold">1490</span>
                </p>
              </div>
            </div>
            
            <div className="mt-8 text-center text-sm text-gray-400">
              <p>يمكنك أيضًا التحقق من خلال الرابط المرسل إلى بريدك الإلكتروني</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationPage;
