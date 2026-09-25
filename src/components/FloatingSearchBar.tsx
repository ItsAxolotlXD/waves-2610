import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { useNativeKeyboard } from '../context/NativeKeyboardContext';
import { useSettings } from '../hooks/useSettings';

interface FloatingSearchBarProps {
  currentRoute: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenSpotlight?: () => void;
  onClose?: () => void;
  autoFocus?: boolean;
  embedded?: boolean;
  layoutId?: string;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

const SF_SEARCH_ICON_URL = 'https://github.com/andrewtavis/sf-symbols-online/blob/master/glyphs/magnifyingglass.png?raw=true';
const SF_MIC_ICON_URL = 'https://github.com/andrewtavis/sf-symbols-online/blob/master/glyphs/mic.png?raw=true';

export const FloatingSearchBar: React.FC<FloatingSearchBarProps> = ({
  currentRoute,
  searchQuery,
  onSearchChange,
  onOpenSpotlight,
  onClose,
  autoFocus = false,
  embedded = false,
  layoutId,
  containerRef
}) => {
  const { settings, draftSettings } = useSettings();
  const currentOpacity = typeof draftSettings?.spatialGlassOpacity === 'number'
    ? draftSettings.spatialGlassOpacity
    : (settings.spatialGlassOpacity ?? 20);
  const isSpatialGlassActive = (draftSettings?.spatialGlass ?? settings.spatialGlass) !== false;
  const isDarkContent = isSpatialGlassActive && currentOpacity > 40;

  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const { isOpen: isKeyboardOpen, keyboardHeight } = useNativeKeyboard();

  useEffect(() => {
    if (autoFocus) {
      // Delay focus slightly until morph animation finishes to prevent layout shift / keyboard jumping
      const timer = setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, 340);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  useEffect(() => {
    if (!onClose) return;
    const handleGlobalEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleGlobalEsc);
    return () => window.removeEventListener('keydown', handleGlobalEsc);
  }, [onClose]);

  const isArticlePage = currentRoute.startsWith('/news/') && currentRoute !== '/news';
  const isHome = currentRoute === '/' || currentRoute === '/home';

  // Tab-specific placeholder text requested by user
  const getTabPlaceholder = (route: string) => {
    if (route.startsWith('/news/') && route !== '/news') return 'Find words';
    if (route === '/' || route === '/home') return 'Search Home';
    if (route === '/live-tv') return 'Search TV channels';
    if (route === '/news') return 'Search news article';
    if (route === '/channels') return 'Search TV channels';
    if (route === '/test') return 'Search test channels';
    if (route === '/favorites') return 'Search favorites';
    if (route === '/settings') return 'Search settings';
    return 'Search...';
  };

  const clearArticleHighlights = useCallback(() => {
    const marks = document.querySelectorAll('mark.vplay-search-highlight');
    const parentsToNormalize = new Set<Node>();
    marks.forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
        parentsToNormalize.add(parent);
      }
    });
    parentsToNormalize.forEach((parent) => {
      parent.normalize();
    });
  }, []);

  const scrollToMatch = useCallback((index: number) => {
    const marks = document.querySelectorAll('mark.vplay-search-highlight');
    if (marks.length === 0) return;

    marks.forEach((m, idx) => {
      if (idx === index) {
        m.className = 'vplay-search-highlight ring-2 ring-[#fd932f] bg-[#fd932f] text-white px-1 py-0.5 rounded font-bold shadow-lg transition-all scale-105';
        m.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        m.className = 'vplay-search-highlight bg-amber-400 text-black px-1 py-0.5 rounded font-bold shadow-sm transition-all';
      }
    });
  }, []);

  const highlightArticleText = useCallback((term: string): number => {
    clearArticleHighlights();
    const cleanTerm = term.trim();
    if (!cleanTerm) return 0;

    const container = document.querySelector('article') || document.querySelector('main');
    if (!container) return 0;

    const escaped = cleanTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');

    // Collect text nodes first to prevent infinite loop or DOM mutation issues during traversal
    const textNodes: Text[] = [];
    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.nodeValue && regex.test(node.nodeValue)) {
          textNodes.push(node as Text);
        }
      } else if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.nodeName !== 'SCRIPT' &&
        node.nodeName !== 'STYLE' &&
        node.nodeName !== 'BUTTON' &&
        node.nodeName !== 'INPUT' &&
        node.nodeName !== 'TEXTAREA' &&
        node.nodeName !== 'SVG'
      ) {
        Array.from(node.childNodes).forEach(walk);
      }
    };

    walk(container);

    let count = 0;
    textNodes.forEach((textNode) => {
      const parent = textNode.parentNode;
      if (!parent) return;

      const content = textNode.nodeValue || '';
      regex.lastIndex = 0;

      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      let m: RegExpExecArray | null;

      while ((m = regex.exec(content)) !== null) {
        const matchStart = m.index;
        const matchEnd = regex.lastIndex;

        if (matchStart > lastIndex) {
          fragment.appendChild(document.createTextNode(content.slice(lastIndex, matchStart)));
        }

        const mark = document.createElement('mark');
        mark.className = 'vplay-search-highlight bg-amber-400 text-black px-1 py-0.5 rounded font-bold shadow-sm transition-all';
        mark.textContent = m[0];
        fragment.appendChild(mark);
        count++;

        lastIndex = matchEnd;
      }

      if (lastIndex < content.length) {
        fragment.appendChild(document.createTextNode(content.slice(lastIndex)));
      }

      parent.replaceChild(fragment, textNode);
    });

    return count;
  }, [clearArticleHighlights]);

  const handleNextMatch = useCallback(() => {
    if (matchCount === 0) return;
    const nextIndex = currentMatchIndex >= matchCount ? 1 : currentMatchIndex + 1;
    setCurrentMatchIndex(nextIndex);
    scrollToMatch(nextIndex - 1);
  }, [matchCount, currentMatchIndex, scrollToMatch]);

  const handlePrevMatch = useCallback(() => {
    if (matchCount === 0) return;
    const prevIndex = currentMatchIndex <= 1 ? matchCount : currentMatchIndex - 1;
    setCurrentMatchIndex(prevIndex);
    scrollToMatch(prevIndex - 1);
  }, [matchCount, currentMatchIndex, scrollToMatch]);

  // Execute highlighting when on an article page
  useEffect(() => {
    if (!isArticlePage) {
      clearArticleHighlights();
      setMatchCount(0);
      setCurrentMatchIndex(0);
      return;
    }

    if (!searchQuery.trim()) {
      clearArticleHighlights();
      setMatchCount(0);
      setCurrentMatchIndex(0);
      return;
    }

    const timer = setTimeout(() => {
      const total = highlightArticleText(searchQuery);
      setMatchCount(total);
      if (total > 0) {
        setCurrentMatchIndex(1);
        scrollToMatch(0);
      } else {
        setCurrentMatchIndex(0);
      }
    }, 60);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery, currentRoute, isArticlePage, highlightArticleText, clearArticleHighlights, scrollToMatch]);

  // Clean up highlights on unmount
  useEffect(() => {
    return () => {
      clearArticleHighlights();
    };
  }, [clearArticleHighlights]);

  const { isListening, toggleListening } = useVoiceSearch((transcript) => {
    onSearchChange(transcript);
    setIsFocused(true);
    inputRef.current?.focus();
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (searchQuery) {
        onSearchChange('');
        clearArticleHighlights();
        setMatchCount(0);
        setCurrentMatchIndex(0);
      } else {
        inputRef.current?.blur();
        if (onClose) {
          onClose();
        }
      }
    } else if (e.key === 'Enter') {
      if (isArticlePage) {
        e.preventDefault();
        if (e.shiftKey) {
          handlePrevMatch();
        } else {
          handleNextMatch();
        }
      } else if (isHome && onOpenSpotlight) {
        onOpenSpotlight();
      }
    }
  };

  const pillContent = (
    <motion.div
      ref={containerRef}
      layoutId={layoutId}
      id="floating-search-bar-pill"
      onClick={() => inputRef.current?.focus()}
      whileHover={{
        scale: 1.02,
        transition: {
          type: 'spring',
          stiffness: 450,
          damping: 16,
          mass: 0.6
        }
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 32,
        mass: 0.6
      }}
      style={{
        backgroundColor: 'var(--spatial-glass-bg, rgba(255, 255, 255, 0.20))',
        backdropFilter: 'blur(var(--spatial-glass-blur, 20px))',
        WebkitBackdropFilter: 'blur(var(--spatial-glass-blur, 20px))',
      }}
      className={`group relative flex items-center overflow-hidden ${
        isArticlePage && searchQuery.trim()
          ? 'w-[94vw] max-w-[380px] sm:max-w-[440px] md:max-w-[480px]'
          : 'w-[88vw] max-w-[320px] sm:max-w-[360px] md:max-w-[400px]'
      } h-[64px] sm:h-[70px] px-3.5 sm:px-4 rounded-full cursor-text shadow-[0_8px_32px_rgba(0,0,0,0.35)] pointer-events-auto ${
        isDarkContent ? 'border border-black/15 text-black' : 'border border-white/10 text-white'
      } ${
        isFocused || isListening
          ? (isDarkContent ? 'ring-2 ring-black/20 shadow-[0_10px_36px_rgba(0,0,0,0.35)]' : 'ring-2 ring-white/25 shadow-[0_10px_36px_rgba(0,0,0,0.45)]')
          : ''
      }`}
    >
      {/* SF Symbol Search Icon */}
      <button
        type="button"
        onClick={(e) => {
          if (isArticlePage) {
            e.stopPropagation();
            handleNextMatch();
          } else if (isHome && onOpenSpotlight) {
            e.stopPropagation();
            onOpenSpotlight();
          } else {
            inputRef.current?.focus();
          }
        }}
        className="flex items-center justify-center shrink-0 pr-2.5 cursor-default transition-opacity"
        title={isArticlePage ? 'Từ tiếp theo (Enter)' : (isHome ? 'Mở Spotlight Search (⌘K)' : 'Tìm kiếm')}
      >
        <img
          src={SF_SEARCH_ICON_URL}
          alt="Search"
          className={`w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] object-contain select-none pointer-events-none transition-opacity ${
            isDarkContent ? 'brightness-0' : 'filter brightness-0 invert'
          } opacity-85 group-hover:opacity-100`}
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/icons/sf-magnifyingglass.png';
          }}
        />
      </button>

      {/* Input Field & Action Controls with smooth opacity transition */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut', delay: 0.05 }}
        className="flex-1 flex items-center min-w-0"
      >
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
          className={`w-full bg-transparent text-[14px] sm:text-[15px] font-medium focus:outline-none truncate ${
            isDarkContent
              ? 'text-black placeholder:text-black/60 caret-black'
              : 'text-white placeholder:text-white/70 caret-white'
          }`}
        />

        {/* In-Article Match Counter & Navigation */}
        {isArticlePage && searchQuery.trim() && (
          <div className={`flex items-center gap-0.5 rounded-full pl-2 pr-0.5 py-0.5 shrink-0 mr-1 select-none ${
            isDarkContent
              ? 'bg-black/10 backdrop-blur-sm border border-black/15 text-black'
              : 'bg-black/35 backdrop-blur-sm border border-white/15 text-white'
          }`}>
            <span className={`text-[11px] font-mono whitespace-nowrap ${isDarkContent ? 'text-black/90' : 'text-white/90'}`}>
              {matchCount > 0 ? `${currentMatchIndex}/${matchCount}` : '0/0'}
            </span>
            {matchCount > 0 && (
              <div className="flex items-center">
                <button
                  type="button"
                  id="btn-floating-find-prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevMatch();
                  }}
                  className={`p-1 rounded-full transition-colors cursor-default ${
                    isDarkContent
                      ? 'text-black/70 hover:text-black hover:bg-black/10'
                      : 'text-white/70 hover:text-white hover:bg-white/20'
                  }`}
                  title="Từ trước (Shift+Enter)"
                  aria-label="Từ trước"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  id="btn-floating-find-next"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextMatch();
                  }}
                  className={`p-1 rounded-full transition-colors cursor-default ${
                    isDarkContent
                      ? 'text-black/70 hover:text-black hover:bg-black/10'
                      : 'text-white/70 hover:text-white hover:bg-white/20'
                  }`}
                  title="Từ tiếp theo (Enter)"
                  aria-label="Từ tiếp theo"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Right Actions: Clear Button & SF Symbol Mic & Close Button */}
        <div className="flex items-center gap-1 shrink-0 pl-1">
          {searchQuery && (
            <button
              type="button"
              id="btn-floating-search-clear"
              onClick={(e) => {
                e.stopPropagation();
                onSearchChange('');
                clearArticleHighlights();
                setMatchCount(0);
                setCurrentMatchIndex(0);
                inputRef.current?.focus();
              }}
              className={`p-1 rounded-full transition-colors cursor-default ${
                isDarkContent
                  ? 'text-black/70 hover:text-black hover:bg-black/10'
                  : 'text-white/70 hover:text-white hover:bg-white/15'
              }`}
              title="Xóa từ khóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* SF Symbol Mic Button */}
          <button
            type="button"
            id="btn-floating-search-mic"
            onClick={(e) => {
              e.stopPropagation();
              toggleListening();
            }}
            className={`p-1.5 rounded-full transition-all cursor-default flex items-center justify-center ${
              isListening
                ? 'bg-red-500/30 ring-2 ring-red-500/50 scale-105'
                : (isDarkContent ? 'hover:bg-black/10' : 'hover:bg-white/15')
            }`}
            title={isListening ? 'Dừng ghi âm' : 'Tìm kiếm bằng giọng nói'}
          >
            <img
              src={SF_MIC_ICON_URL}
              alt="Mic"
              className={`w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] object-contain select-none pointer-events-none transition-opacity ${
                isDarkContent ? 'brightness-0' : 'filter brightness-0 invert'
              } ${
                isListening ? 'opacity-100' : 'opacity-85 hover:opacity-100'
              }`}
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/icons/sf-mic.png';
              }}
            />
          </button>

          {/* Optional Close/Collapse Button */}
          {onClose && (
            <button
              type="button"
              id="btn-floating-search-close"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className={`p-1.5 rounded-full transition-colors cursor-default flex items-center justify-center ${
                isDarkContent
                  ? 'text-black/70 hover:text-black hover:bg-black/10'
                  : 'text-white/70 hover:text-white hover:bg-white/15'
              }`}
              title="Đóng tìm kiếm (Esc)"
              aria-label="Đóng tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  if (embedded) {
    return pillContent;
  }

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

      {/* 2. Floating Search Bar Container with Search Pill (smoothly pushes above native keyboard like Image 2) */}
      <div
        id="floating-search-bar-container"
        style={{
          fontFamily: "'Inter', 'Integer', system-ui, -apple-system, sans-serif",
          bottom: isKeyboardOpen ? `${keyboardHeight + 12}px` : undefined,
          transition: 'bottom 0.42s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className={`fixed ${isKeyboardOpen ? '' : 'bottom-3 sm:bottom-5'} left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none select-none w-auto max-w-[100vw] px-2 font-['Inter','Integer',sans-serif]`}
      >
        {pillContent}
      </div>
    </>
  );
};

