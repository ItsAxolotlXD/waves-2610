import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../hooks/useSettings';
import { ToolsMenu } from './ToolsMenu';
import { Channel, NewsArticle } from '../types';

const LOGO_SRC = 'https://static.wikia.nocookie.net/ep-deo/images/4/4b/Vplay_no_wordmark.png/revision/latest/scale-to-width-down/1000?cb=20260829062616';
const HOME_ICON_SRC = 'https://static.wikia.nocookie.net/ep-deo/images/e/ee/Icons8-home-64.png/revision/latest?cb=20260925115253';
const TV_ICON_SRC = 'https://static.wikia.nocookie.net/ep-deo/images/d/df/Cool_tv.png/revision/latest?cb=20260927105318';
const NEWS_ICON_SRC = 'https://static.wikia.nocookie.net/ep-deo/images/f/f2/Icons8-megaphone-64.png/revision/latest?cb=20260925115252';
const SETTINGS_ICON_SRC = 'https://static.wikia.nocookie.net/ftv/images/9/97/Settungs.png/revision/latest?cb=20260411085024&path-prefix=vi';
const SF_SEARCH_ICON_URL = '/icons/sf-magnifyingglass.png';

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
  fontSize = 16,
  onChangeFontSize = () => {},
  showUnsavedTooltip = false,
  onDismissUnsavedTooltip = () => {}
}) => {
  const { settings, hasChanges, applyDraftSettings } = useSettings();
  const [logoError, setLogoError] = useState(false);

  const isTopBarMode = settings.navigationMode === 'topbar';

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleApplySettings = () => {
    applyDraftSettings();
    onDismissUnsavedTooltip();
  };

  return (
    <header className="w-full h-14 relative bg-[#f3f3f3] dark:bg-[#202020] border-b border-[#e5e5e5] dark:border-[#2e2e2e] px-3 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* TOP BAR MODE: Brand Logo & Navigation Links (Truyền hình, News) */}
      {isTopBarMode ? (
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 relative z-10">
          {/* Logo web - chuẩn WinUI */}
          <button
            id="btn-topbar-brand"
            type="button"
            onClick={() => navigate('/')}
            className="cursor-default flex items-center justify-center p-0 border-0 bg-transparent hover:opacity-85 active:scale-95 transition-opacity shrink-0 select-none outline-none focus:outline-none"
            title="Trang chủ (VNRT Online)"
          >
            {!logoError ? (
              <img 
                src={LOGO_SRC}
                alt="VNRT Online Logo" 
                referrerPolicy="no-referrer"
                className="h-7.5 max-w-[125px] w-auto object-contain shrink-0 drop-shadow-sm"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-[#0067c0] font-black text-2xl tracking-tighter">V</span>
            )}
          </button>

          {/* Navigation links */}
          <nav className="flex items-center gap-1 ml-1 sm:ml-2" aria-label="Thanh điều hướng chính">
            {/* Home (Trang chủ) */}
            <button
              id="btn-topbar-nav-home"
              type="button"
              onClick={() => navigate('/')}
              className={`group relative flex items-center gap-2 px-3 h-8.5 rounded-[4px] text-xs sm:text-[13px] font-normal transition-colors cursor-default whitespace-nowrap outline-none select-none ${
                currentRoute === '/' || currentRoute === '/home'
                  ? 'bg-black/5 dark:bg-white/10 text-[#111827] dark:text-white font-medium'
                  : 'text-[#4b5563] dark:text-[#d1d5db] hover:bg-black/5 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-white'
              }`}
              title="Trang chủ"
            >
              <img
                src={HOME_ICON_SRC}
                alt="Home"
                referrerPolicy="no-referrer"
                className={`w-4 h-4 object-contain shrink-0 transition-opacity ${
                  currentRoute === '/' || currentRoute === '/home'
                    ? 'brightness-0 dark:brightness-0 dark:invert opacity-100'
                    : 'brightness-0 dark:brightness-0 dark:invert opacity-70 group-hover:opacity-100'
                }`}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span>Trang chủ</span>

              {(currentRoute === '/' || currentRoute === '/home') && (
                <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#0067c0] rounded-t-full pointer-events-none" />
              )}
            </button>

            {/* Truyền hình */}
            <button
              id="btn-topbar-nav-tv"
              type="button"
              onClick={() => navigate('/live-tv')}
              className={`group relative flex items-center gap-2 px-3 h-8.5 rounded-[4px] text-xs sm:text-[13px] font-normal transition-colors cursor-default whitespace-nowrap outline-none select-none ${
                currentRoute === '/live-tv' || currentRoute === '/channels'
                  ? 'bg-black/5 dark:bg-white/10 text-[#111827] dark:text-white font-medium'
                  : 'text-[#4b5563] dark:text-[#d1d5db] hover:bg-black/5 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-white'
              }`}
              title="Truyền hình trực tiếp"
            >
              <img
                src={TV_ICON_SRC}
                alt="Truyền hình"
                referrerPolicy="no-referrer"
                className={`w-4 h-4 object-contain shrink-0 transition-opacity ${
                  currentRoute === '/live-tv' || currentRoute === '/channels'
                    ? 'brightness-0 dark:brightness-0 dark:invert opacity-100'
                    : 'brightness-0 dark:brightness-0 dark:invert opacity-70 group-hover:opacity-100'
                }`}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span>Truyền hình</span>

              {(currentRoute === '/live-tv' || currentRoute === '/channels') && (
                <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#0067c0] rounded-t-full pointer-events-none" />
              )}
            </button>

            {/* News */}
            <button
              id="btn-topbar-nav-news"
              type="button"
              onClick={() => navigate('/news')}
              className={`group relative flex items-center gap-2 px-3 h-8.5 rounded-[4px] text-xs sm:text-[13px] font-normal transition-colors cursor-default whitespace-nowrap outline-none select-none ${
                currentRoute === '/news' || currentRoute.startsWith('/article')
                  ? 'bg-black/5 dark:bg-white/10 text-[#111827] dark:text-white font-medium'
                  : 'text-[#4b5563] dark:text-[#d1d5db] hover:bg-black/5 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-white'
              }`}
              title="Tin tức (News)"
            >
              <img
                src={NEWS_ICON_SRC}
                alt="News"
                referrerPolicy="no-referrer"
                className={`w-4 h-4 object-contain shrink-0 transition-opacity ${
                  currentRoute === '/news' || currentRoute.startsWith('/article')
                    ? 'brightness-0 dark:brightness-0 dark:invert opacity-100'
                    : 'brightness-0 dark:brightness-0 dark:invert opacity-70 group-hover:opacity-100'
                }`}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span>News</span>

              {(currentRoute === '/news' || currentRoute.startsWith('/article')) && (
                <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#0067c0] rounded-t-full pointer-events-none" />
              )}
            </button>
          </nav>
        </div>
      ) : (
        /* STANDARD MODE Left Side (Mobile Only Logo & Hamburger) */
        <>
          <div className="flex items-center gap-2 md:hidden relative z-10">
            {settings.navigationMode !== 'floaty' && (
              <button
                id="btn-mobile-menu-toggle"
                onClick={onOpenMobileMenu}
                className="w-8 h-8 rounded-md flex items-center justify-center text-[#18181B] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-default"
                aria-label="Mở menu điều hướng"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <button 
              id="btn-mobile-brand-logo"
              type="button"
              onClick={() => navigate('/')}
              className="cursor-default flex items-center justify-center p-0 border-0 bg-transparent hover:opacity-85 active:scale-95 transition-opacity shrink-0 outline-none"
              title="Trang chủ (VNRT Online)"
            >
              {!logoError ? (
                <img 
                  src={LOGO_SRC} 
                  alt="VNRT Online Logo" 
                  referrerPolicy="no-referrer"
                  className="h-7 max-w-[120px] w-auto object-contain shrink-0"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="text-[#0067c0] font-black text-lg">V</span>
              )}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3 relative z-10" />
        </>
      )}

      {/* Right Action Icons: Search, Tools Menu, Settings Gear */}
      <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0 relative z-10">
        {/* Quick Spotlight Search trigger */}
        <button
          id="btn-top-search"
          onClick={onOpenSearch}
          className="h-8.5 px-2.5 rounded-[4px] flex items-center gap-2 text-xs text-[#555555] dark:text-[#cccccc] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-default"
          title="Spotlight Search (⌘K)"
        >
          <img
            src={SF_SEARCH_ICON_URL}
            alt="Search"
            className="w-4 h-4 object-contain brightness-0 dark:brightness-0 dark:invert opacity-75"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/icons/sf-magnifyingglass.png';
            }}
          />
          <span className="hidden sm:inline text-xs font-normal text-[#666666] dark:text-[#999999]">Tìm kiếm</span>
        </button>

        {/* Tools Menu Icon */}
        <ToolsMenu
          currentRoute={currentRoute}
          currentChannel={currentChannel}
          channels={channels}
          isLightMode={settings.theme === 'light'}
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
            className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors cursor-default ${
              currentRoute === '/settings'
                ? 'bg-black/10 dark:bg-white/15'
                : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            title="Cài đặt hệ thống"
          >
            <img 
              src={SETTINGS_ICON_SRC}
              alt="Cài đặt"
              referrerPolicy="no-referrer"
              className={`w-5 h-5 object-contain shrink-0 brightness-0 dark:brightness-0 dark:invert transition-opacity duration-200 ${
                currentRoute === '/settings' ? 'opacity-100' : 'opacity-75 hover:opacity-100'
              }`}
            />
          </button>
        )}

        {/* In Settings tab: Fluent Save Button */}
        {currentRoute === '/settings' ? (
          <div className="relative flex items-center justify-center ml-1">
            <button
              id="btn-top-settings-apply-checkbox"
              type="button"
              onClick={handleApplySettings}
              className={`px-4 py-1.5 rounded-[4px] font-medium text-white bg-[#0067c0] hover:bg-[#1875c7] active:bg-[#005fb8] transition-colors text-xs sm:text-[13px] cursor-default flex items-center justify-center shrink-0 border-b-2 border-[#005299] shadow-xs select-none ${
                hasChanges 
                  ? 'ring-2 ring-[#0067c0]/50' 
                  : ''
              } ${showUnsavedTooltip ? 'animate-shake' : ''}`}
              title={
                hasChanges
                  ? "Có thay đổi cài đặt chưa lưu. Bấm vào đây để lưu!"
                  : "Tất cả cài đặt đã được lưu"
              }
              aria-label={hasChanges ? "Lưu cài đặt" : "Cài đặt đã lưu"}
            >
              <span>Lưu cài đặt</span>
            </button>

            {/* Unsaved Settings Warning Tooltip */}
            <AnimatePresence>
              {showUnsavedTooltip && (
                <motion.div
                  id="settings-unsaved-tooltip"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -2 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 right-0 z-50 flex flex-col items-end pointer-events-auto"
                >
                  <div className="px-3 py-1.5 rounded-[4px] bg-[#2c2c2c] border border-[#3e3e3e] text-white shadow-xl flex items-center gap-2 whitespace-nowrap text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#0067c0] shrink-0" />
                    <span>Vui lòng lưu thay đổi cài đặt trước khi rời</span>
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
