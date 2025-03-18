
import React from 'react';
import { useTask, Category } from '@/context/TaskContext';
import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  categoryId: string;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ categoryId, className }) => {
  const { getCategoryById } = useTask();
  const category = getCategoryById(categoryId);
  
  if (!category) return null;
  
  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        className
      )}
      style={{ 
        backgroundColor: `${category.color}20`, // 20% opacity
        color: category.color,
        borderColor: `${category.color}30`,
      }}
    >
      {category.name}
    </span>
  );
};

interface CategoryIconProps {
  category: Category;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  category, 
  size = 'md',
  className 
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };
  
  return (
    <span 
      className={cn(
        "inline-block rounded-full",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: category.color }}
    />
  );
};
