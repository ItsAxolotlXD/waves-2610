import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Tv, 
  Megaphone, 
  Heart, 
  Box, 
  BookOpen, 
  Info, 
  Settings, 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft,
  X,
  Radio,
  Palette,
  Film,
  Layers,
  FlaskConical
} from 'lucide-react';
import { useClock } from '../hooks/useClock';
import { useFavorites } from '../hooks/useFavorites';
import { useSettings } from '../hooks/useSettings';
import { CHANNELS_DATA } from '../data/channels';
import { Channel } from '../types';
import { DiscordWelcomeModal } from './DiscordWelcomeModal';

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

    // Swiped left by at least 35px, predominantly horizontal
    if (deltaX < -35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1) {
      onCloseMobile?.();
    }
    drawerTouchStartX.current = null;
    drawerTouchStartY.current = null;
  };

  const favoriteChannels = CHANNELS_DATA.filter((ch) => favoriteChannelIds.includes(ch.id));

  const [settingsSpinCount, setSettingsSpinCount] = useState(0);
  const [isSettingsSpinning, setIsSettingsSpinning] = useState(false);

  const handleSettingsNavClick = () => {
    setSettingsSpinCount((c) => c + 1);
    setIsSettingsSpinning(true);
    handleNavClick('/settings');
  };

  const shouldAnimateSidebar = !settings.reduceAllMotion && settings.animateSidebar;

  // Determine actual collapsed state based on settings
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

  // Shared Sidebar Inner Content (used for both desktop expanded & mobile drawer)
  const renderSidebarBody = (isMobile: boolean = false) => (
    <div className="flex flex-col h-full select-none">
      {/* Top Header: Clock + Monochrome Logo + Close/Collapse Button */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3.5 pl-1.5">
          {/* Brand Logo (Dark mode logo vs Light mode logo) */}
          <div 
            onClick={() => handleNavClick('/')} 
            className="cursor-pointer flex items-center justify-center p-0 hover:opacity-85 transition-opacity"
            title="Vplay"
          >
            {!logoError ? (
              <img 
                src="https://static.wikia.nocookie.net/ep-deo/images/e/ed/New_Vplay.png/revision/latest?cb=20260906031000"
                alt="Vplay Logo" 
                referrerPolicy="no-referrer"
                className="h-8 max-w-[125px] w-auto object-contain shrink-0"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-white dark:text-white light:text-[#111827] font-black text-2xl tracking-tighter">V</span>
            )}
          </div>

          {/* Real-time Clock display */}
          <div className="flex flex-col">
            <div className="text-white text-base font-bold tracking-tight font-mono leading-tight">
              {timeString || '20:16:35'}
            </div>
            <div className="text-[#A1A1AA] text-[11px] font-medium leading-none mt-0.5">
              {dateString || 'Th 5, 27/08/2026'}
            </div>
          </div>
        </div>

        {/* Action Button: Close on Mobile / Collapse on Desktop */}
        {isMobile ? (
          <button 
            id="btn-mobile-sidebar-close"
            onClick={onCloseMobile}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-white transition-all cursor-pointer"
            title="Đóng menu"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        ) : (
          <button 
            id="btn-sidebar-collapse"
            onClick={onToggleCollapse}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-white transition-all cursor-pointer"
            title="Thu gọn menu"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
          </button>
        )}
      </div>

      {/* Spotlight Search Box with generous breathing room */}
      <div className="px-4 pt-2 pb-5 shrink-0">
        <button
          id={isMobile ? 'btn-mobile-spotlight-search' : 'btn-spotlight-search'}
          onClick={handleSpotlightClick}
          className="w-full h-[46px] flex items-center justify-center px-4 rounded-full spotlight-bubble-box spotlight-input-container text-sm text-[#C4C4CC] hover:text-white transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-center gap-2.5 min-w-0">
            <div className="w-[18px] h-[18px] min-w-[18px] min-h-[18px] max-w-[18px] max-h-[18px] flex items-center justify-center shrink-0">
              <img
                src="https://static.wikia.nocookie.net/ep-deo/images/2/21/Searchhh.png/revision/latest?cb=20260717131751"
                alt="Search"
                referrerPolicy="no-referrer"
                className="w-full h-full aspect-square object-contain brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <span className="text-sm text-[#C4C4CC] group-hover:text-white font-medium truncate">Spotlight Search</span>
          </div>
        </button>
      </div>

      {/* Scrollable Navigation Menu (Scrollbar hidden) */}
      <div className="flex-1 overflow-y-auto pb-6 text-sm font-medium sidebar-visible-scroller no-scrollbar px-4 pt-1 space-y-2.5">
        {/* 1. Home */}
        <button
          id={isMobile ? 'mobile-nav-item-home' : 'nav-item-home'}
          onClick={() => handleNavClick('/')}
          title="Home"
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-[14px] transition-all duration-200 cursor-pointer ${
            isActive('/') && currentRoute === '/'
              ? 'bg-[#E6005A] text-white font-bold shadow-md shadow-[#E6005A]/20'
              : 'text-[#D1D5DB] hover:text-white hover:bg-white/10'
          }`}
        >
          <img
            src="https://static.wikia.nocookie.net/ep-deo/images/6/6e/New_hom.png/revision/latest?cb=20260722124341"
            alt="Home"
            referrerPolicy="no-referrer"
            className={`w-5 h-5 object-contain shrink-0 ${
              isActive('/') && currentRoute === '/' ? 'brightness-0 invert' : 'sidebar-nav-home-icon'
            }`}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="truncate">Home</span>
        </button>

        {/* 2. Truyền hình with Accordion */}
        <div className="w-full">
          <button
            id={isMobile ? 'mobile-nav-item-live-tv' : 'nav-item-live-tv'}
            onClick={() => handleNavClick('/live-tv')}
            title="Truyền hình"
            className={`w-full flex items-center justify-between px-4 py-3 rounded-[14px] transition-all cursor-pointer ${
              isActive('/live-tv')
                ? 'bg-[#E6005A] text-white font-bold shadow-md shadow-[#E6005A]/20'
                : 'text-[#D1D5DB] hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3.5 truncate">
              <img
                src="https://vtvgo-next-assets.vtvdigital.vn/prod/images/menu/20260905/2026090508/b467d7552a-tv-1.webp"
                alt="Truyền hình"
                referrerPolicy="no-referrer"
                className={`w-[26px] h-[26px] object-contain shrink-0 ${
                  isActive('/live-tv') ? 'brightness-0 invert' : 'sidebar-nav-tv-icon'
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
              className="p-1 hover:text-white"
            >
              {isLiveTvExpanded ? (
                <ChevronDown className="w-4 h-4 opacity-70" />
              ) : (
                <ChevronRight className="w-4 h-4 opacity-70" />
              )}
            </div>
          </button>

          {/* Expanded Channels list */}
          {isLiveTvExpanded && (
            <div className="mt-2 ml-4 pl-3 border-l border-[#3E3E48] space-y-1">
              {CHANNELS_DATA.slice(0, 5).map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    handleNavClick(`/live-tv?channel=${ch.slug}`);
                    if (onSelectChannel) onSelectChannel(ch);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-[12px] text-xs text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <span className="truncate">{`${String(ch.channelNumber || 1).padStart(3, '0')} | ${ch.shortName || ch.name}`}</span>
                  <span className="px-1.5 py-0.2 text-[9px] bg-[#E6005A]/20 text-[#FF4D8B] border border-[#E6005A]/40 rounded-full font-bold">
                    HD
                  </span>
                </button>
              ))}
              <button
                onClick={() => handleNavClick('/live-tv')}
                className="w-full text-left px-3 py-1.5 text-[11px] text-[#E6005A] hover:underline font-medium cursor-pointer"
              >
                + Xem tất cả kênh
              </button>
            </div>
          )}
        </div>

        {/* Tab Test (khi Developer Mode bật - đặt dưới tab Truyền hình) */}
        {settings.developerMode && (
          <button
            id={isMobile ? 'mobile-nav-item-test' : 'nav-item-test'}
            onClick={() => handleNavClick('/test')}
            title="Test"
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-[14px] transition-all cursor-pointer ${
              isActive('/test')
                ? 'bg-[#E6005A] text-white font-bold shadow-md shadow-[#E6005A]/20'
                : 'text-[#D1D5DB] hover:text-white hover:bg-white/10'
            }`}
          >
            <FlaskConical className="w-5 h-5 shrink-0" />
            <span className="truncate">Test</span>
          </button>
        )}

        {/* 3. News */}
        <button
          id={isMobile ? 'mobile-nav-item-news' : 'nav-item-news'}
          onClick={() => handleNavClick('/news')}
          title="News"
          className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-[14px] transition-all cursor-pointer ${
            isActive('/news')
              ? 'bg-[#E6005A] text-white font-bold shadow-md shadow-[#E6005A]/20'
              : 'text-[#D1D5DB] hover:text-white hover:bg-white/10'
          }`}
        >
          <Megaphone className="w-5 h-5 shrink-0" />
          <span className="truncate">News</span>
        </button>

        {/* Divider */}
        <div className="py-1 w-full">
          <hr className="border-[#34343C]" />
        </div>

        {/* 5. Favorites Accordion */}
        <div className="w-full">
          <button
            id={isMobile ? 'mobile-nav-item-favorites' : 'nav-item-favorites'}
            onClick={() => handleNavClick('/favorites')}
            title="Favorites"
            className={`w-full flex items-center justify-between px-4 py-3 rounded-[14px] transition-all cursor-pointer ${
              isActive('/favorites')
                ? 'bg-[#E6005A] text-white font-bold shadow-md shadow-[#E6005A]/20'
                : 'text-[#D1D5DB] hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3.5 truncate">
              <Heart className="w-5 h-5 shrink-0" />
              <span className="truncate">Favorites</span>
            </div>
            <div
              onClick={(e) => {
                e.stopPropagation();
                setIsFavoritesExpanded(!isFavoritesExpanded);
              }}
              className="p-1 hover:text-white"
            >
              {isFavoritesExpanded ? (
                <ChevronDown className="w-4 h-4 opacity-70" />
              ) : (
                <ChevronRight className="w-4 h-4 opacity-70" />
              )}
            </div>
          </button>

          {isFavoritesExpanded && (
            <div className="mt-2 ml-4 pl-3 border-l border-[#3E3E48] space-y-1">
              {favoriteChannels.length > 0 ? (
                favoriteChannels.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      handleNavClick(`/live-tv?channel=${ch.slug}`);
                      if (onSelectChannel) onSelectChannel(ch);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-[12px] text-xs text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors group cursor-pointer"
                  >
                    <span className="truncate">{`${String(ch.channelNumber || 1).padStart(3, '0')} | ${ch.shortName || ch.name}`}</span>
                    <span className="px-2 py-0.5 text-[9px] bg-[#3E3E48] text-[#E0E0E6] group-hover:bg-[#E6005A] group-hover:text-white rounded-full font-semibold transition-colors">
                      Phát
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-1.5 text-[11px] text-[#8E8E93] italic">
                  Chưa có kênh yêu thích
                </div>
              )}
            </div>
          )}
        </div>

        {/* 6. Help (Book Icon) */}
        <div className="w-full">
          <button
            id={isMobile ? 'mobile-nav-item-help' : 'nav-item-help'}
            onClick={() => setIsHelpExpanded(!isHelpExpanded)}
            title="Help"
            className="w-full flex items-center justify-between px-4 py-3 rounded-[14px] text-[#D1D5DB] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3.5 truncate">
              <BookOpen className="w-5 h-5 shrink-0" />
              <span className="truncate">Help</span>
            </div>
            {isHelpExpanded ? (
              <ChevronDown className="w-4 h-4 opacity-70" />
            ) : (
              <ChevronRight className="w-4 h-4 opacity-70" />
            )}
          </button>

          {isHelpExpanded && (
            <div className="mt-2 ml-4 pl-3 border-l border-[#3E3E48] space-y-1.5 text-xs text-[#A1A1AA] p-2">
              <p>• Phím tắt: ⌘K tìm kiếm, Space tạm dừng</p>
              <p>• Báo lỗi phát sóng trực tiếp qua Discord</p>
            </div>
          )}
        </div>

        {/* 8. Join now */}
        <button
          type="button"
          id={isMobile ? 'mobile-nav-item-discord' : 'nav-item-discord'}
          onClick={() => setIsDiscordModalOpen(true)}
          title="Join now"
          className="w-full flex items-center justify-between px-4 py-3 rounded-[14px] text-[#D1D5DB] hover:text-white hover:bg-white/10 border border-transparent transition-all group cursor-pointer text-left"
        >
          <div className="flex items-center gap-3.5 truncate">
            <svg className="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.078.078 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            <span className="truncate">Join now</span>
          </div>
        </button>

        {/* 10. Settings */}
        <button
          id={isMobile ? 'mobile-nav-item-settings' : 'nav-item-settings'}
          onClick={handleSettingsNavClick}
          title="Cài đặt"
          className={`group w-full flex items-center gap-3.5 px-4 py-3 rounded-[14px] transition-all cursor-pointer ${
            isActive('/settings')
              ? 'bg-[#E6005A] text-white font-bold shadow-md shadow-[#E6005A]/20'
              : 'text-[#D1D5DB] hover:text-white hover:bg-white/10'
          }`}
        >
          <img 
            key={settingsSpinCount}
            src={SETTINGS_ICON_SRC}
            alt="Cài đặt"
            referrerPolicy="no-referrer"
            onAnimationEnd={() => setIsSettingsSpinning(false)}
            className={`w-5 h-5 shrink-0 object-contain brightness-0 invert settings-icon-hoverable ${
              isSettingsSpinning ? 'settings-icon-spin' : ''
            }`}
          />
          <span className="truncate">Cài đặt</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar (Only when dockToSidebar is true or desktop) */}
      {settings.dockToSidebar && (
        <aside 
          id="waves-desktop-sidebar"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`hidden md:flex flex-col h-screen bg-[#180a1c]/30 backdrop-blur-2xl border-r border-white/10 select-none shrink-0 fixed top-0 z-40 overflow-hidden ${
            settings.sidebarPosition === 'right' ? 'right-0 border-l border-r-0' : 'left-0'
          } ${
            shouldAnimateSidebar ? 'transition-all duration-300 ease-in-out' : 'transition-none'
          } ${
            effectiveCollapsed ? 'w-[80px]' : 'w-[290px]'
          }`}
        >
          {!effectiveCollapsed ? (
            renderSidebarBody(false)
          ) : (
            <div className="flex flex-col h-full select-none">
              {/* Collapsed Top Header: Logo + Expand Button */}
              {/* Header: Clickable Logo to Expand Sidebar */}
              <div className="pt-5 pb-3 flex flex-col items-center shrink-0 px-2">
                <button 
                  id="btn-sidebar-expand-logo"
                  type="button"
                  onClick={onToggleCollapse} 
                  className="cursor-pointer flex items-center justify-center p-1 rounded-2xl hover:scale-110 active:scale-95 transition-transform duration-200 outline-none"
                  title="Mở rộng thanh bên"
                >
                  {!logoError ? (
                    <img 
                      src="https://static.wikia.nocookie.net/ep-deo/images/e/ed/New_Vplay.png/revision/latest?cb=20260906031000" 
                      alt="Vplay Logo - Mở rộng menu" 
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 object-contain shrink-0 drop-shadow-sm hover:drop-shadow-[0_0_8px_rgba(230,0,90,0.5)] transition-all"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <span className="text-white dark:text-white light:text-[#111827] font-black text-xl tracking-tighter">V</span>
                  )}
                </button>
              </div>

              {/* Collapsed Spotlight Search Button */}
              <div className="px-3 pt-2 pb-5 flex justify-center shrink-0">
                <button
                  id="btn-spotlight-search-mini"
                  onClick={handleSpotlightClick}
                  title="Spotlight Search (⌘K)"
                  className="w-11 h-11 rounded-full spotlight-bubble-box flex items-center justify-center text-[#A1A1AA] hover:text-white transition-all cursor-pointer shadow-md hover:ring-1 hover:ring-white/40 shrink-0"
                >
                  <div className="w-[18px] h-[18px] min-w-[18px] min-h-[18px] max-w-[18px] max-h-[18px] flex items-center justify-center shrink-0">
                    <img
                      src="https://static.wikia.nocookie.net/ep-deo/images/2/21/Searchhh.png/revision/latest?cb=20260717131751"
                      alt="Search"
                      referrerPolicy="no-referrer"
                      className="w-full h-full aspect-square object-contain brightness-0 invert opacity-80"
                    />
                  </div>
                </button>
              </div>

              {/* Collapsed Scrollable Navigation Menu (Scrollbar hidden) */}
              <div className="flex-1 overflow-y-auto pb-6 text-sm font-medium sidebar-visible-scroller no-scrollbar px-2 pt-1 space-y-2.5 flex flex-col items-center w-full">
                {/* 1. Home */}
                <button
                  onClick={() => handleNavClick('/')}
                  title="Home"
                  className={`w-11 h-11 rounded-[14px] flex items-center justify-center p-0 shrink-0 transition-all cursor-pointer ${
                    isActive('/') && currentRoute === '/' ? 'bg-[#E6005A] text-white font-bold shadow-md shadow-[#E6005A]/20' : 'text-[#D1D5DB] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <img
                    src="https://static.wikia.nocookie.net/ep-deo/images/6/6e/New_hom.png/revision/latest?cb=20260722124341"
                    alt="Home"
                    referrerPolicy="no-referrer"
                    className={`w-5 h-5 object-contain shrink-0 ${
                      isActive('/') && currentRoute === '/' ? 'brightness-0 invert' : 'sidebar-nav-home-icon'
                    }`}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </button>

                {/* 2. Truyền hình */}
                <button
                  onClick={() => handleNavClick('/live-tv')}
                  title="Truyền hình"
                  className={`w-11 h-11 rounded-[14px] flex items-center justify-center p-0 shrink-0 transition-all cursor-pointer ${
                    isActive('/live-tv') ? 'bg-[#E6005A] text-white font-bold shadow-md shadow-[#E6005A]/20' : 'text-[#D1D5DB] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <img
                    src="https://vtvgo-next-assets.vtvdigital.vn/prod/images/menu/20260905/2026090508/b467d7552a-tv-1.webp"
                    alt="Truyền hình"
                    referrerPolicy="no-referrer"
                    className={`w-[26px] h-[26px] object-contain shrink-0 ${
                      isActive('/live-tv') ? 'brightness-0 invert' : 'sidebar-nav-tv-icon'
                    }`}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </button>

                {/* Tab Test (khi Developer Mode bật) */}
                {settings.developerMode && (
                  <button
                    onClick={() => handleNavClick('/test')}
                    title="Test"
                    className={`w-11 h-11 rounded-[14px] flex items-center justify-center p-0 shrink-0 transition-all cursor-pointer ${
                      isActive('/test') ? 'bg-[#E6005A] text-white font-bold shadow-md shadow-[#E6005A]/20' : 'text-[#D1D5DB] hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <FlaskConical className="w-5 h-5 shrink-0" />
                  </button>
                )}

                {/* 3. News */}
                <button
                  onClick={() => handleNavClick('/news')}
                  title="News"
                  className={`w-11 h-11 rounded-[14px] flex items-center justify-center p-0 shrink-0 transition-all cursor-pointer ${
                    isActive('/news') ? 'bg-[#E6005A] text-white font-bold shadow-md shadow-[#E6005A]/20' : 'text-[#D1D5DB] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Megaphone className="w-5 h-5 shrink-0" />
                </button>

                {/* Divider 1 */}
                <div className="py-1 w-full flex justify-center shrink-0">
                  <hr className="w-8 border-[#34343C]" />
                </div>

                {/* 4. Favorites */}
                <button
                  onClick={() => handleNavClick('/favorites')}
                  title="Favorites"
                  className={`w-11 h-11 rounded-[14px] flex items-center justify-center p-0 shrink-0 transition-all cursor-pointer ${
                    isActive('/favorites') ? 'bg-[#E6005A] text-white font-bold shadow-md shadow-[#E6005A]/20' : 'text-[#D1D5DB] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Heart className="w-5 h-5 shrink-0" />
                </button>

                {/* 5. Help */}
                <button
                  onClick={() => handleNavClick('/about')}
                  title="Help"
                  className="w-11 h-11 rounded-[14px] flex items-center justify-center p-0 shrink-0 text-[#D1D5DB] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <BookOpen className="w-5 h-5 shrink-0" />
                </button>

                {/* 7. Discord Community */}
                <button
                  onClick={() => setIsDiscordModalOpen(true)}
                  title="Join now"
                  className="w-11 h-11 rounded-[14px] flex items-center justify-center p-0 shrink-0 text-[#D1D5DB] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <svg className="w-5 h-5 fill-current text-white shrink-0" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.078.078 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </button>

                {/* Divider 2 */}
                <div className="py-1 w-full flex justify-center shrink-0">
                  <hr className="w-8 border-[#34343C]" />
                </div>

                {/* 9. Settings */}
                <button
                  onClick={handleSettingsNavClick}
                  title="Cài đặt"
                  className={`group w-11 h-11 rounded-[14px] flex items-center justify-center p-0 shrink-0 transition-all cursor-pointer ${
                    isActive('/settings') ? 'bg-[#E6005A] text-white font-bold shadow-md shadow-[#E6005A]/20' : 'text-[#D1D5DB] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <img 
                    key={settingsSpinCount}
                    src={SETTINGS_ICON_SRC}
                    alt="Cài đặt"
                    referrerPolicy="no-referrer"
                    onAnimationEnd={() => setIsSettingsSpinning(false)}
                    className={`w-5 h-5 object-contain brightness-0 invert settings-icon-hoverable ${
                      isSettingsSpinning ? 'settings-icon-spin' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </aside>
      )}

      {/* 2. Mobile Responsive Drawer Sidebar with Smooth Slide-in & Identical Layout/Style */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop with smooth ease fade */}
            <motion.div 
              id="waves-mobile-sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldAnimateSidebar ? 0.35 : 0, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={onCloseMobile}
            />

            {/* Mobile Drawer with smooth deceleration ease */}
            <motion.div
              id="waves-mobile-sidebar"
              onTouchStart={handleDrawerTouchStart}
              onTouchEnd={handleDrawerTouchEnd}
              initial={{ x: shouldAnimateSidebar ? '-100%' : 0 }}
              animate={{ x: 0 }}
              exit={{ x: shouldAnimateSidebar ? '-100%' : 0 }}
              transition={{ duration: shouldAnimateSidebar ? 0.38 : 0, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-[290px] sm:w-[320px] max-w-[85vw] h-full bg-[#180a1c]/30 backdrop-blur-2xl border-r border-white/10 flex flex-col shadow-2xl z-10 overflow-hidden"
            >
              {renderSidebarBody(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Discord Welcome Modal Dialog */}
      <DiscordWelcomeModal
        isOpen={isDiscordModalOpen}
        onClose={() => setIsDiscordModalOpen(false)}
      />
    </>
  );
};
