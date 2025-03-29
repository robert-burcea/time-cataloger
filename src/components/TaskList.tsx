
import React, { useState } from 'react';
import { X, ListFilter, Search, PlusCircle, CheckSquare, Tag as TagIcon, Clock } from 'lucide-react';
import { useTask, Task } from '@/context/TaskContext';
import TaskItem from './TaskItem';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TaskForm from './TaskForm';
import { CategoryBadge } from './CategoryBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TaskListProps {
  showCompleted?: boolean;
  title?: string;
  filter?: {
    categoryIds?: string[];
    tagIds?: string[];
    completed?: boolean;
    scheduled?: boolean;
  };
  emptyMessage?: string;
}

const TaskList: React.FC<TaskListProps> = ({
  showCompleted = true,
  title = 'Tasks',
  filter = {},
  emptyMessage = 'No tasks found'
}) => {
  const { tasks, categories, tags, filterTasks } = useTask();
  const [searchQuery, setSearchQuery] = useState('');
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(filter.categoryIds || []);
  const [selectedTags, setSelectedTags] = useState<string[]>(filter.tagIds || []);
  const [showCompletedFilter, setShowCompletedFilter] = useState(showCompleted);
  
  // Apply filters and search
  const filteredTasks = filterTasks({
    ...filter,
    categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
    tagIds: selectedTags.length > 0 ? selectedTags : undefined,
    completed: showCompletedFilter ? undefined : false,
  }).filter(task => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }
    return true;
  });
  
  // Group tasks by date
  const groupTasksByDate = (tasks: Task[]) => {
    const groups: Record<string, Task[]> = {};
    
    tasks.forEach(task => {
      const date = task.scheduledDate || new Date().toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(task);
    });
    
    // Sort dates
    return Object.keys(groups)
      .sort()
      .map(date => ({
        date,
        tasks: groups[date]
      }));
  };
  
  const groupedTasks = groupTasksByDate(filteredTasks);
  
  const handleEditTask = (taskId: string) => {
    setEditingTaskId(taskId);
    setTaskDialogOpen(true);
  };
  
  const handleAddTask = () => {
    setEditingTaskId(null);
    setTaskDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setTaskDialogOpen(false);
    setEditingTaskId(null);
  };
  
  const formatDate = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    
    if (dateString === today) {
      return 'Today';
    } else if (dateString === tomorrow) {
      return 'Tomorrow';
    } else {
      return format(new Date(dateString), 'EEEE, MMMM d');
    }
  };
  
  return (
    <div className="space-y-6">
      {groupedTasks.length > 0 ? (
        groupedTasks.map(group => (
          <div key={group.date} className="space-y-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">{formatDate(group.date)}</h3>
            </div>
            <div className="space-y-1">
              {group.tasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  compact={true}
                  onClick={() => handleEditTask(task.id)}
                />
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-foreground mt-1"
                onClick={handleAddTask}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add task
              </Button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12 border border-dashed rounded-lg border-border">
          <CheckSquare className="h-10 w-10 mx-auto text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">{emptyMessage}</p>
          <Button variant="outline" className="mt-4" onClick={handleAddTask}>
            Add your first task
          </Button>
        </div>
      )}
      
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTaskId ? 'Edit Task' : 'Create Task'}</DialogTitle>
          </DialogHeader>
          <TaskForm
            taskId={editingTaskId ?? undefined}
            onSubmit={handleCloseDialog}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskList;
