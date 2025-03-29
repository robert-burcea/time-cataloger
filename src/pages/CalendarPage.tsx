
import React, { useState, useMemo } from 'react';
import { useTask } from '@/context/TaskContext';
import { TaskProvider } from '@/context/TaskContext';
import { DayContent, DayContentProps, DayProps } from 'react-day-picker';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { formatTime } from '@/utils/timeUtils';
import { CategoryBadge } from '@/components/CategoryBadge';
import { Check } from 'lucide-react';
import Navbar from '@/components/Navbar';

// Create a wrapper component that includes TaskProvider
const CalendarPageContent = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());
  
  const { tasks, categories, tags, getTagById, getCategoryById } = useTask();
  
  const tasksForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    
    return tasks.filter(task => {
      if (!task.scheduledDate) return false;
      
      // Get just the date part (yyyy-MM-dd)
      const taskDateStr = task.scheduledDate.split('T')[0];
      return taskDateStr === selectedDateStr;
    });
  }, [selectedDate, tasks]);
  
  const daysWithTasks = useMemo(() => {
    const days = new Map<string, number>();
    
    tasks.forEach(task => {
      if (task.scheduledDate) {
        const dateKey = task.scheduledDate.split('T')[0];
        const count = days.get(dateKey) || 0;
        days.set(dateKey, count + 1);
      }
    });
    
    return days;
  }, [tasks]);
  
  // Define the day renderer that's compatible with DayContentProps
  const dayWithTasksRenderer = (props: DayContentProps) => {
    const { date, displayMonth } = props;
    const dateKey = format(date, 'yyyy-MM-dd');
    const taskCount = daysWithTasks.get(dateKey) || 0;
    
    const isSelected = selectedDate && 
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
    
    const isOutsideMonth = displayMonth && date.getMonth() !== displayMonth.getMonth();
    
    return (
      <div className="relative flex items-center justify-center">
        <div 
          className={`h-9 w-9 p-0 font-normal aria-selected:opacity-100 flex items-center justify-center rounded-md ${
            isSelected ? 'bg-primary text-primary-foreground' : ''
          }`}
        >
          {date.getDate()}
          {taskCount > 0 && !isOutsideMonth && (
            <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary-foreground" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-center">
        <h1 className="text-2xl font-bold mb-6">Calendar</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Panel - Calendar */}
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardContent className="pt-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                month={visibleMonth}
                onMonthChange={setVisibleMonth}
                className="w-full"
                components={{
                  DayContent: dayWithTasksRenderer
                }}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Right Panel - Tasks for selected date */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {selectedDate ? format(selectedDate, 'EEEE, MMMM do, yyyy') : 'Select a date'}
              </h2>
              
              <Separator className="my-4" />
              
              {tasksForSelectedDate.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No tasks scheduled for this day
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-300px)] pr-4">
                  <div className="space-y-4">
                    {tasksForSelectedDate.map(task => {
                      const category = getCategoryById(task.categoryId);
                      
                      return (
                        <div key={task.id} className="p-4 border border-border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {task.completed && (
                                <Check className="h-4 w-4 text-green-500" />
                              )}
                              <h3 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {task.title}
                              </h3>
                            </div>
                            {category && (
                              <CategoryBadge categoryId={category.id} />
                            )}
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            <div className="text-xs">
                              {task.scheduledStartTime && task.scheduledEndTime ? (
                                <Badge variant="outline">
                                  {formatTime(task.scheduledStartTime)} - {formatTime(task.scheduledEndTime)}
                                </Badge>
                              ) : (
                                <Badge variant="outline">All day</Badge>
                              )}
                            </div>
                            
                            {task.tags.map(tagId => {
                              const tag = getTagById(tagId);
                              if (!tag) return null;
                              
                              return (
                                <Badge key={tagId} variant="secondary" className="text-xs">
                                  {tag.name}
                                </Badge>
                              );
                            })}
                            
                            {task.isRecurring && (
                              <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 border-purple-200">
                                Recurring
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Main component with TaskProvider and layout
const CalendarPage = () => {
  return (
    <TaskProvider>
      <div className="flex flex-col md:flex-row min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6 overflow-auto">
          <CalendarPageContent />
        </main>
      </div>
    </TaskProvider>
  );
};

export default CalendarPage;
