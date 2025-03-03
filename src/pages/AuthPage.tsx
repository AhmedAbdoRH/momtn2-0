
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // استخراج صفحة العودة من state
  const returnUrl = location.state?.returnUrl || '/';

  // إعادة توجيه المستخدم إذا كان مسجل دخوله بالفعل
  useEffect(() => {
    if (user) {
      navigate(returnUrl);
    }
  }, [user, navigate, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: "يمكنك الآن تسجيل الدخول باستخدام بياناتك",
        });
        setIsLogin(true); // التبديل إلى نموذج تسجيل الدخول بعد التسجيل
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast({
        title: isLogin ? "خطأ في تسجيل الدخول" : "خطأ في إنشاء الحساب",
        description: error.message || "حدث خطأ أثناء المصادقة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D1F3D] via-[#1A1F2C] to-[#3D1F2C] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900/60 backdrop-blur-xl text-white border-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {isLogin 
              ? "قم بتسجيل الدخول للوصول إلى مساحات الامتنان" 
              : "أنشئ حسابًا جديدًا للبدء في استخدام امتنان"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium block text-right">
                البريد الإلكتروني
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="أدخل بريدك الإلكتروني"
                className="bg-white/10 backdrop-blur-sm text-white border-gray-700 focus:border-[#ea384c]"
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium block text-right">
                كلمة المرور
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="أدخل كلمة المرور"
                className="bg-white/10 backdrop-blur-sm text-white border-gray-700 focus:border-[#ea384c]"
                dir="rtl"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-[#ea384c] hover:bg-[#ea384c]/90"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري التحميل...
                </span>
              ) : isLogin ? "تسجيل الدخول" : "إنشاء حساب" }
            </Button>
            <Button 
              type="button"
              variant="link" 
              className="w-full text-gray-400 hover:text-white"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin 
                ? "ليس لديك حساب؟ أنشئ حسابًا جديدًا" 
                : "لديك حساب بالفعل؟ سجل دخولك"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AuthPage;
