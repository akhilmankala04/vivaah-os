import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'default' | 'small';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', disabled, children, ...props }, ref) => {
    
    // min-h-[44px] min-w-[44px] requirement per style rules applies to default buttons too, but sizes have classes
    const isSmall = size === 'small';
    const baseHeight = isSmall ? "min-h-[44px] h-[44px] min-w-[44px]" : "h-11 min-h-[44px] min-w-[44px]";
    const basePadding = isSmall ? "px-3.5" : "px-5";
    const baseRounded = isSmall ? "rounded-lg" : "rounded-xl";
    const baseText = isSmall ? "text-sm" : "text-[15px]";

    const baseStyles = cn("font-medium transition-colors inline-flex items-center justify-center", baseHeight, basePadding, baseRounded, baseText);
    
    const variants = {
      primary: "bg-vivaah-600 text-white hover:bg-vivaah-800",
      secondary: "border border-vivaah-600 text-vivaah-600 hover:bg-vivaah-50",
      ghost: "text-gray-500 hover:bg-gray-100",
      danger: "bg-danger text-white hover:bg-red-700",
    };
    
    const disabledStyles = disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "";

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], disabledStyles, className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
