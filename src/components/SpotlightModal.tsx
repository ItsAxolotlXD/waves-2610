import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  X, 
  Tv, 
  Megaphone, 
  Box, 
  Play, 
  Home, 
  Heart, 
  Info, 
  Settings as SettingsIcon,
  ChevronLeft,
  SlidersHorizontal,
  Layers,
  Palette,
  Radio,
  Film,
  Mic,
  MicOff
} from 'lucide-react';
import { CHANNELS_DATA } from '../data/channels';
import { NEWS_DATA } from '../data/news';
import { Channel } from '../types';
import { useSettings } from '../hooks/useSettings';
import { useVoiceSearch } from '../hooks/useVoiceSearch';

interface SpotlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (route: string, state?: any) => void;
  onSelectChannel: (channel: Channel) => void;
}

const CATEGORY_ITEMS = [
  { id: 'cat-home', title: 'Trang chủ (Home)', route: '/', icon: Home, color: '#E6005A' },
  { id: 'cat-livetv', title: 'Truyền hình (Live TV)', route: '/live-tv', icon: Tv, color: '#E6005A' },
  { id: 'cat-news', title: 'Tin tức & Thông báo (News)', route: '/news', icon: Megaphone, color: '#FF4D8B' },
  { id: 'cat-fav', title: 'Kênh yêu thích (Favorites)', route: '/favorites', icon: Heart, color: '#E6005A' },
  { id: 'cat-settings', title: 'Cài đặt hệ thống (Settings)', route: '/settings', icon: SettingsIcon, color: '#E6005A' },
];

const SETTINGS_SHORTCUTS = [
  { id: 'set-font', title: 'Cài đặt: Tỷ lệ cỡ chữ ứng dụng', keyword: 'cỡ chữ font chữ zoom tỷ lệ' },
  { id: 'set-autohide', title: 'Cài đặt: Tự động ẩn Sidebar', keyword: 'tự động ẩn sidebar collapse' },
  { id: 'set-motion', title: 'Cài đặt: Motion and Movements / Hiệu ứng chuyển động', keyword: 'motion movements hiệu ứng animation reduce all animation chuyển trang' },
  { id: 'set-search', title: 'Cài đặt: Tùy chỉnh danh mục tìm kiếm', keyword: 'tìm kiếm search spotlight' },
  { id: 'set-keybinds', title: 'Cài đặt: Customize keybinds / Phím tắt tùy chỉnh', keyword: 'phím tắt customize keybinds shortcut keyboard alt 1 2 3 4 5' },
];

