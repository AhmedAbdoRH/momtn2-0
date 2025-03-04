
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';

const AuthPage = () => {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Validate username when it changes
  useEffect(() => {
    const checkUsername = async () => {
      if (!username || mode !== 'signUp') return;
      
      // Clear previous errors
      setUsernameError('');

      // Check for spaces and special characters
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setUsernameError('اسم المستخدم يجب أن يحتوي على أحرف وأرقام وشرطات سفلية فقط');
        return;
      }

      // Check if username exists in database
      setIsCheckingUsername(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      setIsCheckingUsername(false);
      
      if (data) {
        setUsernameError('اسم المستخدم مستخدم بالفعل');
      }
    };

    const debounceTimer = setTimeout(checkUsername, 500);
    return () => clearTimeout(debounceTimer);
  }, [username, mode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      let error;
      
      if (mode === 'signIn') {
        const result = await signIn(email, password);
        error = result.error;
      } else {
        // Validate username once more before signup
        if (usernameError || !username) {
          setLoading(false);
          toast({
            variant: "destructive",
            title: "خطأ في اسم المستخدم",
            description: usernameError || "يرجى إدخال اسم مستخدم صالح",
          });
          return;
        }
        
        const result = await signUp(email, password, { username });
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

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "حدث خطأ",
          description: error.message || "فشل في تسجيل الدخول بواسطة جوجل",
        });
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: "فشل في تسجيل الدخول بواسطة جوجل",
      });
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
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800/50 backdrop-blur-sm border-gray-700 placeholder-gray-500 text-white"
                placeholder="البريد الإلكتروني"
                dir="rtl"
              />
            </div>
            
            {mode === 'signUp' && (
              <div>
                <label htmlFor="username" className="sr-only">
                  اسم المستخدم
                </label>
                <div className="relative">
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`bg-gray-800/50 backdrop-blur-sm border-gray-700 placeholder-gray-500 text-white ${usernameError ? 'border-red-500' : ''}`}
                    placeholder="اسم المستخدم (بدون مسافات)"
                    dir="rtl"
                  />
                  {isCheckingUsername && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </div>
                {usernameError && (
                  <p className="mt-1 text-sm text-red-500 text-right" dir="rtl">{usernameError}</p>
                )}
                <p className="mt-1 text-sm text-gray-500 text-right" dir="rtl">
                  يمكنك استخدام الأحرف والأرقام والشرطات السفلية فقط
                </p>
              </div>
            )}
            
            <div>
              <label htmlFor="password" className="sr-only">
                كلمة المرور
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800/50 backdrop-blur-sm border-gray-700 placeholder-gray-500 text-white"
                placeholder="كلمة المرور"
                dir="rtl"
              />
            </div>
          </div>
  
          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-lg"
              disabled={loading || (mode === 'signUp' && (!!usernameError || isCheckingUsername))}
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900/60 text-gray-400">
                أو
              </span>
            </div>
          </div>

          <div>
            <Button
              type="button"
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-gray-800 rounded-lg hover:bg-gray-100"
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              التسجيل باستخدام جوجل
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
