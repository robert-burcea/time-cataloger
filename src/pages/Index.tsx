
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import LoginPage from '@/components/LoginPage';
import { Navigate } from 'react-router-dom';
import { TaskProvider } from '@/context/TaskContext';
import Navbar from '@/components/Navbar';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show a loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary/30 mb-4"></div>
          <div className="h-4 w-48 bg-muted rounded"></div>
        </div>
      </div>
    );
  }
  
  // If not authenticated, show the login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }
  
  // If authenticated, redirect to dashboard
  return (
    <TaskProvider>
      <div className="flex flex-col md:flex-row min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6 overflow-auto">
          <Navigate to="/dashboard" replace />
        </main>
      </div>
    </TaskProvider>
  );
};

export default Index;
