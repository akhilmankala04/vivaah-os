import React from 'react';
import { cn } from '../../lib/utils';

interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className, ...props }) => {
  return (
    <div 
      className={cn("animate-pulse bg-gray-100 rounded-2xl w-full h-32", className)} 
      {...props}
    />
  );
};
