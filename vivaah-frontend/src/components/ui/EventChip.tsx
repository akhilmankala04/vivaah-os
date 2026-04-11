import React from 'react';
import { Badge } from './Badge';

interface EventChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  eventType: 'haldi' | 'mehendi' | 'sangeet' | 'engagement' | 'wedding' | 'reception' | 'custom';
  label?: string; // Optional override for custom text
}

export const EventChip: React.FC<EventChipProps> = ({ eventType, label, className, ...props }) => {
  const defaultLabels = {
    haldi: 'Haldi',
    mehendi: 'Mehendi',
    sangeet: 'Sangeet',
    engagement: 'Engagement',
    wedding: 'Wedding',
    reception: 'Reception',
    custom: 'Event'
  };

  const displayLabel = label || defaultLabels[eventType] || 'Event';

  return (
    <Badge variant="event" eventType={eventType} className={className} {...props}>
      {displayLabel}
    </Badge>
  );
};
