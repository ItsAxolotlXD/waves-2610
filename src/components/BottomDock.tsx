import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Home,
  Tv,
  Megaphone,
  Settings as SettingsIcon,
  LayoutGrid
} from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useNativeKeyboard } from '../context/NativeKeyboardContext';
import { FloatingSearchBar } from './FloatingSearchBar';
import { ToolsMenu } from './ToolsMenu';
import { Channel, NewsArticle } from '../types';

interface BottomDockProps {
  currentRoute: string;
  navigate: (route: string) => void;
  onOpenSearch?: () => void;
  onOpenHelp?: () => void;
  onOpenDiscord?: () => void;
  onOpenSummarize?: (article: NewsArticle) => void;
  onOpenTextToSpeech?: (article: NewsArticle) => void;
  onOpenFindWords?: () => void;
  onOpenAddStream?: () => void;
  onImportChannels?: (channels: Channel[]) => void;
  currentChannel?: Channel;
  channels?: Channel[];
  fontSize?: number;
  onChangeFontSize?: (size: number) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenSpotlight?: () => void;
}

const HOME_ICON = 'https://static.wikia.nocookie.net/ep-deo/images/e/ee/Icons8-home-64.png/revision/latest?cb=20260925115253';
const WATCH_ICON = 'https://static.wikia.nocookie.net/ep-deo/images/d/df/Cool_tv.png/revision/latest?cb=20260927105318';
const NEWS_ICON = 'https://static.wikia.nocookie.net/ep-deo/images/f/f2/Icons8-megaphone-64.png/revision/latest?cb=20260925115252';
const SETTINGS_ICON = 'https://static.wikia.nocookie.net/ftv/images/9/97/Settungs.png/revision/latest?cb=20260411085024&path-prefix=vi';
const MORE_ICON = 'https://static.wikia.nocookie.net/ep-deo/images/7/78/Icons8-apps-90.png/revision/latest?cb=20260925115254';
const SF_SEARCH_ICON_URL = 'https://github.com/andrewtavis/sf-symbols-online/blob/master/glyphs/magnifyingglass.png?raw=true';

