import React, { useState } from 'react';
import { Menu, Bell, Search, Tv, Megaphone, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../hooks/useSettings';
import { ToolsMenu } from './ToolsMenu';
import { SfCheckmark } from './SfCheckmark';
import { Channel, NewsArticle } from '../types';

const LOGO_SRC = 'https://static.wikia.nocookie.net/ep-deo/images/e/ed/New_Vplay.png/revision/latest?cb=20260906031000';
const TV_ICON_SRC = 'https://vtvgo-next-assets.vtvdigital.vn/prod/images/menu/20260905/2026090508/b467d7552a-tv-1.webp';
const SETTINGS_ICON_SRC = 'https://static.wikia.nocookie.net/ftv/images/9/97/Settungs.png/revision/latest?cb=20260411085024&path-prefix=vi';

interface TopBarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  onOpenSearch: () => void;
  onOpenMobileMenu?: () => void;
  currentChannel?: Channel;
  channels?: Channel[];
  onOpenHelp?: () => void;
  onOpenDiscord?: () => void;
  onOpenSummarize?: (article: NewsArticle) => void;
  onOpenTextToSpeech?: (article: NewsArticle) => void;
  onOpenFindWords?: () => void;
  onOpenAddStream?: () => void;
  onImportChannels?: (channels: Channel[]) => void;
  onOpenNotifications?: () => void;
  fontSize?: number;
  onChangeFontSize?: (size: number) => void;
  showUnsavedTooltip?: boolean;
  onDismissUnsavedTooltip?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentRoute,
  navigate,
  onOpenSearch,
  onOpenMobileMenu,
  currentChannel,
  channels = [],
  onOpenHelp = () => {},
  onOpenDiscord = () => {},
  onOpenSummarize = () => {},
  onOpenTextToSpeech = () => {},
  onOpenFindWords = () => {},
  onOpenAddStream = () => {},
  onImportChannels = () => {},
  onOpenNotifications = () => {},
  fontSize = 16,
  onChangeFontSize = () => {},
  showUnsavedTooltip = false,
  onDismissUnsavedTooltip = () => {}
}) => {
  const { settings, hasChanges, applyDraftSettings } = useSettings();
  const [logoError, setLogoError] = useState(false);
  const [settingsSpinCount, setSettingsSpinCount] = useState(0);
  const [isSettingsSpinning, setIsSettingsSpinning] = useState(false);
  const isTopBarMode = settings.navigationMode === 'topbar';

  const handleSettingsClick = () => {
    setSettingsSpinCount((prev) => prev + 1);
    setIsSettingsSpinning(true);
    navigate('/settings');
  };

  const handleApplySettings = () => {
    applyDraftSettings();
    onDismissUnsavedTooltip();
  };

  return (
    <header className="w-full h-16 relative bg-transparent border-0 px-3 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 pointer-events-none">
      {/* Progressive Blur Layer over the top header bar spanning entire top width */}
      <div 
        id="topbar-progressive-blur" 
        className="topbar-progressive-blur" 
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

      {/* TOP BAR MODE: Brand Logo & Navigation Links (Truyền hình, News) */}
      {isTopBarMode ? (
        <div className="flex items-center gap-2 sm:gap-4 pointer-events-auto shrink-0 relative z-10">
          {/* Logo web - không có viền, không có text, logo chuẩn như ở sidebar */}
          <button
            id="btn-topbar-brand"
            type="button"
            onClick={() => navigate('/')}
            className="cursor-pointer flex items-center justify-center p-0 border-0 bg-transparent hover:opacity-85 active:scale-95 transition-opacity shrink-0 select-none outline-none focus:outline-none"
            title="Trang chủ (Vplay)"
          >
            {!logoError ? (
              <img 
                src={LOGO_SRC}
                alt="Vplay Logo" 
                referrerPolicy="no-referrer"
                className="h-8 max-w-[125px] w-auto object-contain shrink-0 drop-shadow-sm"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-white dark:text-white light:text-[#111827] font-black text-2xl tracking-tighter">V</span>
            )}
          </button>

          {/* Navigation links: Truyền hình, News có icon như ở sidebar */}
          <nav className="flex items-center gap-1 sm:gap-2 ml-1 sm:ml-2" aria-label="Thanh điều hướng chính">
            {/* Truyền hình */}
            <button
              id="btn-topbar-nav-tv"
              type="button"
              onClick={() => navigate('/live-tv')}
              className={`group relative flex items-center gap-2 px-4 h-10 rounded-full text-xs sm:text-[13.5px] font-medium transition-colors cursor-pointer whitespace-nowrap outline-none select-none hover:bg-white/10 ${
                currentRoute === '/live-tv' || currentRoute === '/channels'
                  ? 'text-white font-semibold'
                  : 'text-[#D1D5DB] hover:text-white'
              }`}
              title="Truyền hình trực tiếp"
            >
              <img
                src={TV_ICON_SRC}
                alt="Truyền hình"
                referrerPolicy="no-referrer"
                className={`w-5 h-5 object-contain shrink-0 transition-opacity ${
                  currentRoute === '/live-tv' || currentRoute === '/channels'
                    ? 'brightness-0 invert opacity-100'
                    : 'opacity-80 group-hover:opacity-100'
                }`}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span>Truyền hình</span>

              {/* Line trắng pill ở chân tab khi select (đặt gần lại sát chân chữ) */}
              {(currentRoute === '/live-tv' || currentRoute === '/channels') && (
                <motion.span
                  layoutId="topbar-nav-pill-line"
                  className="absolute bottom-1 left-4 right-4 h-[2px] bg-white rounded-full shadow-[0_1px_3px_rgba(255,255,255,0.4)] pointer-events-none"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>

            {/* News */}
            <button
              id="btn-topbar-nav-news"
              type="button"
              onClick={() => navigate('/news')}
              className={`group relative flex items-center gap-2 px-4 h-10 rounded-full text-xs sm:text-[13.5px] font-medium transition-colors cursor-pointer whitespace-nowrap outline-none select-none hover:bg-white/10 ${
                currentRoute === '/news' || currentRoute.startsWith('/article')
                  ? 'text-white font-semibold'
                  : 'text-[#D1D5DB] hover:text-white'
              }`}
              title="Tin tức (News)"
            >
              <Megaphone
                className={`w-4.5 h-4.5 shrink-0 transition-opacity ${
                  currentRoute === '/news' || currentRoute.startsWith('/article')
                    ? 'text-white opacity-100'
                    : 'opacity-80 group-hover:opacity-100'
                }`}
              />
              <span>News</span>

              {/* Line trắng pill ở chân tab khi select (đặt gần lại sát chân chữ) */}
              {(currentRoute === '/news' || currentRoute.startsWith('/article')) && (
                <motion.span
                  layoutId="topbar-nav-pill-line"
                  className="absolute bottom-1 left-4 right-4 h-[2px] bg-white rounded-full shadow-[0_1px_3px_rgba(255,255,255,0.4)] pointer-events-none"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          </nav>
        </div>
      ) : (
        /* STANDARD MODE Left Side (Mobile Only Logo & Hamburger) */
        <>
          <div className="flex items-center gap-2.5 md:hidden pointer-events-auto relative z-10">
            <button
              id="btn-mobile-menu-toggle"
              onClick={onOpenMobileMenu}
              className="w-9 h-9 flex items-center justify-center text-[#18181B] dark:text-white bg-transparent border-0 shadow-none hover:bg-transparent transition-opacity hover:opacity-80 active:opacity-60 cursor-pointer p-0"
              aria-label="Mở menu điều hướng"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo web mobile - không có viền, không có text, logo như ở sidebar */}
            <button 
              id="btn-mobile-brand-logo"
              type="button"
              onClick={() => navigate('/')}
              className="cursor-pointer flex items-center justify-center p-0 border-0 bg-transparent hover:opacity-85 active:scale-95 transition-opacity shrink-0 outline-none"
              title="Trang chủ (Vplay)"
            >
              {!logoError ? (
                <img 
                  src={LOGO_SRC}
                  alt="Vplay Logo" 
                  referrerPolicy="no-referrer"
                  className="h-7.5 max-w-[120px] w-auto object-contain shrink-0 drop-shadow-sm"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="text-[#E6005A] font-black text-lg">V</span>
              )}
            </button>
          </div>

          {/* Empty placeholder on desktop left */}
          <div className="hidden md:flex items-center gap-3 relative z-10" />
        </>
      )}

      {/* Right Action Icons: Search, Tools Menu, Settings Gear */}
      <div className="flex items-center gap-1.5 sm:gap-3 pointer-events-auto ml-auto shrink-0 relative z-10">
        {/* Quick Spotlight Search trigger */}
        <button
          id="btn-top-search"
          onClick={onOpenSearch}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#D1D5DB] hover:text-white hover:bg-white/10 transition-all drop-shadow-sm cursor-pointer"
          title="Spotlight Search (⌘K)"
        >
          <Search className="w-5.5 h-5.5 object-contain topbar-search-icon" strokeWidth={1.6} />
        </button>

        {/* Tools Menu Icon (Contextual hover dropdown for each tab) */}
        <ToolsMenu
          currentRoute={currentRoute}
          currentChannel={currentChannel}
          channels={channels}
          onNavigate={navigate}
          onOpenHelp={onOpenHelp}
          onOpenDiscord={onOpenDiscord}
          onOpenSummarize={onOpenSummarize}
          onOpenTextToSpeech={onOpenTextToSpeech}
          onOpenFindWords={onOpenFindWords}
          onOpenAddStream={onOpenAddStream}
          onImportChannels={onImportChannels}
          fontSize={fontSize}
          onChangeFontSize={onChangeFontSize}
        />

        {/* TopBar Mode: Settings Gear Icon */}
        {isTopBarMode && (
          <button
            id="btn-top-settings-gear"
            onClick={handleSettingsClick}
            className={`group w-10 h-10 rounded-full flex items-center justify-center transition-colors drop-shadow-sm cursor-pointer ${
              currentRoute === '/settings'
                ? 'bg-white/15'
                : 'hover:bg-white/10'
            }`}
            title="Cài đặt hệ thống"
          >
            <img 
              key={settingsSpinCount}
              src={SETTINGS_ICON_SRC}
              alt="Cài đặt"
              referrerPolicy="no-referrer"
              onAnimationEnd={() => setIsSettingsSpinning(false)}
              className={`w-6 h-6 object-contain shrink-0 brightness-0 invert transition-opacity duration-200 settings-icon-hoverable ${
                currentRoute === '/settings' ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
              } ${isSettingsSpinning ? 'settings-icon-spin' : ''}`}
            />
          </button>
        )}

        {/* Standard Notifications button (when not in TopBar mode) */}
        {!isTopBarMode && (
          <button
            id="btn-top-notifications"
            onClick={onOpenNotifications}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#18181B] dark:text-[#D1D5DB] dark:hover:text-white transition-all relative drop-shadow-sm cursor-pointer"
            title="Thông báo cộng đồng"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E6005A]" />
          </button>
        )}

        {/* In Settings tab: Apply Settings Checkbox button */}
        {currentRoute === '/settings' ? (
          <div className="relative flex items-center justify-center ml-0.5">
            <button
              id="btn-top-settings-apply-checkbox"
              type="button"
              onClick={handleApplySettings}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer select-none transition-all text-white bg-[#E6005A] ${
                hasChanges 
                  ? 'ring-2 ring-[#E6005A] ring-offset-2 ring-offset-[#141416] animate-pulse shadow-[0_0_14px_rgba(230,0,90,0.7)]' 
                  : 'shadow-[0_2px_10px_rgba(230,0,90,0.35)] hover:scale-105 active:scale-95'
              } ${showUnsavedTooltip ? 'animate-shake' : ''}`}
              data-checked="true"
              title={
                hasChanges
                  ? "Có thay đổi cài đặt chưa áp dụng. Bấm vào đây để áp dụng!"
                  : "Tất cả cài đặt đã được áp dụng"
              }
              aria-label={hasChanges ? "Áp dụng cài đặt" : "Cài đặt đã áp dụng"}
            >
              <SfCheckmark className="w-[24px] h-[24px] text-white" strokeWidth={2.7} color="#FFFFFF" />
            </button>

            {/* Unsaved Settings Warning Tooltip */}
            <AnimatePresence>
              {showUnsavedTooltip && (
                <motion.div
                  id="settings-unsaved-tooltip"
                  initial={{ opacity: 0, y: -6, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.94 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-full mt-2.5 right-0 z-50 flex flex-col items-end pointer-events-auto"
                >
                  <div className="settings-unsaved-tooltip-arrow w-2.5 h-2.5 rotate-45 bg-[#1C1C1E] border-t border-l border-white/20 translate-y-[5px] mr-3 z-10" />
                  <div className="settings-unsaved-tooltip-card px-3.5 py-2 rounded-2xl bg-[#1C1C1E]/95 border border-white/20 text-white shadow-2xl backdrop-blur-xl flex items-center gap-2 whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-[#E6005A] shadow-[0_0_8px_rgba(230,0,90,0.9)] shrink-0 animate-ping" />
                    <span className="text-[12.5px] font-medium tracking-wide">
                      Vui lòng lưu thay đổi cài đặt trước khi rời
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : null}
      </div>
    </header>
  );
};
