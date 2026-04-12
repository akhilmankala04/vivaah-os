import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from '../../lib/navigation';

interface Props {
  weddingId: string;
  currentAccessLevel: string;
  currentPath: string;
}

const MAX_VISIBLE = 5;

// 4-pointed sparkle — used to mark AI-powered nav items
function Sparkle({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 10 10"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 0 C5 0 5.4 2.8 6.2 3.8 C7 4.8 10 5 10 5 C10 5 7 5.2 6.2 6.2 C5.4 7.2 5 10 5 10 C5 10 4.6 7.2 3.8 6.2 C3 5.2 0 5 0 5 C0 5 3 4.8 3.8 3.8 C4.6 2.8 5 0 5 0 Z" />
    </svg>
  );
}

export function BottomNav({ weddingId, currentAccessLevel, currentPath }: Props) {
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const filteredItems = NAV_ITEMS.filter(item =>
    item.accessLevels.includes(currentAccessLevel)
  );

  const visibleItems = filteredItems.slice(0, MAX_VISIBLE);
  const overflowItems = filteredItems.slice(MAX_VISIBLE);
  const hasOverflow = overflowItems.length > 0;

  const isOverflowActive = overflowItems.some(item =>
    currentPath === item.path(weddingId) || currentPath.startsWith(item.path(weddingId) + '/')
  );

  function handleNavigate(path: string) {
    setMoreOpen(false);
    navigate(path);
  }

  return (
    <>
      {/* More panel — sits above the nav bar */}
      {moreOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[45]"
            onClick={() => setMoreOpen(false)}
          />
          {/* Panel */}
          <div className="fixed bottom-[56px] left-0 right-0 max-w-md mx-auto bg-white border border-gray-100 rounded-t-2xl shadow-sm z-[46] pb-2">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-3" />
            {overflowItems.map(item => {
              const path = item.path(weddingId);
              const isActive = currentPath === path || currentPath.startsWith(path + '/');
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavigate(path)}
                  className={`w-full flex items-center px-5 h-11 text-[15px] font-medium min-h-[44px] ${
                    isActive ? 'text-vivaah-600' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                  {item.isAI && (
                    <>
                      <Sparkle className="w-2.5 h-2.5 ml-1 mb-2 text-vivaah-500" />
                      <Sparkle className="w-1.5 h-1.5 ml-0.5 mb-0.5 text-vivaah-400" />
                    </>
                  )}
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-vivaah-600" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex max-w-md mx-auto h-[56px] z-50">
        {visibleItems.map((item) => {
          const path = item.path(weddingId);
          const isActive = currentPath === path || currentPath.startsWith(path + '/');
          return (
            <button
              key={item.label}
              onClick={() => { setMoreOpen(false); navigate(path); }}
              className={`flex-1 flex flex-col items-center justify-center text-xs font-medium min-h-[44px] relative ${
                isActive ? 'text-vivaah-600' : 'text-gray-400'
              }`}
            >
              {item.label}
              {item.isAI && (
                <>
                  <Sparkle className="absolute top-1 right-[calc(50%-16px)] w-2 h-2 text-vivaah-500" />
                  <Sparkle className="absolute top-2.5 right-[calc(50%-22px)] w-1.5 h-1.5 text-vivaah-400" />
                </>
              )}
            </button>
          );
        })}

        {hasOverflow && (
          <button
            onClick={() => setMoreOpen(prev => !prev)}
            className={`flex-1 flex flex-col items-center justify-center text-xs font-medium min-h-[44px] ${
              isOverflowActive || moreOpen ? 'text-vivaah-600' : 'text-gray-400'
            }`}
          >
            More
          </button>
        )}
      </nav>
    </>
  );
}
