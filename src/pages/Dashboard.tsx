
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { TaskProvider } from '@/context/TaskContext';
import Navbar from '@/components/Navbar';
import TaskList from '@/components/TaskList';
import TimeTracker from '@/components/TimeTracker';
import { Button } from '@/components/ui/button';
import { PlusCircle, List, Columns, Calendar as CalendarIcon, Search } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import TaskForm from '@/components/TaskForm';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ViewType = 'list' | 'board' | 'calendar';

const Dashboard = () => {
  const { user } = useAuth();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [viewType, setViewType] = useState<ViewType>('list');
  
  const handleTaskFormSubmit = () => {
    setIsTaskFormOpen(false);
  };
  
  const handleTaskFormCancel = () => {
    setIsTaskFormOpen(false);
  };
  
  const handleViewChange = (view: ViewType) => {
    setViewType(view);
  };
  
  const renderViewIcon = () => {
    switch (viewType) {
      case 'list':
        return <List className="h-4 w-4" />;
      case 'board':
        return <Columns className="h-4 w-4" />;
      case 'calendar':
        return <CalendarIcon className="h-4 w-4" />;
    }
  };
  
  return (
    <TaskProvider>
      <div className="flex flex-col md:flex-row min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6 overflow-auto">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold">My Tasks</h1>
                <div className="flex items-center gap-1.5">
                  <DropdownMenu>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1">
                              {renderViewIcon()}
                              <span className="hidden sm:inline">View</span>
                            </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          Change view
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => handleViewChange('list')} className="gap-2">
                        <List className="h-4 w-4" />
                        <span>List View</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewChange('board')} className="gap-2">
                        <Columns className="h-4 w-4" />
                        <span>Board View</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewChange('calendar')} className="gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Calendar View</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8">
                  <Search className="h-4 w-4" />
                </Button>
                
                <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="h-8 gap-1">
                      <PlusCircle className="h-4 w-4" />
                      <span>Add task</span>
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
            </div>
            
            {viewType === 'list' && <TaskList />}
            {viewType === 'board' && (
              <div className="text-center py-12 border border-dashed rounded-lg border-border">
                <p className="text-muted-foreground">Board view coming soon!</p>
              </div>
            )}
            {viewType === 'calendar' && (
              <div className="text-center py-12 border border-dashed rounded-lg border-border">
                <p className="text-muted-foreground">Calendar view coming soon!</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </TaskProvider>
  );
};

export default Dashboard;
