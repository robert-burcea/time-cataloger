
import React, { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { TaskProvider, useTask } from '@/context/TaskContext';
import Navbar from '@/components/Navbar';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip, 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

// Separate component to access the TaskContext
const StatisticsContent = () => {
  const { tasks, categories, getCategoryById } = useTask();
  
  // Calculate category distribution
  const categoryData = useMemo(() => {
    const categoryDistribution = tasks.reduce((acc, task) => {
      const categoryId = task.categoryId;
      
      // Skip tasks without a category
      if (!categoryId) return acc;
      
      // Get the category
      const category = getCategoryById(categoryId);
      if (!category) return acc;
      
      // Initialize category count if not exists
      if (!acc[categoryId]) {
        acc[categoryId] = {
          id: categoryId,
          name: category.name,
          color: category.color,
          value: 0,
          tasks: 0,
          completedTasks: 0,
          totalDuration: 0
        };
      }
      
      // Calculate total time spent on this task
      const taskDuration = task.timeLogs.reduce((total, log) => total + log.duration, 0);
      
      // Update category stats
      acc[categoryId].tasks += 1;
      acc[categoryId].value += taskDuration; // For pie chart
      acc[categoryId].totalDuration += taskDuration;
      if (task.completed) {
        acc[categoryId].completedTasks += 1;
      }
      
      return acc;
    }, {});
    
    // Convert to array
    return Object.values(categoryDistribution);
  }, [tasks, getCategoryById]);
  
  // Weekly task completion data
  const weeklyStats = useMemo(() => {
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Total tasks created this week
    const tasksThisWeek = tasks.filter(task => {
      const taskCreatedAt = new Date(task.createdAt);
      return taskCreatedAt >= startOfWeek;
    });
    
    // Completed tasks this week
    const completedTasksThisWeek = tasksThisWeek.filter(task => task.completed);
    
    // Total tracked time this week
    const timeTrackedThisWeek = tasks.reduce((total, task) => {
      const taskTimeLogs = task.timeLogs.filter(log => {
        const logStartTime = new Date(log.startTime);
        return logStartTime >= startOfWeek;
      });
      
      const taskDuration = taskTimeLogs.reduce((sum, log) => sum + log.duration, 0);
      return total + taskDuration;
    }, 0);
    
    // Percent of completion
    const completionPercent = tasksThisWeek.length > 0 
      ? Math.round((completedTasksThisWeek.length / tasksThisWeek.length) * 100) 
      : 0;
    
    return {
      totalTasks: tasksThisWeek.length,
      completedTasks: completedTasksThisWeek.length,
      timeTracked: timeTrackedThisWeek, // in seconds
      productivityScore: completionPercent
    };
  }, [tasks]);
  
  // Format seconds into hours and minutes
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hr${hours !== 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;
    }
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  };
  
  // Daily activity data (tasks completed per day this week)
  const dailyActivityData = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    const currentDayOfWeek = now.getDay();
    
    // Create array of last 7 days
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      
      const dayTasks = tasks.filter(task => {
        const taskCompletedAt = task.updatedAt;
        if (!task.completed || !taskCompletedAt) return false;
        
        const completedDate = new Date(taskCompletedAt);
        return completedDate >= date && completedDate < nextDate;
      });
      
      result.push({
        name: days[date.getDay()].substring(0, 3),
        tasks: dayTasks.length
      });
    }
    
    return result;
  }, [tasks]);
  
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Statistics</h1>
        <p className="text-muted-foreground mb-6">
          Analyze your time usage and productivity
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Time Distribution by Category</h2>
            {categoryData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => 
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => {
                        return [formatTime(value), 'Time Spent'];
                      }} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-muted-foreground">
                  Start tracking time to see your category distribution
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-card rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Weekly Overview</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Tasks Completed</span>
                  <span className="text-sm font-medium">
                    {weeklyStats.completedTasks}/{weeklyStats.totalTasks}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ 
                      width: `${weeklyStats.totalTasks > 0 
                        ? (weeklyStats.completedTasks / weeklyStats.totalTasks) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Time Tracked</span>
                  <span className="text-sm font-medium">
                    {formatTime(weeklyStats.timeTracked)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ 
                      width: `${Math.min(
                        weeklyStats.timeTracked > 0 
                          ? (weeklyStats.timeTracked / (40 * 3600)) * 100 // 40 hours as max
                          : 0, 
                        100
                      )}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Productivity Score</span>
                  <span className="text-sm font-medium">
                    {weeklyStats.productivityScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${weeklyStats.productivityScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg shadow p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Daily Activity</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="tasks" name="Tasks Completed" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const StatisticsPage = () => {
  const { user } = useAuth();
  
  return (
    <TaskProvider>
      <div className="flex flex-col md:flex-row min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 pt-20 md:pt-6 overflow-auto">
          <div className="container mx-auto max-w-6xl">
            <StatisticsContent />
          </div>
        </main>
      </div>
    </TaskProvider>
  );
};

export default StatisticsPage;
