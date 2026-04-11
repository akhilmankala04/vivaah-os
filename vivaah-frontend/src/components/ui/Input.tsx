import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string; // Required per spec
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, value, ...props }, ref) => {
    // Spec: "Label always rendered above input, always visible when field has value, never placeholder-only"
    return (
      <div className="flex flex-col w-full">
        <label className="text-sm font-normal text-gray-700 mb-1">{label}</label>
        <input
          ref={ref}
          value={value}
          className={cn(
            "h-11 w-full border rounded-xl outline-none bg-white px-3 text-[15px] transition-colors",
            error ? "border-danger focus:border-danger focus:ring-0" : "border-gray-300 focus:border-vivaah-600 focus:ring-0",
            className
          )}
          {...props}
        />
        {error ? (
          <span className="text-sm text-danger mt-1">{error}</span>
        ) : helperText ? (
          <span className="text-sm text-gray-500 mt-1">{helperText}</span>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';
