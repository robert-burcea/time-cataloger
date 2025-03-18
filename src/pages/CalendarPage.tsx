
import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { TaskProvider, useTask } from '@/context/TaskContext';
import Navbar from '@/components/Navbar';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CategoryBadge } from '@/components/CategoryBadge';
import { CheckCircle, Clock } from 'lucide-react';
import { formatTimeForDisplay } from '@/utils/timeUtils';
import { DayContent } from 'react-day-picker';

// Separate component for task list to use the task context
const TaskCalendarView = () => {
  const { tasks, categories, tags, getTaskById, getCategoryById } = useTask();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  
  // Find all days that have tasks scheduled
  const daysWithTasks = useMemo(() => {
    return tasks.reduce((days: Record<string, number>, task) => {
      if (task.scheduledDate) {
        const dateStr = new Date(task.scheduledDate).toISOString().split('T')[0];
        days[dateStr] = (days[dateStr] || 0) + 1;
      }
      return days;
    }, {});
  }, [tasks]);
  
  // Get tasks for the selected date
  const tasksForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    return tasks.filter(task => {
      if (!task.scheduledDate) return false;
      const taskDateStr = new Date(task.scheduledDate).toISOString().split('T')[0];
      return taskDateStr === dateStr;
    }).sort((a, b) => {
      // Sort by time if available, otherwise by creation date
      if (a.scheduledStartTime && b.scheduledStartTime) {
        return a.scheduledStartTime.localeCompare(b.scheduledStartTime);
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [selectedDate, tasks]);
  
  // Helper function to get a tag by its ID
  const getTagById = (id: string) => {
    return tags.find(tag => tag.id === id);
  };
  
  // Custom day renderer to show indicators for days with tasks
  const dayWithTasksRenderer = (props: { date: Date; displayMonth: Date; }) => {
    const { date, displayMonth } = props;
    
    // Convert date to string format for comparison
    const dateStr = new Date(date).toISOString().split('T')[0];
    const hasTask = daysWithTasks[dateStr];
    
    return (
      <div className="relative h-9 w-9 p-0">
        <div className={props.selected ? "text-white" : ""}>{date.getDate()}</div>
        {hasTask && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
            <div className="flex gap-0.5">
              <div className="h-1 w-1 rounded-full bg-primary" />
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-1/3">
        <Card>
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="mx-auto"
              components={{
                DayContent: dayWithTasksRenderer as DayContent,
              }}
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="w-full lg:w-2/3">
        <Card>
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-4">
              Tasks for {selectedDate?.toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h2>
            
            {tasksForSelectedDate.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center">
                No tasks scheduled for this day
              </p>
            ) : (
              <div className="space-y-3">
                {tasksForSelectedDate.map(task => {
                  const category = getCategoryById(task.categoryId);
                  
                  return (
                    <div 
                      key={task.id} 
                      className={`p-3 rounded-lg border ${
                        task.completed ? 'bg-muted/30' : 'bg-card'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {task.completed && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            <h3 className={`font-medium ${
                              task.completed ? 'line-through text-muted-foreground' : ''
                            }`}>
                              {task.title}
                            </h3>
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            {category && (
                              <CategoryBadge 
                                categoryId={category.id}
                                className=""
                              />
                            )}
                            
                            {task.tags.length > 0 && task.tags.map(tagId => (
                              <Badge key={tagId} variant="outline" className="text-xs">
                                {getTagById(tagId)?.name || 'Unknown tag'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {task.scheduledStartTime && (
                          <div className="flex items-center text-xs text-muted-foreground whitespace-nowrap">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>
                              {formatTimeForDisplay(new Date(`2000-01-01T${task.scheduledStartTime}`))}{" "}
                              {task.scheduledEndTime && (
                                <>
                                  - {formatTimeForDisplay(new Date(`2000-01-01T${task.scheduledEndTime}`))}
                                </>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const CalendarPage = () => {
  const { user } = useAuth();
  
  return (
    <TaskProvider>
      <div className="flex flex-col md:flex-row min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6 overflow-auto">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-4">Calendar</h1>
              <p className="text-muted-foreground mb-6">
                View and manage your scheduled tasks
              </p>
              
              <TaskCalendarView />
            </div>
          </div>
        </main>
      </div>
    </TaskProvider>
  );
};

export default CalendarPage;
