
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Clock, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface MockGoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
}

// This is a mock database of users for demo purposes
const MOCK_USERS: MockGoogleUser[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    picture: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    picture: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: '3',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    picture: 'https://randomuser.me/api/portraits/men/22.jpg',
  },
];

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    
    try {
      // In a real app, this would be an actual Google OAuth flow
      // For demo purposes, we'll use a random mock user
      const randomUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      login(randomUser);
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
      <div className="w-full max-w-md">
        <div className="bg-card/90 backdrop-blur-md shadow-medium rounded-2xl p-8 border border-border/50 animate-scale-in">
          <div className="text-center mb-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary flex items-center justify-center mb-4 shadow-soft animate-float">
              <Clock className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">Time Cataloger</h1>
            <p className="text-muted-foreground mt-2">
              Organize, track, and maximize your time
            </p>
          </div>
          
          <div className="space-y-4">
            <Button
              className="w-full py-6 relative overflow-hidden group"
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
            >
              <div className="flex items-center justify-center gap-2">
                <LogIn className="h-5 w-5" />
                <span>Continue with Google</span>
              </div>
              <div className="absolute bottom-0 left-0 h-0.5 w-full bg-primary-foreground/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                This is a demo app using local storage.
                <br />
                No actual authentication is performed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
