import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 
    | 'shortlisted' | 'quoted' | 'booked' | 'confirmed' | 'done' // vendor statuses
    | 'health' // health dot
    | 'event'; // event chip wrapper
  status?: 'good' | 'at-risk' | 'critical'; // for health variant
  eventType?: 'haldi' | 'mehendi' | 'sangeet' | 'engagement' | 'wedding' | 'reception' | 'custom'; // for event variant
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'shortlisted', 
  status, 
  eventType, 
  className, 
  ...props 
}) => {
  if (variant === 'health') {
    const healthColors = {
      'good': 'bg-success',
      'at-risk': 'bg-warning',
      'critical': 'bg-danger'
    };
    const activeColor = status ? healthColors[status] : 'bg-gray-300';
    return (
      <div className={cn("flex items-center gap-1.5", className)} {...props}>
        <div className={cn("w-2.5 h-2.5 rounded-full", activeColor)} />
        {children && <span className="text-xs font-medium tracking-wide uppercase">{children}</span>}
      </div>
    );
  }

  if (variant === 'event' && eventType) {
    const eventStyles = {
      haldi: "bg-haldi-bg text-haldi-text border-haldi-border",
      mehendi: "bg-mehendi-bg text-mehendi-text border-mehendi-border",
      sangeet: "bg-sangeet-bg text-sangeet-text border-sangeet-border",
      engagement: "bg-engagement-bg text-engagement-text border-engagement-border",
      wedding: "bg-wedding-event-bg text-wedding-event-text border-wedding-event-border",
      reception: "bg-reception-bg text-reception-text border-reception-border",
      custom: "bg-gray-100 text-gray-600 border-gray-200"
    };

    return (
      <span className={cn(
        "inline-flex items-center justify-center rounded-full text-xs font-medium tracking-wide uppercase px-2.5 py-0.5 border", 
        eventStyles[eventType] || eventStyles.custom,
        className
      )} {...props}>
        {children}
      </span>
    );
  }

  // Fallback to vendor statuses
  const baseVendorStyles = "inline-flex items-center justify-center rounded-full text-xs font-medium tracking-wide uppercase px-2.5 py-0.5";
  const vendorVariants = {
    shortlisted: "bg-gray-100 text-gray-600",
    quoted: "bg-yellow-50 text-yellow-900",
    booked: "bg-blue-100 text-blue-800",
    confirmed: "bg-emerald-100 text-emerald-800",
    done: "bg-vivaah-100 text-vivaah-800",
  };

  const vClass = (variant in vendorVariants) ? vendorVariants[variant as keyof typeof vendorVariants] : vendorVariants.shortlisted;

  return (
    <span className={cn(baseVendorStyles, vClass, className)} {...props}>
      {children}
    </span>
  );
};
