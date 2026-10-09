import React, { useState, useRef, useMemo } from 'react';
import { 
  Home,
  Search,
  Tv,
  LayoutGrid,
  Megaphone,
  Heart,
  Palette,
  Sliders,
  BookOpen,
  FlaskConical,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  Monitor,
  Paintbrush,
  Type,
  RectangleHorizontal
} from 'lucide-react';
import { useClock } from '../hooks/useClock';
import { useFavorites } from '../hooks/useFavorites';
import { useSettings } from '../hooks/useSettings';
import { useRevealEffect } from '../hooks/useRevealEffect';
import { CHANNELS_DATA } from '../data/channels';
import { Channel } from '../types';
import { DiscordWelcomeModal } from './DiscordWelcomeModal';

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

  const [searchQuery, setSearchQuery] = useState('');
  const [isLiveTvExpanded, setIsLiveTvExpanded] = useState(false);
  const [isFavoritesExpanded, setIsFavoritesExpanded] = useState(false);
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Touch swipe to close mobile drawer
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

  const favoriteChannels = useMemo(() => {
    return CHANNELS_DATA.filter((ch) => favoriteChannelIds.includes(ch.id));
  }, [favoriteChannelIds]);

  const shouldAnimateSidebar = !settings.reduceAllMotion && settings.animateSidebar;
  const effectiveCollapsed = settings.autoHideSidebar ? !isHovered : isCollapsed;

  const handleNavClick = (route: string, state?: any) => {
    navigate(route, state);
    if (onCloseMobile) onCloseMobile();
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/channels?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      onOpenSearch();
    }
    if (onCloseMobile) onCloseMobile();
  };

  const isSettingsActive = currentRoute.startsWith('/settings');

  // Navigation Items matching the Windows 10 Settings Style
  const navItems = useMemo(() => {
    const list = [
      {
        id: 'live-tv',
        label: 'Truyền hình',
        secondary: 'Taskbar / Live TV',
        route: '/live-tv',
        icon: Tv,
        hasSubmenu: true,
      },
      {
        id: 'channels',
        label: 'Kênh phát sóng',
        secondary: 'Channels',
        route: '/channels',
        icon: LayoutGrid,
      },
      {
        id: 'news',
        label: 'Tin tức',
        secondary: 'News',
        route: '/news',
        icon: Megaphone,
      },
      {
        id: 'favorites',
        label: 'Yêu thích',
        secondary: 'Favorites',
        route: '/favorites',
        icon: Heart,
        hasFavoritesSubmenu: true,
      },
      {
        id: 'personalization',
        label: 'Cá nhân hóa',
        secondary: 'Personalization',
        route: '/settings?tab=spatial-glass',
        icon: Palette,
      },
      {
        id: 'settings',
        label: 'Cài đặt hệ thống',
        secondary: 'Settings',
        route: '/settings',
        icon: Sliders,
      },
      {
        id: 'help',
        label: 'Trợ giúp',
        secondary: 'Help',
        route: '/about',
        icon: BookOpen,
      },
    ];

    if (settings.developerMode) {
      list.push({
        id: 'test',
        label: 'Thử nghiệm (Test)',
        secondary: 'Developer Mode',
        route: '/test',
        icon: FlaskConical,
      });
    }

    return list;
  }, [settings.developerMode]);

  // When searching, filter navigation items
  const filteredNavItems = useMemo(() => {
    if (!searchQuery.trim()) return navItems;
    const q = searchQuery.toLowerCase();
    return navItems.filter(
      (item) => item.label.toLowerCase().includes(q) || item.secondary.toLowerCase().includes(q)
    );
  }, [navItems, searchQuery]);

  // Settings sub-items when user is in Settings page (matching Windows 10 Personalization list)
  const settingsPersonalizationItems = [
    { id: 'background', label: 'Background', icon: ImageIcon, tabId: 'spatial-glass' },
    { id: 'colors', label: 'Colors', icon: Palette, tabId: 'interface' },
    { id: 'lock-screen', label: 'Lock screen', icon: Monitor, tabId: 'interface' },
    { id: 'themes', label: 'Themes', icon: Paintbrush, tabId: 'spatial-glass' },
    { id: 'fonts', label: 'Fonts', icon: Type, tabId: 'accessibility' },
    { id: 'start', label: 'Start', icon: LayoutGrid, tabId: 'tools' },
    { id: 'taskbar', label: 'Taskbar', icon: RectangleHorizontal, tabId: 'interface' },
  ];

  const isCurrentActive = (route: string) => {
    if (route === '/' && currentRoute === '/') return true;
    if (route !== '/' && currentRoute.startsWith(route)) return true;
    return false;
  };

  // Render Full Windows 10 Settings Style Sidebar Content
  const renderSidebarBody = (isMobile: boolean = false) => (
    <div className="flex flex-col h-full select-none text-[13.5px] font-sans">
      {/* Top Header: "Settings" Title + Hamburger Toggle */}
      <div className="px-4 pt-3.5 pb-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          {/* Hamburger Menu Icon */}
          <button
            type="button"
            id={isMobile ? 'btn-mobile-sidebar-toggle' : 'btn-desktop-sidebar-toggle'}
            onClick={isMobile ? onCloseMobile : onToggleCollapse}
            title={isMobile ? 'Đóng menu' : 'Thu gọn menu'}
            className="fluent-reveal-item w-8 h-8 flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 active:bg-white/15 transition-colors cursor-default"
            {...revealProps}
          >
            {isMobile ? <X className="w-4 h-4 stroke-[1.75]" /> : <Menu className="w-4 h-4 stroke-[1.75]" />}
          </button>

          {/* Section Title: "Settings" in Segoe UI font */}
          <span className="text-white text-[15px] font-semibold tracking-wide">
            {isSettingsActive ? 'Settings' : 'Vplay'}
          </span>
        </div>

        {/* Small Clock Info */}
        <div className="text-right hidden sm:block">
          <span className="text-[11px] font-mono text-neutral-400 font-medium block leading-none">
            {timeString}
          </span>
        </div>
      </div>

      {/* 1. Home Item (Directly below Settings header, exactly like Windows 10 Settings) */}
      <div className="px-0 pt-0.5 shrink-0">
        <button
          type="button"
          id={isMobile ? 'mobile-nav-home' : 'sidebar-nav-home'}
          onClick={() => handleNavClick('/')}
          title="Home"
          className={`fluent-reveal-item sidebar-nav-item w-full h-10 flex items-center gap-3.5 px-4 transition-colors cursor-default relative text-left rounded-none ${
            currentRoute === '/'
              ? 'bg-white/[0.14] text-white font-normal'
              : 'text-[#cccccc] hover:bg-white/[0.06] hover:text-white'
          }`}
          {...revealProps}
        >
          {/* Active Accent Strip on far left edge */}
          {currentRoute === '/' && (
            <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#0078d7]" />
          )}
          <Home className="w-4 h-4 stroke-[1.5] shrink-0 text-white" />
          <span className="truncate text-[13.5px]">Home</span>
        </button>
      </div>

      {/* 2. Windows 10 Style Search Input Box: "Find a setting" with 🔍 on the right */}
      <div className="px-4 py-2.5 shrink-0">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="fluent-reveal-item w-full h-8 bg-black border border-[#3d3d3d] focus-within:border-[#0078d7] flex items-center px-2.5 gap-2 transition-colors rounded-none">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find a setting"
              className="w-full bg-transparent text-[13px] text-white placeholder-[#888888] outline-none border-none py-1 pr-6"
            />
            <button
              type="button"
              onClick={() => {
                if (searchQuery.trim()) {
                  handleSearchSubmit();
                } else {
                  onOpenSearch();
                }
              }}
              title="Tìm kiếm (⌘K)"
              className="absolute right-2 text-[#888888] hover:text-white transition-colors p-1"
            >
              <Search className="w-3.5 h-3.5 stroke-[1.75]" />
            </button>
          </div>
        </form>
      </div>

      {/* 3. Category Heading: "Personalization" (bold white text) */}
      <div className="px-4 pt-2.5 pb-1.5 shrink-0">
        <h2 className="text-white text-[13.5px] font-semibold tracking-normal uppercase text-opacity-95 select-none">
          {isSettingsActive ? 'Personalization' : 'Điều hướng & Nội dung'}
        </h2>
      </div>

      {/* 4. Navigation Menu List */}
      <div className="flex-1 overflow-y-auto pb-4 no-scrollbar space-y-0.5 reveal-group font-normal">
        {/* If user is in Settings page, show the Personalization sub-items from Windows 10 */}
        {isSettingsActive && (
          <div className="space-y-0.5 pb-2 mb-2 border-b border-white/10">
            {settingsPersonalizationItems.map((subItem) => {
              const SubIcon = subItem.icon;
              const isSelected = subItem.id === 'taskbar' || (subItem.id === 'themes' && currentRoute.includes('spatial-glass'));
              return (
                <button
                  key={subItem.id}
                  type="button"
                  onClick={() => {
                    handleNavClick(`/settings?tab=${subItem.tabId}`);
                  }}
                  className={`fluent-reveal-item sidebar-nav-item w-full h-10 flex items-center gap-3.5 px-4 transition-colors cursor-default relative text-left rounded-none ${
                    isSelected
                      ? 'bg-white/[0.14] text-white'
                      : 'text-[#cccccc] hover:bg-white/[0.06] hover:text-white'
                  }`}
                  {...revealProps}
                >
                  {isSelected && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#0078d7]" />
                  )}
                  <SubIcon className="w-4 h-4 stroke-[1.5] shrink-0 text-white" />
                  <span className="truncate text-[13.5px]">{subItem.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Primary Navigation Items */}
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const active = isCurrentActive(item.route) && (item.route !== '/' || currentRoute === '/');

          return (
            <div key={item.id} className="w-full">
              <button
                type="button"
                id={isMobile ? `mobile-nav-${item.id}` : `sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item.route)}
                title={item.label}
                className={`fluent-reveal-item sidebar-nav-item w-full h-10 flex items-center justify-between px-4 transition-colors cursor-default relative text-left rounded-none ${
                  active
                    ? 'bg-white/[0.14] text-white'
                    : 'text-[#cccccc] hover:bg-white/[0.06] hover:text-white'
                }`}
                {...revealProps}
              >
                {/* Active Accent Strip on the far left edge */}
                {active && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#0078d7]" />
                )}

                <div className="flex items-center gap-3.5 truncate">
                  <Icon className="w-4 h-4 stroke-[1.5] shrink-0 text-white" />
                  <span className="truncate text-[13.5px]">{item.label}</span>
                </div>

                {/* Submenu toggles for Live TV or Favorites */}
                {item.hasSubmenu && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLiveTvExpanded(!isLiveTvExpanded);
                    }}
                    className="p-1 hover:bg-white/10 rounded-[2px] transition-colors"
                  >
                    {isLiveTvExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                    )}
                  </div>
                )}

                {item.hasFavoritesSubmenu && favoriteChannels.length > 0 && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFavoritesExpanded(!isFavoritesExpanded);
                    }}
                    className="p-1 hover:bg-white/10 rounded-[2px] transition-colors"
                  >
                    {isFavoritesExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                    )}
                  </div>
                )}
              </button>

              {/* Live TV Channels Quick Submenu */}
              {item.hasSubmenu && isLiveTvExpanded && (
                <div className="ml-5 pl-3 border-l border-white/10 space-y-0.5 py-1">
                  {CHANNELS_DATA.slice(0, 5).map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => {
                        handleNavClick(`/live-tv?channel=${ch.slug}`);
                        if (onSelectChannel) onSelectChannel(ch);
                      }}
                      className="fluent-reveal-item w-full h-8 flex items-center justify-between px-2.5 rounded-none text-xs text-[#a1a1aa] hover:text-white hover:bg-white/10 transition-colors cursor-default"
                      {...revealProps}
                    >
                      <span className="truncate">{`${String(ch.channelNumber || 1).padStart(3, '0')} | ${ch.shortName || ch.name}`}</span>
                      <span className="px-1.5 py-0.2 text-[9px] bg-white/10 text-neutral-200 rounded-none font-semibold">
                        HD
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleNavClick('/live-tv')}
                    className="fluent-reveal-item w-full text-left px-2.5 py-1 text-[11px] text-[#60cdff] hover:underline font-normal cursor-default rounded-none"
                    {...revealProps}
                  >
                    + Xem tất cả kênh
                  </button>
                </div>
              )}

              {/* Favorites Quick Submenu */}
              {item.hasFavoritesSubmenu && isFavoritesExpanded && (
                <div className="ml-5 pl-3 border-l border-white/10 space-y-0.5 py-1">
                  {favoriteChannels.map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => {
                        handleNavClick(`/live-tv?channel=${ch.slug}`);
                        if (onSelectChannel) onSelectChannel(ch);
                      }}
                      className="fluent-reveal-item w-full h-8 flex items-center justify-between px-2.5 rounded-none text-xs text-[#a1a1aa] hover:text-white hover:bg-white/10 transition-colors cursor-default"
                      {...revealProps}
                    >
                      <span className="truncate">{`${String(ch.channelNumber || 1).padStart(3, '0')} | ${ch.shortName || ch.name}`}</span>
                      <span className="px-1.5 py-0.2 text-[9px] bg-[#0078d7]/20 text-[#60cdff] rounded-none font-semibold">
                        Phát
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Discord Community Button */}
        <button
          type="button"
          id={isMobile ? 'mobile-nav-discord' : 'sidebar-nav-discord'}
          onClick={() => setIsDiscordModalOpen(true)}
          title="Cộng đồng Discord"
          className="fluent-reveal-item sidebar-nav-item w-full h-10 flex items-center gap-3.5 px-4 text-[#cccccc] hover:bg-white/[0.06] hover:text-white transition-colors cursor-default text-left rounded-none"
          {...revealProps}
        >
          <svg className="w-4 h-4 fill-current shrink-0 text-white" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.078.078 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          <span className="truncate text-[13.5px]">Cộng đồng Discord</span>
        </button>
      </div>

      {/* Bottom Footer Note */}
      <div className="px-4 py-3 shrink-0 border-t border-white/10 text-[11px] text-[#888888] flex items-center justify-between">
        <span className="truncate">Windows 10 Fluent Style</span>
        <span className="font-mono text-[10px] text-neutral-500">v26.10</span>
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
          className={`hidden md:flex flex-col h-screen bg-[#1f1f1f] text-white border-r border-[#2d2d2d] select-none shrink-0 fixed top-0 z-40 overflow-hidden shadow-2xl ${
            settings.sidebarPosition === 'right' ? 'right-0 border-l border-r-0' : 'left-0'
          } ${
            shouldAnimateSidebar ? 'transition-all duration-200 ease-in-out' : 'transition-none'
          } ${
            effectiveCollapsed ? 'w-[48px]' : 'w-[260px]'
          }`}
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {!effectiveCollapsed ? (
            renderSidebarBody(false)
          ) : (
            /* Collapsed Windows 10 Sidebar Icon Bar */
            <div className="flex flex-col h-full select-none items-center py-2.5 space-y-1">
              {/* Hamburger Button to Expand */}
              <button 
                id="btn-sidebar-expand-toggle"
                type="button"
                onClick={onToggleCollapse} 
                className="fluent-reveal-item w-10 h-10 rounded-none flex items-center justify-center text-white/90 hover:bg-white/10 hover:text-white transition-colors mb-1.5"
                title="Mở rộng menu"
                {...revealProps}
              >
                <Menu className="w-4 h-4 stroke-[1.75]" />
              </button>

              {/* Home Icon */}
              <button
                type="button"
                onClick={() => handleNavClick('/')}
                title="Home"
                className={`fluent-reveal-item sidebar-nav-item w-12 h-10 rounded-none flex items-center justify-center transition-colors relative ${
                  currentRoute === '/'
                    ? 'bg-white/[0.14] text-white'
                    : 'text-[#cccccc] hover:bg-white/[0.06] hover:text-white'
                }`}
                {...revealProps}
              >
                {currentRoute === '/' && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#0078d7]" />
                )}
                <Home className="w-4 h-4 stroke-[1.5] text-white" />
              </button>

              {/* Search Icon */}
              <button
                type="button"
                onClick={onOpenSearch}
                title="Tìm kiếm"
                className="fluent-reveal-item sidebar-nav-item w-12 h-10 rounded-none flex items-center justify-center text-[#cccccc] hover:bg-white/[0.06] hover:text-white transition-colors"
                {...revealProps}
              >
                <Search className="w-4 h-4 stroke-[1.5] text-white" />
              </button>

              <div className="w-6 h-[1px] bg-white/10 my-1" />

              {/* Primary Navigation Icons */}
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isCurrentActive(item.route) && (item.route !== '/' || currentRoute === '/');

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.route)}
                    title={item.label}
                    className={`fluent-reveal-item sidebar-nav-item w-12 h-10 rounded-none flex items-center justify-center transition-colors relative ${
                      active
                        ? 'bg-white/[0.14] text-white'
                        : 'text-[#cccccc] hover:bg-white/[0.06] hover:text-white'
                    }`}
                    {...revealProps}
                  >
                    {active && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#0078d7]" />
                    )}
                    <Icon className="w-4 h-4 stroke-[1.5] text-white" />
                  </button>
                );
              })}
            </div>
          )}
        </aside>
      )}

      {/* 2. Mobile Drawer Navigation */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-50 md:hidden flex"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div 
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Slide-out Sidebar Drawer */}
          <div 
            onTouchStart={handleDrawerTouchStart}
            onTouchEnd={handleDrawerTouchEnd}
            className="relative w-[280px] max-w-[85vw] h-full bg-[#1f1f1f] text-white border-r border-[#2d2d2d] shadow-2xl flex flex-col z-10"
            style={{
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            {renderSidebarBody(true)}
          </div>
        </div>
      )}

      {/* Discord Welcome Modal */}
      <DiscordWelcomeModal
        isOpen={isDiscordModalOpen}
        onClose={() => setIsDiscordModalOpen(false)}
      />
    </>
  );
};
