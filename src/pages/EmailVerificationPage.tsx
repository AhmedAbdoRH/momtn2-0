
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

const EmailVerificationPage = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  const { user, isEmailVerified } = useAuth();
  
  // Fixed verification code
  const FIXED_CODE = "1490";

  // Redirect if already verified
  if (isEmailVerified) {
    navigate("/");
    return null;
  }

  // Redirect if not logged in
  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleVerify = async () => {
    if (verificationCode === FIXED_CODE) {
      setIsVerifying(true);
      
      try {
        // Get current user
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

        // Set custom user metadata to mark email as verified
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
        
        // Redirect to the main page after successful verification
        navigate("/");
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
    // In a real system, this would send a new email with the code
    // For now, we'll just show a toast message
    uiToast({
      title: "تم إرسال الرمز",
      description: "تم إرسال رمز التحقق إلى بريدك الإلكتروني",
    });
    toast.success("تم إرسال رمز التحقق (1490) إلى بريدك الإلكتروني");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D1F3D] via-[#1A1F2C] to-[#3D1F2C] flex items-center justify-center p-4">
      <div className="glass-effect p-8 w-full max-w-md rounded-xl bg-gray-900/60 backdrop-blur-xl shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">التحقق من البريد الإلكتروني</h2>
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
      </div>
    </div>
  );
};

export default EmailVerificationPage;
