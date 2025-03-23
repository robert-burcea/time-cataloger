
import React, { useState, useMemo } from 'react';
import { useTask } from '@/context/TaskContext';
import { DayContent, DayProps } from 'react-day-picker';
import { format, isToday, isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CategoryBadge } from '@/components/CategoryBadge';
import Navbar from '@/components/Navbar';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { formatDateForDisplay, formatTime } from '@/utils/timeUtils';
import { TaskProvider } from '@/context/TaskContext';

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());
  
  const { tasks, categories, tags, getTagById, getCategoryById } = useTask();
  
  // Find tasks scheduled for the selected date
  const tasksForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    
    const dayStart = startOfDay(selectedDate);
    const dayEnd = endOfDay(selectedDate);
    
    return tasks.filter(task => {
      if (!task.scheduledDate) return false;
      
      const taskDate = parseISO(task.scheduledDate);
      return isWithinInterval(taskDate, { start: dayStart, end: dayEnd });
    });
  }, [selectedDate, tasks]);
  
  // For each day, check if there are tasks scheduled
  const daysWithTasks = useMemo(() => {
    const days = new Map<string, number>();
    
    tasks.forEach(task => {
      if (task.scheduledDate) {
        const dateKey = task.scheduledDate.split('T')[0]; // YYYY-MM-DD
        days.set(dateKey, (days.get(dateKey) || 0) + 1);
      }
    });
    
    return days;
  }, [tasks]);
  
  // Custom day content renderer that shows a dot for days with tasks
  const dayWithTasksRenderer = (props: DayProps) => {
    const { date, displayMonth } = props;
    const dateKey = format(date, 'yyyy-MM-dd');
    const taskCount = daysWithTasks.get(dateKey) || 0;
    const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === dateKey;
    
    return (
      <div className="relative flex items-center justify-center w-full h-full">
        <span>{date.getDate()}</span>
        {taskCount > 0 && (
          <div className="absolute -bottom-1">
            <div className={`h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'}`}></div>
          </div>
        )}
      </div>
    );
  };
  
  const handlePrevMonth = () => {
    setVisibleMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };
  
  const handleNextMonth = () => {
    setVisibleMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };
  
  return (
    <TaskProvider>
      <div className="flex flex-col md:flex-row min-h-screen bg-background">
        <Navbar />
        
        <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6 overflow-auto">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Calendar</h1>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-7 md:gap-6 gap-8">
                <Card className="md:col-span-5">
                  <CardContent className="p-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      month={visibleMonth}
                      onMonthChange={setVisibleMonth}
                      className="w-full"
                      components={{
                        DayContent: dayWithTasksRenderer as unknown as DayContent
                      }}
                    />
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        {selectedDate ? formatDateForDisplay(selectedDate) : 'No date selected'}
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {tasksForSelectedDate.length === 0 
                        ? 'No tasks scheduled' 
                        : `${tasksForSelectedDate.length} task${tasksForSelectedDate.length === 1 ? '' : 's'} scheduled`}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {tasksForSelectedDate.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-20" />
                          <p>No tasks scheduled for this day</p>
                          <p className="text-sm">Select a different date or add a new task</p>
                        </div>
                      ) : (
                        tasksForSelectedDate.map(task => (
                          <div key={task.id} className="border rounded-lg p-3 space-y-2">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium">{task.title}</h3>
                              <CategoryBadge categoryId={task.categoryId} />
                            </div>
                            
                            {task.description && (
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                            )}
                            
                            {task.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {task.tags.map(tagId => {
                                  const tag = getTagById(tagId);
                                  return tag ? (
                                    <Badge key={tagId} variant="outline" className="text-xs">
                                      {tag.name}
                                    </Badge>
                                  ) : null;
                                })}
                              </div>
                            )}
                            
                            {(task.scheduledStartTime || task.scheduledEndTime) && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>
                                  {task.scheduledStartTime ? formatTime(task.scheduledStartTime) : '--:--'} 
                                  {' to '} 
                                  {task.scheduledEndTime ? formatTime(task.scheduledEndTime) : '--:--'}
                                </span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </TaskProvider>
  );
};

export default CalendarPage;
