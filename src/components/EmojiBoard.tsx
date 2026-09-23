import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Delete } from 'lucide-react';
import { EMOJI_CATEGORIES } from '../data/emojiCategories';
import { keyboardSound } from '../utils/keyboardSound';

interface EmojiBoardProps {
  searchQuery?: string;
  onInsertEmoji: (emoji: string) => void;
  onDeleteChar: () => void;
  onCloseKeyboard: () => void;
  onSwitchToABC: () => void;
}

export const EmojiBoard: React.FC<EmojiBoardProps> = ({
  searchQuery = '',
  onInsertEmoji,
  onDeleteChar,
  onCloseKeyboard,
  onSwitchToABC,
}) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(EMOJI_CATEGORIES[0]?.id || 'faces');
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const categorySectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const backspaceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const backspaceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play click sound with throttling
  const playSound = useCallback((type: 'char' | 'space' | 'delete' | 'action' | 'modifier' = 'char') => {
    keyboardSound.playKeyClick(type);
  }, []);

  // Backspace press handlers
  const clearBackspaceTimers = useCallback(() => {
    if (backspaceTimerRef.current) {
      clearTimeout(backspaceTimerRef.current);
      backspaceTimerRef.current = null;
    }
    if (backspaceIntervalRef.current) {
      clearInterval(backspaceIntervalRef.current);
      backspaceIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearBackspaceTimers();
  }, [clearBackspaceTimers]);

  const handleDeleteDown = (e: React.PointerEvent | React.MouseEvent) => {
    e.preventDefault();
    playSound('delete');
    onDeleteChar();
    if (navigator.vibrate) {
      try { navigator.vibrate(12); } catch {}
    }

    clearBackspaceTimers();
    backspaceTimerRef.current = setTimeout(() => {
      backspaceIntervalRef.current = setInterval(() => {
        playSound('delete');
        onDeleteChar();
      }, 75);
    }, 350);
  };

  const handleDeleteUp = () => {
    clearBackspaceTimers();
  };

  // Scroll to selected category horizontally
  const handleSelectCategory = (catId: string) => {
    setActiveCategoryId(catId);
    const targetElem = categorySectionRefs.current[catId];
    const container = scrollContainerRef.current;
    if (targetElem && container) {
      isProgrammaticScrollRef.current = true;
      const targetLeft = targetElem.offsetLeft - container.offsetLeft;
      container.scrollTo({
        left: Math.max(0, targetLeft - 10),
        behavior: 'smooth',
      });
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 450);
    }
  };

  // Detect active category while scrolling horizontally
  const handleScroll = () => {
    if (isProgrammaticScrollRef.current || !scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;

    let closestCatId = EMOJI_CATEGORIES[0].id;
    let minDistance = Infinity;

    for (const cat of EMOJI_CATEGORIES) {
      const section = categorySectionRefs.current[cat.id];
      if (section) {
        const offset = section.offsetLeft - container.offsetLeft;
        const distance = Math.abs(offset - scrollLeft);
        if (distance < minDistance) {
          minDistance = distance;
          closestCatId = cat.id;
        }
      }
    }

    if (closestCatId !== activeCategoryId) {
      setActiveCategoryId(closestCatId);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        scrollContainerRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  const handleEmojiClick = (emoji: string) => {
    playSound('char');
    if (navigator.vibrate) {
      try { navigator.vibrate(8); } catch {}
    }
    onInsertEmoji(emoji);
  };

  // Filter emojis if searching
  const filteredCategories = searchQuery.trim()
    ? [
        {
          id: 'search_results',
          name: `Kết quả tìm kiếm ("${searchQuery.trim()}")`,
          icon: '🔍',
          emojis: Array.from(
            new Set(
              EMOJI_CATEGORIES.flatMap((c) => c.emojis).filter((emoji) =>
                emoji.includes(searchQuery.trim())
              )
            )
          ),
        },
      ]
    : EMOJI_CATEGORIES;

  return (
    <div className="flex-1 flex flex-col justify-between h-full min-h-0 select-none overflow-hidden pb-0.5">
      {/* Main Emoji Board - 3 Rows Horizontal Scrolling with NO Background on individual Emojis */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onWheel={handleWheel}
        className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden scroll-smooth flex flex-row gap-6 py-1.5 px-3 select-none scrollbar-thin cursor-grab active:cursor-grabbing"
      >
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            ref={(el) => {
              categorySectionRefs.current[category.id] = el;
            }}
            className="flex flex-col shrink-0 h-full justify-between"
          >
            {/* Category header - Title is displayed in FULL without any truncation or ellipsis */}
            <div className="flex items-center gap-1.5 px-1 py-0.5 select-none shrink-0 whitespace-nowrap">
              <span className="text-sm leading-none">{category.icon}</span>
              <span className="text-xs sm:text-[13px] font-bold text-black tracking-tight whitespace-nowrap">
                {category.name}
              </span>
              <span className="text-[11px] font-mono text-black/50">
                ({category.emojis.length})
              </span>
            </div>

            {/* 3-Row horizontal grid for this category - NO background behind emojis, larger touch targets */}
            <div className="grid grid-rows-3 grid-flow-col auto-cols-[46px] sm:auto-cols-[54px] gap-1.5 sm:gap-2 flex-1 items-center content-center py-1">
              {category.emojis.map((emoji, idx) => (
                <button
                  key={`${category.id}-${idx}-${emoji}`}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handleEmojiClick(emoji);
                  }}
                  className="w-[46px] h-[40px] sm:w-[54px] sm:h-[46px] flex items-center justify-center text-[28px] sm:text-[32px] leading-none transition-transform hover:scale-120 active:scale-130 active:opacity-75 cursor-default select-none bg-transparent border-0 shadow-none p-0 outline-none"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM: Category Emoji Tabs (Bên dưới) & Action Controls */}
      <div className="flex flex-col gap-1 pt-1 px-1 border-t border-black/10 shrink-0">
        {/* Category Emoji Bar placed below the emoji grid */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 w-full">
          {EMOJI_CATEGORIES.map((cat) => {
            const isActive = activeCategoryId === cat.id && !searchQuery.trim();
            return (
              <button
                key={cat.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onPointerDown={() => playSound('modifier')}
                onClick={() => handleSelectCategory(cat.id)}
                className={`h-7 px-2.5 rounded-full flex items-center gap-1.5 transition-all shrink-0 cursor-default ${
                  isActive
                    ? 'bg-black/20 text-black shadow-xs font-semibold'
                    : 'hover:bg-black/10 text-black/75'
                }`}
                title={cat.name}
              >
                <span className="text-base leading-none select-none">{cat.icon}</span>
                {isActive && (
                  <span className="text-[11px] font-semibold text-black whitespace-nowrap">
                    {cat.name}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Action buttons: ABC, Space, Backspace, Xong */}
        <div className="flex items-center justify-between pt-0.5 px-0.5">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onPointerDown={() => playSound('modifier')}
              onClick={onSwitchToABC}
              className="h-8 px-4 rounded-xl bg-white/50 hover:bg-white/70 active:bg-white/80 text-xs font-bold text-black border border-white/30 backdrop-blur-md shadow-xs transition-colors cursor-default"
            >
              ABC
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onPointerDown={() => {
                playSound('space');
                onInsertEmoji(' ');
              }}
              className="h-8 px-4 sm:px-6 rounded-xl bg-white/40 hover:bg-white/60 active:bg-white/70 text-xs font-medium text-black border border-white/25 shadow-xs transition-colors cursor-default"
            >
              dấu cách
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id="btn-emoji-backspace"
              onMouseDown={handleDeleteDown}
              onMouseUp={handleDeleteUp}
              onMouseLeave={handleDeleteUp}
              onPointerDown={handleDeleteDown}
              onPointerUp={handleDeleteUp}
              onPointerLeave={handleDeleteUp}
              onPointerCancel={handleDeleteUp}
              className="h-8 w-11 rounded-xl bg-white/45 hover:bg-white/65 active:bg-white/80 flex items-center justify-center text-black border border-white/30 shadow-xs transition-colors cursor-default"
              title="Xóa ký tự"
              aria-label="Xóa ký tự"
            >
              <Delete className="w-4 h-4 text-black stroke-[2.2]" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onPointerDown={() => playSound('action')}
              onClick={onCloseKeyboard}
              className="h-8 px-4 rounded-xl bg-[#007AFF] hover:bg-[#006FDF] active:bg-[#005EC4] text-xs font-semibold text-white shadow-xs transition-colors cursor-default"
            >
              Xong
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
