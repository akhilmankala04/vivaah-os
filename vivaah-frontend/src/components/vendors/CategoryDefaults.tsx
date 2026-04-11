import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Props {
  eventType: 'haldi' | 'mehendi' | 'sangeet' | 'engagement' | 'wedding' | 'reception';
  onSelectCategory: (category: string) => void;
}

export function CategoryDefaults({ eventType, onSelectCategory }: Props) {
  const [categories, setCategories] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    try {
      const saved = sessionStorage.getItem(`dismissed-categories-${eventType}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-event-category-defaults?event_type=${eventType}`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
      setLoading(false);
    }
    fetchCategories();
  }, [eventType]);

  const handleSelect = (category: string) => {
    onSelectCategory(category);
  };

  const handleDismiss = (e: React.MouseEvent, category: string) => {
    e.stopPropagation();
    setDismissed(prev => {
      const next = new Set(prev).add(category);
      try {
        sessionStorage.setItem(`dismissed-categories-${eventType}`, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  const visible = categories.filter(c => !dismissed.has(c));

  if (loading) return (
    <div className="flex gap-2">
      {[1,2,3].map(i => (
        <div key={i} className="h-8 w-24 bg-gray-100 rounded-full animate-pulse" />
      ))}
    </div>
  );

  if (visible.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap">
      {visible.map(category => (
        <div
          key={category}
          className="flex items-center gap-1 pl-3 pr-2 py-1.5 rounded-full border border-gray-200 bg-white"
        >
          <button
            type="button"
            onClick={() => handleSelect(category)}
            className="text-[13px] font-medium text-gray-700 whitespace-nowrap"
          >
            + {category}
          </button>
          <button
            type="button"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleDismiss(e, category)}
            className="text-gray-400 hover:text-gray-600 text-xs ml-1 min-w-[16px] min-h-[16px]"
            aria-label={`Dismiss ${category}`}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
