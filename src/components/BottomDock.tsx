import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle, 
  Info, 
  Megaphone, 
  Search, 
  Settings, 
  Tv, 
  MessageCircle,
  FlaskConical
} from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useNativeKeyboard } from '../context/NativeKeyboardContext';
import { FloatingSearchBar } from './FloatingSearchBar';

interface BottomDockProps {
  currentRoute: string;
  navigate: (route: string) => void;
  onOpenSearch?: () => void;
  onOpenHelp?: () => void;
  onOpenDiscord?: () => void;
  isImmersive?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenSpotlight?: () => void;
}

const HOME_ICON = 'https://static.wikia.nocookie.net/ep-deo/images/6/6e/New_hom.png/revision/latest?cb=20260722124341';
const TV_ICON = 'https://vtvgo-next-assets.vtvdigital.vn/prod/images/menu/20260905/2026090508/b467d7552a-tv-1.webp';
const SETTINGS_ICON = 'https://static.wikia.nocookie.net/ftv/images/9/97/Settungs.png/revision/latest?cb=20260411085024&path-prefix=vi';
const SF_SEARCH_ICON_URL = 'https://github.com/andrewtavis/sf-symbols-online/blob/master/glyphs/magnifyingglass.png?raw=true';

export const BottomDock: React.FC<BottomDockProps> = ({ 
  currentRoute, 
  navigate, 
  onOpenSearch, 
  onOpenHelp, 
  onOpenDiscord,
  isImmersive = false,
  searchQuery = '',
  onSearchChange,
  onOpenSpotlight
}) => {
  const { settings, draftSettings } = useSettings();
  const currentOpacity = typeof draftSettings?.spatialGlassOpacity === 'number'
    ? draftSettings.spatialGlassOpacity
    : (settings.spatialGlassOpacity ?? 20);
  const isSpatialGlassActive = (draftSettings?.spatialGlass ?? settings.spatialGlass) !== false;
  const isDarkContent = isSpatialGlassActive && currentOpacity > 40;

  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { isOpen: isKeyboardOpen, keyboardHeight } = useNativeKeyboard();

  // Listen for global open event (Cmd+K / Alt+2 shortcuts)
  useEffect(() => {
    const handleGlobalOpen = () => setIsSearchOpen(true);
    window.addEventListener('vplay:open-floaty-search', handleGlobalOpen);
    return () => window.removeEventListener('vplay:open-floaty-search', handleGlobalOpen);
  }, []);

  // Close search when route changes
  useEffect(() => {
    setIsSearchOpen(false);
  }, [currentRoute]);

  // Click outside to collapse search
  useEffect(() => {
    if (!isSearchOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (
        searchContainerRef.current?.contains(target) ||
        target.closest('#vplay-native-keyboard') ||
        target.closest('#floating-search-bar-pill') ||
        target.closest('#btn-floaty-search-trigger')
      ) {
        return;
      }
      setIsSearchOpen(false);
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isSearchOpen]);

  const goToPrevPage = () => {
    setDirection(-1);
    setHoveredId(null);
    setPage((current) => (current + pages.length - 1) % pages.length);
  };

  const goToNextPage = () => {
    setDirection(1);
    setHoveredId(null);
    setPage((current) => (current + 1) % pages.length);
  };

  // Touch swipe support for Floaty bar
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Trigger page turn if horizontal swipe exceeds 30px and dominates vertical movement
    if (Math.abs(deltaX) > 30 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        goToNextPage();
      } else {
        goToPrevPage();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return path === '/' ? currentRoute === '/' || currentRoute === '/home' : currentRoute.startsWith(path);
  };

  const firstPage = [
    { id: 'dock-home', label: 'Home', route: '/', image: HOME_ICON },
    { id: 'dock-tv', label: 'Truyền hình', route: '/live-tv', image: TV_ICON },
    ...(settings.developerMode ? [{ id: 'dock-test', label: 'Test', route: '/test', icon: FlaskConical }] : []),
    { id: 'dock-news', label: 'News', route: '/news', icon: Megaphone },
  ];

  const pages = [
    firstPage,
    [
      { id: 'dock-discord', label: 'Discord', action: onOpenDiscord, icon: MessageCircle },
      { id: 'dock-help', label: 'Help', action: onOpenHelp, icon: HelpCircle },
      { id: 'dock-settings', label: 'Cài đặt', route: '/settings', image: SETTINGS_ICON },
    ],
  ];

  return (
    <>
      {/* 1. Progressive Blur Layer at the bottom (matching float search box) */}
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

      {/* 2. Bottom Dock Container with Floaty Bar & Search Trigger */}
      <div
        id="bottom-dock-container"
        style={{
          fontFamily: "'Inter', 'Integer', system-ui, -apple-system, sans-serif",
          bottom: isKeyboardOpen ? `${keyboardHeight + 12}px` : undefined,
          transition: 'bottom 0.42s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className={`fixed ${isKeyboardOpen ? '' : 'bottom-5'} left-1/2 -translate-x-1/2 z-40 select-none flex items-center justify-center pointer-events-auto`}
      >
        <motion.div
          layout
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 32,
            mass: 0.6
          }}
          className="flex items-center justify-center gap-2 sm:gap-2.5"
        >
          <AnimatePresence initial={false} mode="sync">
            {!isSearchOpen && (
              <motion.nav
                key="floaty-bar-nav"
                id="floaty-bar-surface"
                layout
                initial={{ opacity: 0, scale: 0.85, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: 'auto' }}
                exit={{ opacity: 0, scale: 0.85, width: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 32,
                  mass: 0.6
                }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                style={{
                  backgroundColor: 'var(--spatial-glass-bg, rgba(255, 255, 255, 0.20))',
                  backdropFilter: 'blur(var(--spatial-glass-blur, 20px))',
                  WebkitBackdropFilter: 'blur(var(--spatial-glass-blur, 20px))',
                  transformOrigin: 'right center',
                }}
                className={`floaty-bar floaty-bar__surface ${isImmersive ? 'floaty-bar__surface--immersive' : ''} h-[44px] sm:h-[46px] flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.35)] select-none pointer-events-auto overflow-hidden transition-[background-color,border-color,box-shadow] ${
                  isDarkContent ? 'border border-black/15 text-black' : 'border border-white/10 text-white'
                }`}
                aria-label="Floaty bar"
              >
              <button
                type="button"
                aria-label="Trang dock trước"
                onClick={goToPrevPage}
                className={`floaty-bar__arrow size-8 sm:size-[34px] rounded-full flex items-center justify-center cursor-default transition-colors shrink-0 ${
                  isDarkContent ? 'text-black/80 hover:text-black hover:bg-black/10' : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <ChevronLeft className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              </button>

              <div className="floaty-bar__items w-auto max-w-[85vw] h-full relative overflow-hidden flex items-center justify-center transition-all duration-300">
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                  <motion.div
                    key={page}
                    custom={direction}
                    variants={{
                      enter: (dir: number) => ({
                        x: dir > 0 ? '100%' : '-100%',
                        opacity: 0,
                      }),
                      center: {
                        x: '0%',
                        opacity: 1,
                      },
                      exit: (dir: number) => ({
                        x: dir > 0 ? '-100%' : '100%',
                        opacity: 0,
                      }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
                      opacity: { duration: 0.25, ease: 'easeInOut' },
                    }}
                    className="floaty-bar__page flex items-center justify-center gap-1 sm:gap-1.5 w-auto h-full shrink-0 px-0.5 sm:px-1"
                  >
                      {pages[page].map((item) => {
                        const active = item.route ? isActive(item.route) : false;
                        const Icon = item.icon;
                        const isHovered = hoveredId === item.id;

                        if (!isImmersive) {
                          // Standard Floaty bar: Strictly icon only, adaptive pill width when active or hovered
                          const isSelectedOrHovered = active || isHovered;

                          return (
                            <motion.button
                              key={item.id}
                              id={item.id}
                              type="button"
                              title={item.label}
                              layout
                              onMouseEnter={() => setHoveredId(item.id)}
                              onMouseLeave={() => setHoveredId(null)}
                              onClick={() => item.action ? item.action() : item.route && navigate(item.route)}
                              transition={{
                                layout: { type: 'spring', stiffness: 450, damping: 35, mass: 0.6 }
                              }}
                              className={`floaty-bar__item relative h-8 sm:h-[34px] rounded-full flex items-center justify-center cursor-default transition-colors duration-150 outline-none select-none shrink-0 ${
                                isSelectedOrHovered
                                  ? (isDarkContent ? 'is-active px-3 sm:px-3.5 text-black' : 'is-active px-3 sm:px-3.5 text-white')
                                  : (isDarkContent ? 'px-2 sm:px-2.5 text-black/80 hover:text-black hover:bg-black/10' : 'px-2 sm:px-2.5 text-white/80 hover:text-white hover:bg-white/10')
                              }`}
                            >
                              {active && (
                                <motion.div
                                  layoutId="floaty-bar-active-pill"
                                  transition={{
                                    type: 'spring',
                                    stiffness: 450,
                                    damping: 35,
                                    mass: 0.6
                                  }}
                                  className={`floaty-bar-pill-indicator absolute inset-0 rounded-full z-0 pointer-events-none ${
                                    isDarkContent ? 'bg-black/15 shadow-sm' : 'bg-white/20 shadow-sm'
                                  }`}
                                />
                              )}
                              <span className="relative z-10 flex items-center justify-center">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.label}
                                    referrerPolicy="no-referrer"
                                    className={`size-4 sm:size-[18px] object-contain shrink-0 ${
                                      isDarkContent ? 'brightness-0' : 'brightness-0 invert'
                                    } ${
                                      isSelectedOrHovered ? 'opacity-100' : 'opacity-75'
                                    }`}
                                  />
                                ) : Icon ? (
                                  <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0" />
                                ) : null}
                              </span>
                            </motion.button>
                          );
                        }

                        // Immersive Floaty bar: Khi hover không hiện title, chỉ khi nhấn vào (active) mới hiện
                        const isExpanded = active;

                        return (
                          <motion.button
                            key={item.id}
                            id={item.id}
                            type="button"
                            layout
                            onClick={() => item.action ? item.action() : item.route && navigate(item.route)}
                            transition={{
                              layout: { type: 'spring', stiffness: 450, damping: 35, mass: 0.6 }
                            }}
                            className={`floaty-bar__item relative h-8 sm:h-[34px] rounded-full flex items-center justify-center cursor-default transition-colors duration-150 outline-none overflow-hidden select-none shrink-0 ${
                              isExpanded
                                ? (isDarkContent ? 'is-active text-black px-3 sm:px-3.5' : 'is-active text-white px-3 sm:px-3.5')
                                : (isDarkContent ? 'text-black/80 hover:text-black hover:bg-black/10 w-8 sm:w-[34px]' : 'text-white/80 hover:text-white hover:bg-white/10 w-8 sm:w-[34px]')
                            }`}
                          >
                            {active && (
                              <motion.div
                                layoutId="floaty-bar-immersive-active-pill"
                                transition={{
                                  type: 'spring',
                                  stiffness: 450,
                                  damping: 35,
                                  mass: 0.6
                                }}
                                className={`floaty-bar-pill-indicator absolute inset-0 rounded-full z-0 pointer-events-none ${
                                  isDarkContent ? 'bg-black/15 shadow-sm' : 'bg-white/20 shadow-sm'
                                }`}
                              />
                            )}
                            <div className="relative z-10 flex items-center justify-center gap-1.5 whitespace-nowrap">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.label}
                                  referrerPolicy="no-referrer"
                                  className={`size-4 sm:size-[18px] object-contain shrink-0 ${
                                    isDarkContent ? 'brightness-0' : 'brightness-0 invert'
                                  } ${
                                    isExpanded ? 'opacity-100' : 'opacity-75'
                                  }`}
                                />
                              ) : Icon ? (
                                <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0" />
                              ) : null}

                              {/* Title tab chỉ hiển thị khi nhấn vào / active - thích ứng theo độ dài nhãn */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                    className={`text-xs font-bold ${isDarkContent ? 'text-black' : 'text-white'} tracking-tight whitespace-nowrap overflow-hidden pl-0.5`}
                                  >
                                    {item.label}
                                  </motion.span>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  aria-label="Trang dock tiếp theo"
                  onClick={goToNextPage}
                  className={`floaty-bar__arrow size-8 sm:size-[34px] rounded-full flex items-center justify-center cursor-default transition-colors shrink-0 ${
                    isDarkContent ? 'text-black/80 hover:text-black hover:bg-black/10' : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <ChevronRight className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </button>
            </motion.nav>
          )}
        </AnimatePresence>

        {/* Morphing Search Button / Floating Search Bar Pill */}
        <AnimatePresence initial={false}>
          {!isSearchOpen ? (
            <motion.button
              key="btn-floaty-search-trigger"
              layoutId="floaty-search-morph"
              id="btn-floaty-search-trigger"
              type="button"
              onClick={() => setIsSearchOpen(true)}
              title="Tìm kiếm (Search)"
              aria-label="Mở thanh tìm kiếm"
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
              className={`group h-[44px] w-[44px] sm:h-[46px] sm:w-[46px] rounded-full flex items-center justify-center cursor-default shadow-[0_8px_32px_rgba(0,0,0,0.35)] select-none shrink-0 pointer-events-auto transition-[background-color,border-color,box-shadow] ${
                isDarkContent ? 'border border-black/15 text-black' : 'border border-white/10 text-white'
              } ${
                searchQuery?.trim()
                  ? (isDarkContent ? 'ring-2 ring-black/20 shadow-[0_10px_36px_rgba(0,0,0,0.35)]' : 'ring-2 ring-white/25 shadow-[0_10px_36px_rgba(0,0,0,0.45)]')
                  : ''
              }`}
            >
              <img
                src={SF_SEARCH_ICON_URL}
                alt="Search"
                className={`w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] object-contain select-none pointer-events-none transition-opacity ${
                  isDarkContent ? 'brightness-0' : 'filter brightness-0 invert'
                } opacity-85`}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/icons/sf-magnifyingglass.png';
                }}
              />
              {searchQuery?.trim() && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#fd932f] ring-2 ring-black/40" />
              )}
            </motion.button>
          ) : (
            <FloatingSearchBar
              key="floaty-search-active"
              containerRef={searchContainerRef}
              currentRoute={currentRoute}
              searchQuery={searchQuery || ''}
              onSearchChange={onSearchChange || (() => {})}
              onOpenSpotlight={onOpenSpotlight}
              onClose={() => setIsSearchOpen(false)}
              layoutId="floaty-search-morph"
              autoFocus={false}
              embedded
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  </>
);
};

export { BottomDock as FloatyBar };


