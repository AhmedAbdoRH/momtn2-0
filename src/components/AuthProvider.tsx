
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userDisplayName: string | null;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  refreshUserDisplayName: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to load user's background preference
const loadUserBackgroundPreference = async (userId: string) => {
  try {
    const savedGradient = localStorage.getItem(`user-background-${userId}`);
    const gradientId = savedGradient || 'default';
    
    console.log(`Loading background preference for user ${userId}:`, gradientId);
    
    // Dispatch event to apply the user's background
    window.dispatchEvent(new CustomEvent('apply-gradient', { 
      detail: { gradientId, userId } 
    }));
  } catch (error) {
    console.error('Error loading user background preference:', error);
  }
};

// Helper function to get display name from database or email
const getDisplayNameFromUser = async (user: User): Promise<string> => {
  if (!user) return '';
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single();

    if (error || !data?.full_name) {
      // Return email prefix as default
      return user.email?.split('@')[0] || '';
    }

    return data.full_name;
  } catch (err) {
    console.error('Error loading display name:', err);
    return user.email?.split('@')[0] || '';
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Function to refresh user display name
  const refreshUserDisplayName = async () => {
    if (user) {
      const displayName = await getDisplayNameFromUser(user);
      setUserDisplayName(displayName);
    }
  };

  // Listen for display name updates
  useEffect(() => {
    const handleDisplayNameUpdate = (event: CustomEvent) => {
      const { displayName } = event.detail;
      setUserDisplayName(displayName);
    };

    window.addEventListener('displayNameUpdated', handleDisplayNameUpdate as EventListener);
    
    return () => {
      window.removeEventListener('displayNameUpdated', handleDisplayNameUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    console.log("Setting up auth listener...");
    
    // Check if this is an OAuth callback
    const isOAuthCallback = window.location.hash.includes('access_token') || 
                           window.location.search.includes('code');
    console.log("Initial OAuth callback check:", isOAuthCallback);
    
    let mounted = true;
    
    // Helper function to handle session updates
    const handleSessionUpdate = async (newSession: Session | null) => {
      if (!mounted) return;
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (newSession?.user) {
        try {
          await loadUserBackgroundPreference(newSession.user.id);
          const displayName = await getDisplayNameFromUser(newSession.user);
          if (mounted) {
            setUserDisplayName(displayName);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        setUserDisplayName(null);
      }
    };
    
    // Set up the auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.email);
        
        if (event === 'INITIAL_SESSION') {
          console.log("Initial session detected");
          await handleSessionUpdate(newSession);
          
          // For OAuth callback on initial session, redirect to home
          if (newSession && isOAuthCallback) {
            console.log("OAuth callback with session, redirecting to home");
            setTimeout(() => {
              navigate('/', { replace: true });
            }, 100);
          }
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log("User signed in or token refreshed");
          await handleSessionUpdate(newSession);
          
          // For Google OAuth and new users, always redirect to home
          if (newSession) {
            // Check if this is coming from OAuth callback or if on auth page
            const currentIsOAuth = window.location.hash.includes('access_token') || 
                                  window.location.search.includes('code');
            const isOnAuthPage = location.pathname === '/auth';
            
            console.log("OAuth callback detected:", currentIsOAuth, "On auth page:", isOnAuthPage);
            
            if (currentIsOAuth || isOnAuthPage) {
              console.log("Redirecting to home after successful authentication");
              setTimeout(() => {
                navigate('/', { replace: true });
              }, 100);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out");
          await handleSessionUpdate(null);
          
          // Apply default background when user signs out
          window.dispatchEvent(new CustomEvent('apply-gradient', { 
            detail: { gradientId: 'default', userId: null } 
          }));
          
          navigate('/auth');
        } else if (event === 'USER_UPDATED') {
          console.log("User updated");
          await handleSessionUpdate(newSession);
        } else if (event === 'PASSWORD_RECOVERY') {
          console.log("Password recovery event detected");
          navigate('/reset-password');
        }
        
        // Set loading to false after processing any auth event
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log("Getting current session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        console.log("Current session:", session?.user?.email);
        
        if (mounted) {
          await handleSessionUpdate(session);
          
          // Redirect if needed - but only if user is logged in and on auth page
          if (location.pathname === '/auth' && session) {
            console.log("User already logged in, redirecting from auth page to home");
            navigate('/', { replace: true });
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const signUp = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign up:", email);
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      console.log("Sign up result:", error ? `Error: ${error.message}` : "Success", data);
      
      // Don't manually set states here - let the auth listener handle it
      if (!error && data.user) {
        navigate('/', { replace: true });
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
      
      // Don't manually set states here - let the auth listener handle it
      if (!error && data.user) {
        navigate('/', { replace: true });
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
      // Don't manually set states here - let the auth listener handle it
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    session,
    user,
    userDisplayName,
    signUp,
    signIn,
    signOut,
    loading,
    refreshUserDisplayName
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
