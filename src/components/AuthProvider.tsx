
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  isEmailVerified: boolean;
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
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("Setting up auth listener...");
    
    // First set up the auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.email);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log("User signed in or token refreshed");
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          // Check if email is verified via user metadata
          const isVerified = newSession?.user?.user_metadata?.email_verified === true;
          setIsEmailVerified(isVerified);
          
          // Redirect based on verification status
          if (newSession) {
            if (isVerified) {
              // إذا كان المستخدم في صفحة التحقق وتم التحقق بالفعل، انتقل إلى الصفحة الرئيسية
              if (location.pathname === '/verify-email') {
                navigate('/');
              } else if (location.pathname === '/auth') {
                navigate('/');
              }
            } else {
              // إذا لم يتم التحقق من البريد وكان المستخدم ليس في صفحة التحقق، اذهب إلى صفحة التحقق
              if (location.pathname !== '/verify-email') {
                navigate('/verify-email');
              }
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out");
          setSession(null);
          setUser(null);
          setIsEmailVerified(false);
          navigate('/auth');
        } else if (event === 'USER_UPDATED') {
          console.log("User updated");
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          // Re-check verification status after user update
          const isVerified = newSession?.user?.user_metadata?.email_verified === true;
          setIsEmailVerified(isVerified);
          
          if (isVerified && location.pathname === '/verify-email') {
            // إذا تم التحقق أثناء وجود المستخدم في صفحة التحقق، انتظر قليلاً قبل التوجيه
            // سنترك للصفحة نفسها إظهار رسالة النجاح ثم إعادة التوجيه
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
        
        // Check if email is verified
        if (session?.user) {
          const isVerified = session.user.user_metadata?.email_verified === true;
          setIsEmailVerified(isVerified);
          
          // Redirect if needed
          if (session) {
            if (isVerified) {
              if (location.pathname === '/verify-email' || location.pathname === '/auth') {
                navigate('/');
              }
            } else {
              if (location.pathname !== '/verify-email' && location.pathname !== '/auth') {
                navigate('/verify-email');
              }
            }
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
      console.log("Attempting to sign up:", email);
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
        } 
      });
      console.log("Sign up result:", error ? `Error: ${error.message}` : "Success");
      
      // After successful signup, redirect to verification page
      if (!error) {
        navigate('/verify-email');
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
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      console.log("Sign in result:", error ? `Error: ${error.message}` : "Success");
      
      if (!error) {
        // Get updated user data to check verification status
        const { data } = await supabase.auth.getUser();
        const isVerified = data.user?.user_metadata?.email_verified === true;
        
        if (isVerified) {
          navigate('/');
        } else {
          navigate('/verify-email');
        }
      }
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

  const value = {
    session,
    user,
    signUp,
    signIn,
    signOut,
    loading,
    isEmailVerified
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
