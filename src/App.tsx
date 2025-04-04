
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import { AuthProvider } from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Auth callback handler component
const AuthCallback = () => {
  const [message, setMessage] = useState("جاري التحقق من البريد الإلكتروني...");
  
  useEffect(() => {
    // Handle the OAuth or email confirmation redirect
    const handleAuthRedirect = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth redirect error:", error);
        setMessage("حدث خطأ أثناء التحقق من البريد الإلكتروني");
      } else if (data?.session) {
        // Successful auth, redirect to home or verify page based on email confirmation
        const emailConfirmed = data.session.user.email_confirmed_at != null;
        window.location.href = emailConfirmed ? "/" : "/verify-email";
      } else {
        // No session, could be an error or link expired
        console.log("No session found after auth redirect");
        setMessage("انتهت صلاحية الرابط أو حدث خطأ، يرجى المحاولة مرة أخرى");
        setTimeout(() => {
          window.location.href = "/auth";
        }, 3000);
      }
    };
    
    handleAuthRedirect();
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D1F3D] via-[#1A1F2C] to-[#3D1F2C] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900/60 backdrop-blur-xl p-8 rounded-2xl shadow-xl text-center">
        <div className="animate-pulse mb-4">
          <div className="h-12 w-12 mx-auto rounded-full bg-indigo-500/30"></div>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">{message}</h2>
      </div>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
