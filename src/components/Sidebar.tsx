import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft,
  X,
  Heart,
  BookOpen,
  FlaskConical
} from 'lucide-react';
import { useClock } from '../hooks/useClock';
import { useFavorites } from '../hooks/useFavorites';
import { useSettings } from '../hooks/useSettings';
import { useRevealEffect } from '../hooks/useRevealEffect';
import { CHANNELS_DATA } from '../data/channels';
import { Channel } from '../types';
import { DiscordWelcomeModal } from './DiscordWelcomeModal';

const LOGO_SRC = 'https://static.wikia.nocookie.net/ep-deo/images/4/4b/Vplay_no_wordmark.png/revision/latest/scale-to-width-down/1000?cb=20260829062616';
const HOME_ICON_SRC = 'https://static.wikia.nocookie.net/ep-deo/images/e/ee/Icons8-home-64.png/revision/latest?cb=20260925115253';
const WATCH_ICON_SRC = 'https://static.wikia.nocookie.net/ep-deo/images/d/df/Cool_tv.png/revision/latest?cb=20260927105318';
const NEWS_ICON_SRC = 'https://static.wikia.nocookie.net/ep-deo/images/f/f2/Icons8-megaphone-64.png/revision/latest?cb=20260925115252';
const SETTINGS_ICON_SRC = 'https://static.wikia.nocookie.net/ftv/images/9/97/Settungs.png/revision/latest?cb=20260411085024&path-prefix=vi';

interface SidebarProps {
  currentRoute: string;
  navigate: (route: string, state?: any) => void;
  onOpenSearch: () => void;
  selectedChannel?: Channel | null;
  onSelectChannel?: (channel: Channel) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  navigate,
  onOpenSearch,
  onSelectChannel,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const { settings } = useSettings();
  const { timeString, dateString } = useClock();
  const { favoriteChannelIds } = useFavorites();
  const revealProps = useRevealEffect();

  const [isLiveTvExpanded, setIsLiveTvExpanded] = useState(false);
  const [isFavoritesExpanded, setIsFavoritesExpanded] = useState(false);
  const [isHelpExpanded, setIsHelpExpanded] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Touch swipe to close mobile drawer when swiping left
  const drawerTouchStartX = useRef<number | null>(null);
  const drawerTouchStartY = useRef<number | null>(null);

