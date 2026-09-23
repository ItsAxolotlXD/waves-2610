import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { BottomDock } from './components/BottomDock';
import { SpotlightModal } from './components/SpotlightModal';
import { CustomStreamModal } from './components/CustomStreamModal';
import { WelcomeModal } from './components/WelcomeModal';
import { UnderConstructionModal } from './components/UnderConstructionModal';
import { HelpModal } from './components/HelpModal';
import { NewsSummaryModal } from './components/NewsSummaryModal';
import { FindWordsBar } from './components/FindWordsBar';
import { AddStreamModal } from './components/AddStreamModal';
import { TextToSpeechPlayer } from './components/TextToSpeechPlayer';
import { FloatingSearchBar } from './components/FloatingSearchBar';
import { NativeKeyboard } from './components/NativeKeyboard';
import { NativeKeyboardProvider } from './context/NativeKeyboardContext';
import { Home } from './pages/Home';
import { LiveTV } from './pages/LiveTV';
import { TestChannels } from './pages/TestChannels';
import { News } from './pages/News';
import { Article } from './pages/Article';
import { Channels } from './pages/Channels';
import { Favorites } from './pages/Favorites';
import { Settings } from './pages/Settings';
import { ImmersiveSearch } from './pages/ImmersiveSearch';
import { CHANNELS_DATA } from './data/channels';
import { NEWS_DATA } from './data/news';
import { Channel, NewsArticle } from './types';
import { useSettings } from './hooks/useSettings';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export default function App() {
  const { settings, draftSettings, hasChanges } = useSettings();

  // Tooltip & navigation block for unsaved settings
  const [showUnsavedTooltip, setShowUnsavedTooltip] = useState(false);
  const unsavedTooltipTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerUnsavedTooltip = useCallback(() => {
    setShowUnsavedTooltip(true);
    if (unsavedTooltipTimerRef.current) clearTimeout(unsavedTooltipTimerRef.current);
    unsavedTooltipTimerRef.current = setTimeout(() => {
      setShowUnsavedTooltip(false);
    }, 4500);
  }, []);

  // When changes are saved or cleared, hide tooltip
  useEffect(() => {
    if (!hasChanges) {
      setShowUnsavedTooltip(false);
    }
  }, [hasChanges]);

  useEffect(() => {
    return () => {
      if (unsavedTooltipTimerRef.current) clearTimeout(unsavedTooltipTimerRef.current);
    };
  }, []);

  // Navigation Route State (supports browser pathname or internal state)
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname === '/' ? '/' : window.location.pathname;
  });
  const [routeState, setRouteState] = useState<any>(null);
  const previousRouteRef = useRef<string>('/');

  // Tab-specific search state for Floating Search Bar
  const [tabSearchQueries, setTabSearchQueries] = useState<Record<string, string>>({});
  const currentTabSearchQuery = tabSearchQueries[currentRoute] || '';
  const handleTabSearchChange = (query: string) => {
    setTabSearchQueries((prev) => ({
      ...prev,
      [currentRoute]: query
    }));
  };

  // Channels State (base channels + imported channels from localStorage)
  const [channels, setChannels] = useState<Channel[]>(() => {
    const saved = localStorage.getItem('waves_custom_channels');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [...CHANNELS_DATA, ...parsed];
      } catch {
        return CHANNELS_DATA;
      }
    }
    return CHANNELS_DATA;
  });

  // Current Active Channel for Live TV Player
  const [currentChannel, setCurrentChannel] = useState<Channel>(() => {
    // Check if URL has ?channel=slug
    const urlParams = new URLSearchParams(window.location.search);
    const channelSlug = urlParams.get('channel');
    if (channelSlug) {
      const matched = CHANNELS_DATA.find((c) => c.slug === channelSlug);
      if (matched) return matched;
    }
    try {
      const savedRecentId = localStorage.getItem('vplay_recent_channel_id');
      if (savedRecentId) {
        const found = CHANNELS_DATA.find((c) => c.id === savedRecentId);
        if (found) return found;
      }
    } catch {}
    return CHANNELS_DATA[0];
  });

  // Track recent channel in localStorage
  useEffect(() => {
    if (currentChannel?.id) {
      try {
        localStorage.setItem('vplay_recent_channel_id', currentChannel.id);
      } catch {}
    }
  }, [currentChannel]);

  // Modals state (Changelogs popup shows on web launch)
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(true);
  const [isUnderConstructionOpen, setIsUnderConstructionOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isCustomStreamModalOpen, setIsCustomStreamModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isNewsSummaryOpen, setIsNewsSummaryOpen] = useState(false);
  const [summarizeArticle, setSummarizeArticle] = useState<NewsArticle>(NEWS_DATA[0]);
  const [isTtsOpen, setIsTtsOpen] = useState(false);
  const [ttsArticle, setTtsArticle] = useState<NewsArticle>(NEWS_DATA[0]);
  const [isFindWordsOpen, setIsFindWordsOpen] = useState(false);
  const [isAddStreamOpen, setIsAddStreamOpen] = useState(false);
  const [articleFontSize, setArticleFontSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('vplay_font_size');
      return saved ? parseInt(saved, 10) : 16;
    } catch {
      return 16;
    }
  });

  const handleFontSizeChange = (size: number) => {
    setArticleFontSize(size);
    try {
      localStorage.setItem('vplay_font_size', String(size));
    } catch {}
  };

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('waves_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('waves_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Edge swipe gesture: vuốt từ cạnh trái sang để mở sidebar
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let isTrackingEdgeSwipe = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      // Swipe originates from within 45px of the left screen edge
      if (touch.clientX <= 45) {
        startX = touch.clientX;
        startY = touch.clientY;
        isTrackingEdgeSwipe = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isTrackingEdgeSwipe) return;
      isTrackingEdgeSwipe = false;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;

      // Swiped right with at least 40px, predominantly horizontal
      if (deltaX > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1) {
        setIsMobileSidebarOpen(true);
        if (isSidebarCollapsed) {
          setIsSidebarCollapsed(false);
          try {
            localStorage.setItem('waves_sidebar_collapsed', 'false');
          } catch {}
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isSidebarCollapsed]);

  // Determine effective sidebar width for page adaptation
  const isEffectiveCollapsed = settings.autoHideSidebar || isSidebarCollapsed;

  // Navigation handler
  const navigate = (path: string, state?: any) => {
    // If currently on settings and there are unsaved changes, block switching to any other tab
    if (currentRoute === '/settings' && hasChanges) {
      const isStillSettings = path === '/settings' || path.startsWith('/settings?') || path.startsWith('/settings#');
      if (!isStillSettings) {
        triggerUnsavedTooltip();
        return;
      }
    }

    if (currentRoute !== '/search') {
      previousRouteRef.current = currentRoute;
    }

    setRouteState(state);
    
    // Parse query params if any
    if (path.includes('?')) {
      const [baseRoute, query] = path.split('?');
      const params = new URLSearchParams(query);
      const chSlug = params.get('channel');
      if (chSlug) {
        const matched = channels.find((c) => c.slug === chSlug);
        if (matched) setCurrentChannel(matched);
      }
      window.history.pushState(null, '', path);
      setCurrentRoute(baseRoute);
    } else {
      window.history.pushState(null, '', path);
      setCurrentRoute(path);
    }

    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open search handler (respects navigation mode and immersive search experiment)
  const handleOpenSearch = useCallback(() => {
    if (settings.navigationMode === 'floaty' || settings.navigationMode === 'immersive_floaty') {
      window.dispatchEvent(new CustomEvent('vplay:open-floaty-search'));
    } else if (settings.immersiveSearch) {
      if (currentRoute !== '/search') {
        previousRouteRef.current = currentRoute;
      }
      navigate('/search');
    } else {
      setIsSpotlightOpen(true);
    }
  }, [settings.navigationMode, settings.immersiveSearch, currentRoute]);

  // Global search shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleGlobalSearchKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleOpenSearch();
      }
    };
    window.addEventListener('keydown', handleGlobalSearchKey);
    return () => window.removeEventListener('keydown', handleGlobalSearchKey);
  }, [handleOpenSearch]);

  // Global Customizable Keybinds (Alt+1: Home, Alt+2: Search, Alt+3: Tools menu, Alt+4: Settings, Alt+5: Recent Channel)
  useKeyboardShortcuts({
    onHome: useCallback(() => {
      navigate('/');
    }, [navigate]),
    onSearch: useCallback(() => {
      handleOpenSearch();
    }, [handleOpenSearch]),
    onTools: useCallback(() => {
      window.dispatchEvent(new CustomEvent('vplay:toggle-tools'));
    }, []),
    onSettings: useCallback(() => {
      navigate('/settings');
    }, [navigate]),
    onRecentChannel: useCallback(() => {
      let targetChannel = currentChannel;
      try {
        const savedId = localStorage.getItem('vplay_recent_channel_id');
        if (savedId) {
          const found = channels.find((c) => c.id === savedId);
          if (found) targetChannel = found;
        }
      } catch {}
      if (targetChannel) {
        setCurrentChannel(targetChannel);
        navigate(`/live-tv?channel=${targetChannel.slug}`);
      }
    }, [currentChannel, channels, navigate])
  });

  // Handle browser back / forward navigation
  useEffect(() => {
    const handlePopState = () => {
      if (currentRoute === '/settings' && hasChanges) {
        window.history.pushState(null, '', '/settings');
        triggerUnsavedTooltip();
        return;
      }
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      const chSlug = params.get('channel');
      if (chSlug) {
        const matched = channels.find((c) => c.slug === chSlug);
        if (matched) setCurrentChannel(matched);
      }
      setCurrentRoute(path);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [channels, currentRoute, hasChanges, triggerUnsavedTooltip]);

  // Handle page reload / unload when settings are unsaved
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentRoute === '/settings' && hasChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentRoute, hasChanges]);

  // Handle playing a custom single channel
  const handlePlayCustomChannel = (newChannel: Channel) => {
    setChannels((prev) => {
      const exists = prev.some((c) => c.id === newChannel.id);
      if (exists) return prev;
      const updated = [newChannel, ...prev];
      return updated;
    });
    setCurrentChannel(newChannel);
    navigate(`/live-tv?channel=${newChannel.slug}`);
  };

  // Handle importing a list of M3U channels
  const handleImportPlaylist = (importedList: Channel[]) => {
    setChannels((prev) => {
      const updated = [...importedList, ...prev];
      try {
        localStorage.setItem('waves_custom_channels', JSON.stringify(importedList));
      } catch {}
      return updated;
    });
    if (importedList.length > 0) {
      setCurrentChannel(importedList[0]);
      navigate(`/live-tv?channel=${importedList[0].slug}`);
    }
  };

  // Render Page Content based on currentRoute
  const renderContent = () => {
    // Route matching for news detail: /news/:slug
    if (currentRoute.startsWith('/news/')) {
      const slug = currentRoute.replace('/news/', '');
      return <Article slug={slug} navigate={navigate} fontSize={articleFontSize} />;
    }

    switch (currentRoute) {
      case '/':
      case '/home':
        return (
          <Home
            navigate={navigate}
            onSelectChannel={setCurrentChannel}
            channels={channels}
            searchQuery={currentTabSearchQuery}
            onSearchChange={handleTabSearchChange}
            onOpenSpotlight={() => setIsSpotlightOpen(true)}
          />
        );

      case '/live-tv':
        return (
          <LiveTV
            currentChannel={currentChannel}
            onSelectChannel={setCurrentChannel}
            channels={channels}
            onOpenCustomStreamModal={() => setIsCustomStreamModalOpen(true)}
            searchQuery={currentTabSearchQuery}
            onSearchChange={handleTabSearchChange}
          />
        );

      case '/test':
        return (
          <TestChannels
            currentChannel={currentChannel}
            onSelectChannel={setCurrentChannel}
            channels={channels}
            onOpenCustomStreamModal={() => setIsCustomStreamModalOpen(true)}
            searchQuery={currentTabSearchQuery}
            onSearchChange={handleTabSearchChange}
          />
        );

      case '/news':
        return (
          <News
            navigate={navigate}
            searchQuery={currentTabSearchQuery}
            onSearchChange={handleTabSearchChange}
          />
        );

      case '/channels':
        return (
          <Channels
            channels={channels}
            onSelectChannel={setCurrentChannel}
            navigate={navigate}
            onOpenCustomStreamModal={() => setIsCustomStreamModalOpen(true)}
            searchQuery={currentTabSearchQuery}
            onSearchChange={handleTabSearchChange}
          />
        );

      case '/favorites':
        return (
          <Favorites
            channels={channels}
            onSelectChannel={setCurrentChannel}
            navigate={navigate}
            searchQuery={currentTabSearchQuery}
            onSearchChange={handleTabSearchChange}
          />
        );

      case '/about':
        return (
          <Home
            navigate={navigate}
            onSelectChannel={setCurrentChannel}
            channels={channels}
            searchQuery={currentTabSearchQuery}
            onSearchChange={handleTabSearchChange}
          />
        );

      case '/settings':
        return (
          <Settings
            searchQuery={currentTabSearchQuery}
            onSearchChange={handleTabSearchChange}
          />
        );

      case '/search':
        return (
          <ImmersiveSearch
            navigate={navigate}
            onSelectChannel={setCurrentChannel}
            onClose={() => {
              const target = previousRouteRef.current && previousRouteRef.current !== '/search' ? previousRouteRef.current : '/';
              navigate(target);
            }}
          />
        );

      default:
        return (
          <Home
            navigate={navigate}
            onSelectChannel={setCurrentChannel}
            channels={channels}
          />
        );
    }
  };

  return (
    <NativeKeyboardProvider>
      <div
        data-immersive-sidebar={settings.immersiveSidebar}
      data-sidebar-position={settings.sidebarPosition}
      className={`min-h-screen ${settings.superDarkMode ? 'bg-black' : 'bg-transparent'} text-[#E0E0E6] flex font-sans selection:bg-[#C83DFF] selection:text-white relative`}
    >
      {/* Fixed atmospheric cosmic background matching custom nebula gradient */}
      <div 
        id="fixed-app-background-solid" 
        className={`fixed inset-0 pointer-events-none -z-50 ${settings.superDarkMode ? '!bg-black' : ''}`} 
        aria-hidden="true" 
      />

      {/* Sidebar Navigation (Desktop + Mobile Drawer) */}
      {settings.navigationMode === 'sidebar' && (
        <Sidebar
          currentRoute={currentRoute}
          navigate={navigate}
          onOpenSearch={handleOpenSearch}
          onSelectChannel={setCurrentChannel}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main App Container */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ${
        settings.navigationMode === 'topbar'
          ? 'md:pl-0 md:pr-0 pb-10'
          : !settings.dockToSidebar || settings.navigationMode !== 'sidebar'
            ? 'md:pl-0 md:pr-0 pb-20'
            : settings.sidebarPosition === 'right'
              ? isEffectiveCollapsed
                ? 'md:pr-[80px]'
                : 'md:pr-[290px]'
              : isEffectiveCollapsed
                ? 'md:pl-[80px]'
                : 'md:pl-[290px]'
      }`}>
        {/* TopBar Header */}
        <TopBar
          currentRoute={currentRoute}
          navigate={navigate}
          onOpenSearch={handleOpenSearch}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          currentChannel={currentChannel}
          channels={channels}
          onOpenHelp={() => setIsHelpModalOpen(true)}
          onOpenDiscord={() => setIsWelcomeModalOpen(true)}
          onOpenSummarize={(art) => {
            setSummarizeArticle(art);
            setIsNewsSummaryOpen(true);
          }}
          onOpenTextToSpeech={(art) => {
            setTtsArticle(art);
            setIsTtsOpen(true);
          }}
          onOpenFindWords={() => {
            const floatInput = document.getElementById('floating-search-input') as HTMLInputElement | null;
            if (floatInput && settings.floatingSearchBar) {
              floatInput.focus();
              floatInput.select?.();
            } else {
              setIsFindWordsOpen(true);
            }
          }}
          onOpenAddStream={() => setIsAddStreamOpen(true)}
          onImportChannels={handleImportPlaylist}
          onOpenNotifications={() => setIsUnderConstructionOpen(true)}
          fontSize={articleFontSize}
          onChangeFontSize={handleFontSizeChange}
          showUnsavedTooltip={showUnsavedTooltip}
          onDismissUnsavedTooltip={() => setShowUnsavedTooltip(false)}
        />

        {/* Dynamic Page Content with smooth slide-up transition */}
        <main className={`flex-1 w-full mx-auto ${
          currentRoute === '/' || currentRoute === '/home' 
            ? 'p-0 max-w-none pt-1 sm:pt-2' 
            : 'px-4 sm:px-6 md:px-8 py-5 max-w-7xl'
        } ${
          ((settings.floatingSearchBar || (currentRoute === '/settings' && draftSettings.floatingSearchBar)) &&
          ((settings.navigationMode === 'topbar' || settings.navigationMode === 'sidebar') || currentRoute === '/settings'))
            ? 'pb-24 sm:pb-28'
            : ''
        }`}>
          {!settings.reduceAllMotion && settings.animatePageTransitions ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentRoute}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div key={currentRoute} className="w-full h-full">
              {renderContent()}
            </div>
          )}
        </main>
      </div>

      {/* Floaty bar navigation (Standard or Immersive) */}
      {(settings.navigationMode === 'floaty' || settings.navigationMode === 'immersive_floaty') && (
        <BottomDock
          currentRoute={currentRoute}
          navigate={navigate}
          onOpenSearch={handleOpenSearch}
          onOpenHelp={() => setIsHelpModalOpen(true)}
          onOpenDiscord={() => setIsWelcomeModalOpen(true)}
          isImmersive={settings.navigationMode === 'immersive_floaty'}
          searchQuery={currentTabSearchQuery}
          onSearchChange={handleTabSearchChange}
          onOpenSpotlight={() => setIsSpotlightOpen(true)}
        />
      )}

      {/* Floating Search Bar (shown when enabled and navigationMode is topbar or sidebar, or when on /settings) */}
      {((settings.floatingSearchBar || (currentRoute === '/settings' && draftSettings.floatingSearchBar)) &&
        ((settings.navigationMode === 'topbar' || settings.navigationMode === 'sidebar') || currentRoute === '/settings') &&
        currentRoute !== '/search') && (
          <FloatingSearchBar
            currentRoute={currentRoute}
            searchQuery={currentTabSearchQuery}
            onSearchChange={handleTabSearchChange}
            onOpenSpotlight={() => setIsSpotlightOpen(true)}
          />
        )}

      {/* Global Modals */}
      <SpotlightModal
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        navigate={navigate}
        onSelectChannel={setCurrentChannel}
      />

      <CustomStreamModal
        isOpen={isCustomStreamModalOpen}
        onClose={() => setIsCustomStreamModalOpen(false)}
        onPlayCustomChannel={handlePlayCustomChannel}
        onImportPlaylist={handleImportPlaylist}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* News Summary Modal */}
      <NewsSummaryModal
        isOpen={isNewsSummaryOpen}
        onClose={() => setIsNewsSummaryOpen(false)}
        article={summarizeArticle}
      />

      {/* Text to Speech Floating Player */}
      <TextToSpeechPlayer
        isOpen={isTtsOpen}
        onClose={() => setIsTtsOpen(false)}
        article={ttsArticle}
      />

      {/* In-Article / News Word Finder */}
      <FindWordsBar
        isOpen={isFindWordsOpen}
        onClose={() => setIsFindWordsOpen(false)}
      />

      {/* Quick Add Stream Modal Dialog (Tên luồng, Địa chỉ luồng) */}
      <AddStreamModal
        isOpen={isAddStreamOpen}
        onClose={() => setIsAddStreamOpen(false)}
        onAddStream={handlePlayCustomChannel}
      />

      {/* Startup / Refresh Welcome Modal */}
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
      />

      {/* Notifications / Under Construction Modal */}
      <UnderConstructionModal
        isOpen={isUnderConstructionOpen}
        onClose={() => setIsUnderConstructionOpen(false)}
      />

      {/* App Native Virtual Keyboard for Touch Devices */}
      <NativeKeyboard />
    </div>
  </NativeKeyboardProvider>
  );
}
