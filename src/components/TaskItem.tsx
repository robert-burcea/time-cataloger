
import React from 'react';
import { Check, Clock, Calendar, Tag, MoreVertical, PlayCircle, StopCircle } from 'lucide-react';
import { Task, useTask } from '@/context/TaskContext';
import { CategoryBadge } from './CategoryBadge';
import { formatDuration, getRelativeDateLabel } from '@/utils/timeUtils';
import { cn } from '@/lib/utils';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskItemProps {
  task: Task;
  showCategory?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  showCategory = true, 
  compact = false,
  onClick
}) => {
  const { 
    toggleTaskCompletion, 
    startTimeTracking, 
    stopTimeTracking, 
    deleteTask,
    getCurrentlyTrackedTask
  } = useTask();
  
  const currentlyTrackedTask = getCurrentlyTrackedTask();
  const isTracking = currentlyTrackedTask?.id === task.id;
  
  // Calculate total tracked time
  const totalTrackedSeconds = task.timeLogs.reduce((total, log) => total + log.duration, 0);
  
  const handleToggleCompletion = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTaskCompletion(task.id);
  };
  
  const handleStartTracking = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTimeTracking(task.id);
  };
  
  const handleStopTracking = (e: React.MouseEvent) => {
    e.stopPropagation();
    stopTimeTracking(task.id);
  };
  
  const handleDeleteTask = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTask(task.id);
  };
  
  return (
    <div 
      className={cn(
        "group relative p-4 rounded-lg border border-border/50 transition-all hover-scale",
        task.completed ? "bg-secondary/50" : "bg-background/80 hover:shadow-soft",
        compact ? "p-3" : "p-4",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <button
          className={cn(
            "flex-shrink-0 h-5 w-5 rounded-full border border-primary/20 flex items-center justify-center transition-colors",
            task.completed ? "bg-primary text-primary-foreground" : "bg-background hover:bg-primary/10"
          )}
          onClick={handleToggleCompletion}
          aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {task.completed && <Check className="h-3 w-3" />}
        </button>
        
        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 
              className={cn(
                "font-medium text-foreground line-clamp-1",
                task.completed && "line-through text-muted-foreground",
                compact ? "text-sm" : "text-base"
              )}
            >
              {task.title}
            </h3>
            
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {isTracking ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleStopTracking}
                        className="p-1 rounded-full text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label="Stop tracking"
                      >
                        <StopCircle className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Stop tracking</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                !task.completed && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={handleStartTracking}
                          className="p-1 rounded-full text-primary hover:bg-primary/10 transition-colors"
                          aria-label="Start tracking"
                        >
                          <PlayCircle className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Start tracking</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-1 rounded-full hover:bg-secondary transition-colors"
                    aria-label="More options"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Task Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    // Handle edit in parent component
                    onClick && onClick();
                  }}>
                    Edit task
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleToggleCompletion}>
                    {task.completed ? "Mark as incomplete" : "Mark as complete"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteTask} className="text-destructive">
                    Delete task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {!compact && task.description && (
            <p className={cn(
                "text-sm text-muted-foreground mt-1 line-clamp-2",
                task.completed && "line-through"
              )}
            >
              {task.description}
            </p>
          )}
          
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {showCategory && (
              <CategoryBadge categoryId={task.categoryId} />
            )}
            
            {task.scheduledDate && (
              <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{getRelativeDateLabel(task.scheduledDate)}</span>
              </div>
            )}
            
            {task.tags.length > 0 && (
              <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Tag className="h-3 w-3" />
                <span>{task.tags.length} tag{task.tags.length !== 1 ? 's' : ''}</span>
              </div>
            )}
            
            {totalTrackedSeconds > 0 && (
              <div className={cn(
                "inline-flex items-center gap-1 text-xs",
                isTracking ? "text-primary animate-pulse-soft" : "text-muted-foreground"
              )}>
                <Clock className="h-3 w-3" />
                <span>{formatDuration(totalTrackedSeconds)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isTracking && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-primary rounded-b-lg"></div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;