  const handleDrawerTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      drawerTouchStartX.current = e.touches[0].clientX;
      drawerTouchStartY.current = e.touches[0].clientY;
    }
  };

  const handleDrawerTouchEnd = (e: React.TouchEvent) => {
    if (drawerTouchStartX.current === null || drawerTouchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - drawerTouchStartX.current;
    const deltaY = e.changedTouches[0].clientY - drawerTouchStartY.current;

    if (deltaX < -35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1) {
      onCloseMobile?.();
    }
    drawerTouchStartX.current = null;
    drawerTouchStartY.current = null;
  };

  const favoriteChannels = CHANNELS_DATA.filter((ch) => favoriteChannelIds.includes(ch.id));

  const handleSettingsNavClick = () => {
    handleNavClick('/settings');
  };

  const shouldAnimateSidebar = !settings.reduceAllMotion && settings.animateSidebar;

  const effectiveCollapsed = settings.autoHideSidebar 
    ? !isHovered 
    : isCollapsed;

  const isActive = (route: string) => {
    if (route === '/' && currentRoute === '/') return true;
    if (route !== '/' && currentRoute.startsWith(route)) return true;
    return false;
  };

  const handleNavClick = (route: string, state?: any) => {
    navigate(route, state);
    if (onCloseMobile) onCloseMobile();
  };

  const handleSpotlightClick = () => {
    onOpenSearch();
    if (onCloseMobile) onCloseMobile();
  };

  // Shared Sidebar Inner Content (Fluent Design NavigationView with Reveal Effect)
  const renderSidebarBody = (isMobile: boolean = false) => (
    <div className="flex flex-col h-full select-none text-[13px]">
      {/* Top Header: Clock + Monochrome Logo + Close/Collapse Button */}
      <div className="px-4 pt-4 pb-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div 
            onClick={() => handleNavClick('/')} 
            className="cursor-default flex items-center justify-center p-0 hover:opacity-85 transition-opacity"
            title="VNRT Online"
          >
            {!logoError ? (
              <img 
                src={LOGO_SRC} 
                alt="VNRT Online Logo" 
                referrerPolicy="no-referrer"
                className="h-7.5 max-w-[120px] w-auto object-contain shrink-0"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-[#0067c0] font-black text-2xl tracking-tighter">V</span>
            )}
          </div>

          <div className="flex flex-col">
            <div className="text-[#111827] dark:text-white text-sm font-bold tracking-tight font-mono leading-tight">
              {timeString || '20:16:35'}
            </div>
            <div className="text-[#6b7280] dark:text-[#a1a1aa] text-[10.5px] font-normal leading-none mt-0.5">
              {dateString || 'Th 5, 27/08/2026'}
            </div>
          </div>
        </div>

        {isMobile ? (
          <button 
            id="btn-mobile-sidebar-close"
            onClick={onCloseMobile}
            className="fluent-reveal-item w-7 h-7 rounded-[4px] flex items-center justify-center text-[#6b7280] dark:text-[#a1a1aa] hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors cursor-default"
            title="Đóng menu"
            {...revealProps}
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button 
            id="btn-sidebar-collapse"
            onClick={onToggleCollapse}
            className="fluent-reveal-item w-7 h-7 rounded-[4px] flex items-center justify-center text-[#6b7280] dark:text-[#a1a1aa] hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors cursor-default"
            title="Thu gọn menu"
            {...revealProps}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* AutoSuggestBox Search Trigger */}
      <div className="px-3 pt-1 pb-3 shrink-0">
        <button
          id={isMobile ? 'btn-mobile-spotlight-search' : 'btn-spotlight-search'}
          onClick={handleSpotlightClick}
          className="fluent-reveal-item w-full h-8.5 rounded-[4px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 flex items-center px-3 gap-2.5 text-xs text-[#555555] dark:text-[#cccccc] transition-colors cursor-default text-left"
          {...revealProps}
        >
          <img
            src="https://static.wikia.nocookie.net/ep-deo/images/2/21/Searchhh.png/revision/latest?cb=20260717131751"
            alt="Search"
            referrerPolicy="no-referrer"
            className="w-3.5 h-3.5 aspect-square object-contain brightness-0 dark:brightness-0 dark:invert opacity-75 shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="truncate">Tìm kiếm (⌘K)</span>
        </button>
      </div>

      {/* Navigation Menu List */}
      <div className="flex-1 overflow-y-auto pb-4 no-scrollbar px-2 space-y-0.5 font-normal">
        {/* 1. Home */}
        <button
          id={isMobile ? 'mobile-nav-item-home' : 'nav-item-home'}
          onClick={() => handleNavClick('/')}
          title="Trang chủ"
          className={`fluent-reveal-item w-full h-9 flex items-center gap-2.5 px-3 rounded-[4px] transition-colors cursor-default relative text-left ${
            isActive('/') && currentRoute === '/'
              ? 'bg-black/5 dark:bg-white/10 text-[#111827] dark:text-white font-medium'
              : 'text-[#4b5563] dark:text-[#d1d5db] hover:bg-black/5 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-white'
          }`}
          {...revealProps}
        >
          {isActive('/') && currentRoute === '/' && (
            <span className="w-[3px] h-4 bg-[#0067c0] rounded-full absolute left-1" />
          )}
          <img
            src={HOME_ICON_SRC}
            alt="Home"
            referrerPolicy="no-referrer"
            className={`w-4 h-4 object-contain shrink-0 ${
              isActive('/') && currentRoute === '/' ? 'brightness-0 dark:brightness-0 dark:invert opacity-100' : 'brightness-0 dark:brightness-0 dark:invert opacity-70'
            }`}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="truncate">Trang chủ</span>
        </button>

        {/* 2. Truyền hình */}
        <div className="w-full">
          <button
            id={isMobile ? 'mobile-nav-item-live-tv' : 'nav-item-live-tv'}
            onClick={() => handleNavClick('/live-tv')}
            title="Truyền hình"
            className={`fluent-reveal-item w-full h-9 flex items-center justify-between px-3 rounded-[4px] transition-colors cursor-default relative text-left ${
              isActive('/live-tv')
                ? 'bg-black/5 dark:bg-white/10 text-[#111827] dark:text-white font-medium'
                : 'text-[#4b5563] dark:text-[#d1d5db] hover:bg-black/5 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-white'
            }`}
            {...revealProps}
          >
            {isActive('/live-tv') && (
              <span className="w-[3px] h-4 bg-[#0067c0] rounded-full absolute left-1" />
            )}
            <div className="flex items-center gap-2.5 truncate">
              <img
                src={WATCH_ICON_SRC}
                alt="Truyền hình"
                referrerPolicy="no-referrer"
                className={`w-4 h-4 object-contain shrink-0 ${
                  isActive('/live-tv') ? 'brightness-0 dark:brightness-0 dark:invert opacity-100' : 'brightness-0 dark:brightness-0 dark:invert opacity-70'
                }`}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="truncate">Truyền hình</span>
            </div>
            <div
              onClick={(e) => {
                e.stopPropagation();
                setIsLiveTvExpanded(!isLiveTvExpanded);
              }}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-[2px]"
            >
              {isLiveTvExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 opacity-70" />
              )}
            </div>
          </button>

          {isLiveTvExpanded && (
            <div className="mt-0.5 ml-4 pl-2.5 border-l border-black/10 dark:border-white/10 space-y-0.5">
              {CHANNELS_DATA.slice(0, 5).map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    handleNavClick(`/live-tv?channel=${ch.slug}`);
                    if (onSelectChannel) onSelectChannel(ch);
                  }}
                  className="fluent-reveal-item w-full h-8 flex items-center justify-between px-2.5 rounded-[4px] text-xs text-[#555555] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.06] transition-colors cursor-default"
                  {...revealProps}
                >
                  <span className="truncate">{`${String(ch.channelNumber || 1).padStart(3, '0')} | ${ch.shortName || ch.name}`}</span>
                  <span className="px-1.5 py-0.2 text-[9px] bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 rounded-[2px] font-semibold">
                    HD
                  </span>
                </button>
              ))}
              <button
                onClick={() => handleNavClick('/live-tv')}
                className="fluent-reveal-item w-full text-left px-2.5 py-1 text-[11px] text-[#0067c0] dark:text-[#60cdff] hover:underline font-normal cursor-default rounded-[4px]"
                {...revealProps}
              >
                + Xem tất cả kênh
              </button>
            </div>
          )}
        </div>

        {/* Tab Test (Developer Mode) */}
        {settings.developerMode && (
          <button
            id={isMobile ? 'mobile-nav-item-test' : 'nav-item-test'}
            onClick={() => handleNavClick('/test')}
            title="Test"
            className={`fluent-reveal-item w-full h-9 flex items-center gap-2.5 px-3 rounded-[4px] transition-colors cursor-default relative text-left ${
              isActive('/test')
                ? 'bg-black/5 dark:bg-white/10 text-[#111827] dark:text-white font-medium'
                : 'text-[#4b5563] dark:text-[#d1d5db] hover:bg-black/5 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-white'
            }`}
            {...revealProps}
          >
            {isActive('/test') && (
              <span className="w-[3px] h-4 bg-[#0067c0] rounded-full absolute left-1" />
            )}
            <FlaskConical className="w-4 h-4 shrink-0 text-[#0067c0] dark:text-[#60cdff]" />
            <span className="truncate">Test</span>
          </button>
        )}

        {/* 3. News */}
        <button
          id={isMobile ? 'mobile-nav-item-news' : 'nav-item-news'}
          onClick={() => handleNavClick('/news')}
          title="Tin tức"
          className={`fluent-reveal-item w-full h-9 flex items-center gap-2.5 px-3 rounded-[4px] transition-colors cursor-default relative text-left ${
            isActive('/news')
              ? 'bg-black/5 dark:bg-white/10 text-[#111827] dark:text-white font-medium'
              : 'text-[#4b5563] dark:text-[#d1d5db] hover:bg-black/5 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-white'
          }`}
          {...revealProps}
        >
          {isActive('/news') && (
            <span className="w-[3px] h-4 bg-[#0067c0] rounded-full absolute left-1" />
          )}
          <img
            src={NEWS_ICON_SRC}
            alt="News"
            referrerPolicy="no-referrer"
            className={`w-4 h-4 object-contain shrink-0 ${
              isActive('/news') ? 'brightness-0 dark:brightness-0 dark:invert opacity-100' : 'brightness-0 dark:brightness-0 dark:invert opacity-70'
            }`}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="truncate">Tin tức (News)</span>
        </button>

        {/* Divider */}
        <div className="py-1 px-1">
          <hr className="border-black/10 dark:border-white/10" />
        </div>

        {/* 4. Favorites */}
        <div className="w-full">
          <button
            id={isMobile ? 'mobile-nav-item-favorites' : 'nav-item-favorites'}
            onClick={() => handleNavClick('/favorites')}
            title="Yêu thích"
            className={`fluent-reveal-item w-full h-9 flex items-center justify-between px-3 rounded-[4px] transition-colors cursor-default relative text-left ${
              isActive('/favorites')
                ? 'bg-black/5 dark:bg-white/10 text-[#111827] dark:text-white font-medium'
                : 'text-[#4b5563] dark:text-[#d1d5db] hover:bg-black/5 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-white'
            }`}
            {...revealProps}
          >
            {isActive('/favorites') && (
              <span className="w-[3px] h-4 bg-[#0067c0] rounded-full absolute left-1" />
            )}
            <div className="flex items-center gap-2.5 truncate">
              <Heart className="w-4 h-4 shrink-0 text-[#e81123]" />
              <span className="truncate">Yêu thích</span>
            </div>
            <div
              onClick={(e) => {
                e.stopPropagation();
                setIsFavoritesExpanded(!isFavoritesExpanded);
              }}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-[2px]"
            >
              {isFavoritesExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 opacity-70" />
              )}
            </div>
          </button>

          {isFavoritesExpanded && (
            <div className="mt-0.5 ml-4 pl-2.5 border-l border-black/10 dark:border-white/10 space-y-0.5">
              {favoriteChannels.length > 0 ? (
                favoriteChannels.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      handleNavClick(`/live-tv?channel=${ch.slug}`);
                      if (onSelectChannel) onSelectChannel(ch);
                    }}
                    className="fluent-reveal-item w-full h-8 flex items-center justify-between px-2.5 rounded-[4px] text-xs text-[#555555] dark:text-[#a1a1aa] hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/[0.06] transition-colors cursor-default"
                    {...revealProps}
                  >
                    <span className="truncate">{`${String(ch.channelNumber || 1).padStart(3, '0')} | ${ch.shortName || ch.name}`}</span>
                    <span className="px-1.5 py-0.2 text-[9px] bg-[#0067c0]/15 text-[#0067c0] dark:text-[#60cdff] rounded-[2px] font-semibold">
                      Phát
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-2.5 py-1 text-[11px] text-neutral-500 italic">
                  Chưa có kênh yêu thích
                </div>
              )}
            </div>
          )}
        </div>

        {/* 5. Help */}
        <div className="w-full">
          <button
            id={isMobile ? 'mobile-nav-item-help' : 'nav-item-help'}
            onClick={() => setIsHelpExpanded(!isHelpExpanded)}
            title="Trợ giúp"
            className="fluent-reveal-item w-full h-9 flex items-center justify-between px-3 rounded-[4px] text-[#4b5563] dark:text-[#d1d5db] hover:bg-black/5 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-white transition-colors cursor-default text-left"
            {...revealProps}
          >
            <div className="flex items-center gap-2.5 truncate">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="truncate">Trợ giúp</span>
            </div>
            {isHelpExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            )}
          </button>

          {isHelpExpanded && (
            <div className="mt-0.5 ml-4 pl-2.5 border-l border-black/10 dark:border-white/10 space-y-1 text-xs text-[#555555] dark:text-[#a1a1aa] p-2">
              <p>• Phím tắt: ⌘K tìm kiếm, Space tạm dừng</p>
              <p>• Báo lỗi phát sóng trực tiếp qua Discord</p>
            </div>
          )}
        </div>

        {/* 6. Discord */}
        <button
          type="button"
          id={isMobile ? 'mobile-nav-item-discord' : 'nav-item-discord'}
          onClick={() => setIsDiscordModalOpen(true)}
          title="Discord"
          className="fluent-reveal-item w-full h-9 flex items-center gap-2.5 px-3 rounded-[4px] text-[#4b5563] dark:text-[#d1d5db] hover:bg-black/5 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-white transition-colors cursor-default text-left"
          {...revealProps}
        >
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.078.078 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          <span className="truncate">Cộng đồng Discord</span>
        </button>

        {/* 7. Settings */}
        <button
          id={isMobile ? 'mobile-nav-item-settings' : 'nav-item-settings'}
          onClick={handleSettingsNavClick}
          title="Cài đặt"
          className={`fluent-reveal-item w-full h-9 flex items-center gap-2.5 px-3 rounded-[4px] transition-colors cursor-default relative text-left ${
            isActive('/settings')
              ? 'bg-black/5 dark:bg-white/10 text-[#111827] dark:text-white font-medium'
              : 'text-[#4b5563] dark:text-[#d1d5db] hover:bg-black/5 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-white'
          }`}
          {...revealProps}
        >
          {isActive('/settings') && (
            <span className="w-[3px] h-4 bg-[#0067c0] rounded-full absolute left-1" />
          )}
          <img 
            src={SETTINGS_ICON_SRC}
            alt="Cài đặt"
            referrerPolicy="no-referrer"
            className={`w-4 h-4 shrink-0 object-contain ${
              isActive('/settings')
                ? 'brightness-0 dark:brightness-0 dark:invert opacity-100'
                : 'brightness-0 dark:brightness-0 dark:invert opacity-70'
            }`}
          />
          <span className="truncate">Cài đặt</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      {settings.dockToSidebar && (
        <aside 
          id="waves-desktop-sidebar"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`hidden md:flex flex-col h-screen bg-[#f3f3f3] dark:bg-[#202020] border-r border-[#e5e5e5] dark:border-[#2e2e2e] select-none shrink-0 fixed top-0 z-40 overflow-hidden ${
            settings.sidebarPosition === 'right' ? 'right-0 border-l border-r-0' : 'left-0'
          } ${
            shouldAnimateSidebar ? 'transition-all duration-200 ease-in-out' : 'transition-none'
          } ${
            effectiveCollapsed ? 'w-[68px]' : 'w-[260px]'
          }`}
        >
          {!effectiveCollapsed ? (
            renderSidebarBody(false)
          ) : (
            <div className="flex flex-col h-full select-none items-center py-3">
              {/* Collapsed Top Header */}
              <button 
                id="btn-sidebar-expand-logo"
                type="button"
                onClick={onToggleCollapse} 
                className="fluent-reveal-item p-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/10 transition-colors mb-2"
                title="Mở rộng menu"
                {...revealProps}
              >
                {!logoError ? (
                  <img 
                    src={LOGO_SRC} 
                    alt="Logo" 
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span className="text-[#0067c0] font-black text-xl">V</span>
                )}
              </button>

              {/* Collapsed Search */}
              <button
                id="btn-spotlight-search-mini"
                onClick={handleSpotlightClick}
                title="Tìm kiếm (⌘K)"
                className="fluent-reveal-item w-9 h-9 rounded-[4px] flex items-center justify-center text-[#555555] dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/10 transition-colors mb-3"
                {...revealProps}
              >
                <img
                  src="https://static.wikia.nocookie.net/ep-deo/images/2/21/Searchhh.png/revision/latest?cb=20260717131751"
                  alt="Search"
                  referrerPolicy="no-referrer"
                  className="w-4 h-4 aspect-square object-contain brightness-0 dark:brightness-0 dark:invert opacity-75"
                />
              </button>

              {/* Collapsed Icons */}
              <div className="flex-1 space-y-1 flex flex-col items-center w-full px-2">
                <button
                  onClick={() => handleNavClick('/')}
                  title="Trang chủ"
                  className={`fluent-reveal-item w-9 h-9 rounded-[4px] flex items-center justify-center transition-colors relative ${
                    isActive('/') && currentRoute === '/' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                  {...revealProps}
                >
                  {isActive('/') && currentRoute === '/' && (
                    <span className="w-[3px] h-4 bg-[#0067c0] rounded-full absolute left-0" />
                  )}
                  <img
                    src={HOME_ICON_SRC}
                    alt="Home"
                    referrerPolicy="no-referrer"
                    className="w-4 h-4 object-contain brightness-0 dark:brightness-0 dark:invert"
                  />
                </button>

                <button
                  onClick={() => handleNavClick('/live-tv')}
                  title="Truyền hình"
                  className={`fluent-reveal-item w-9 h-9 rounded-[4px] flex items-center justify-center transition-colors relative ${
                    isActive('/live-tv') ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                  {...revealProps}
                >
                  {isActive('/live-tv') && (
                    <span className="w-[3px] h-4 bg-[#0067c0] rounded-full absolute left-0" />
                  )}
                  <img
                    src={WATCH_ICON_SRC}
                    alt="Truyền hình"
                    referrerPolicy="no-referrer"
                    className="w-4 h-4 object-contain brightness-0 dark:brightness-0 dark:invert"
                  />
                </button>

                {settings.developerMode && (
                  <button
                    onClick={() => handleNavClick('/test')}
                    title="Test"
                    className={`fluent-reveal-item w-9 h-9 rounded-[4px] flex items-center justify-center transition-colors relative ${
                      isActive('/test') ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                    {...revealProps}
                  >
                    {isActive('/test') && (
                      <span className="w-[3px] h-4 bg-[#0067c0] rounded-full absolute left-0" />
                    )}
                    <FlaskConical className="w-4 h-4 text-[#0067c0] dark:text-[#60cdff]" />
                  </button>
                )}

                <button
                  onClick={() => handleNavClick('/news')}
                  title="Tin tức"
                  className={`fluent-reveal-item w-9 h-9 rounded-[4px] flex items-center justify-center transition-colors relative ${
                    isActive('/news') ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                  {...revealProps}
                >
                  {isActive('/news') && (
                    <span className="w-[3px] h-4 bg-[#0067c0] rounded-full absolute left-0" />
                  )}
                  <img
                    src={NEWS_ICON_SRC}
                    alt="News"
                    referrerPolicy="no-referrer"
                    className="w-4 h-4 object-contain brightness-0 dark:brightness-0 dark:invert"
                  />
                </button>

                <div className="py-1 w-full flex justify-center">
                  <hr className="w-5 border-black/10 dark:border-white/10" />
                </div>

                <button
                  onClick={() => handleNavClick('/favorites')}
                  title="Yêu thích"
                  className={`fluent-reveal-item w-9 h-9 rounded-[4px] flex items-center justify-center transition-colors relative ${
                    isActive('/favorites') ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                  {...revealProps}
                >
                  {isActive('/favorites') && (
                    <span className="w-[3px] h-4 bg-[#0067c0] rounded-full absolute left-0" />
                  )}
                  <Heart className="w-4 h-4 text-[#e81123]" />
                </button>

                <button
                  onClick={() => handleNavClick('/about')}
                  title="Trợ giúp"
                  className="fluent-reveal-item w-9 h-9 rounded-[4px] flex items-center justify-center text-[#555555] dark:text-[#a1a1aa] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  {...revealProps}
                >
                  <BookOpen className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsDiscordModalOpen(true)}
                  title="Discord"
                  className="fluent-reveal-item w-9 h-9 rounded-[4px] flex items-center justify-center text-[#555555] dark:text-[#a1a1aa] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  {...revealProps}
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.078.078 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </button>

                <div className="py-1 w-full flex justify-center">
                  <hr className="w-5 border-black/10 dark:border-white/10" />
                </div>

                <button
                  onClick={handleSettingsNavClick}
                  title="Cài đặt"
                  className={`fluent-reveal-item w-9 h-9 rounded-[4px] flex items-center justify-center transition-colors relative ${
                    isActive('/settings') ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                  {...revealProps}
                >
                  {isActive('/settings') && (
                    <span className="w-[3px] h-4 bg-[#0067c0] rounded-full absolute left-0" />
                  )}
                  <img 
                    src={SETTINGS_ICON_SRC}
                    alt="Cài đặt"
                    referrerPolicy="no-referrer"
                    className="w-4 h-4 object-contain brightness-0 dark:brightness-0 dark:invert"
                  />
                </button>
              </div>
            </div>
          )}
        </aside>
      )}

      {/* 2. Mobile Responsive Drawer Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop: Solid black/50 with zero blur */}
            <motion.div 
              id="waves-mobile-sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldAnimateSidebar ? 0.2 : 0 }}
              className="fixed inset-0 bg-black/50"
              onClick={onCloseMobile}
            />

            {/* Mobile Drawer */}
            <motion.div
              id="waves-mobile-sidebar"
              onTouchStart={handleDrawerTouchStart}
              onTouchEnd={handleDrawerTouchEnd}
              initial={{ x: shouldAnimateSidebar ? '-100%' : 0 }}
              animate={{ x: 0 }}
              exit={{ x: shouldAnimateSidebar ? '-100%' : 0 }}
              transition={{ duration: shouldAnimateSidebar ? 0.24 : 0, ease: 'easeOut' }}
              className="relative w-[270px] max-w-[85vw] h-full bg-[#ffffff] dark:bg-[#202020] border-r border-[#e5e5e5] dark:border-[#2e2e2e] flex flex-col shadow-2xl z-10 overflow-hidden"
            >
              {renderSidebarBody(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <DiscordWelcomeModal
        isOpen={isDiscordModalOpen}
        onClose={() => setIsDiscordModalOpen(false)}
      />
    </>
  );
};
