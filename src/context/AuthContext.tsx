
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { getStorageItem, setStorageItem, removeStorageItem } from '@/utils/localStorage';

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

const USER_STORAGE_KEY = 'time_cataloger_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Always set to false since we're not using Supabase
  const [supabaseReady] = useState<boolean>(false);

  useEffect(() => {
    // Check for user in localStorage
    const storedUser = getStorageItem<User | null>(USER_STORAGE_KEY, null);
    setUser(storedUser);
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setStorageItem(USER_STORAGE_KEY, userData);
    toast.success('Successfully logged in');
  };

  const googleSignIn = async () => {
    // Create a mock user for demo purposes
    const demoUser: User = {
      id: 'local-user-id',
      name: 'Demo User',
      email: 'demo@example.com',
      picture: 'https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff'
    };
    
    login(demoUser);
    
    // No actual Google sign-in since we're using local storage only
    return Promise.resolve();
  };

  const logout = () => {
    setUser(null);
    removeStorageItem(USER_STORAGE_KEY);
    toast.info('You have been logged out');
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
