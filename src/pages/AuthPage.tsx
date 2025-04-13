// تعديل حجم اللوجو في صفحة تسجيل الدخول
// نعدل فقط الأجزاء المتعلقة بحجم اللوجو

import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignUp = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sign up successful",
        description: "Please check your email to verify your account.",
      });
      navigate("/");
    }
    setIsLoading(false);
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sign in successful",
        description: "You are now signed in.",
      });
      navigate("/");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-gradient-to-b from-[#2D1F3D] via-[#1A1F2C] to-[#3D1F2C]">
      <div className="w-full max-w-md bg-black/30 backdrop-blur-md p-8 rounded-xl shadow-lg border border-white/10">
        <div className="text-center mb-6">
          <div className="flex justify-center">
            {/* هنا قمنا بتصغير حجم اللوجو */}
            <img
              src="/lovable-Uploads/f39108e3-15cc-458c-bb92-7e6b18e100cc.png"
              alt="Logo"
              className="h-24 w-24 object-contain mb-2" // تم تقليل الحجم من 32 إلى 24
            />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isSigningUp ? "إنشاء حساب جديد" : "تسجيل الدخول"}
          </h2>
          <p className="text-gray-300 text-sm">
            {isSigningUp
              ? "أنشئ حسابًا جديدًا للاستمتاع بجميع المزايا"
              : "قم بتسجيل الدخول للوصول إلى حسابك"}
          </p>
        </div>
        <form onSubmit={(e) => {
            e.preventDefault();
            isSigningUp ? handleSignUp() : handleSignIn();
          }} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-gray-300 text-sm font-bold mb-2 text-right"
            >
              البريد الإلكتروني
            </label>
            <Input
              type="email"
              id="email"
              placeholder="أدخل بريدك الإلكتروني"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-right"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-gray-300 text-sm font-bold mb-2 text-right"
            >
              كلمة المرور
            </label>
            <Input
              type="password"
              id="password"
              placeholder="أدخل كلمة المرور"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-right"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Button
              className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 mr-3"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                isSigningUp ? "إنشاء حساب" : "تسجيل الدخول"
              )}
            </Button>
            <button
              type="button"
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              onClick={() => setIsSigningUp(!isSigningUp)}
            >
              {isSigningUp ? "هل لديك حساب؟ تسجيل الدخول" : "ليس لديك حساب؟ إنشاء حساب"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
