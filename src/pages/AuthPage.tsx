
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';

const AuthPage = () => {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      let error;
      
      if (mode === 'signIn') {
        const result = await signIn(email, password);
        error = result.error;
      } else {
        const result = await signUp(email, password);
        error = result.error;
        
        if (!error) {
          toast({
            title: "تم إنشاء الحساب بنجاح",
            description: "يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب",
          });
        }
      }
      
      if (error) {
        toast({
          variant: "destructive",
          title: "حدث خطأ",
          description: error.message || "فشل في عملية التسجيل",
        });
      }
    } finally {
      setLoading(false);
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
          <h2 className="text-2xl font-bold text-white">
            {mode === 'signIn' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </h2>
          <p className="mt-2 text-gray-400">
            {mode === 'signIn' ? 'قم بتسجيل الدخول للوصول إلى حسابك' : 'أنشئ حسابًا جديدًا للبدء'}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                البريد الإلكتروني
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none bg-gray-800/50 backdrop-blur-sm relative block w-full px-3 py-3 border border-gray-700 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="البريد الإلكتروني"
                dir="rtl"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                كلمة المرور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none bg-gray-800/50 backdrop-blur-sm relative block w-full px-3 py-3 border border-gray-700 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="كلمة المرور"
                dir="rtl"
              />
            </div>
          </div>
  
          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-lg"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري التحميل...
                </span>
              ) : (
                mode === 'signIn' ? 'تسجيل الدخول' : 'إنشاء حساب'
              )}
            </Button>
          </div>
  
          <div className="text-center">
            <button
              type="button"
              onClick={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
              className="font-medium text-indigo-300 hover:text-indigo-200"
            >
              {mode === 'signIn'
                ? 'ليس لديك حساب؟ سجل الآن'
                : 'لديك حساب بالفعل؟ تسجيل الدخول'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
