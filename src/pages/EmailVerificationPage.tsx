
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/components/AuthProvider";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast as sonnerToast } from "sonner";

const EmailVerificationPage = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [generatedCode, setGeneratedCode] = useState(() => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  });

  useEffect(() => {
    if (!user) {
      console.log("No user found, redirecting to auth page");
      navigate('/auth');
      return;
    }

    console.log("Email verification page loaded for user:", user.email);
    
    // Send verification code immediately when page loads, but only once
    if (user && !user.user_metadata?.email_verified && !emailSent) {
      console.log("User is not verified, sending verification code automatically");
      handleSendCode();
    } else if (user.user_metadata?.email_verified) {
      console.log("User is already verified, redirecting to home");
      navigate('/');
    }
  }, [user, emailSent]);

  useEffect(() => {
    let timer: number | undefined;
    
    if (countdown > 0) {
      timer = window.setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const handleVerify = async () => {
    if (verificationCode === generatedCode) {
      setIsVerifying(true);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "خطأ",
            description: "يجب تسجيل الدخول أولاً",
            variant: "destructive",
          });
          sonnerToast.error("يجب تسجيل الدخول أولاً");
          navigate("/auth");
          return;
        }

        console.log("Verifying user email for:", user.email);
        const { error } = await supabase.auth.updateUser({
          data: { email_verified: true }
        });

        if (error) {
          throw error;
        }

        toast({
          title: "تم التحقق بنجاح",
          description: "تم التحقق من بريدك الإلكتروني بنجاح",
        });
        
        sonnerToast.success("تم التحقق من بريدك الإلكتروني بنجاح");
        
        navigate("/");
      } catch (error: any) {
        console.error("Error during verification:", error);
        toast({
          title: "خطأ في التحقق",
          description: error.message || "حدث خطأ أثناء التحقق من البريد الإلكتروني",
          variant: "destructive",
        });
        sonnerToast.error("خطأ في التحقق: " + (error.message || "حدث خطأ أثناء التحقق من البريد الإلكتروني"));
      } finally {
        setIsVerifying(false);
      }
    } else {
      toast({
        title: "رمز خاطئ",
        description: "الرمز الذي أدخلته غير صحيح",
        variant: "destructive",
      });
      sonnerToast.error("الرمز الذي أدخلته غير صحيح");
    }
  };

  const handleSendCode = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    try {
      if (!user || !user.email) {
        throw new Error("لا يوجد مستخدم مسجل الدخول");
      }
      
      const newCode = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedCode(newCode);
      
      console.log("Sending verification code to:", user.email, "Code:", newCode);
      
      const { error, data } = await supabase.functions.invoke('send-verification-email', {
        body: { 
          email: user.email,
          code: newCode
        }
      });
      
      console.log("Edge function response:", data, error);
      
      if (error) throw error;
      
      setCountdown(60);
      setEmailSent(true);
      
      toast({
        title: "تم إرسال الرمز",
        description: `تم إرسال رمز التحقق إلى بريدك الإلكتروني: ${user.email}`,
      });
      
      sonnerToast.success(`تم إرسال رمز التحقق إلى: ${user.email}`);
    } catch (error: any) {
      console.error("Error sending verification email:", error);
      toast({
        title: "خطأ في الإرسال",
        description: error.message || "حدث خطأ أثناء إرسال رمز التحقق",
        variant: "destructive",
      });
      
      sonnerToast.error("خطأ في إرسال رمز التحقق: " + (error.message || "حدث خطأ غير معروف"));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D1F3D] via-[#1A1F2C] to-[#3D1F2C] flex items-center justify-center p-4">
      <div className="glass-effect p-8 w-full max-w-md rounded-xl">
        <h2 className="text-2xl font-bold text-center mb-6">التحقق من البريد الإلكتروني</h2>
        <p className="text-center mb-6">
          أدخل رمز التحقق المرسل إلى بريدك الإلكتروني {user?.email}
        </p>
        
        {import.meta.env.DEV && (
          <Alert className="mb-6 bg-amber-100 border-amber-300 text-amber-800">
            <AlertTitle className="mb-2">ملاحظة (وضع التطوير فقط)</AlertTitle>
            <AlertDescription>
              رمز التحقق الحالي هو: <span className="font-bold">{generatedCode}</span>
            </AlertDescription>
          </Alert>
        )}
        
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
                <InputOTPSlot index={0} className="h-16 w-12" />
                <InputOTPSlot index={1} className="h-16 w-12" />
                <InputOTPSlot index={2} className="h-16 w-12" />
                <InputOTPSlot index={3} className="h-16 w-12" />
              </InputOTPGroup>
            </InputOTP>
          </div>
          
          <Button 
            className="w-full" 
            disabled={verificationCode.length !== 4 || isVerifying}
            onClick={handleVerify}
          >
            {isVerifying ? "جاري التحقق..." : "تحقق"}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleSendCode} 
            disabled={countdown > 0 || isResending}
          >
            {countdown > 0 
              ? `إعادة الإرسال (${countdown})`
              : isResending 
                ? "جاري إعادة الإرسال..."
                : "إعادة إرسال رمز التحقق"
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
