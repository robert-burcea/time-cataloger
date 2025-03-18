
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

export type Category = {
  id: string;
  name: string;
  color: string;
};

export type Tag = {
  id: string;
  name: string;
};

export type TaskTimeLog = {
  id: string;
  taskId: string;
  startTime: string;
  endTime: string | null;
  duration: number; // in seconds
};

export type Task = {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  deadline: string | null;
  scheduledDate: string | null;
  scheduledStartTime: string | null;
  scheduledEndTime: string | null;
  tags: string[]; // tag IDs
  isRecurring: boolean;
  recurrencePattern?: string;
  timeLogs: TaskTimeLog[];
};

type TaskContextType = {
  tasks: Task[];
  categories: Category[];
  tags: Tag[];
  isLoading: boolean;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timeLogs'>) => void;
  updateTask: (id: string, taskData: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, categoryData: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addTag: (tag: Omit<Tag, 'id'>) => void;
  deleteTag: (id: string) => void;
  startTimeTracking: (taskId: string) => void;
  stopTimeTracking: (taskId: string) => void;
  getCurrentlyTrackedTask: () => Task | null;
  getTaskById: (id: string) => Task | undefined;
  getCategoryById: (id: string) => Category | undefined;
  getTagById: (id: string) => Tag | undefined;
  searchTasks: (query: string) => Task[];
  filterTasks: (filters: {
    categoryIds?: string[];
    tagIds?: string[];
    completed?: boolean;
    scheduled?: boolean;
  }) => Task[];
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TASKS: 'timeApp_tasks',
  CATEGORIES: 'timeApp_categories',
  TAGS: 'timeApp_tags',
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentlyTrackedTaskId, setCurrentlyTrackedTaskId] = useState<string | null>(null);

  // Load data from localStorage based on the logged-in user
  useEffect(() => {
    if (user) {
      const userIdPrefix = `user_${user.id}_`;
      
      // Load tasks
      const storedTasks = localStorage.getItem(`${userIdPrefix}${STORAGE_KEYS.TASKS}`);
      if (storedTasks) {
        try {
          setTasks(JSON.parse(storedTasks));
        } catch (error) {
          console.error('Failed to parse tasks data', error);
          setTasks([]);
        }
      }
      
      // Load categories
      const storedCategories = localStorage.getItem(`${userIdPrefix}${STORAGE_KEYS.CATEGORIES}`);
      if (storedCategories) {
        try {
          setCategories(JSON.parse(storedCategories));
        } catch (error) {
          console.error('Failed to parse categories data', error);
          setCategories([]);
        }
      } else {
        // Create default categories if none exist
        const defaultCategories: Category[] = [
          { id: '1', name: 'Work', color: '#4f46e5' },
          { id: '2', name: 'Personal', color: '#10b981' },
          { id: '3', name: 'Health', color: '#ef4444' },
          { id: '4', name: 'Learning', color: '#f59e0b' },
        ];
        
        setCategories(defaultCategories);
        localStorage.setItem(`${userIdPrefix}${STORAGE_KEYS.CATEGORIES}`, JSON.stringify(defaultCategories));
      }
      
      // Load tags
      const storedTags = localStorage.getItem(`${userIdPrefix}${STORAGE_KEYS.TAGS}`);
      if (storedTags) {
        try {
          setTags(JSON.parse(storedTags));
        } catch (error) {
          console.error('Failed to parse tags data', error);
          setTags([]);
        }
      } else {
        // Create default tags if none exist
        const defaultTags: Tag[] = [
          { id: '1', name: 'Urgent' },
          { id: '2', name: 'Important' },
          { id: '3', name: 'Low Priority' },
        ];
        
        setTags(defaultTags);
        localStorage.setItem(`${userIdPrefix}${STORAGE_KEYS.TAGS}`, JSON.stringify(defaultTags));
      }
    } else {
      // Reset state when user logs out
      setTasks([]);
      setCategories([]);
      setTags([]);
    }
    
    setIsLoading(false);
  }, [user]);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (user && tasks.length > 0) {
      const userIdPrefix = `user_${user.id}_`;
      localStorage.setItem(`${userIdPrefix}${STORAGE_KEYS.TASKS}`, JSON.stringify(tasks));
    }
  }, [tasks, user]);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    if (user && categories.length > 0) {
      const userIdPrefix = `user_${user.id}_`;
      localStorage.setItem(`${userIdPrefix}${STORAGE_KEYS.CATEGORIES}`, JSON.stringify(categories));
    }
  }, [categories, user]);

  // Save tags to localStorage whenever they change
  useEffect(() => {
    if (user && tags.length > 0) {
      const userIdPrefix = `user_${user.id}_`;
      localStorage.setItem(`${userIdPrefix}${STORAGE_KEYS.TAGS}`, JSON.stringify(tags));
    }
  }, [tags, user]);

  // Check for active time tracking and update durations every second
  useEffect(() => {
    if (!currentlyTrackedTaskId) return;
    
    const intervalId = setInterval(() => {
      setTasks(currentTasks => 
        currentTasks.map(task => {
          if (task.id !== currentlyTrackedTaskId) return task;
          
          const activeTimeLog = task.timeLogs.find(log => log.startTime && !log.endTime);
          if (!activeTimeLog) return task;
          
          // Calculate current duration
          const startTime = new Date(activeTimeLog.startTime).getTime();
          const currentTime = new Date().getTime();
          const durationInSeconds = Math.floor((currentTime - startTime) / 1000);
          
          // Update the time log
          return {
            ...task,
            timeLogs: task.timeLogs.map(log => 
              log.id === activeTimeLog.id ? { ...log, duration: durationInSeconds } : log
            )
          };
        })
      );
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [currentlyTrackedTaskId]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timeLogs'>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeLogs: [],
    };
    
    setTasks(prevTasks => [...prevTasks, newTask]);
    toast.success('Task added successfully');
  };

  const updateTask = (id: string, taskData: Partial<Task>) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id
          ? { ...task, ...taskData, updatedAt: new Date().toISOString() }
          : task
      )
    );
    toast.success('Task updated');
  };

  const deleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    toast.success('Task deleted');
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id
          ? { 
              ...task, 
              completed: !task.completed, 
              updatedAt: new Date().toISOString() 
            }
          : task
      )
    );
    
    const completedTask = tasks.find(task => task.id === id);
    toast.success(completedTask?.completed ? 'Task marked as incomplete' : 'Task completed');
  };

  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      ...categoryData,
    };
    
    setCategories(prevCategories => [...prevCategories, newCategory]);
    toast.success('Category added');
  };

  const updateCategory = (id: string, categoryData: Partial<Category>) => {
    setCategories(prevCategories => 
      prevCategories.map(category => 
        category.id === id
          ? { ...category, ...categoryData }
          : category
      )
    );
    toast.success('Category updated');
  };

  const deleteCategory = (id: string) => {
    // Check if any tasks use this category
    const tasksWithCategory = tasks.filter(task => task.categoryId === id);
    
    if (tasksWithCategory.length > 0) {
      toast.error('Cannot delete category that has tasks assigned to it');
      return;
    }
    
    setCategories(prevCategories => prevCategories.filter(category => category.id !== id));
    toast.success('Category deleted');
  };

  const addTag = (tagData: Omit<Tag, 'id'>) => {
    const newTag: Tag = {
      id: Date.now().toString(),
      ...tagData,
    };
    
    setTags(prevTags => [...prevTags, newTag]);
    toast.success('Tag added');
  };

  const deleteTag = (id: string) => {
    // Remove this tag from all tasks that have it
    setTasks(prevTasks => 
      prevTasks.map(task => ({
        ...task,
        tags: task.tags.filter(tagId => tagId !== id),
      }))
    );
    
    setTags(prevTags => prevTags.filter(tag => tag.id !== id));
    toast.success('Tag removed');
  };

  const startTimeTracking = (taskId: string) => {
    // If another task is currently being tracked, stop it first
    if (currentlyTrackedTaskId && currentlyTrackedTaskId !== taskId) {
      stopTimeTracking(currentlyTrackedTaskId);
    }
    
    setCurrentlyTrackedTaskId(taskId);
    
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id !== taskId) return task;
        
        // Create a new time log entry
        const newTimeLog: TaskTimeLog = {
          id: Date.now().toString(),
          taskId,
          startTime: new Date().toISOString(),
          endTime: null,
          duration: 0,
        };
        
        return {
          ...task,
          timeLogs: [...task.timeLogs, newTimeLog],
        };
      })
    );
    
    const taskName = tasks.find(t => t.id === taskId)?.title;
    toast.success(`Started tracking time for "${taskName}"`);
  };

  const stopTimeTracking = (taskId: string) => {
    const endTime = new Date().toISOString();
    
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id !== taskId) return task;
        
        return {
          ...task,
          timeLogs: task.timeLogs.map(log => {
            if (log.endTime === null) {
              // Calculate final duration
              const startTimeMs = new Date(log.startTime).getTime();
              const endTimeMs = new Date(endTime).getTime();
              const durationInSeconds = Math.floor((endTimeMs - startTimeMs) / 1000);
              
              return {
                ...log,
                endTime,
                duration: durationInSeconds,
              };
            }
            return log;
          }),
        };
      })
    );
    
    setCurrentlyTrackedTaskId(null);
    
    const taskName = tasks.find(t => t.id === taskId)?.title;
    toast.success(`Stopped tracking time for "${taskName}"`);
  };

  const getCurrentlyTrackedTask = (): Task | null => {
    if (!currentlyTrackedTaskId) return null;
    return tasks.find(task => task.id === currentlyTrackedTaskId) || null;
  };

  const getTaskById = (id: string): Task | undefined => {
    return tasks.find(task => task.id === id);
  };

  const getCategoryById = (id: string): Category | undefined => {
    return categories.find(category => category.id === id);
  };

  const getTagById = (id: string): Tag | undefined => {
    return tags.find(tag => tag.id === id);
  };

  const searchTasks = (query: string): Task[] => {
    const lowercasedQuery = query.toLowerCase();
    return tasks.filter(task => 
      task.title.toLowerCase().includes(lowercasedQuery) || 
      task.description.toLowerCase().includes(lowercasedQuery)
    );
  };

  const filterTasks = (filters: {
    categoryIds?: string[];
    tagIds?: string[];
    completed?: boolean;
    scheduled?: boolean;
  }): Task[] => {
    return tasks.filter(task => {
      // Filter by category
      if (filters.categoryIds && filters.categoryIds.length > 0) {
        if (!filters.categoryIds.includes(task.categoryId)) {
          return false;
        }
      }
      
      // Filter by tags
      if (filters.tagIds && filters.tagIds.length > 0) {
        if (!filters.tagIds.some(tagId => task.tags.includes(tagId))) {
          return false;
        }
      }
      
      // Filter by completion status
      if (filters.completed !== undefined) {
        if (task.completed !== filters.completed) {
          return false;
        }
      }
      
      // Filter by scheduled status
      if (filters.scheduled !== undefined) {
        const isScheduled = task.scheduledDate !== null;
        if (isScheduled !== filters.scheduled) {
          return false;
        }
      }
      
      return true;
    });
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        categories,
        tags,
        isLoading,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        addCategory,
        updateCategory,
        deleteCategory,
        addTag,
        deleteTag,
        startTimeTracking,
        stopTimeTracking,
        getCurrentlyTrackedTask,
        getTaskById,
        getCategoryById,
        getTagById,
        searchTasks,
        filterTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
