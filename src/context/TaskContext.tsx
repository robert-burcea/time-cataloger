import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { supabase, safeSupabaseOperation, isSupabaseConfigured } from '@/utils/supabase';

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

export type RecurrenceInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';

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
  recurrenceFrequency?: number;
  recurrenceInterval?: RecurrenceInterval;
  recurrenceEndDate?: string | null;
  timeLogs: TaskTimeLog[];
};

type TaskContextType = {
  tasks: Task[];
  categories: Category[];
  tags: Tag[];
  isLoading: boolean;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timeLogs'>) => Promise<void>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, categoryData: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addTag: (tag: Omit<Tag, 'id'>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  startTimeTracking: (taskId: string) => Promise<void>;
  stopTimeTracking: (taskId: string) => Promise<void>;
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

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, supabaseReady } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentlyTrackedTaskId, setCurrentlyTrackedTaskId] = useState<string | null>(null);
  const [timeLogs, setTimeLogs] = useState<Record<string, TaskTimeLog[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setTasks([]);
        setCategories([]);
        setTags([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const supabaseUnavailable = !isSupabaseConfigured() || !supabaseReady;
        if (supabaseUnavailable) {
          const defaultCategories: Category[] = [
            { id: 'cat-1', name: 'Work', color: '#4f46e5' },
            { id: 'cat-2', name: 'Personal', color: '#10b981' },
            { id: 'cat-3', name: 'Health', color: '#ef4444' },
            { id: 'cat-4', name: 'Learning', color: '#f59e0b' },
          ];
          
          const defaultTags: Tag[] = [
            { id: 'tag-1', name: 'Urgent' },
            { id: 'tag-2', name: 'Important' },
            { id: 'tag-3', name: 'Low Priority' },
          ];
          
          const defaultTasks: Task[] = [
            {
              id: 'task-1',
              title: 'Complete project proposal',
              description: 'Finish the draft and send for review',
              categoryId: 'cat-1',
              completed: false,
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date().toISOString(),
              deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              scheduledDate: new Date().toISOString().split('T')[0],
              scheduledStartTime: '09:00:00',
              scheduledEndTime: '11:00:00',
              tags: ['tag-1', 'tag-2'],
              isRecurring: false,
              timeLogs: []
            },
            {
              id: 'task-2',
              title: 'Workout session',
              description: 'Cardio and strength training',
              categoryId: 'cat-3',
              completed: true,
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date().toISOString(),
              deadline: null,
              scheduledDate: new Date().toISOString().split('T')[0],
              scheduledStartTime: '17:00:00',
              scheduledEndTime: '18:00:00',
              tags: ['tag-3'],
              isRecurring: true,
              recurrenceInterval: 'daily',
              recurrenceFrequency: 1,
              timeLogs: []
            },
          ];
          
          setCategories(defaultCategories);
          setTags(defaultTags);
          setTasks(defaultTasks);
          setIsLoading(false);
          return;
        }

        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id);

        if (categoriesError) throw categoriesError;

        if (categoriesData && categoriesData.length > 0) {
          setCategories(categoriesData.map(cat => ({
            id: cat.id,
            name: cat.name,
            color: cat.color
          })));
        } else {
          const defaultCategories: Omit<Category, 'id'>[] = [
            { name: 'Work', color: '#4f46e5' },
            { name: 'Personal', color: '#10b981' },
            { name: 'Health', color: '#ef4444' },
            { name: 'Learning', color: '#f59e0b' },
          ];
          
          for (const category of defaultCategories) {
            await addCategory(category);
          }
        }

        const { data: tagsData, error: tagsError } = await supabase
          .from('tags')
          .select('*')
          .eq('user_id', user.id);

        if (tagsError) throw tagsError;

        if (tagsData && tagsData.length > 0) {
          setTags(tagsData.map(tag => ({
            id: tag.id,
            name: tag.name
          })));
        } else {
          const defaultTags: Omit<Tag, 'id'>[] = [
            { name: 'Urgent' },
            { name: 'Important' },
            { name: 'Low Priority' },
          ];
          
          for (const tag of defaultTags) {
            await addTag(tag);
          }
        }

        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id);

        if (tasksError) throw tasksError;

        const { data: taskTagsData, error: taskTagsError } = await supabase
          .from('task_tags')
          .select('*');

        if (taskTagsError) throw taskTagsError;

        const taskTagsMap: Record<string, string[]> = {};
        taskTagsData?.forEach(tt => {
          if (!taskTagsMap[tt.task_id]) {
            taskTagsMap[tt.task_id] = [];
          }
          taskTagsMap[tt.task_id].push(tt.tag_id);
        });

        const { data: timeLogsData, error: timeLogsError } = await supabase
          .from('time_logs')
          .select('*')
          .eq('user_id', user.id);

        if (timeLogsError) throw timeLogsError;

        const timeLogsMap: Record<string, TaskTimeLog[]> = {};
        timeLogsData?.forEach(tl => {
          if (!timeLogsMap[tl.task_id]) {
            timeLogsMap[tl.task_id] = [];
          }
          timeLogsMap[tl.task_id].push({
            id: tl.id,
            taskId: tl.task_id,
            startTime: tl.start_time,
            endTime: tl.end_time,
            duration: tl.duration
          });
        });

        setTimeLogs(timeLogsMap);

        if (tasksData) {
          setTasks(tasksData.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            categoryId: task.category_id,
            completed: task.completed,
            createdAt: task.created_at,
            updatedAt: task.updated_at,
            deadline: task.deadline,
            scheduledDate: task.scheduled_date,
            scheduledStartTime: task.scheduled_start_time,
            scheduledEndTime: task.scheduled_end_time,
            tags: taskTagsMap[task.id] || [],
            isRecurring: task.is_recurring || false,
            recurrencePattern: task.recurrence_pattern || undefined,
            recurrenceFrequency: task.recurrence_frequency,
            recurrenceInterval: task.recurrence_interval as RecurrenceInterval,
            recurrenceEndDate: task.recurrence_end_date,
            timeLogs: timeLogsMap[task.id] || []
          })));
        }

        const activeLog = timeLogsData?.find(log => log.end_time === null);
        if (activeLog) {
          setCurrentlyTrackedTaskId(activeLog.task_id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load your tasks and categories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, supabaseReady]);

  useEffect(() => {
    if (!currentlyTrackedTaskId) return;
    
    const intervalId = setInterval(() => {
      setTasks(currentTasks => 
        currentTasks.map(task => {
          if (task.id !== currentlyTrackedTaskId) return task;
          
          const activeTimeLog = task.timeLogs.find(log => log.startTime && !log.endTime);
          if (!activeTimeLog) return task;
          
          const startTime = new Date(activeTimeLog.startTime).getTime();
          const currentTime = new Date().getTime();
          const durationInSeconds = Math.floor((currentTime - startTime) / 1000);
          
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

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'timeLogs'>) => {
    if (!user) {
      toast.error('You must be logged in to add a task');
      return;
    }
    
    try {
      const now = new Date().toISOString();
      
      const localTaskId = `task-${Date.now()}`;
      
      const newTaskWithRelations: Task = {
        id: localTaskId,
        title: taskData.title,
        description: taskData.description,
        categoryId: taskData.categoryId,
        completed: taskData.completed || false,
        createdAt: now,
        updatedAt: now,
        deadline: taskData.deadline || null,
        scheduledDate: taskData.scheduledDate || null,
        scheduledStartTime: taskData.scheduledStartTime || null,
        scheduledEndTime: taskData.scheduledEndTime || null,
        tags: taskData.tags || [],
        isRecurring: taskData.isRecurring || false,
        recurrencePattern: taskData.recurrencePattern || undefined,
        recurrenceFrequency: taskData.recurrenceFrequency || undefined,
        recurrenceInterval: taskData.recurrenceInterval || undefined,
        recurrenceEndDate: taskData.recurrenceEndDate || null,
        timeLogs: []
      };
      
      if (!isSupabaseConfigured() || !supabaseReady) {
        setTasks(prev => [...prev, newTaskWithRelations]);
        toast.success('Task added successfully');
        return;
      }
      
      const { data: newTask, error: taskError } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          category_id: taskData.categoryId,
          completed: taskData.completed || false,
          deadline: taskData.deadline || null,
          scheduled_date: taskData.scheduledDate || null,
          scheduled_start_time: taskData.scheduledStartTime || null,
          scheduled_end_time: taskData.scheduledEndTime || null,
          user_id: user.id,
          is_recurring: taskData.isRecurring || false,
          recurrence_pattern: taskData.recurrencePattern || null,
          recurrence_frequency: taskData.recurrenceFrequency || null,
          recurrence_interval: taskData.recurrenceInterval || null,
          recurrence_end_date: taskData.recurrenceEndDate || null,
          created_at: now,
          updated_at: now
        })
        .select('*')
        .single();
      
      if (taskError) throw taskError;
      
      if (taskData.tags && taskData.tags.length > 0) {
        const taskTagsToInsert = taskData.tags.map(tagId => ({
          task_id: newTask.id,
          tag_id: tagId
        }));
        
        const { error: tagsError } = await supabase
          .from('task_tags')
          .insert(taskTagsToInsert);
        
        if (tagsError) throw tagsError;
      }
      
      newTaskWithRelations.id = newTask.id;
      
      setTasks(prev => [...prev, newTaskWithRelations]);
      toast.success('Task added successfully');
    } catch (error) {
      console.error('Error adding task:', error);
      
      if (import.meta.env.DEV) {
        const now = new Date().toISOString();
        const localTaskId = `task-${Date.now()}`;
        
        const newTaskWithRelations: Task = {
          id: localTaskId,
          title: taskData.title,
          description: taskData.description,
          categoryId: taskData.categoryId,
          completed: taskData.completed || false,
          createdAt: now,
          updatedAt: now,
          deadline: taskData.deadline || null,
          scheduledDate: taskData.scheduledDate || null,
          scheduledStartTime: taskData.scheduledStartTime || null,
          scheduledEndTime: taskData.scheduledEndTime || null,
          tags: taskData.tags || [],
          isRecurring: taskData.isRecurring || false,
          recurrencePattern: taskData.recurrencePattern || undefined,
          recurrenceFrequency: taskData.recurrenceFrequency || undefined,
          recurrenceInterval: taskData.recurrenceInterval || undefined,
          recurrenceEndDate: taskData.recurrenceEndDate || null,
          timeLogs: []
        };
        
        setTasks(prev => [...prev, newTaskWithRelations]);
        toast.success('Task added locally (Supabase connection failed)');
      } else {
        toast.error('Failed to add task');
      }
    }
  };

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    if (!user) return;
    
    try {
      const taskToUpdate = tasks.find(t => t.id === id);
      if (!taskToUpdate) return;
      
      const updateData = {
        title: taskData.title,
        description: taskData.description,
        category_id: taskData.categoryId,
        completed: taskData.completed,
        deadline: taskData.deadline,
        scheduled_date: taskData.scheduledDate,
        scheduled_start_time: taskData.scheduledStartTime,
        scheduled_end_time: taskData.scheduledEndTime,
        is_recurring: taskData.isRecurring,
        recurrence_pattern: taskData.recurrencePattern || null,
        recurrence_frequency: taskData.recurrenceFrequency || null,
        recurrence_interval: taskData.recurrenceInterval || null,
        recurrence_end_date: taskData.recurrenceEndDate || null,
        updated_at: new Date().toISOString()
      };
      
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });
      
      const { error: taskError } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id);
      
      if (taskError) throw taskError;
      
      if (taskData.tags !== undefined) {
        const { error: deleteError } = await supabase
          .from('task_tags')
          .delete()
          .eq('task_id', id);
        
        if (deleteError) throw deleteError;
        
        if (taskData.tags.length > 0) {
          const taskTagsToInsert = taskData.tags.map(tagId => ({
            task_id: id,
            tag_id: tagId
          }));
          
          const { error: insertError } = await supabase
            .from('task_tags')
            .insert(taskTagsToInsert);
          
          if (insertError) throw insertError;
        }
      }
      
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id
            ? { 
                ...task, 
                ...taskData,
                updatedAt: new Date().toISOString() 
              }
            : task
        )
      );
      
      toast.success('Task updated');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    
    try {
      const { error: tagsError } = await supabase
        .from('task_tags')
        .delete()
        .eq('task_id', id);
      
      if (tagsError) throw tagsError;
      
      const { error: logsError } = await supabase
        .from('time_logs')
        .delete()
        .eq('task_id', id);
      
      if (logsError) throw logsError;
      
      const { error: taskError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (taskError) throw taskError;
      
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      toast.success('Task deleted');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const toggleTaskCompletion = async (id: string) => {
    if (!user) return;
    
    try {
      const taskToToggle = tasks.find(t => t.id === id);
      if (!taskToToggle) return;
      
      const newCompletedState = !taskToToggle.completed;
      
      const { error } = await supabase
        .from('tasks')
        .update({ 
          completed: newCompletedState,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id
            ? { 
                ...task, 
                completed: newCompletedState, 
                updatedAt: new Date().toISOString() 
              }
            : task
        )
      );
      
      toast.success(newCompletedState ? 'Task completed' : 'Task marked as incomplete');
    } catch (error) {
      console.error('Error toggling task completion:', error);
      toast.error('Failed to update task status');
    }
  };

  const addCategory = async (categoryData: Omit<Category, 'id'>) => {
    if (!user) return;
    
    try {
      const { data: newCategory, error } = await supabase
        .from('categories')
        .insert({
          name: categoryData.name,
          color: categoryData.color,
          user_id: user.id,
          created_at: new Date().toISOString()
        })
        .select('*')
        .single();
      
      if (error) throw error;
      
      setCategories(prev => [
        ...prev, 
        { 
          id: newCategory.id, 
          name: newCategory.name, 
          color: newCategory.color 
        }
      ]);
      
      toast.success('Category added');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: categoryData.name,
          color: categoryData.color
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setCategories(prevCategories => 
        prevCategories.map(category => 
          category.id === id
            ? { ...category, ...categoryData }
            : category
        )
      );
      
      toast.success('Category updated');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user) return;
    
    const tasksWithCategory = tasks.filter(task => task.categoryId === id);
    
    if (tasksWithCategory.length > 0) {
      toast.error('Cannot delete category that has tasks assigned to it');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setCategories(prevCategories => prevCategories.filter(category => category.id !== id));
      toast.success('Category deleted');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const addTag = async (tagData: Omit<Tag, 'id'>) => {
    if (!user) return;
    
    try {
      const { data: newTag, error } = await supabase
        .from('tags')
        .insert({
          name: tagData.name,
          user_id: user.id,
          created_at: new Date().toISOString()
        })
        .select('*')
        .single();
      
      if (error) throw error;
      
      setTags(prev => [
        ...prev, 
        { 
          id: newTag.id, 
          name: newTag.name 
        }
      ]);
      
      toast.success('Tag added');
    } catch (error) {
      console.error('Error adding tag:', error);
      toast.error('Failed to add tag');
    }
  };

  const deleteTag = async (id: string) => {
    if (!user) return;
    
    try {
      const { error: relError } = await supabase
        .from('task_tags')
        .delete()
        .eq('tag_id', id);
      
      if (relError) throw relError;
      
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setTasks(prevTasks => 
        prevTasks.map(task => ({
          ...task,
          tags: task.tags.filter(tagId => tagId !== id),
        }))
      );
      
      setTags(prevTags => prevTags.filter(tag => tag.id !== id));
      toast.success('Tag removed');
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error('Failed to delete tag');
    }
  };

  const startTimeTracking = async (taskId: string) => {
    if (!user) return;
    
    try {
      if (currentlyTrackedTaskId && currentlyTrackedTaskId !== taskId) {
        await stopTimeTracking(currentlyTrackedTaskId);
      }
      
      const startTime = new Date().toISOString();
      const newLogId = `log-${Date.now()}`;
      
      if (!isSupabaseConfigured() || !supabaseReady) {
        setCurrentlyTrackedTaskId(taskId);
        
        setTasks(prevTasks => 
          prevTasks.map(task => {
            if (task.id !== taskId) return task;
            
            const newLog: TaskTimeLog = {
              id: newLogId,
              taskId,
              startTime: startTime,
              endTime: null,
              duration: 0,
            };
            
            return {
              ...task,
              timeLogs: [...task.timeLogs, newLog],
            };
          })
        );
        
        const taskName = tasks.find(t => t.id === taskId)?.title;
        toast.success(`Started tracking time for "${taskName}"`);
        return;
      }
      
      const { data: newTimeLog, error } = await supabase
        .from('time_logs')
        .insert({
          task_id: taskId,
          start_time: startTime,
          end_time: null,
          duration: 0,
          user_id: user.id,
          created_at: startTime
        })
        .select('*')
        .single();
      
      if (error) throw error;
      
      setCurrentlyTrackedTaskId(taskId);
      
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id !== taskId) return task;
          
          const newLog: TaskTimeLog = {
            id: newTimeLog.id,
            taskId,
            startTime: startTime,
            endTime: null,
            duration: 0,
          };
          
          return {
            ...task,
            timeLogs: [...task.timeLogs, newLog],
          };
        })
      );
      
      const taskName = tasks.find(t => t.id === taskId)?.title;
      toast.success(`Started tracking time for "${taskName}"`);
    } catch (error) {
      console.error('Error starting time tracking:', error);
      
      if (import.meta.env.DEV) {
        const startTime = new Date().toISOString();
        const newLogId = `log-${Date.now()}`;
        
        setCurrentlyTrackedTaskId(taskId);
        
        setTasks(prevTasks => 
          prevTasks.map(task => {
            if (task.id !== taskId) return task;
            
            const newLog: TaskTimeLog = {
              id: newLogId,
              taskId,
              startTime: startTime,
              endTime: null,
              duration: 0,
            };
            
            return {
              ...task,
              timeLogs: [...task.timeLogs, newLog],
            };
          })
        );
        
        const taskName = tasks.find(t => t.id === taskId)?.title;
        toast.success(`Started tracking time locally for "${taskName}" (Supabase connection failed)`);
      } else {
        toast.error('Failed to start time tracking');
      }
    }
  };

  const stopTimeTracking = async (taskId: string) => {
    if (!user) return;
    
    try {
      const taskToStop = tasks.find(t => t.id === taskId);
      if (!taskToStop) return;
      
      const activeLog = taskToStop.timeLogs.find(log => !log.endTime);
      if (!activeLog) return;
      
      const endTime = new Date().toISOString();
      
      const startTimeMs = new Date(activeLog.startTime).getTime();
      const endTimeMs = new Date(endTime).getTime();
      const durationInSeconds = Math.floor((endTimeMs - startTimeMs) / 1000);
      
      const { error } = await supabase
        .from('time_logs')
        .update({
          end_time: endTime,
          duration: durationInSeconds
        })
        .eq('id', activeLog.id);
      
      if (error) throw error;
      
      setCurrentlyTrackedTaskId(null);
      
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id !== taskId) return task;
          
          return {
            ...task,
            timeLogs: task.timeLogs.map(log => {
              if (log.id === activeLog.id) {
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
      
      const taskName = taskToStop.title;
      toast.success(`Stopped tracking time for "${taskName}"`);
    } catch (error) {
      console.error('Error stopping time tracking:', error);
      toast.error('Failed to stop time tracking');
    }
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
      if (filters.categoryIds && filters.categoryIds.length > 0) {
        if (!filters.categoryIds.includes(task.categoryId)) {
          return false;
        }
      }
      
      if (filters.tagIds && filters.tagIds.length > 0) {
        if (!filters.tagIds.some(tagId => task.tags.includes(tagId))) {
          return false;
        }
      }
      
      if (filters.completed !== undefined) {
        if (task.completed !== filters.completed) {
          return false;
        }
      }
      
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
