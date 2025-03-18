
import React, { useState } from 'react';
import { X, ListFilter, Search, PlusCircle, CheckSquare, Tag as TagIcon } from 'lucide-react';
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
  
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };
  
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedTags([]);
    setSearchQuery('');
  };
  
  const hasActiveFilters = selectedCategories.length > 0 || selectedTags.length > 0 || searchQuery;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <Button onClick={handleAddTask} variant="default" size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <ListFilter className="h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 font-normal">
                    {selectedCategories.length + selectedTags.length + (searchQuery ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter Tasks</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuCheckboxItem
                checked={showCompletedFilter}
                onCheckedChange={setShowCompletedFilter}
              >
                Show completed tasks
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel className="text-xs">Categories</DropdownMenuLabel>
              {categories.map(category => (
                <DropdownMenuCheckboxItem
                  key={category.id}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="flex-1 truncate">{category.name}</span>
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel className="text-xs">Tags</DropdownMenuLabel>
              {tags.map(tag => (
                <DropdownMenuCheckboxItem
                  key={tag.id}
                  checked={selectedTags.includes(tag.id)}
                  onCheckedChange={() => toggleTag(tag.id)}
                >
                  <span className="flex-1 truncate">{tag.name}</span>
                </DropdownMenuCheckboxItem>
              ))}
              
              {hasActiveFilters && (
                <>
                  <DropdownMenuSeparator />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center text-xs"
                    onClick={clearFilters}
                  >
                    Clear all filters
                  </Button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map(categoryId => {
            const category = categories.find(c => c.id === categoryId);
            return category ? (
              <Badge 
                key={categoryId}
                variant="secondary"
                className="flex gap-1 items-center p-1 pl-2"
              >
                <div 
                  className="h-2 w-2 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <span>{category.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1 hover:bg-accent/50"
                  onClick={() => toggleCategory(categoryId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ) : null;
          })}
          
          {selectedTags.map(tagId => {
            const tag = tags.find(t => t.id === tagId);
            return tag ? (
              <Badge
                key={tagId}
                variant="secondary"
                className="flex gap-1 items-center p-1 pl-2"
              >
                <TagIcon className="h-3 w-3" />
                <span>{tag.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1 hover:bg-accent/50"
                  onClick={() => toggleTag(tagId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ) : null;
          })}
          
          {searchQuery && (
            <Badge
              variant="secondary"
              className="flex gap-1 items-center p-1 pl-2"
            >
              <Search className="h-3 w-3" />
              <span>{searchQuery}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 ml-1 hover:bg-accent/50"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-6 px-2"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        </div>
      )}
      
      <div className="space-y-2">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onClick={() => handleEditTask(task.id)}
            />
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
      </div>
      
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
