
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock as ClockIcon, Tag as TagIcon, X, Plus } from 'lucide-react';
import { useTask, Category, Tag, Task } from '@/context/TaskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CategoryBadge } from './CategoryBadge';
import { cn } from '@/lib/utils';
import { formatDateForDisplay } from '@/utils/timeUtils';

interface TaskFormProps {
  taskId?: string;
  onSubmit: () => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ taskId, onSubmit, onCancel }) => {
  const { 
    categories, 
    tags, 
    getTaskById,
    addTask,
    updateTask
  } = useTask();
  
  const existingTask = taskId ? getTaskById(taskId) : null;
  
  const [title, setTitle] = useState(existingTask?.title || '');
  const [description, setDescription] = useState(existingTask?.description || '');
  const [categoryId, setCategoryId] = useState(existingTask?.categoryId || categories[0]?.id || '');
  const [completed, setCompleted] = useState(existingTask?.completed || false);
  const [selectedTags, setSelectedTags] = useState<string[]>(existingTask?.tags || []);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    existingTask?.scheduledDate ? new Date(existingTask.scheduledDate) : undefined
  );
  const [isRecurring, setIsRecurring] = useState(existingTask?.isRecurring || false);
  const [startTime, setStartTime] = useState(existingTask?.scheduledStartTime || '');
  const [endTime, setEndTime] = useState(existingTask?.scheduledEndTime || '');
  
  useEffect(() => {
    // If we're editing and the start/end times aren't set but there's a date,
    // default to 9 AM - 10 AM
    if (existingTask?.scheduledDate && !existingTask.scheduledStartTime) {
      setStartTime('09:00');
    }
    
    if (existingTask?.scheduledDate && !existingTask.scheduledEndTime) {
      setEndTime('10:00');
    }
  }, [existingTask]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      title,
      description,
      categoryId,
      completed,
      deadline: null, // Not implemented in the UI yet
      scheduledDate: scheduledDate ? scheduledDate.toISOString() : null,
      scheduledStartTime: startTime || null,
      scheduledEndTime: endTime || null,
      tags: selectedTags,
      isRecurring,
      recurrencePattern: isRecurring ? 'daily' : undefined, // Default pattern, can be expanded
    };
    
    if (existingTask) {
      updateTask(existingTask.id, taskData);
    } else {
      addTask(taskData);
    }
    
    onSubmit();
  };
  
  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Task Title</Label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="mt-1"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details about this task"
            className="mt-1 min-h-[80px]"
          />
        </div>
        
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={categoryId}
            onValueChange={setCategoryId}
          >
            <SelectTrigger id="category" className="mt-1">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Tags</Label>
          <div className="mt-1 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  "cursor-pointer px-3 py-1 rounded-full text-xs font-medium transition-colors",
                  selectedTags.includes(tag.id)
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-secondary text-muted-foreground border border-transparent hover:border-border"
                )}
              >
                <div className="flex items-center gap-1">
                  {selectedTags.includes(tag.id) && <X className="h-3 w-3" />}
                  {tag.name}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          <Label>Schedule</Label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left w-full sm:w-auto font-normal",
                    !scheduledDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduledDate ? formatDateForDisplay(scheduledDate) : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={setScheduledDate}
                  className="p-3 pointer-events-auto"
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
            
            {scheduledDate && (
              <>
                <div className="flex gap-2 w-full">
                  <div className="w-1/2">
                    <Label htmlFor="startTime" className="text-xs">Start</Label>
                    <div className="flex items-center mt-1">
                      <ClockIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input
                        id="startTime"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="flex-grow"
                      />
                    </div>
                  </div>
                  <div className="w-1/2">
                    <Label htmlFor="endTime" className="text-xs">End</Label>
                    <div className="flex items-center mt-1">
                      <ClockIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input
                        id="endTime"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="flex-grow"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-3">
                  <Switch
                    id="recurring"
                    checked={isRecurring}
                    onCheckedChange={setIsRecurring}
                  />
                  <Label htmlFor="recurring" className="text-sm cursor-pointer">Recurring task</Label>
                </div>
              </>
            )}
          </div>
        </div>
        
        {existingTask && (
          <div className="flex items-center space-x-2">
            <Switch
              id="completed"
              checked={completed}
              onCheckedChange={setCompleted}
            />
            <Label htmlFor="completed" className="cursor-pointer">Mark as completed</Label>
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {existingTask ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
