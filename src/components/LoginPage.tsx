
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Clock, LogIn, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LoginPage: React.FC = () => {
  const { googleSignIn, supabaseReady } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    
    try {
      await googleSignIn();
      // The page will be redirected by Supabase OAuth flow
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please try again.');
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
          
          {!supabaseReady && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>
                Authentication system is not configured. Contact the administrator to set up Supabase.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <Button
              className="w-full py-6 relative overflow-hidden group"
              onClick={handleGoogleLogin}
              disabled={isLoggingIn || !supabaseReady}
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
                Sign in with your Google account to start tracking your time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
