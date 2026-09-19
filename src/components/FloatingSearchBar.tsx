import React, { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useVoiceSearch } from '../hooks/useVoiceSearch';

interface FloatingSearchBarProps {
  currentRoute: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenSpotlight?: () => void;
}

const SF_SEARCH_ICON_URL = 'https://github.com/andrewtavis/sf-symbols-online/blob/master/glyphs/magnifyingglass.png?raw=true';
const SF_MIC_ICON_URL = 'https://github.com/andrewtavis/sf-symbols-online/blob/master/glyphs/mic.png?raw=true';

export const FloatingSearchBar: React.FC<FloatingSearchBarProps> = ({
  currentRoute,
  searchQuery,
  onSearchChange,
  onOpenSpotlight
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Tab-specific placeholder text requested by user
  const getTabPlaceholder = (route: string) => {
    if (route === '/' || route === '/home') return 'Search Home';
    if (route === '/live-tv') return 'Search TV channels';
    if (route === '/news' || route.startsWith('/news/')) return 'Search news article';
    if (route === '/channels') return 'Search TV channels';
    if (route === '/test') return 'Search test channels';
    if (route === '/favorites') return 'Search favorites';
    if (route === '/settings') return 'Search settings';
    return 'Search...';
  };

  const { isListening, toggleListening } = useVoiceSearch((transcript) => {
    onSearchChange(transcript);
    setIsFocused(true);
    inputRef.current?.focus();
  });

  const isHome = currentRoute === '/' || currentRoute === '/home';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (searchQuery) {
        onSearchChange('');
      } else {
        inputRef.current?.blur();
      }
    } else if (e.key === 'Enter') {
      if (isHome && onOpenSpotlight) {
        onOpenSpotlight();
      }
    }
  };

  return (
    <>
      {/* 1. Progressive Blur Layer at the bottom */}
      <div 
        id="bottom-progressive-blur-dock" 
        className="bottom-progressive-blur"
        aria-hidden="true"
      >
        <div className="progressive-blur-layer layer-1" />
        <div className="progressive-blur-layer layer-2" />
        <div className="progressive-blur-layer layer-3" />
        <div className="progressive-blur-layer layer-4" />
        <div className="progressive-blur-layer layer-5" />
        <div className="progressive-blur-layer layer-6" />
        <div className="progressive-blur-gradient" />
      </div>

      {/* 2. Floating Search Bar Container with Build Notice & Search Pill */}
      <div
        id="floating-search-bar-container"
        style={{ fontFamily: "'Inter', 'Integer', system-ui, -apple-system, sans-serif" }}
        className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none select-none w-auto max-w-[100vw] px-2 font-['Inter','Integer',sans-serif]"
      >
        {/* Pre-release build info notice above search bar */}
        <div
          id="floating-search-build-info"
          className="text-center mb-1.5 px-2 pointer-events-none flex flex-col items-center justify-center max-w-full"
        >
          <p className="build-info-line-1 whitespace-nowrap text-[9.5px] sm:text-[11.5px] font-medium text-neutral-400 leading-tight tracking-normal drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
            Vplay v26.10_devb1 (Codename WinterM1) - Pre-release build product
          </p>
          <p className="build-info-line-2 whitespace-nowrap text-[8.5px] sm:text-[10.5px] text-neutral-500 leading-tight mt-0.5 tracking-normal drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
            Anything you've seen here are not finished and may change in future builds
          </p>
        </div>

        {/* Floating Search Bar Pill with Backdrop Blur and 20% Opacity */}
        <div
          onClick={() => inputRef.current?.focus()}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.20)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
          className={`group relative flex items-center w-[84vw] max-w-[280px] sm:max-w-[320px] md:max-w-[340px] h-[44px] sm:h-[46px] px-3 sm:px-3.5 rounded-full border transition-all duration-200 cursor-text shadow-[0_8px_32px_rgba(0,0,0,0.35)] pointer-events-auto ${
            isFocused || isListening
              ? 'border-white/40 ring-2 ring-white/20 shadow-[0_10px_36px_rgba(0,0,0,0.45)]'
              : 'border-white/20 hover:border-white/30 hover:shadow-[0_9px_34px_rgba(0,0,0,0.40)]'
          }`}
        >
          {/* SF Symbol Search Icon - Enlarged */}
          <button
            type="button"
            onClick={(e) => {
              if (isHome && onOpenSpotlight) {
                e.stopPropagation();
                onOpenSpotlight();
              } else {
                inputRef.current?.focus();
              }
            }}
            className="flex items-center justify-center shrink-0 pr-2 cursor-pointer transition-opacity"
            title={isHome ? 'Mở Spotlight Search (⌘K)' : 'Tìm kiếm'}
          >
            <img
              src={SF_SEARCH_ICON_URL}
              alt="Search"
              className="w-5.5 h-5.5 sm:w-6 sm:h-6 object-contain filter brightness-0 invert opacity-85 group-hover:opacity-100 select-none pointer-events-none transition-opacity"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/icons/sf-magnifyingglass.png';
              }}
            />
          </button>

          {/* Input Field with White text and high readability on 20% opacity frosted glass */}
          <input
            ref={inputRef}
            id="floating-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Đang lắng nghe...' : getTabPlaceholder(currentRoute)}
            className="w-full bg-transparent text-white placeholder:text-white/70 text-[13px] sm:text-[14px] font-medium focus:outline-none truncate caret-white"
          />

          {/* Right Actions: Clear Button & SF Symbol Mic - Enlarged */}
          <div className="flex items-center gap-1 shrink-0 pl-1.5">
            {searchQuery && (
              <button
                type="button"
                id="btn-floating-search-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  onSearchChange('');
                  inputRef.current?.focus();
                }}
                className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                title="Xóa từ khóa tìm kiếm"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* SF Symbol Mic Button - Enlarged */}
            <button
              type="button"
              id="btn-floating-search-mic"
              onClick={(e) => {
                e.stopPropagation();
                toggleListening();
              }}
              className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                isListening
                  ? 'bg-red-500/30 ring-2 ring-red-500/50 scale-105'
                  : 'hover:bg-white/15'
              }`}
              title={isListening ? 'Dừng ghi âm' : 'Tìm kiếm bằng giọng nói'}
            >
              <img
                src={SF_MIC_ICON_URL}
                alt="Mic"
                className={`w-5.5 h-5.5 sm:w-6 sm:h-6 object-contain filter brightness-0 invert select-none pointer-events-none transition-opacity ${
                  isListening ? 'opacity-100' : 'opacity-85 hover:opacity-100'
                }`}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/icons/sf-mic.png';
                }}
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
