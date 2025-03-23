
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '@/utils/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

type User = {
  id: string;
  name: string;
  email: string;
  picture?: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  googleSignIn: () => Promise<void>;
  supabaseReady: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabaseReady] = useState<boolean>(isSupabaseConfigured());

  // Transform Supabase user to our app's user format
  const formatUser = (supabaseUser: SupabaseUser | null): User | null => {
    if (!supabaseUser) return null;
    
    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
      email: supabaseUser.email || '',
      picture: supabaseUser.user_metadata?.avatar_url,
    };
  };

  useEffect(() => {
    // Only try to connect to Supabase if properly configured
    if (!supabaseReady) {
      // For development, create a dummy user to bypass auth
      if (import.meta.env.DEV) {
        console.info("Development mode: Creating dummy user for testing");
        const dummyUser: User = {
          id: 'dev-user-id',
          name: 'Dev User',
          email: 'dev@example.com',
          picture: 'https://ui-avatars.com/api/?name=Dev+User&background=0D8ABC&color=fff'
        };
        setUser(dummyUser);
      } else {
        // In production, notify user that Supabase is not configured
        toast.error(
          "Authentication system is not configured. Please contact the administrator.",
          { duration: 8000, id: "auth-config-error" }
        );
      }
      setIsLoading(false);
      return;
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const formattedUser = formatUser(session.user);
          setUser(formattedUser);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Check for existing session on load
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const formattedUser = formatUser(session.user);
          setUser(formattedUser);
        }
      } catch (error) {
        console.error("Error checking auth session:", error);
        toast.error("Failed to verify authentication status");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabaseReady]);

  const login = (userData: User) => {
    setUser(userData);
    toast.success('Successfully logged in');
  };

  const googleSignIn = async () => {
    if (!supabaseReady) {
      toast.error('Authentication system is not configured. Please contact the administrator.');
      console.error('Cannot sign in: Supabase is not configured with proper environment variables');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast.error('Failed to sign in with Google. Please try again later.');
      throw error;
    }
  };

  const logout = async () => {
    if (!supabaseReady) {
      setUser(null);
      toast.info('You have been logged out');
      return;
    }

    try {
      await supabase.auth.signOut();
      setUser(null);
      toast.info('You have been logged out');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        googleSignIn,
        supabaseReady,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
