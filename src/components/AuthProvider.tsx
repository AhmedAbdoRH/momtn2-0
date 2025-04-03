
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  isEmailConfirmed: boolean;
  resendConfirmationEmail: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("Setting up auth listener...");
    
    // First set up the auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.email);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log("User signed in or token refreshed");
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          // Check if email is confirmed
          const emailConfirmed = newSession?.user?.email_confirmed_at != null;
          setIsEmailConfirmed(emailConfirmed);
          
          console.log("Email confirmed:", emailConfirmed);
          
          // Redirect based on confirmation status
          if (newSession) {
            if (!emailConfirmed && newSession.user.email && 
                !['/auth', '/verify-email', '/auth/callback'].includes(location.pathname)) {
              console.log("Redirecting to email verification page");
              navigate('/verify-email');
            } else if (emailConfirmed && location.pathname === '/auth') {
              navigate('/');
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out");
          setSession(null);
          setUser(null);
          setIsEmailConfirmed(false);
          navigate('/auth');
        } else if (event === 'USER_UPDATED') {
          console.log("User updated");
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          // Re-check email confirmation status on update
          const emailConfirmed = newSession?.user?.email_confirmed_at != null;
          setIsEmailConfirmed(emailConfirmed);
          
          if (emailConfirmed && location.pathname === '/verify-email') {
            navigate('/');
          }
        }
        
        setLoading(false);
      }
    );

    // Then check for the current session
    const getSession = async () => {
      try {
        console.log("Getting current session...");
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        
        console.log("Current session:", session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check if email is confirmed for initial load
        if (session?.user) {
          const emailConfirmed = session.user.email_confirmed_at != null;
          setIsEmailConfirmed(emailConfirmed);
          
          // Redirect to verification page if needed
          if (!emailConfirmed && session.user.email && 
              !['/auth', '/verify-email', '/auth/callback'].includes(location.pathname)) {
            console.log("Initial redirect to email verification page");
            navigate('/verify-email');
          }
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Check if we have a hash error in the URL (like from an expired confirmation link)
    const handleHashError = () => {
      const hash = window.location.hash;
      if (hash && hash.includes('error=')) {
        const errorParams = new URLSearchParams(hash.substring(1));
        const errorCode = errorParams.get('error_code');
        const errorDesc = errorParams.get('error_description');
        
        if (errorCode === 'otp_expired') {
          toast.error('رابط التأكيد منتهي الصلاحية. يرجى طلب رابط جديد.');
          // Clear the hash
          window.history.replaceState(null, '', window.location.pathname);
          navigate('/verify-email');
        }
      }
    };
    
    handleHashError();

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  const signUp = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign up:", email);
      
      // Pre-validate email format before sending to Supabase
      // Using a more permissive regex to let Supabase handle more complex validations
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { 
          error: { 
            message: "صيغة البريد الإلكتروني غير صحيحة" 
          } 
        };
      }
      
      // Sanitize the email by trimming whitespace
      const sanitizedEmail = email.trim().toLowerCase();
      
      // Make sure to specify we want an email confirmation
      const { error } = await supabase.auth.signUp({ 
        email: sanitizedEmail, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email_confirmed: false
          }
        } 
      });
      
      console.log("Sign up result:", error ? `Error: ${error.message}` : "Success");
      
      if (!error) {
        // Show success toast for better UX
        toast.success("تم إنشاء الحساب بنجاح، يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب");
      }
      
      return { error };
    } catch (error: any) {
      console.error('Error during sign up:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign in:", email);
      
      // Validate email format before attempting signin
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { 
          error: { 
            message: "صيغة البريد الإلكتروني غير صحيحة" 
          } 
        };
      }
      
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      console.log("Sign in result:", error ? `Error: ${error.message}` : "Success");
      
      return { error };
    } catch (error: any) {
      console.error('Error during sign in:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out...");
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    try {
      console.log("Resending confirmation email to:", email);
      
      // Validate email before attempting to resend
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { 
          error: { 
            message: "صيغة البريد الإلكتروني غير صحيحة" 
          } 
        };
      }
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      console.log("Resend result:", error ? `Error: ${error.message}` : "Success");
      
      if (!error) {
        // Show success toast
        toast.success("تم إرسال رسالة التأكيد بنجاح");
      }
      
      return { error };
    } catch (error: any) {
      console.error('Error resending confirmation email:', error);
      return { error };
    }
  };

  const value = {
    session,
    user,
    signUp,
    signIn,
    signOut,
    loading,
    isEmailConfirmed,
    resendConfirmationEmail
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
