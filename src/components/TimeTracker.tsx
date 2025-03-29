
import React, { useState } from 'react';
import { Play, Pause, Clock, Timer, RotateCcw } from 'lucide-react';
import { useTask } from '@/context/TaskContext';
import { formatDuration } from '@/utils/timeUtils';
import { Button } from '@/components/ui/button';
import { CategoryBadge } from './CategoryBadge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import TaskForm from './TaskForm';

const TimeTracker: React.FC = () => {
  const { getCurrentlyTrackedTask, tasks, startTimeTracking, stopTimeTracking } = useTask();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [isStoppingTimer, setIsStoppingTimer] = useState(false);
  
  const currentTask = getCurrentlyTrackedTask();
  
  // Find the active time log for the current task
  const activeTimeLog = currentTask?.timeLogs.find(log => log.startTime && !log.endTime);
  
  // Calculate total tracked time for the current task
  const totalTrackedSeconds = currentTask?.timeLogs.reduce(
    (total, log) => total + log.duration,
    0
  ) || 0;
  
  // Find the most recently completed tasks (for quick access)
  const recentTasks = tasks
    .filter(task => !task.completed && task.id !== currentTask?.id)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);
  
  const handleStartTracking = (taskId: string) => {
    startTimeTracking(taskId);
  };
  
  const handleStopTracking = async () => {
    if (currentTask) {
      try {
        setIsStoppingTimer(true);
        await stopTimeTracking(currentTask.id);
      } catch (error) {
        console.error("Error in TimeTracker when stopping time:", error);
        toast.error("Failed to stop time tracking. Your time will still be saved locally.");
      } finally {
        setIsStoppingTimer(false);
      }
    }
  };
  
  const handleResetTimer = () => {
    // This would reset the current session's timer
    // For demo purposes, we'll restart tracking
    if (currentTask) {
      try {
        stopTimeTracking(currentTask.id);
        startTimeTracking(currentTask.id);
      } catch (error) {
        console.error("Error resetting timer:", error);
        toast.error("Failed to reset timer. Your time will still be saved locally.");
      }
    }
  };
  
  const handleAddTask = () => {
    setTaskDialogOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Time Tracker</h2>
        <Button onClick={handleAddTask} variant="default" size="sm">
          Add New Task
        </Button>
      </div>
      
      {/* Current task tracker */}
      <div className={cn(
        "p-6 rounded-lg border transition-all duration-300",
        currentTask 
          ? "bg-card shadow-soft border-primary/30" 
          : "bg-muted/30 border-dashed"
      )}>
        <div className="text-center space-y-2 mb-6">
          <h3 className="text-xl font-medium">
            {currentTask 
              ? currentTask.title 
              : "No task being tracked"
            }
          </h3>
          
          {currentTask && (
            <div className="flex items-center justify-center gap-2">
              <CategoryBadge categoryId={currentTask.categoryId} />
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-center">
          <div className="text-5xl font-semibold tabular-nums tracking-tight py-4">
            {formatDuration(totalTrackedSeconds)}
          </div>
        </div>
        
        <div className="flex justify-center gap-3 mt-4">
          {currentTask ? (
            <>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleResetTimer}
                className="rounded-full h-12 w-12"
                disabled={isStoppingTimer}
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
              
              <Button
                onClick={handleStopTracking}
                size="lg"
                className="rounded-full px-6 animate-pulse-soft"
                disabled={isStoppingTimer}
              >
                {isStoppingTimer ? (
                  "Stopping..."
                ) : (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    Stop
                  </>
                )}
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground">
              Select a task below to start tracking
            </p>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Recent Tasks</h3>
        
        {recentTasks.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {recentTasks.map(task => (
              <div 
                key={task.id} 
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 hover:shadow-soft transition-all cursor-pointer"
                onClick={() => handleStartTracking(task.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Timer className="h-5 w-5 text-primary" />
                  </div>
                  
                  <div>
                    <h4 className="font-medium line-clamp-1">{task.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <CategoryBadge categoryId={task.categoryId} />
                    </div>
                  </div>
                </div>
                
                <Button variant="ghost" size="icon" className="rounded-full" onClick={(e) => {
                  e.stopPropagation();
                  handleStartTracking(task.id);
                }}>
                  <Play className="h-5 w-5 text-primary" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed rounded-lg border-border">
            <Clock className="h-10 w-10 mx-auto text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No recent tasks</p>
            <Button variant="outline" className="mt-4" onClick={handleAddTask}>
              Create a task to track
            </Button>
          </div>
        )}
      </div>
      
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>Add a new task to start tracking time</DialogDescription>
          </DialogHeader>
          <TaskForm
            onSubmit={() => setTaskDialogOpen(false)}
            onCancel={() => setTaskDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimeTracker;
