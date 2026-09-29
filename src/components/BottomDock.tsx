import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Home,
  Tv,
  Megaphone,
  Search,
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
const SF_SEARCH_ICON_URL = '/icons/sf-magnifyingglass.png';

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
  { id: 'dock-news', label: 'Articles', route: '/news', image: NEWS_ICON, icon: Megaphone },
  { id: 'dock-settings', label: 'Settings', route: '/settings', image: SETTINGS_ICON, icon: SettingsIcon },
  { id: 'dock-search', label: 'Search', isAction: true, image: SF_SEARCH_ICON_URL, icon: Search },
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
  // When spatial glass opacity < 40%, user wants text & icons in tab bar / float search to be monochrome white
  const isLightMode = settings.theme === 'light';
  const isDarkContent = isSpatialGlassActive && currentOpacity > 40;
  const isUnder40 = isSpatialGlassActive && currentOpacity < 40;
  // If isUnder40 is true, force light content (white icons & text) even in light mode
  const useDarkContent = !isUnder40 && (isDarkContent || isLightMode);

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
        target.closest('#vplay-tools-dropdown-card') ||
        target.closest('#dock-more')
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
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }, 100);
    return () => {
      clearTimeout(timer);
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
        target.closest('#floating-search-bar-container') ||
        target.closest('#dock-search') ||
        target.closest('#dock-spotlight-btn')
      ) {
        return;
      }
      setIsSearchOpen(false);
    };
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 100);
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
  const currentActiveId = gesturingTabId || (isToolsOpen ? 'dock-more' : (isSearchOpen ? 'dock-search' : activeRouteTab.id));

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
    if (item.id === 'dock-search' || item.id === 'dock-spotlight-btn') {
      setIsToolsOpen(false);
      setIsSearchOpen(true);
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
    const isWatchTab = item.id === 'dock-tv';
    const isSearchTab = item.id === 'dock-search' || item.id === 'dock-spotlight-btn';
    const iconSizeClasses = isWatchTab
      ? 'w-[24px] h-[24px] sm:w-[26.5px] sm:h-[26.5px]'
      : isSearchTab
        ? 'w-[24px] h-[24px] sm:w-[26.5px] sm:h-[26.5px]'
        : 'w-[28px] h-[28px] sm:w-[31px] sm:h-[31px]';

    if (active) {
      const activeColor = (!isUnder40 && isLightMode) ? '#000000' : '#FFFFFF';
      if (hasImage) {
        return (
          <div
            className={`${iconSizeClasses} shrink-0 transition-transform duration-200`}
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
          className={`${iconSizeClasses} shrink-0 ${
            (!isUnder40 && isLightMode) ? 'text-black stroke-black' : 'text-white stroke-white'
          } transition-all duration-200`}
        />
      );
    }

    // Inactive tab icon:
    // If spatial glass opacity < 40%, icons must be monochrome white.
    // Otherwise if useDarkContent is true (opacity > 40% or light mode), it's black.
    const isBlackIcon = useDarkContent;

    if (hasImage) {
      return (
        <img
          src={item.image}
          alt={item.label}
          referrerPolicy="no-referrer"
          onError={() => setImageErrors((prev) => ({ ...prev, [item.id]: true }))}
          className={`${iconSizeClasses} object-contain shrink-0 transition-all duration-150 ${
            isBlackIcon
              ? 'brightness-0'
              : 'filter brightness-0 invert'
          } ${isSelectedOrHovered ? 'opacity-100' : 'opacity-75'}`}
        />
      );
    }

    return (
      <Icon
        className={`${iconSizeClasses} shrink-0 transition-all duration-150 ${
          isBlackIcon
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

      {/* 2. Bottom Dock Container with Floaty Bar */}
      <div
        id="bottom-dock-container"
        style={{
          fontFamily: "'Inter', 'Integer', system-ui, -apple-system, sans-serif",
          bottom: isKeyboardOpen ? `${keyboardHeight + 12}px` : undefined,
          transition: 'bottom 0.42s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className={`fixed ${isKeyboardOpen ? '' : 'bottom-5'} left-1/2 -translate-x-1/2 z-40 select-none flex items-center justify-center pointer-events-auto`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {!isSearchOpen ? (
            <motion.div
              key="dock-tab-view"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ 
                opacity: 0, 
                scale: 0.94,
                transition: { duration: 0.18, ease: 'easeOut' }
              }}
              transition={SQUISHY_SPRING}
              className="relative flex items-center justify-center pointer-events-auto"
            >
              <motion.nav
                id="floaty-bar-surface"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchCancel}
                whileHover={{
                  scale: 1.025,
                  transition: {
                    type: 'spring',
                    stiffness: 420,
                    damping: 15,
                    mass: 0.6
                  }
                }}
                whileTap={{ scale: 0.98 }}
                style={{
                  backgroundColor: 'var(--spatial-glass-bg, rgba(255, 255, 255, 0.20))',
                  backdropFilter: 'blur(var(--spatial-glass-blur, 20px))',
                  WebkitBackdropFilter: 'blur(var(--spatial-glass-blur, 20px))',
                }}
                className={`floaty-bar floaty-bar__surface h-[58px] sm:h-[62px] w-[336px] sm:w-[396px] max-w-[calc(100vw-20px)] flex items-center justify-between gap-0.5 sm:gap-1 px-1.5 sm:px-2 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.35)] select-none pointer-events-auto overflow-hidden transition-[background-color,border-color,box-shadow] ${
                  useDarkContent ? 'border border-black/15 text-black' : 'border border-white/10 text-white'
                }`}
                aria-label="Tab View"
              >
                <div 
                  id="floaty-bar-tabs-container"
                  className="floaty-bar__items w-full h-full relative z-30 overflow-hidden flex items-center justify-between gap-0.5 sm:gap-1 px-0.5 shrink-0 whitespace-nowrap"
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
                        className={`floaty-bar__item relative flex-1 h-[48px] sm:h-[52px] min-w-0 px-0.5 sm:px-1 rounded-full flex flex-col items-center justify-center cursor-default transition-all duration-150 outline-none select-none shrink-0 ${
                          active
                            ? (useDarkContent ? 'is-active text-black z-20' : 'is-active text-white z-20')
                            : isSelectedOrHovered
                              ? (useDarkContent ? 'text-black z-10' : 'text-white z-10')
                              : (useDarkContent ? 'text-black/75 hover:text-black hover:bg-black/5 z-10' : 'text-white/75 hover:text-white hover:bg-white/10 z-10')
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
                            className="floaty-bar-pill-indicator absolute inset-0 rounded-full pointer-events-none"
                          >
                            {/* Subtle contained glow around selected tab within tab view bar perimeter */}
                            <div 
                              className="absolute -inset-1 rounded-full bg-[#fd932f]/45 blur-[5px] pointer-events-none" 
                              aria-hidden="true" 
                            />
                            <div className="absolute inset-0 rounded-full bg-[#fd932f] border border-[#fd932f] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)]" />
                          </motion.div>
                        )}
                        <div className="relative z-10 flex flex-col items-center justify-center w-full">
                          <div className="w-full h-[27px] sm:h-[29px] flex items-center justify-center shrink-0 relative">
                            {renderTabIcon(item, active, isSelectedOrHovered)}
                            {item.id === 'dock-search' && !!searchQuery?.trim() && (
                              <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-[#fd932f] ring-1.5 ring-black/40 shadow-sm" />
                            )}
                          </div>
                          <span
                            className={`text-[8px] sm:text-[8.5px] font-semibold leading-none tracking-tight transition-colors duration-150 select-none text-center whitespace-nowrap block mt-0.5 -translate-y-[1.5px] ${
                              active
                                ? (useDarkContent ? 'font-bold text-black' : 'font-bold text-white')
                                : useDarkContent
                                  ? 'text-black/85 group-hover:text-black'
                                  : 'text-white/85 group-hover:text-white'
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.nav>

              {/* Tools Flyout Menu attached to More tab */}
              <div 
                ref={toolsFlyoutRef}
                className="absolute right-2 sm:right-3 bottom-full mb-2.5 z-50 pointer-events-auto"
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
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ 
                opacity: 0, 
                scale: 0.94,
                transition: { duration: 0.18, ease: 'easeOut' }
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
