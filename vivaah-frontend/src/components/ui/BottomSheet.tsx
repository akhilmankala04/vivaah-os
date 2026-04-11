import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children, className }) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-[60] transition-opacity"
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className={cn(
          "fixed inset-x-0 bottom-0 z-[70] bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto flex flex-col transform transition-transform duration-300 ease-out",
          className
        )}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4 flex-shrink-0" />
        
        {title && (
          <div className="px-4 pb-2">
            <h2 className="text-xl font-medium">{title}</h2>
          </div>
        )}

        <div className="w-full px-4 pb-6 flex-1">
          {children}
        </div>
      </div>
    </>
  );
};
