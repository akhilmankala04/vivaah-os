import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface RupeeInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label: string;
  error?: string;
  value?: number | null; // Value in paise (integer)
  onChange?: (val: number | null) => void;
}

export const RupeeInput = React.forwardRef<HTMLInputElement, RupeeInputProps>(
  ({ className, label, error, value, onChange, onBlur, onFocus, ...props }, ref) => {
    const [displayVal, setDisplayVal] = useState<string>('');
    const [isFocused, setIsFocused] = useState(false);

    // Convert paise to human readable format
    const formatFromPaise = (paise: number) => {
      const rupees = paise / 100;
      if (Math.abs(rupees) >= 10000000) {
        return (rupees / 10000000).toFixed(2) + ' crore';
      } else if (Math.abs(rupees) >= 100000) {
        return (rupees / 100000).toFixed(2) + ' lakh';
      } else {
        return rupees.toLocaleString('en-IN');
      }
    };

    // Calculate raw numeric string from real value


    useEffect(() => {
      if (value !== undefined && value !== null) {
        if (!isFocused) {
          setDisplayVal(formatFromPaise(value));
        }
      } else if (value === null) {
        setDisplayVal('');
      }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setDisplayVal(e.target.value);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (value != null) {
        setDisplayVal((value / 100).toString());
      }
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      const raw = e.target.value.toLowerCase().trim();
      if (!raw) {
        onChange?.(null);
        setDisplayVal('');
        if (onBlur) onBlur(e);
        return;
      }

      let parsedRupees = 0;
      const numStr = raw.replace(/[^0-9.]/g, '');
      const num = parseFloat(numStr);

      if (isNaN(num)) {
        if (onBlur) onBlur(e);
        // revert to previous
        if (value != null) setDisplayVal(formatFromPaise(value));
        else setDisplayVal('');
        return;
      }

      if (raw.includes('cr') || raw.includes('crore')) {
        parsedRupees = num * 10000000;
      } else if (raw.includes('l') || raw.includes('lakh')) {
        parsedRupees = num * 100000;
      } else {
        parsedRupees = num;
      }

      const paise = Math.round(parsedRupees * 100);
      onChange?.(paise);
      setDisplayVal(formatFromPaise(paise));
      if (onBlur) onBlur(e);
    };

    // Parse the displayVal on the fly for the real-time preview (only while focused)
    const getPreview = () => {
      if (!displayVal || !isFocused) return null;
      const raw = displayVal.toLowerCase().trim();
      const numStr = raw.replace(/[^0-9.]/g, '');
      const num = parseFloat(numStr);
      if (isNaN(num)) return null;

      let p = 0;
      if (raw.includes('cr') || raw.includes('crore')) p = num * 10000000;
      else if (raw.includes('l') || raw.includes('lakh')) p = num * 100000;
      else p = num;
      
      const pPaise = Math.round(p * 100);
      return `₹${formatFromPaise(pPaise)}`;
    };

    return (
      <div className="flex flex-col w-full">
        {label && (
          <label className="text-sm font-normal text-gray-700 mb-1">{label}</label>
        )}
        <div className="relative flex items-center">
          <span className="absolute left-3 text-gray-500 font-medium">₹</span>
          <input
            ref={ref}
            type="text"
            inputMode="numeric"
            value={displayVal}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            className={cn(
              "h-11 w-full bg-white pl-8 pr-3 border border-gray-300 rounded-xl outline-none text-[15px] transition-colors focus:border-vivaah-600 focus:ring-0",
              error ? "border-danger focus:border-danger" : "",
              className
            )}
            {...props}
          />
        </div>
        {isFocused && displayVal && !error && (
          <span className="text-sm text-gray-500 mt-1">Preview: {getPreview()}</span>
        )}
        {error && <span className="text-sm text-danger mt-1">{error}</span>}
      </div>
    );
  }
);
RupeeInput.displayName = 'RupeeInput';
