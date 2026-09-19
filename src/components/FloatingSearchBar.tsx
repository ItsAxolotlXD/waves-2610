import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { useNativeKeyboard } from '../context/NativeKeyboardContext';

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
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  const { isOpen: isKeyboardOpen, keyboardHeight } = useNativeKeyboard();

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
        m.className = 'vplay-search-highlight ring-2 ring-[#E6005A] bg-[#FF4D8D] text-white px-1 py-0.5 rounded font-bold shadow-lg transition-all scale-105';
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
        {/* Floating Search Bar Pill with Backdrop Blur, 20% Opacity and Channel Card Border */}
        <div
          id="floating-search-bar-pill"
          onClick={() => inputRef.current?.focus()}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.20)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
          className={`group relative flex items-center ${
            isArticlePage && searchQuery.trim()
              ? 'w-[92vw] max-w-[340px] sm:max-w-[400px] md:max-w-[440px]'
              : 'w-[84vw] max-w-[280px] sm:max-w-[320px] md:max-w-[340px]'
          } h-[44px] sm:h-[46px] px-3 sm:px-3.5 rounded-full transition-all duration-200 cursor-text shadow-[0_8px_32px_rgba(0,0,0,0.35)] pointer-events-auto ${
            isFocused || isListening
              ? 'ring-2 ring-white/25 shadow-[0_10px_36px_rgba(0,0,0,0.45)]'
              : 'hover:shadow-[0_9px_34px_rgba(0,0,0,0.40)]'
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
            className="flex items-center justify-center shrink-0 pr-2 cursor-pointer transition-opacity"
            title={isArticlePage ? 'Từ tiếp theo (Enter)' : (isHome ? 'Mở Spotlight Search (⌘K)' : 'Tìm kiếm')}
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

          {/* Input Field */}
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

          {/* In-Article Match Counter & Navigation */}
          {isArticlePage && searchQuery.trim() && (
            <div className="flex items-center gap-0.5 bg-black/35 backdrop-blur-sm rounded-full pl-2 pr-0.5 py-0.5 border border-white/15 shrink-0 mr-1 select-none">
              <span className="text-[11px] font-mono text-white/90 whitespace-nowrap">
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
                    className="p-1 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer"
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
                    className="p-1 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                    title="Từ tiếp theo (Enter)"
                    aria-label="Từ tiếp theo"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Right Actions: Clear Button & SF Symbol Mic */}
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
                className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
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

