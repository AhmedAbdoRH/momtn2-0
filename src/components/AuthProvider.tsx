
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
          
          // Redirect to the home page if on auth page
          if (newSession && location.pathname === '/auth') {
            navigate('/');
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out");
          setSession(null);
          setUser(null);
          navigate('/auth');
        } else if (event === 'USER_UPDATED') {
          console.log("User updated");
          setSession(newSession);
          setUser(newSession?.user ?? null);
        } else if (event === 'PASSWORD_RECOVERY') {
          console.log("Password recovery event detected");
          // The recovery token is already in the URL in hash parameters
          // ResetPasswordPage will handle this token
          navigate('/reset-password');
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
        
        // Redirect if needed
        if (location.pathname === '/auth' && session) {
          navigate('/');
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
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      console.log("Sign up result:", error ? `Error: ${error.message}` : "Success", data);
      
      // Redirect to home page after successful signup
      if (!error && data.user) {
        setUser(data.user);
        setSession(data.session);
        navigate('/');
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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log("Sign in result:", error ? `Error: ${error.message}` : "Success", data);
      
      if (!error && data.user) {
        navigate('/');
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
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