export const SpotlightModal: React.FC<SpotlightModalProps> = ({
  isOpen,
  onClose,
  navigate,
  onSelectChannel
}) => {
  const { settings, updateSetting } = useSettings();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [viewMode, setViewMode] = useState<'search' | 'settings'>('search');
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    isListening,
    errorMessage: voiceError,
    toggleListening
  } = useVoiceSearch((transcript) => {
    setQuery(transcript);
    setIsFocused(true);
    inputRef.current?.focus();
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setIsFocused(false);
      setViewMode('search');
      const timer = setTimeout(() => {
        setIsFocused(true);
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsFocused(false);
      setViewMode('search');
    }
  }, [isOpen]);

  // Global Cmd+K / Ctrl+K keyboard shortcut & ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        if (viewMode === 'settings') {
          setViewMode('search');
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, viewMode]);

  const rawQuery = query.trim();
  const normalizedQuery = rawQuery.toLowerCase();

  // 1. Channel matching (Live TV search & Channel number search)
  const matchedChannels = settings.searchTv ? CHANNELS_DATA.filter((ch, index) => {
    if (!normalizedQuery) return false;
    
    // Check channel number search (if searchChannelNumber setting is enabled)
    if (settings.searchChannelNumber) {
      const chNum = ch.channelNumber || (index + 1);
      const chCode = ch.channelCode || String(chNum).padStart(3, '0');
      const cleanNum = normalizedQuery.replace(/[^0-9]/g, '');
      
      // Match "001", "1", "kênh 1", "ch 1", "#1", etc.
      if (cleanNum && (
        String(chNum) === cleanNum || 
        chCode === cleanNum || 
        chCode.endsWith(cleanNum) ||
        cleanNum === String(chNum).padStart(cleanNum.length, '0')
      )) {
        return true;
      }
      
      // Match query containing channel code or formatted string
      if (normalizedQuery.includes(chCode) || normalizedQuery.includes(String(chNum))) {
        if (/^(kênh|ch|kenh|#|\s)*\d+$/i.test(normalizedQuery)) {
          return true;
        }
      }
    }

    return (
      ch.name.toLowerCase().includes(normalizedQuery) ||
      ch.shortName?.toLowerCase().includes(normalizedQuery) ||
      ch.category.toLowerCase().includes(normalizedQuery) ||
      ch.tags?.some((t) => t.toLowerCase().includes(normalizedQuery)) ||
      ch.currentProgram?.title.toLowerCase().includes(normalizedQuery)
    );
  }) : [];

  // 2. Category matching
  const matchedCategories = settings.searchCategories ? CATEGORY_ITEMS.filter((item) => 
    normalizedQuery && item.title.toLowerCase().includes(normalizedQuery)
  ) : [];

  // 3. News matching
  const matchedNews = settings.searchNews ? NEWS_DATA.filter((n) =>
    normalizedQuery && (
      n.title.toLowerCase().includes(normalizedQuery) ||
      n.category.toLowerCase().includes(normalizedQuery) ||
      n.tags?.some((t) => t.toLowerCase().includes(normalizedQuery))
    )
  ) : [];

  // 4. Settings shortcuts matching
  const matchedSettings = settings.searchSettings ? SETTINGS_SHORTCUTS.filter((s) =>
    normalizedQuery && (s.title.toLowerCase().includes(normalizedQuery) || s.keyword.toLowerCase().includes(normalizedQuery))
  ) : [];

  const hasAnyResults = matchedChannels.length > 0 || 
    matchedCategories.length > 0 || 
    matchedNews.length > 0 || 
    matchedSettings.length > 0;

  const shouldAnimateModal = !settings.reduceAllMotion && settings.animateModals;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="spotlight-container"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          {/* 1. Backdrop */}
          <motion.div 
            id="spotlight-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldAnimateModal ? 0.32 : 0, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* 2. Dialog Modal Box */}
          <motion.div 
            id="spotlight-popup-card"
            initial={shouldAnimateModal ? { opacity: 0, scale: 1.10 } : { opacity: 1, scale: 1 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              transition: {
                duration: shouldAnimateModal ? 0.38 : 0,
                ease: [0.16, 1, 0.3, 1]
              }
            }}
            exit={shouldAnimateModal ? { 
              opacity: 0, 
              scale: 1.08,
              transition: {
                duration: 0.25,
                ease: [0.25, 0.1, 0.25, 1]
              }
            } : { opacity: 0 }}
            className="relative w-full max-w-[400px] sm:max-w-[460px] bg-[#27282D] border border-white/10 rounded-[28px] p-4 sm:p-5 shadow-2xl overflow-hidden z-10 my-auto max-h-[calc(100vh-32px)] flex flex-col"
          >
            {viewMode === 'settings' ? (
              /* View 2: Search Settings Menu (Without navigating to Settings tab) */
              <div id="spotlight-settings-view" className="space-y-3.5 flex flex-col min-h-0">
                {/* Header with Back button, Title strictly centered, and Close */}
                <div className="relative flex items-center justify-between pb-3 border-b border-white/10 min-h-[36px]">
                  <button
                    id="btn-spotlight-back-to-search"
                    type="button"
                    onClick={() => setViewMode('search')}
                    className="z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-[#8E8E93] hover:text-white hover:bg-white/10 dark:hover:bg-white/15 transition-all cursor-pointer group"
                  >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Quay lại</span>
                  </button>

                  {/* Perfectly Centered Title */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 pointer-events-none">
                    <div className="w-6 h-6 rounded-full bg-[#E6005A]/15 flex items-center justify-center text-[#E6005A]">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-bold text-white tracking-wide">Cài đặt tìm kiếm</span>
                  </div>

                  <button
                    id="btn-spotlight-close-settings"
                    type="button"
                    onClick={onClose}
                    className="z-10 w-7 h-7 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-white hover:bg-white/10 dark:hover:bg-white/15 transition-colors cursor-pointer"
                    title="Đóng"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Subtitle description */}
                <p className="text-[12px] text-[#8E8E93] px-1 font-medium leading-relaxed select-none text-center">
                  Tùy chỉnh các danh mục và chế độ tìm kiếm trong Spotlight
                </p>

                {/* Settings list - Identical to Settings tab search section */}
                <div id="spotlight-search-settings-list" className="space-y-3 max-h-[min(400px,55vh)] overflow-y-auto pr-1 sidebar-scroller text-left">
                  {/* 1. Danh mục */}
                  <div 
                    id="setting-spotlight-categories"
                    onClick={() => updateSetting('searchCategories', !settings.searchCategories)}
                    className="group p-3.5 rounded-[18px] bg-[#28272E] flex items-center justify-between gap-3.5 cursor-pointer hover:bg-[#313038] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-white text-[13.5px]">
                        Danh mục
                      </div>
                      <div className="text-[11.5px] text-[#9CA3AF] mt-0.5 leading-snug">
                        Hiển thị các tab và điều hướng hệ thống (Home, Live TV, News, v.v.)
                      </div>
                    </div>

                    <button
                      id="toggle-spotlight-search-categories"
                      type="button"
                      role="switch"
                      aria-checked={settings.searchCategories}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSetting('searchCategories', !settings.searchCategories);
                      }}
                      className={`toggle-switch-btn relative w-[62px] h-7 rounded-full p-[3px] transition-colors duration-200 ease-in-out cursor-pointer shrink-0 flex items-center ${
                        settings.searchCategories ? 'bg-[#E6005A]' : 'bg-[#E4E4E7] dark:bg-[#3F3F46]'
                      }`}
                    >
                      <span className="toggle-switch-thumb block w-[30px] h-[22px] rounded-full bg-white border border-black/10 dark:border-white/10 shadow-md pointer-events-none" />
                    </button>
                  </div>

                  {/* 2. Tin tức */}
                  <div 
                    id="setting-spotlight-news"
                    onClick={() => updateSetting('searchNews', !settings.searchNews)}
                    className="group p-3.5 rounded-[18px] bg-[#28272E] flex items-center justify-between gap-3.5 cursor-pointer hover:bg-[#313038] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-white text-[13.5px]">
                        Tin tức
                      </div>
                      <div className="text-[11.5px] text-[#9CA3AF] mt-0.5 leading-snug">
                        Hiển thị các bài viết tin tức, thông báo cộng đồng và sự kiện Discord
                      </div>
                    </div>

                    <button
                      id="toggle-spotlight-search-news"
                      type="button"
                      role="switch"
                      aria-checked={settings.searchNews}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSetting('searchNews', !settings.searchNews);
                      }}
                      className={`toggle-switch-btn relative w-[62px] h-7 rounded-full p-[3px] transition-colors duration-200 ease-in-out cursor-pointer shrink-0 flex items-center ${
                        settings.searchNews ? 'bg-[#E6005A]' : 'bg-[#E4E4E7] dark:bg-[#3F3F46]'
                      }`}
                    >
                      <span className="toggle-switch-thumb block w-[30px] h-[22px] rounded-full bg-white border border-black/10 dark:border-white/10 shadow-md pointer-events-none" />
                    </button>
                  </div>

                  {/* 3. Truyền hình & Tìm kênh theo số hiệu kênh */}
                  <div className="p-3.5 rounded-[18px] bg-[#28272E] space-y-3.5">
                    {/* 3.1 Truyền hình */}
                    <div 
                      id="setting-spotlight-tv"
                      onClick={() => updateSetting('searchTv', !settings.searchTv)}
                      className="group flex items-center justify-between gap-3.5 cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-white text-[13.5px]">
                          Truyền hình
                        </div>
                        <div className="text-[11.5px] text-[#9CA3AF] mt-0.5 leading-snug">
                          Hiển thị danh sách kênh truyền hình trực tiếp theo tên hoặc nhóm kênh
                        </div>
                      </div>

                      <button
                        id="toggle-spotlight-search-tv"
                        type="button"
                        role="switch"
                        aria-checked={settings.searchTv}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSetting('searchTv', !settings.searchTv);
                        }}
                        className={`toggle-switch-btn relative w-[62px] h-7 rounded-full p-[3px] transition-colors duration-200 ease-in-out cursor-pointer shrink-0 flex items-center ${
                          settings.searchTv ? 'bg-[#E6005A]' : 'bg-[#E4E4E7] dark:bg-[#3F3F46]'
                        }`}
                      >
                        <span className="toggle-switch-thumb block w-[30px] h-[22px] rounded-full bg-white border border-black/10 dark:border-white/10 shadow-md pointer-events-none" />
                      </button>
                    </div>

                    {/* Divider */}
                    <hr className="border-[#383742]" />

                    {/* 3.2 Tìm kênh theo số hiệu kênh */}
                    <div 
                      id="setting-spotlight-channel-number"
                      onClick={() => updateSetting('searchChannelNumber', !settings.searchChannelNumber)}
                      className="group flex items-center justify-between gap-3.5 cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-[13.5px]">
                            Tìm kênh theo số hiệu kênh
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#E6005A]/20 text-[#E6005A] tracking-wider shrink-0">
                            CH #
                          </span>
                        </div>
                        <div className="text-[11.5px] text-[#9CA3AF] mt-0.5 leading-snug">
                          Cho phép gõ số kênh (ví dụ: 1, 001, #12, kênh 5) để tìm nhanh
                        </div>
                      </div>

                      <button
                        id="toggle-spotlight-search-channel-number"
                        type="button"
                        role="switch"
                        aria-checked={settings.searchChannelNumber}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateSetting('searchChannelNumber', !settings.searchChannelNumber);
                        }}
                        className={`toggle-switch-btn relative w-[62px] h-7 rounded-full p-[3px] transition-colors duration-200 ease-in-out cursor-pointer shrink-0 flex items-center ${
                          settings.searchChannelNumber ? 'bg-[#E6005A]' : 'bg-[#E4E4E7] dark:bg-[#3F3F46]'
                        }`}
                      >
                        <span className="toggle-switch-thumb block w-[30px] h-[22px] rounded-full bg-white border border-black/10 dark:border-white/10 shadow-md pointer-events-none" />
                      </button>
                    </div>
                  </div>

                  {/* 4. Cài đặt hệ thống */}
                  <div 
                    id="setting-spotlight-settings"
                    onClick={() => updateSetting('searchSettings', !settings.searchSettings)}
                    className="group p-3.5 rounded-[18px] bg-[#28272E] flex items-center justify-between gap-3.5 cursor-pointer hover:bg-[#313038] transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-white text-[13.5px]">
                        Cài đặt hệ thống
                      </div>
                      <div className="text-[11.5px] text-[#9CA3AF] mt-0.5 leading-snug">
                        Quản lý và chuyển nhanh tới các mục tùy chọn hệ thống
                      </div>
                    </div>

                    <button
                      id="toggle-spotlight-search-settings"
                      type="button"
                      role="switch"
                      aria-checked={settings.searchSettings}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSetting('searchSettings', !settings.searchSettings);
                      }}
                      className={`toggle-switch-btn relative w-[62px] h-7 rounded-full p-[3px] transition-colors duration-200 ease-in-out cursor-pointer shrink-0 flex items-center ${
                        settings.searchSettings ? 'bg-[#E6005A]' : 'bg-[#E4E4E7] dark:bg-[#3F3F46]'
                      }`}
                    >
                      <span className="toggle-switch-thumb block w-[30px] h-[22px] rounded-full bg-white border border-black/10 dark:border-white/10 shadow-md pointer-events-none" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* View 1: Spotlight Search Standard Mode */
              <>
                {/* Capsule Pill Search Input Bar */}
                <div 
                  id="spotlight-search-container"
                  onClick={() => {
                    setIsFocused(true);
                    inputRef.current?.focus();
                  }}
                  className={`relative w-full h-[46px] flex items-center px-4 rounded-full spotlight-bubble-box text-sm transition-all spotlight-input-container overflow-hidden cursor-text select-none ${settings.immersiveSearch ? 'immersive-search-input' : ''}`}
                >
                  <motion.div 
                    animate={{
                      x: isFocused || query ? 0 : 'calc(50% - 68px)',
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 28,
                      mass: 0.8
                    }}
                    className={`flex items-center gap-2.5 w-full ${isFocused || isListening || query ? 'pr-24' : 'pr-14'}`}
                  >
                    <div className="w-[18px] h-[18px] min-w-[18px] min-h-[18px] max-w-[18px] max-h-[18px] flex items-center justify-center shrink-0">
                      <img
                        src="https://static.wikia.nocookie.net/ep-deo/images/2/21/Searchhh.png/revision/latest?cb=20260717131751"
                        alt="Search"
                        referrerPolicy="no-referrer"
                        className="w-full h-full aspect-square object-contain brightness-0 invert opacity-90"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => {
                        if (!query && !isListening) setIsFocused(false);
                      }}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={isListening ? "Đang nghe giọng nói..." : "Spotlight Search"}
                      className="bg-transparent text-white placeholder-[#A1A1AA] text-sm focus:outline-none font-medium w-full text-left"
                    />
                  </motion.div>

                  {/* Right Side Actions: Clear, Voice Search Mic & Search Settings */}
                  <div className="absolute right-2 flex items-center gap-1 shrink-0 overflow-visible">
                    <AnimatePresence>
                      {query && (
                        <motion.button 
                          type="button"
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={{ duration: 0.15 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuery('');
                            inputRef.current?.focus();
                          }}
                          className="p-1 rounded-full text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
                          title="Xóa tìm kiếm"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      )}

                      {(isFocused || isListening) && (
                        <motion.button
                          type="button"
                          initial={{ opacity: 0, x: 20, scale: 0.85 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: 20, scale: 0.85 }}
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 28,
                            mass: 0.8
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleListening();
                          }}
                          className={`w-7 h-7 rounded-full transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                            isListening
                              ? 'bg-[#E6005A] shadow-[0_0_14px_rgba(230,0,90,0.8)] scale-105 animate-pulse'
                              : 'hover:bg-white/10 dark:hover:bg-white/15'
                          }`}
                          title={isListening ? "Dừng nghe giọng nói" : "Tìm kiếm bằng giọng nói"}
                        >
                          <div className="w-[18px] h-[18px] min-w-[18px] min-h-[18px] max-w-[18px] max-h-[18px] flex items-center justify-center shrink-0">
                            <img
                              src="https://github.com/andrewtavis/sf-symbols-online/blob/master/glyphs/mic.png?raw=true"
                              alt="Voice Search"
                              referrerPolicy="no-referrer"
                              className="w-full h-full aspect-square object-contain brightness-0 invert opacity-90 select-none pointer-events-none drop-shadow-sm"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        </motion.button>
                      )}
                    </AnimatePresence>

                    {/* Settings Button: Opens Search Settings Menu inside Spotlight */}
                    <button
                      id="btn-spotlight-open-settings"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewMode('settings');
                      }}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-white hover:bg-white/10 dark:hover:bg-white/15 active:scale-95 transition-all cursor-pointer shrink-0"
                      title="Cài đặt tìm kiếm"
                      aria-label="Cài đặt tìm kiếm"
                    >
                      <SettingsIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Dynamic Content Area */}
                {!query ? (
                  <div className="py-7 sm:py-9 px-3 text-center">
                    <p className="text-[13px] sm:text-sm text-[#8E8E93] leading-relaxed font-normal select-none max-w-[290px] mx-auto">
                      Nhập từ khóa hoặc số kênh để tìm kiếm trong Vplay
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 max-h-[320px] overflow-y-auto space-y-2 pr-1 sidebar-scroller">
                    {/* 1. Channels */}
                    {matchedChannels.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#E6005A] flex items-center gap-1.5">
                          <Tv className="w-3 h-3" />
                          <span>Kênh truyền hình ({matchedChannels.length})</span>
                        </div>
                        {matchedChannels.slice(0, 5).map((ch) => (
                          <div
                            key={ch.id}
                            onClick={() => {
                              onSelectChannel(ch);
                              navigate(`/live-tv?channel=${ch.slug}`);
                              onClose();
                            }}
                            className="flex items-center justify-between p-2.5 rounded-[14px] bg-[#22222A] hover:bg-[#2C2C36] cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-[#141418] border border-[#34343E] flex items-center justify-center text-xs font-bold text-white shrink-0 p-1 overflow-hidden">
                                <img
                                  src={ch.logo}
                                  alt={ch.name}
                                  referrerPolicy="no-referrer"
                                  className={`max-w-full max-h-full object-contain ${
                                    ch.id === 'vtv1' || ch.id === 'vtv3' ? 'scale-[0.90]' : ''
                                  }`}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-white group-hover:text-[#E6005A] truncate">
                                    {`${String(ch.channelNumber || 1).padStart(3, '0')} | ${ch.name}`}
                                  </span>
                                </div>
                                <div className="text-[10px] text-[#9CA3AF] truncate">
                                  {ch.category}
                                </div>
                              </div>
                            </div>
                            <div className="w-7 h-7 rounded-full bg-[#2F2F3A] group-hover:bg-[#E6005A] flex items-center justify-center text-white shrink-0 transition-colors">
                              <Play className="w-3 h-3 fill-current ml-0.5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 2. Categories / Navigation */}
                    {matchedCategories.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#38BDF8] flex items-center gap-1.5">
                          <Box className="w-3 h-3" />
                          <span>Danh mục ({matchedCategories.length})</span>
                        </div>
                        {matchedCategories.map((item) => {
                          const IconComponent = item.icon;
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                navigate(item.route);
                                onClose();
                              }}
                              className="flex items-center gap-2.5 p-2 rounded-[14px] bg-[#22222A] hover:bg-[#2C2C36] cursor-pointer transition-colors"
                            >
                              <div className="w-7 h-7 rounded-lg bg-[#2E2E38] flex items-center justify-center shrink-0">
                                <IconComponent className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-xs font-medium text-white truncate">{item.title}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 3. News */}
                    {matchedNews.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FF4D4D] flex items-center gap-1.5">
                          <Megaphone className="w-3 h-3" />
                          <span>Tin tức ({matchedNews.length})</span>
                        </div>
                        {matchedNews.slice(0, 3).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              navigate(`/news/${n.slug}`);
                              onClose();
                            }}
                            className="flex items-center gap-2.5 p-2 rounded-[14px] bg-[#22222A] hover:bg-[#2C2C36] cursor-pointer transition-colors"
                          >
                            <div className="w-10 h-7 rounded bg-[#141418] overflow-hidden shrink-0">
                              <img src={n.coverImage} alt={n.title} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-xs text-white line-clamp-1 flex-1">{n.title}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 4. Settings Shortcuts */}
                    {matchedSettings.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FF4D4D] flex items-center gap-1.5">
                          <SettingsIcon className="w-3 h-3" />
                          <span>Cài đặt ({matchedSettings.length})</span>
                        </div>
                        {matchedSettings.map((st) => (
                          <div
                            key={st.id}
                            onClick={() => {
                              navigate('/settings');
                              onClose();
                            }}
                            className="flex items-center gap-2.5 p-2 rounded-[14px] bg-[#22222A] hover:bg-[#2C2C36] cursor-pointer transition-colors"
                          >
                            <div className="w-7 h-7 rounded-lg bg-[#2E2E38] flex items-center justify-center shrink-0">
                              <SettingsIcon className="w-4 h-4 text-[#FF4D4D]" />
                            </div>
                            <span className="text-xs font-medium text-white truncate">{st.title}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {!hasAnyResults && (
                      <div className="py-6 text-center text-xs text-[#8E8E93]">
                        Không tìm thấy kết quả phù hợp với "<span className="text-white font-medium">{query}</span>"
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
