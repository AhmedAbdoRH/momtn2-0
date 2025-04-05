
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const EmailVerificationPage = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fixed verification code
  const FIXED_CODE = "1490";

  const handleVerify = async () => {
    if (verificationCode === FIXED_CODE) {
      setIsVerifying(true);
      
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "خطأ",
            description: "يجب تسجيل الدخول أولاً",
            variant: "destructive",
          });
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

        toast({
          title: "تم التحقق بنجاح",
          description: "تم التحقق من بريدك الإلكتروني بنجاح",
        });
        
        // Redirect to the main page after successful verification
        navigate("/");
      } catch (error: any) {
        toast({
          title: "خطأ في التحقق",
          description: error.message || "حدث خطأ أثناء التحقق من البريد الإلكتروني",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    } else {
      toast({
        title: "رمز خاطئ",
        description: "الرمز الذي أدخلته غير صحيح",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D1F3D] via-[#1A1F2C] to-[#3D1F2C] flex items-center justify-center p-4">
      <div className="glass-effect p-8 w-full max-w-md rounded-xl">
        <h2 className="text-2xl font-bold text-center mb-6">التحقق من البريد الإلكتروني</h2>
        <p className="text-center mb-6">
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
          
          <p className="text-sm text-center">
            ملاحظة: رمز التحقق الخاص بك هو <span className="font-bold">1490</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
