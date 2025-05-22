import { cn } from '@/lib/utils';
import { Grid2x2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex justify-center items-center h-full w-full min-h-[100px]">
      <div className={cn(
        "relative flex items-center justify-center",
        sizeClasses[size],
        className
      )}>
        {/* Background circle */}
        <div className="absolute inset-0 rounded-full bg-primary/10 dark:bg-primary/20" />
        
        {/* Rotating window icon */}
        <Grid2x2 
          className={cn(
            "animate-spin text-primary",
            sizeClasses[size]
          )} 
        />
      </div>
    </div>
  );
}