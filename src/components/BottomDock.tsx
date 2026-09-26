import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Home,
  Tv,
  Megaphone,
  Settings as SettingsIcon
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
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenSpotlight?: () => void;
}

const HOME_ICON = 'https://static.wikia.nocookie.net/ep-deo/images/e/ee/Icons8-home-64.png/revision/latest?cb=20260925115253';
const WATCH_ICON = 'https://static.wikia.nocookie.net/ep-deo/images/7/78/Icons8-apps-90.png/revision/latest?cb=20260925115254';
const NEWS_ICON = 'https://static.wikia.nocookie.net/ep-deo/images/f/f2/Icons8-megaphone-64.png/revision/latest?cb=20260925115252';
const SETTINGS_ICON = 'https://static.wikia.nocookie.net/ftv/images/9/97/Settungs.png/revision/latest?cb=20260411085024&path-prefix=vi';
const SF_SEARCH_ICON_URL = 'https://github.com/andrewtavis/sf-symbols-online/blob/master/glyphs/magnifyingglass.png?raw=true';

interface TabItem {
  id: string;
  label: string;
  route: string;
  image?: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

const DOCK_TABS: TabItem[] = [
  { id: 'dock-home', label: 'Home', route: '/', image: HOME_ICON, icon: Home },
  { id: 'dock-tv', label: 'Watch', route: '/live-tv', image: WATCH_ICON, icon: Tv },
  { id: 'dock-news', label: 'News', route: '/news', image: NEWS_ICON, icon: Megaphone },
  { id: 'dock-settings', label: 'Settings', route: '/settings', image: SETTINGS_ICON, icon: SettingsIcon },
];

const FAST_MORPH_SPRING = {
  type: 'spring' as const,
  stiffness: 580,
  damping: 32,
  mass: 0.35,
};

export const BottomDock: React.FC<BottomDockProps> = ({ 
  currentRoute, 
  navigate, 
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
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isGesturingRef = useRef(false);

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

  const isActive = (route: string) => {
    if (route === '/') {
      return currentRoute === '/' || currentRoute === '/home';
    }
    if (route === '/live-tv') {
      return currentRoute === '/live-tv' || currentRoute === '/channels' || currentRoute === '/test';
    }
    return currentRoute.startsWith(route);
  };

  const activeRouteTab = DOCK_TABS.find((t) => isActive(t.route)) || DOCK_TABS[0];
  const currentActiveId = gesturingTabId || activeRouteTab.id;

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

  const handleTouchEnd = () => {
    if (isGesturingRef.current) {
      isGesturingRef.current = false;
      if (gesturingTabId) {
        const targetTab = DOCK_TABS.find((t) => t.id === gesturingTabId);
        if (targetTab) {
          navigate(targetTab.route);
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
            className="w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] shrink-0 transition-transform duration-200"
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
          className={`w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] shrink-0 ${
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
          className={`w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] object-contain shrink-0 transition-all duration-150 ${
            isDarkContent
              ? 'brightness-0'
              : 'filter brightness-0 invert'
          } ${isSelectedOrHovered ? 'opacity-100' : 'opacity-75'}`}
        />
      );
    }

    return (
      <Icon
        className={`w-[28px] h-[28px] sm:w-[32px] sm:h-[32px] shrink-0 transition-all duration-150 ${
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
        <motion.div
          layout
          transition={FAST_MORPH_SPRING}
          className="flex items-center justify-center gap-2 sm:gap-2.5"
        >
          <AnimatePresence initial={false} mode="sync">
            {!isSearchOpen && (
              <motion.nav
                key="floaty-bar-nav"
                id="floaty-bar-surface"
                layout
                initial={{ opacity: 0, scale: 0.92, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: 'auto' }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.92, 
                  width: 0,
                  paddingLeft: 0,
                  paddingRight: 0,
                  transition: {
                    opacity: { duration: 0.12 },
                    width: FAST_MORPH_SPRING,
                    scale: { duration: 0.14 }
                  }
                }}
                whileHover={{
                  scale: 1.055,
                  transition: {
                    type: 'spring',
                    stiffness: 450,
                    damping: 18,
                    mass: 0.6
                  }
                }}
                whileTap={{ scale: 0.98 }}
                transition={FAST_MORPH_SPRING}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchCancel}
                style={{
                  backgroundColor: 'var(--spatial-glass-bg, rgba(255, 255, 255, 0.20))',
                  backdropFilter: 'blur(var(--spatial-glass-blur, 20px))',
                  WebkitBackdropFilter: 'blur(var(--spatial-glass-blur, 20px))',
                  transformOrigin: 'right center',
                }}
                className={`floaty-bar floaty-bar__surface h-[64px] sm:h-[70px] flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.35)] select-none pointer-events-auto overflow-hidden hover:brightness-125 transition-[background-color,border-color,box-shadow,filter] ${
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
                      <motion.button
                        key={item.id}
                        ref={(el) => { tabRefs.current[item.id] = el; }}
                        id={item.id}
                        type="button"
                        title={item.label}
                        layout
                        onMouseEnter={() => setHoveredId(item.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => navigate(item.route)}
                        transition={{
                          layout: { type: 'spring', stiffness: 480, damping: 35, mass: 0.6 }
                        }}
                        className={`floaty-bar__item relative h-[54px] sm:h-[60px] min-w-[62px] sm:min-w-[70px] px-2.5 sm:px-3.5 rounded-full flex flex-col items-center justify-center cursor-default transition-all duration-150 outline-none select-none shrink-0 ${
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
                              stiffness: 380,
                              damping: 20,
                              mass: 0.55
                            }}
                            style={{ zIndex: 1 }}
                            className="floaty-bar-pill-indicator absolute inset-0 rounded-full pointer-events-none bg-[#fd932f] shadow-[0_4px_14px_rgba(253,147,47,0.40)] border border-[#fd932f]"
                          />
                        )}
                        <div className="relative z-10 flex flex-col items-center justify-center">
                          {renderTabIcon(item, active, isSelectedOrHovered)}
                          <span
                            className={`text-[10px] sm:text-[11px] font-semibold leading-tight tracking-tight transition-colors duration-150 select-none mt-0.5 ${
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
                      </motion.button>
                    );
                  })}
                </div>
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
                whileHover={{
                  scale: 1.08,
                  transition: {
                    type: 'spring',
                    stiffness: 450,
                    damping: 15,
                    mass: 0.6
                  }
                }}
                whileTap={{ scale: 0.94 }}
                transition={FAST_MORPH_SPRING}
                style={{
                  backgroundColor: 'var(--spatial-glass-bg, rgba(255, 255, 255, 0.20))',
                  backdropFilter: 'blur(var(--spatial-glass-blur, 20px))',
                  WebkitBackdropFilter: 'blur(var(--spatial-glass-blur, 20px))',
                }}
                className={`group h-[64px] w-[64px] sm:h-[70px] sm:w-[70px] rounded-full flex items-center justify-center cursor-default shadow-[0_8px_32px_rgba(0,0,0,0.35)] select-none shrink-0 pointer-events-auto hover:brightness-125 transition-[background-color,border-color,box-shadow,filter] ${
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
