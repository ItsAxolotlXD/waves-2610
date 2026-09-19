import React, { useState, useRef } from 'react';
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

interface BottomDockProps {
  currentRoute: string;
  navigate: (route: string) => void;
  onOpenSearch: () => void;
  onOpenHelp?: () => void;
  onOpenDiscord?: () => void;
  isImmersive?: boolean;
}

const HOME_ICON = 'https://static.wikia.nocookie.net/ep-deo/images/6/6e/New_hom.png/revision/latest?cb=20260722124341';
const TV_ICON = 'https://vtvgo-next-assets.vtvdigital.vn/prod/images/menu/20260905/2026090508/b467d7552a-tv-1.webp';
const SETTINGS_ICON = 'https://static.wikia.nocookie.net/ftv/images/9/97/Settungs.png/revision/latest?cb=20260411085024&path-prefix=vi';

export const BottomDock: React.FC<BottomDockProps> = ({ 
  currentRoute, 
  navigate, 
  onOpenSearch, 
  onOpenHelp, 
  onOpenDiscord,
  isImmersive = false 
}) => {
  const { settings } = useSettings();
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
    { id: 'dock-search', label: 'Search', route: '/search', action: onOpenSearch, icon: Search },
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
    <nav className="floaty-bar fixed bottom-5 left-1/2 -translate-x-1/2 z-40 select-none" aria-label="Floaty bar">
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`floaty-bar__surface ${isImmersive ? 'floaty-bar__surface--immersive' : ''} flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all duration-300`}
      >
        <button
          type="button"
          aria-label="Trang dock trước"
          onClick={goToPrevPage}
          className="floaty-bar__arrow size-10 rounded-full flex items-center justify-center cursor-pointer transition-colors shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="floaty-bar__items w-auto max-w-[85vw] h-11 relative overflow-hidden flex items-center justify-center transition-all duration-300">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={page}
              custom={direction}
              variants={{
                enter: (dir: number) => ({
                  x: dir > 0 ? '100%' : '-100%',
                  opacity: 0,
                  filter: 'blur(3px)',
                }),
                center: {
                  x: '0%',
                  opacity: 1,
                  filter: 'blur(0px)',
                },
                exit: (dir: number) => ({
                  x: dir > 0 ? '-100%' : '100%',
                  opacity: 0,
                  filter: 'blur(3px)',
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                opacity: { duration: 0.6, ease: 'easeInOut' },
                filter: { duration: 0.6, ease: 'easeInOut' },
              }}
              className="floaty-bar__page flex items-center justify-center gap-1 sm:gap-1.5 w-auto h-11 shrink-0 px-1 sm:px-2"
            >
              {pages[page].map((item) => {
                const isSearchItem = item.id === 'dock-search';
                const active = isSearchItem
                  ? currentRoute === '/search'
                  : item.route ? isActive(item.route) : false;
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
                        layout: { duration: 0.25, ease: [0.25, 1, 0.5, 1] }
                      }}
                      className={`floaty-bar__item h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-150 outline-none select-none shrink-0 ${
                        isSelectedOrHovered
                          ? 'is-active px-4 bg-white/20 text-white shadow-sm'
                          : 'px-2.5 text-white/75 hover:text-white'
                      }`}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.label}
                          referrerPolicy="no-referrer"
                          className={`size-5 object-contain shrink-0 brightness-0 invert ${
                            isSelectedOrHovered ? 'opacity-100' : 'opacity-75'
                          }`}
                        />
                      ) : Icon ? (
                        <Icon className="w-5 h-5 shrink-0" />
                      ) : null}
                    </motion.button>
                  );
                }

                // Immersive Floaty bar: Khi hover không hiện title, chỉ khi nhấn vào (active) mới hiện
                // Độ dài tự thích ứng (adapt) theo số tab và độ dài tên tab active
                const isExpanded = active;

                return (
                  <motion.button
                    key={item.id}
                    id={item.id}
                    type="button"
                    layout
                    onClick={() => item.action ? item.action() : item.route && navigate(item.route)}
                    transition={{
                      layout: { duration: 0.28, ease: [0.25, 1, 0.5, 1] }
                    }}
                    className={`floaty-bar__item relative h-9 sm:h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-150 outline-none overflow-hidden select-none shrink-0 ${
                      isExpanded
                        ? 'is-active bg-white/20 text-white shadow-sm px-3.5 sm:px-4'
                        : 'text-white/75 hover:text-white hover:bg-white/10 w-9 sm:w-10'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.label}
                          referrerPolicy="no-referrer"
                          className={`size-5 object-contain shrink-0 brightness-0 invert ${
                            isExpanded ? 'opacity-100' : 'opacity-75'
                          }`}
                        />
                      ) : Icon ? (
                        <Icon className="w-4.5 h-4.5 shrink-0" />
                      ) : null}

                      {/* Title tab chỉ hiển thị khi nhấn vào / active - thích ứng theo độ dài nhãn */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="text-xs font-bold text-white tracking-tight whitespace-nowrap overflow-hidden pl-0.5"
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
          className="floaty-bar__arrow size-10 rounded-full flex items-center justify-center cursor-pointer transition-colors shrink-0"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};

export { BottomDock as FloatyBar };


