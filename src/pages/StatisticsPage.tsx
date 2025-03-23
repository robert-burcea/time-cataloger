
import React, { useMemo } from 'react';
import { useTask } from '@/context/TaskContext';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { 
  PieChart as PieChartIcon, 
  BarChart as BarChartIcon,
  Clock, 
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { TaskProvider } from '@/context/TaskContext';
import { addDays, format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

const StatisticsPage = () => {
  const { tasks, categories, getCategoryById } = useTask();

  // Calculate time spent per category
  const categoryTimeData = useMemo(() => {
    const categoryTimes: Record<string, number> = {};
    
    // Initialize all categories with 0 time
    categories.forEach(category => {
      categoryTimes[category.id] = 0;
    });
    
    // Sum up time logs for each task by category
    tasks.forEach(task => {
      if (task.timeLogs.length > 0) {
        let totalSeconds = 0;
        task.timeLogs.forEach(log => {
          totalSeconds += log.duration;
        });
        
        categoryTimes[task.categoryId] = (categoryTimes[task.categoryId] || 0) + totalSeconds;
      }
    });
    
    // Convert to array format for chart
    return Object.keys(categoryTimes)
      .filter(id => categoryTimes[id] > 0) // Only include categories with time spent
      .map(id => {
        const category = getCategoryById(id);
        return {
          name: category?.name || 'Unknown',
          value: Math.round(categoryTimes[id] / 60), // Convert to minutes
          color: category?.color || '#cccccc'
        };
      });
  }, [tasks, categories, getCategoryById]);
  
  // Calculate tasks completed this week
  const weeklyStats = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
    
    // Tasks completed this week
    const completedThisWeek = tasks.filter(task => {
      if (!task.completed) return false;
      const completedDate = task.updatedAt ? parseISO(task.updatedAt) : null;
      return completedDate && isWithinInterval(completedDate, { start: weekStart, end: weekEnd });
    }).length;
    
    // Total tracked time this week (in hours)
    let totalTimeTrackedThisWeek = 0;
    
    tasks.forEach(task => {
      task.timeLogs.forEach(log => {
        const logDate = parseISO(log.startTime);
        if (isWithinInterval(logDate, { start: weekStart, end: weekEnd })) {
          totalTimeTrackedThisWeek += log.duration;
        }
      });
    });
    
    // Convert seconds to hours
    const hoursTracked = Math.round(totalTimeTrackedThisWeek / 3600 * 10) / 10;
    
    return {
      completedTasks: completedThisWeek,
      hoursTracked
    };
  }, [tasks]);
  
  // Daily activity data
  const dailyActivityData = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    
    // Create an array of the days of the week
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    
    // Count tasks and time for each day
    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      
      const tasksForDay = tasks.filter(task => {
        if (!task.scheduledDate) return false;
        const taskDate = parseISO(task.scheduledDate);
        return isWithinInterval(taskDate, { start: dayStart, end: dayEnd });
      });
      
      let timeTrackedForDay = 0;
      tasks.forEach(task => {
        task.timeLogs.forEach(log => {
          const logDate = parseISO(log.startTime);
          if (isWithinInterval(logDate, { start: dayStart, end: dayEnd })) {
            timeTrackedForDay += log.duration;
          }
        });
      });
      
      return {
        name: format(day, 'EEE'),
        tasks: tasksForDay.length,
        timeHours: Math.round(timeTrackedForDay / 3600 * 10) / 10
      };
    });
  }, [tasks]);
  
  // Helper function for start of day
  function startOfDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }
  
  // Helper function for end of day
  function endOfDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
  }
  
  return (
    <TaskProvider>
      <div className="flex flex-col md:flex-row min-h-screen bg-background">
        <Navbar />
        
        <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6 overflow-auto">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-3xl font-bold">Statistics</h1>
                <p className="text-muted-foreground">Track your productivity and task completion</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="h-5 w-5" />
                      Time by Category
                    </CardTitle>
                    <CardDescription>
                      Distribution of time spent across different categories
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {categoryTimeData.length > 0 ? (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryTimeData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {categoryTimeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: number) => [`${value} minutes`, 'Time Spent']} 
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center flex-col text-muted-foreground">
                        <Clock className="h-12 w-12 mb-2 opacity-20" />
                        <p>No time tracking data available</p>
                        <p className="text-sm">Start tracking time on your tasks to see statistics</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Weekly Overview
                    </CardTitle>
                    <CardDescription>
                      Your productivity this week
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="border-2">
                        <CardContent className="p-6 flex flex-col items-center justify-center">
                          <CheckCircle2 className="h-10 w-10 text-primary mb-2" />
                          <span className="text-3xl font-bold">{weeklyStats.completedTasks}</span>
                          <span className="text-muted-foreground text-sm">Tasks Completed</span>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-2">
                        <CardContent className="p-6 flex flex-col items-center justify-center">
                          <Clock className="h-10 w-10 text-primary mb-2" />
                          <span className="text-3xl font-bold">{weeklyStats.hoursTracked}</span>
                          <span className="text-muted-foreground text-sm">Hours Tracked</span>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="mt-6 h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyActivityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="tasks" name="Tasks" fill="#8884d8" />
                          <Bar dataKey="timeHours" name="Hours" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {tasks.length === 0 && (
                <Card className="bg-muted/40">
                  <CardContent className="p-6 flex items-center">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mr-2" />
                    <p>Add tasks and track your time to see meaningful statistics here.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </TaskProvider>
  );
};

export default StatisticsPage;