interface TabItem {
  id: string;
  label: string;
  route?: string;
  isAction?: boolean;
  image?: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

const DOCK_TABS: TabItem[] = [
  { id: 'dock-home', label: 'Home', route: '/', image: HOME_ICON, icon: Home },
  { id: 'dock-tv', label: 'Watch', route: '/live-tv', image: WATCH_ICON, icon: Tv },
  { id: 'dock-news', label: 'News', route: '/news', image: NEWS_ICON, icon: Megaphone },
  { id: 'dock-settings', label: 'Settings', route: '/settings', image: SETTINGS_ICON, icon: SettingsIcon },
  { id: 'dock-more', label: 'More', isAction: true, image: MORE_ICON, icon: LayoutGrid },
];

const SQUISHY_SPRING = {
  type: 'spring' as const,
  stiffness: 170,
  damping: 18,
  mass: 0.9,
};

export const BottomDock: React.FC<BottomDockProps> = ({ 
  currentRoute, 
  navigate, 
  onOpenSearch,
  onOpenHelp,
  onOpenDiscord,
  onOpenSummarize,
  onOpenTextToSpeech,
  onOpenFindWords,
  onOpenAddStream,
  onImportChannels,
  currentChannel,
  channels,
  fontSize,
  onChangeFontSize,
  searchQuery = '',
  onSearchChange,
  onOpenSpotlight
}) => {
  const { settings, draftSettings } = useSettings();
  const currentOpacity = typeof draftSettings?.spatialGlassOpacity === 'number'
    ? draftSettings.spatialGlassOpacity
    : (settings.spatialGlassOpacity ?? 20);
  const isSpatialGlassActive = (draftSettings?.spatialGlass ?? settings.spatialGlass) !== false;
  const isLightMode = settings.theme === 'light';
  const isDarkContent = isSpatialGlassActive && currentOpacity > 40;

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [gesturingTabId, setGesturingTabId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const toolsFlyoutRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isGesturingRef = useRef(false);

  const { isOpen: isKeyboardOpen, keyboardHeight } = useNativeKeyboard();

  // Listen for global open event (Cmd+K / Alt+2 shortcuts)
  useEffect(() => {
    const handleGlobalOpen = () => setIsSearchOpen(true);
    window.addEventListener('vplay:open-floaty-search', handleGlobalOpen);
    return () => window.removeEventListener('vplay:open-floaty-search', handleGlobalOpen);
  }, []);

  // Close search & tools when route changes
  useEffect(() => {
    setIsSearchOpen(false);
    setIsToolsOpen(false);
  }, [currentRoute]);

  // Click outside / Esc to close tools flyout
  useEffect(() => {
    if (!isToolsOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const moreBtn = tabRefs.current['dock-more'];
      const flyout = toolsFlyoutRef.current;
      if (
        (flyout && flyout.contains(target)) ||
        (moreBtn && moreBtn.contains(target)) ||
        target.closest('#vplay-tools-dropdown-card')
      ) {
        return;
      }
      setIsToolsOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isToolsOpen]);

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

  const isActive = (route?: string) => {
    if (!route) return false;
    if (route === '/') {
      return currentRoute === '/' || currentRoute === '/home';
    }
    if (route === '/live-tv') {
      return currentRoute === '/live-tv' || currentRoute === '/channels' || currentRoute === '/test';
    }
    return currentRoute.startsWith(route);
  };

  const activeRouteTab = DOCK_TABS.find((t) => t.route && isActive(t.route)) || DOCK_TABS[0];
  const currentActiveId = gesturingTabId || (isToolsOpen ? 'dock-more' : activeRouteTab.id);

  // Real-time gesture tracking: finger sliding horizontally across floaty bar updates active tab indicator
  const getTabFromTouch = (touch: React.Touch | Touch): string | null => {
    const clientX = touch.clientX;
    const clientY = touch.clientY;

    let closestTabId: string | null = null;
    let minDistance = Infinity;

    for (const tab of DOCK_TABS) {
      const el = tabRefs.current[tab.id];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      // Allow vertical leeway (+-60px) so horizontal finger gestures remain tracked smoothly
      if (clientY >= rect.top - 60 && clientY <= rect.bottom + 60) {
        if (clientX >= rect.left && clientX <= rect.right) {
          return tab.id;
        }
        const centerX = rect.left + rect.width / 2;
        const dist = Math.abs(clientX - centerX);
        if (dist < minDistance) {
          minDistance = dist;
          closestTabId = tab.id;
        }
      }
    }

    return closestTabId;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isGesturingRef.current = true;
      const tabId = getTabFromTouch(e.touches[0]);
      if (tabId) {
        setGesturingTabId(tabId);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isGesturingRef.current || e.touches.length !== 1) return;
    const tabId = getTabFromTouch(e.touches[0]);
    if (tabId && tabId !== gesturingTabId) {
      setGesturingTabId(tabId);
    }
  };

  const handleTabClick = (item: TabItem) => {
    if (item.id === 'dock-more') {
      setIsToolsOpen((prev) => !prev);
      return;
    }
    setIsToolsOpen(false);
    if (item.route) {
      navigate(item.route);
    }
  };

  const handleTouchEnd = () => {
    if (isGesturingRef.current) {
      isGesturingRef.current = false;
      if (gesturingTabId) {
        const targetTab = DOCK_TABS.find((t) => t.id === gesturingTabId);
        if (targetTab) {
          handleTabClick(targetTab);
        }
      }
      setGesturingTabId(null);
    }
  };

  const handleTouchCancel = () => {
    isGesturingRef.current = false;
    setGesturingTabId(null);
  };

  const renderTabIcon = (item: TabItem, active: boolean, isSelectedOrHovered: boolean) => {
    const Icon = item.icon;
    const hasImage = !!item.image && !imageErrors[item.id];

    if (active) {
      const activeColor = isLightMode ? '#000000' : '#FFFFFF';
      if (hasImage) {
        return (
          <div
            className="w-[31px] h-[31px] sm:w-[35px] sm:h-[35px] shrink-0 transition-transform duration-200"
            style={{
              maskImage: `url(${item.image})`,
              WebkitMaskImage: `url(${item.image})`,
              maskSize: 'contain',
              WebkitMaskSize: 'contain',
              maskRepeat: 'no-repeat',
              WebkitMaskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskPosition: 'center',
              backgroundColor: activeColor,
            }}
          />
        );
      }
      return (
        <Icon
          className={`w-[31px] h-[31px] sm:w-[35px] sm:h-[35px] shrink-0 ${
            isLightMode ? 'text-black stroke-black' : 'text-white stroke-white'
          } transition-all duration-200`}
        />
      );
    }

    // Inactive: monochrome white, or monochrome black if opacity > 40% (isDarkContent)
    if (hasImage) {
      return (
        <img
          src={item.image}
          alt={item.label}
          referrerPolicy="no-referrer"
          onError={() => setImageErrors((prev) => ({ ...prev, [item.id]: true }))}
          className={`w-[31px] h-[31px] sm:w-[35px] sm:h-[35px] object-contain shrink-0 transition-all duration-150 ${
            isDarkContent
              ? 'brightness-0'
              : 'filter brightness-0 invert'
          } ${isSelectedOrHovered ? 'opacity-100' : 'opacity-75'}`}
        />
      );
    }

    return (
      <Icon
        className={`w-[31px] h-[31px] sm:w-[35px] sm:h-[35px] shrink-0 transition-all duration-150 ${
          isDarkContent
            ? 'text-black stroke-black'
            : 'text-white stroke-white'
        } ${isSelectedOrHovered ? 'opacity-100' : 'opacity-75'}`}
      />
    );
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
        <AnimatePresence mode="popLayout" initial={false}>
          {!isSearchOpen ? (
            <motion.div
              key="dock-tab-view"
              initial={{ opacity: 0, scale: 0.88, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ 
                opacity: 0, 
                scale: 0.88, 
                filter: 'blur(8px)',
                transition: {
                  opacity: { duration: 0.28, ease: 'easeInOut' },
                  scale: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
                  filter: { duration: 0.30 },
                }
              }}
              transition={SQUISHY_SPRING}
              className="flex items-center justify-center gap-2 sm:gap-2.5 relative"
            >
              <nav
                id="floaty-bar-surface"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchCancel}
                style={{
                  backgroundColor: 'var(--spatial-glass-bg, rgba(255, 255, 255, 0.20))',
                  backdropFilter: 'blur(var(--spatial-glass-blur, 20px))',
                  WebkitBackdropFilter: 'blur(var(--spatial-glass-blur, 20px))',
                }}
                className={`floaty-bar floaty-bar__surface h-[66px] sm:h-[72px] flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.35)] select-none pointer-events-auto overflow-hidden transition-[background-color,border-color,box-shadow] ${
                  isDarkContent || isLightMode ? 'border border-black/15 text-black' : 'border border-white/10 text-white'
                }`}
                aria-label="Tab View"
              >
                <div 
                  id="floaty-bar-tabs-container"
                  className="floaty-bar__items w-auto h-full relative z-30 overflow-hidden flex items-center justify-center gap-1 sm:gap-1.5 px-0.5 shrink-0 whitespace-nowrap min-w-max"
                >
                  {DOCK_TABS.map((item) => {
                    const active = currentActiveId === item.id;
                    const isHovered = hoveredId === item.id;
                    const isSelectedOrHovered = active || isHovered;

                    return (
                      <button
                        key={item.id}
                        ref={(el) => { tabRefs.current[item.id] = el; }}
                        id={item.id}
                        type="button"
                        title={item.label}
                        onMouseEnter={() => setHoveredId(item.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => handleTabClick(item)}
                        className={`floaty-bar__item relative h-[56px] sm:h-[62px] min-w-[56px] sm:min-w-[66px] px-2 sm:px-3 rounded-full flex flex-col items-center justify-center cursor-default transition-all duration-150 outline-none select-none shrink-0 ${
                          active
                            ? (isLightMode ? 'is-active text-black z-20' : 'is-active text-white z-20')
                            : isSelectedOrHovered
                              ? (isDarkContent ? 'text-black z-10' : 'text-white z-10')
                              : (isDarkContent ? 'text-black/75 hover:text-black hover:bg-black/5 z-10' : 'text-white/75 hover:text-white hover:bg-white/10 z-10')
                        }`}
                      >
                        {active && (
                          <motion.div
                            layoutId="floaty-bar-active-pill"
                            transition={{
                              type: 'spring',
                              stiffness: 420,
                              damping: 28,
                              mass: 0.55
                            }}
                            style={{ zIndex: 1 }}
                            className="floaty-bar-pill-indicator absolute inset-0 rounded-full pointer-events-none bg-[#fd932f] shadow-[0_4px_14px_rgba(253,147,47,0.40)] border border-[#fd932f]"
                          />
                        )}
                        <div className="relative z-10 flex flex-col items-center justify-center">
                          {renderTabIcon(item, active, isSelectedOrHovered)}
                          <span
                            className={`text-[9px] sm:text-[9.5px] font-semibold leading-tight tracking-tight transition-colors duration-150 select-none mt-0.5 ${
                              active
                                ? (isLightMode ? 'font-bold text-black' : 'font-bold text-white')
                                : isDarkContent
                                  ? 'text-black/75 group-hover:text-black'
                                  : 'text-white/75 group-hover:text-white'
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </nav>

              {/* Search Trigger Button */}
              <motion.button
                id="btn-floaty-search-trigger"
                type="button"
                onClick={() => {
                  setIsToolsOpen(false);
                  setIsSearchOpen(true);
                }}
                title="Tìm kiếm (Search)"
                aria-label="Mở thanh tìm kiếm"
                whileHover={{
                  scale: 1.08,
                  transition: SQUISHY_SPRING
                }}
                whileTap={{ scale: 0.94 }}
                style={{
                  backgroundColor: 'var(--spatial-glass-bg, rgba(255, 255, 255, 0.20))',
                  backdropFilter: 'blur(var(--spatial-glass-blur, 20px))',
                  WebkitBackdropFilter: 'blur(var(--spatial-glass-blur, 20px))',
                }}
                className={`group h-[66px] w-[66px] sm:h-[72px] sm:w-[72px] rounded-full flex items-center justify-center cursor-default shadow-[0_8px_32px_rgba(0,0,0,0.35)] select-none shrink-0 pointer-events-auto transition-[border-color,box-shadow] ${
                  isDarkContent || isLightMode ? 'border border-black/15 text-black' : 'border border-white/10 text-white'
                } ${
                  searchQuery?.trim()
                    ? (isDarkContent || isLightMode ? 'ring-2 ring-black/20 shadow-[0_10px_36px_rgba(0,0,0,0.35)]' : 'ring-2 ring-white/25 shadow-[0_10px_36px_rgba(0,0,0,0.45)]')
                    : ''
                }`}
              >
                <img
                  src={SF_SEARCH_ICON_URL}
                  alt="Search"
                  className={`w-[30px] h-[30px] sm:w-[33px] sm:h-[33px] object-contain select-none pointer-events-none transition-opacity ${
                    isDarkContent || isLightMode ? 'brightness-0' : 'filter brightness-0 invert'
                  } opacity-90`}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/icons/sf-magnifyingglass.png';
                  }}
                />
                {searchQuery?.trim() && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#fd932f] ring-2 ring-black/40" />
                )}
              </motion.button>

              {/* Tools Flyout Menu attached to More tab */}
              <div 
                ref={toolsFlyoutRef}
                className="absolute right-16 sm:right-20 bottom-full mb-3.5 z-50 pointer-events-auto"
              >
                <ToolsMenu
                  currentRoute={currentRoute}
                  currentChannel={currentChannel}
                  channels={channels || []}
                  onNavigate={(route) => {
                    setIsToolsOpen(false);
                    navigate(route);
                  }}
                  onOpenHelp={() => {
                    setIsToolsOpen(false);
                    onOpenHelp?.();
                  }}
                  onOpenDiscord={() => {
                    setIsToolsOpen(false);
                    onOpenDiscord?.();
                  }}
                  onOpenSummarize={(article) => {
                    setIsToolsOpen(false);
                    onOpenSummarize?.(article);
                  }}
                  onOpenTextToSpeech={(article) => {
                    setIsToolsOpen(false);
                    onOpenTextToSpeech?.(article);
                  }}
                  onOpenFindWords={() => {
                    setIsToolsOpen(false);
                    onOpenFindWords?.();
                  }}
                  onOpenAddStream={() => {
                    setIsToolsOpen(false);
                    onOpenAddStream?.();
                  }}
                  onImportChannels={(newChs) => {
                    setIsToolsOpen(false);
                    onImportChannels?.(newChs);
                  }}
                  fontSize={fontSize || 16}
                  onChangeFontSize={onChangeFontSize || (() => {})}
                  placement="bottom"
                  isOpen={isToolsOpen}
                  onClose={() => setIsToolsOpen(false)}
                  showTrigger={false}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dock-search-mode"
              initial={{ opacity: 0, scale: 0.88, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ 
                opacity: 0, 
                scale: 0.88, 
                filter: 'blur(8px)',
                transition: {
                  opacity: { duration: 0.28, ease: 'easeInOut' },
                  scale: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
                  filter: { duration: 0.30 },
                }
              }}
              transition={SQUISHY_SPRING}
              className="flex items-center justify-center pointer-events-auto"
            >
              <FloatingSearchBar
                containerRef={searchContainerRef}
                currentRoute={currentRoute}
                searchQuery={searchQuery || ''}
                onSearchChange={onSearchChange || (() => {})}
                onOpenSpotlight={onOpenSpotlight}
                onClose={() => setIsSearchOpen(false)}
                autoFocus={true}
                embedded
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export { BottomDock as FloatyBar };
