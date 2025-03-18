
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { TaskProvider } from '@/context/TaskContext';
import Navbar from '@/components/Navbar';
import TaskList from '@/components/TaskList';
import TimeTracker from '@/components/TimeTracker';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import TaskForm from '@/components/TaskForm';

const Dashboard = () => {
  const { user } = useAuth();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  
  const handleTaskFormSubmit = () => {
    setIsTaskFormOpen(false);
  };
  
  const handleTaskFormCancel = () => {
    setIsTaskFormOpen(false);
  };
  
  return (
    <TaskProvider>
      <div className="flex flex-col md:flex-row min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6 overflow-auto">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold">Welcome, {user?.name?.split(' ')[0]}</h1>
                  <p className="text-muted-foreground mt-1">
                    Here's your task overview and time tracking
                  </p>
                </div>
                
                <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full md:w-auto">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      New Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                      <DialogTitle>Create a new task</DialogTitle>
                    </DialogHeader>
                    <TaskForm 
                      onSubmit={handleTaskFormSubmit}
                      onCancel={handleTaskFormCancel}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              
              <TimeTracker />
            </div>
            
            <TaskList />
          </div>
        </main>
      </div>
    </TaskProvider>
  );
};

export default Dashboard;
