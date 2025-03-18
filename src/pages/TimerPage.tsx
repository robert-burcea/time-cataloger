
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { TaskProvider } from '@/context/TaskContext';
import Navbar from '@/components/Navbar';
import TimeTracker from '@/components/TimeTracker';

const TimerPage = () => {
  const { user } = useAuth();
  
  return (
    <TaskProvider>
      <div className="flex flex-col md:flex-row min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6 overflow-auto">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-4">Timer</h1>
              <p className="text-muted-foreground mb-6">
                Track time for your tasks and projects
              </p>
              
              <TimeTracker />
            </div>
          </div>
        </main>
      </div>
    </TaskProvider>
  );
};

export default TimerPage;
