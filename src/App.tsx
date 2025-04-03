
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
import { toast } from "sonner";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Component to handle auth callback and refresh session
const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const processCallback = async () => {
      // Check if there's an error in the URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const errorCode = hashParams.get('error_code');
      const errorMessage = hashParams.get('error_description');
      
      if (errorCode) {
        console.error(`Auth error: ${errorCode} - ${errorMessage}`);
        setError(errorMessage || 'حدث خطأ أثناء التحقق من البريد الإلكتروني');
        
        if (errorCode === 'otp_expired') {
          toast.error('رابط التأكيد منتهي الصلاحية. يرجى طلب رابط جديد.');
          setTimeout(() => {
            window.location.href = '/verify-email';
          }, 1500);
          return;
        }
      }
      
      // Refresh the session after processing the auth callback
      try {
        const { error } = await supabase.auth.refreshSession();
        if (error) throw error;
        
        // Clear any URL fragments
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }
        
        // Get the fresh session
        const { data } = await supabase.auth.getSession();
        
        // Check if email is confirmed
        if (data.session?.user?.email_confirmed_at) {
          toast.success('تم تأكيد بريدك الإلكتروني بنجاح!');
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        } else {
          // If still not confirmed, go to verification page
          setTimeout(() => {
            window.location.href = '/verify-email';
          }, 1000);
        }
      } catch (error: any) {
        console.error("Error refreshing session:", error);
        setError(error.message || 'حدث خطأ أثناء تحديث الجلسة');
        toast.error('حدث خطأ أثناء تحديث الجلسة');
      }
    };

    processCallback();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold mb-4">حدث خطأ</h2>
          <p className="mb-6">{error}</p>
          <button 
            onClick={() => window.location.href = '/verify-email'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            العودة إلى صفحة التحقق
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
        <p>جاري التحقق من بريدك الإلكتروني...</p>
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
