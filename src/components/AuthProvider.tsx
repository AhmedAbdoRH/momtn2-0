
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

  // Helper to validate email format
  const isValidEmail = (email: string): boolean => {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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
            toast.success("تم تأكيد بريدك الإلكتروني بنجاح!");
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

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  const signUp = async (email: string, password: string) => {
    try {
      // Trim and normalize email
      email = email.trim().toLowerCase();
      
      if (!isValidEmail(email)) {
        console.log("Invalid email format:", email);
        return { 
          error: { 
            message: "البريد الإلكتروني غير صالح، يرجى التأكد من صحة البريد الإلكتروني"
          } 
        };
      }
      
      console.log("Attempting to sign up:", email);
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        } 
      });
      
      if (error) {
        console.error("Sign up error:", error.message);
        let errorMessage = error.message;
        
        // Translate common error messages to Arabic
        if (error.message.includes("already registered")) {
          errorMessage = "البريد الإلكتروني مسجل بالفعل";
        } else if (error.message.includes("invalid")) {
          errorMessage = "البريد الإلكتروني غير صالح، يرجى التأكد من صحة البريد الإلكتروني";
        }
        
        return { error: { message: errorMessage } };
      }
      
      console.log("Sign up successful, verification email sent");
      return { error: null };
    } catch (error: any) {
      console.error('Error during sign up:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Trim and normalize email
      email = email.trim().toLowerCase();
      
      if (!isValidEmail(email)) {
        console.log("Invalid email format:", email);
        return { 
          error: { 
            message: "البريد الإلكتروني غير صالح، يرجى التأكد من صحة البريد الإلكتروني"
          } 
        };
      }
      
      console.log("Attempting to sign in:", email);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Sign in error:", error.message);
        let errorMessage = error.message;
        
        // Translate common error messages to Arabic
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "بيانات الدخول غير صحيحة";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "البريد الإلكتروني غير مؤكد، يرجى التحقق من بريدك الإلكتروني";
        }
        
        return { error: { message: errorMessage } };
      }
      
      console.log("Sign in successful");
      return { error: null };
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
      // Trim and normalize email
      email = email.trim().toLowerCase();
      
      if (!isValidEmail(email)) {
        console.log("Invalid email format for resend:", email);
        return { 
          error: { 
            message: "البريد الإلكتروني غير صالح، يرجى التأكد من صحة البريد الإلكتروني"
          } 
        };
      }
      
      console.log("Resending confirmation email to:", email);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error("Resend error:", error.message);
        return { error };
      }
      
      console.log("Confirmation email resent successfully");
      return { error: null };
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
