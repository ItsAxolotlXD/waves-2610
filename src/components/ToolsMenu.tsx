import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Info, 
  Sparkles, 
  Search, 
  Type, 
  FileDown, 
  Heart, 
  ExternalLink, 
  PlusCircle, 
  UploadCloud, 
  DownloadCloud, 
  Minus, 
  Plus, 
  Check,
  Volume2
} from 'lucide-react';
import { Channel, NewsArticle } from '../types';
import { useFavorites } from '../hooks/useFavorites';
import { useSettings } from '../hooks/useSettings';
import { NEWS_DATA } from '../data/news';
import { parseM3UPlaylist, downloadPlaylistFile } from '../utils/m3uParser';
import { exportArticleToDocx } from '../utils/docxExport';

interface ToolsMenuProps {
  currentRoute: string;
  currentChannel?: Channel;
  channels: Channel[];
  isLightMode?: boolean;
  onNavigate: (route: string) => void;
  onOpenHelp: () => void;
  onOpenDiscord: () => void;
  onOpenSummarize: (article: NewsArticle) => void;
  onOpenTextToSpeech?: (article: NewsArticle) => void;
  onOpenFindWords: () => void;
  onOpenAddStream: () => void;
  onImportChannels: (newChannels: Channel[]) => void;
  fontSize: number;
  onChangeFontSize: (size: number) => void;
  placement?: 'top' | 'bottom';
  isOpen?: boolean;
  onClose?: () => void;
  showTrigger?: boolean;
  className?: string;
}

export const ToolsMenu: React.FC<ToolsMenuProps> = ({
  currentRoute,
  currentChannel,
  channels,
  isLightMode,
  onNavigate,
  onOpenHelp,
  onOpenDiscord,
  onOpenSummarize,
  onOpenTextToSpeech,
  onOpenFindWords,
  onOpenAddStream,
  onImportChannels,
  fontSize,
  onChangeFontSize,
  placement = 'top',
  isOpen: externalIsOpen,
  onClose,
  showTrigger = true,
  className
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = externalIsOpen !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalOpen;

  const setIsOpen = (next: boolean | ((prev: boolean) => boolean)) => {
    if (isControlled) {
      const nextVal = typeof next === 'function' ? next(externalIsOpen!) : next;
      if (!nextVal && onClose) onClose();
    } else {
      setInternalOpen(next);
    }
  };

  const [spinCount, setSpinCount] = useState(0);
  const [isClickSpinning, setIsClickSpinning] = useState(false);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);
  const [exportingDocx, setExportingDocx] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isRelevant = true; // Always available on all pages

  const handleTriggerClick = () => {
    setSpinCount((prev) => prev + 1);
    setIsClickSpinning(true);
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleToggleTools = () => {
      setSpinCount((prev) => prev + 1);
      setIsClickSpinning(true);
      setIsOpen((prev) => !prev);
    };
    window.addEventListener('vplay:toggle-tools', handleToggleTools);
    return () => window.removeEventListener('vplay:toggle-tools', handleToggleTools);
  }, []);

  const { isChannelFavorite, toggleFavoriteChannel } = useFavorites();
  const isFav = currentChannel ? isChannelFavorite(currentChannel.id) : false;

  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  const { settings, draftSettings } = useSettings();
  const currentOpacity = typeof draftSettings?.spatialGlassOpacity === 'number'
    ? draftSettings.spatialGlassOpacity
    : (settings.spatialGlassOpacity ?? 20);
  const isSpatialGlassActive = (draftSettings?.spatialGlass ?? settings.spatialGlass) !== false;
  const isLight = settings.theme === 'light';
  const isDarkContent = isLight || (isSpatialGlassActive && currentOpacity > 40);

  const renderHoverPill = (id: string) => {
    if (hoveredItemId !== id) return null;
    return (
      <motion.div
        layoutId="tools-menu-hover-pill"
        transition={{
          type: 'spring',
          stiffness: 480,
          damping: 30,
          mass: 0.55
        }}
        className={`absolute inset-0 rounded-full pointer-events-none ${
          isDarkContent
            ? 'bg-black/[0.13] shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
            : 'bg-white/[0.22] shadow-[0_2px_12px_rgba(255,255,255,0.12)]'
        }`}
      />
    );
  };

  // Determine current active section & whether Tools is relevant for this page
  const isHome = currentRoute === '/' || currentRoute === '/home';
  const isNews = currentRoute.startsWith('/news');
  const isLiveTV = currentRoute.startsWith('/live-tv') || currentRoute.startsWith('/channels') || currentRoute.startsWith('/test');
  const isOther = !isNews && !isLiveTV;

  // Find active article if on news
  const currentNewsArticle: NewsArticle = (() => {
    if (currentRoute.startsWith('/news/')) {
      const slug = currentRoute.replace('/news/', '');
      return NEWS_DATA.find((a) => a.slug === slug) || NEWS_DATA[0];
    }
    return NEWS_DATA[0];
  })();

  // Check if active article is locked in session
  const isCurrentArticleLocked = (() => {
    if (!currentNewsArticle || !currentNewsArticle.isLocked) return false;
    try {
      const saved = sessionStorage.getItem('waves_unlocked_articles');
      const unlocked = saved ? JSON.parse(saved) : {};
      return !unlocked[currentNewsArticle.slug];
    } catch {
      return true;
    }
  })();

  const handleMouseEnter = () => {
    if (!isRelevant || !showTrigger) return;
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (!isRelevant || !showTrigger) return;
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const showToast = (msg: string) => {
    setCopiedToast(msg);
    setTimeout(() => setCopiedToast(null), 2500);
  };

  // Handler for Export .docx
  const handleExportDocx = async () => {
    setExportingDocx(true);
    try {
      await exportArticleToDocx(currentNewsArticle);
      showToast('Đã xuất file .docx thành công!');
    } catch (e) {
      console.error(e);
      showToast('Lỗi khi xuất tài liệu Word.');
    } finally {
      setExportingDocx(false);
      setIsOpen(false);
    }
  };

  // Handler for Export M3U8
  const handleExportM3U8 = () => {
    try {
      downloadPlaylistFile(channels, 'vplay_playlist.m3u8');
      showToast(`Đã xuất ${channels.length} kênh thành file .m3u8!`);
    } catch (e) {
      console.error(e);
      showToast('Lỗi khi xuất danh sách kênh.');
    }
    setIsOpen(false);
  };

  // Handler for Import M3U File
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      try {
        const parsed = parseM3UPlaylist(content);
        if (parsed.length === 0) {
          showToast('Không tìm thấy kênh hợp lệ trong file.');
          return;
        }
        const fullChannels: Channel[] = parsed.map((p, idx) => ({
          id: p.id || `m3u-file-${Date.now()}-${idx}`,
          name: p.name || `Kênh ${idx + 1}`,
          shortName: p.name || `Kênh ${idx + 1}`,
          slug: p.slug || `m3u-file-ch-${idx + 1}`,
          logo: p.logo || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=200&auto=format&fit=crop&q=80',
          category: p.category || 'Chuyên biệt',
          quality: p.quality || 'HD',
          streamUrl: p.streamUrl || '',
          isLive: true,
          description: p.description || 'Kênh nạp từ file M3U.',
          currentProgram: p.currentProgram || {
            title: p.name || 'Chương trình phát sóng',
            startTime: '00:00',
            endTime: '24:00',
            progress: 50,
            description: 'Phát trực tiếp.'
          }
        }));
        onImportChannels(fullChannels);
        showToast(`Đã nạp ${fullChannels.length} kênh từ file!`);
      } catch (err) {
        showToast('Lỗi phân tích file playlist.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsOpen(false);
  };

  return (
    <div
      className={`relative pointer-events-auto cursor-default ${
        !isRelevant ? 'opacity-30 pointer-events-none grayscale' : ''
      }`}
      onMouseEnter={showTrigger ? handleMouseEnter : undefined}
      onMouseLeave={showTrigger ? handleMouseLeave : undefined}
    >
      {/* Hidden M3U File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".m3u,.m3u8,text/plain"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Tools Trigger Button with Tools icon (rendered when showTrigger is true) */}
      {showTrigger && (
        <button
          id="btn-top-tools-menu"
          type="button"
          disabled={!isRelevant}
          onClick={handleTriggerClick}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#18181B] dark:text-white transition-all drop-shadow-sm cursor-default relative group hover:bg-white/10"
          title={isRelevant ? "Công cụ & Tiện ích VNRT Online (Tools)" : "Không có công cụ khả dụng"}
          aria-label="Menu công cụ VNRT Online"
          aria-expanded={isOpen}
        >
          <img
            key={spinCount}
            src="https://static.wikia.nocookie.net/ep-deo/images/3/3c/Tools_menu.png/revision/latest?cb=20260905055712"
            alt="Tools"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/icons/copilot.png';
            }}
            onAnimationEnd={() => setIsClickSpinning(false)}
            className={`w-6 h-6 object-contain topbar-tools-icon transition-transform duration-700 ease-in-out ${
              isClickSpinning ? 'spin-click' : ''
            }`}
          />
        </button>
      )}

      {/* Floating Popup Menu with Slide Down Bounce Animation */}
      <AnimatePresence>
        {isOpen && isRelevant && (
          <motion.div
            id="vplay-tools-dropdown-card"
            initial={{ opacity: 0, y: placement === 'bottom' ? 12 : -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: placement === 'bottom' ? 8 : -8, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 24,
              mass: 0.7
            }}
            style={{
              backgroundColor: isSpatialGlassActive
                ? 'var(--spatial-glass-bg, rgba(255, 255, 255, 0.20))'
                : (isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(30, 30, 36, 0.92)'),
              backdropFilter: isSpatialGlassActive ? 'blur(var(--spatial-glass-blur, 20px))' : 'none',
              WebkitBackdropFilter: isSpatialGlassActive ? 'blur(var(--spatial-glass-blur, 20px))' : 'none',
            }}
            className={`${
              showTrigger
                ? (placement === 'bottom' ? 'absolute right-0 bottom-full mb-3 origin-bottom-right' : 'absolute right-0 mt-2 origin-top-right')
                : 'relative origin-bottom-right shadow-2xl'
            } w-72 max-w-[calc(100vw-32px)] rounded-[30px] p-3 z-50 select-none cursor-default overflow-hidden border ${
              isDarkContent ? 'border-black/15 text-[#111827]' : 'border-white/10 text-white'
            } ${className || ''}`}
          >
            {/* Menu Items for HOME & OTHER PAGES */}
          {isOther && (
            <div className="space-y-1" onMouseLeave={() => setHoveredItemId(null)}>
              <button
                id="tool-home-help"
                type="button"
                onMouseEnter={() => setHoveredItemId('tool-home-help')}
                onClick={() => {
                  setIsOpen(false);
                  onOpenHelp();
                }}
                className="relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-colors text-left cursor-default group"
              >
                {renderHoverPill('tool-home-help')}
                <div className="relative z-10 w-5 h-5 flex items-center justify-center text-[#18181B] dark:text-white shrink-0">
                  <BookOpen className="w-[18px] h-[18px]" />
                </div>
                <span className="relative z-10 text-[#1F2937] dark:text-[#E5E7EB]">Help</span>
              </button>

              <button
                id="tool-home-discord"
                type="button"
                onMouseEnter={() => setHoveredItemId('tool-home-discord')}
                onClick={() => {
                  setIsOpen(false);
                  onOpenDiscord();
                }}
                className="relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-colors text-left cursor-default group"
              >
                {renderHoverPill('tool-home-discord')}
                <div className="relative z-10 w-5 h-5 flex items-center justify-center text-[#18181B] dark:text-white shrink-0">
                  <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.078.078 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </div>
                <span className="relative z-10 text-[#1F2937] dark:text-[#E5E7EB]">Join now</span>
              </button>

              <button
                id="tool-home-add-stream"
                type="button"
                onMouseEnter={() => setHoveredItemId('tool-home-add-stream')}
                onClick={() => {
                  setIsOpen(false);
                  onOpenAddStream();
                }}
                className="relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-colors text-left cursor-default group"
              >
                {renderHoverPill('tool-home-add-stream')}
                <div className="relative z-10 w-5 h-5 flex items-center justify-center text-[#18181B] dark:text-white shrink-0">
                  <PlusCircle className="w-[18px] h-[18px]" />
                </div>
                <span className="relative z-10 text-[#1F2937] dark:text-[#E5E7EB]">Thêm luồng mới</span>
              </button>

              <button
                id="tool-home-import-m3u"
                type="button"
                onMouseEnter={() => setHoveredItemId('tool-home-import-m3u')}
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-colors text-left cursor-default group"
              >
                {renderHoverPill('tool-home-import-m3u')}
                <div className="relative z-10 w-5 h-5 flex items-center justify-center text-[#18181B] dark:text-white shrink-0">
                  <UploadCloud className="w-[18px] h-[18px]" />
                </div>
                <span className="relative z-10 text-[#1F2937] dark:text-[#E5E7EB]">Nhập file m3u/m3u8</span>
              </button>

              <button
                id="tool-home-export-m3u"
                type="button"
                onMouseEnter={() => setHoveredItemId('tool-home-export-m3u')}
                onClick={handleExportM3U8}
                className="relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-colors text-left cursor-default group"
              >
                {renderHoverPill('tool-home-export-m3u')}
                <div className="relative z-10 w-5 h-5 flex items-center justify-center text-[#18181B] dark:text-white shrink-0">
                  <DownloadCloud className="w-[18px] h-[18px]" />
                </div>
                <span className="relative z-10 text-[#1F2937] dark:text-[#E5E7EB]">Xuất file m3u/m3u8</span>
              </button>

              <button
                id="tool-home-text-to-speech"
                type="button"
                onMouseEnter={() => setHoveredItemId('tool-home-text-to-speech')}
                onClick={() => {
                  setIsOpen(false);
                  onOpenTextToSpeech?.(NEWS_DATA[0]);
                }}
                className="relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-colors text-left cursor-default group"
              >
                {renderHoverPill('tool-home-text-to-speech')}
                <div className="relative z-10 w-5 h-5 flex items-center justify-center text-[#18181B] dark:text-white shrink-0">
                  <Volume2 className="w-[18px] h-[18px]" />
                </div>
                <span className="relative z-10 text-[#1F2937] dark:text-[#E5E7EB]">Text to speech</span>
              </button>
            </div>
          )}

          {/* Menu Items for NEWS */}
          {isNews && (
            <div className="space-y-1" onMouseLeave={() => setHoveredItemId(null)}>
              {/* 1. Summarize News */}
              <button
                id="tool-news-summarize"
                type="button"
                onMouseEnter={() => setHoveredItemId('tool-news-summarize')}
                disabled={isCurrentArticleLocked}
                onClick={() => {
                  if (isCurrentArticleLocked) return;
                  setIsClickSpinning(true);
                  setIsOpen(false);
                  onOpenSummarize(currentNewsArticle);
                }}
                className={`relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-colors text-left cursor-default group ${
                  isCurrentArticleLocked 
                    ? 'opacity-40 cursor-not-allowed hover:bg-transparent' 
                    : ''
                }`}
                title={isCurrentArticleLocked ? 'Bài viết đang bị khóa, hãy mở khóa để tóm tắt' : 'Tóm tắt bài viết'}
              >
                {!isCurrentArticleLocked && renderHoverPill('tool-news-summarize')}
                <div className="relative z-10 w-5 h-5 flex items-center justify-center text-[#18181B] dark:text-white shrink-0">
                  <Sparkles className="w-[18px] h-[18px]" />
                </div>
                <span className="relative z-10 text-[#1F2937] dark:text-[#E5E7EB]">
                  {isCurrentArticleLocked ? 'Summarize (Khóa)' : 'Summarize News'}
                </span>
              </button>

              {/* 2. Text to speech */}
              <button
                id="tool-news-text-to-speech"
                type="button"
                onMouseEnter={() => setHoveredItemId('tool-news-text-to-speech')}
                disabled={isCurrentArticleLocked}
                onClick={() => {
                  if (isCurrentArticleLocked) return;
                  setIsOpen(false);
                  onOpenTextToSpeech?.(currentNewsArticle);
                }}
                className={`relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-colors text-left cursor-default group ${
                  isCurrentArticleLocked 
                    ? 'opacity-40 cursor-not-allowed hover:bg-transparent' 
                    : ''
                }`}
                title={isCurrentArticleLocked ? 'Bài viết đang bị khóa, hãy mở khóa để nghe đọc' : 'Đọc bài viết (Text to speech)'}
              >
                {!isCurrentArticleLocked && renderHoverPill('tool-news-text-to-speech')}
                <div className="relative z-10 w-5 h-5 flex items-center justify-center text-[#18181B] dark:text-white shrink-0">
                  <Volume2 className="w-[18px] h-[18px]" />
                </div>
                <span className="relative z-10 text-[#1F2937] dark:text-[#E5E7EB]">
                  {isCurrentArticleLocked ? 'Text to speech (Khóa)' : 'Text to speech'}
                </span>
              </button>

              {/* 3. Find words */}
              <button
                id="tool-news-find-words"
                type="button"
                onMouseEnter={() => setHoveredItemId('tool-news-find-words')}
                onClick={() => {
                  setIsOpen(false);
                  onOpenFindWords();
                }}
                className="relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-colors text-left cursor-default group"
              >
                {renderHoverPill('tool-news-find-words')}
                <div className="relative z-10 w-5 h-5 flex items-center justify-center text-[#18181B] dark:text-white shrink-0">
                  <Search className="w-[18px] h-[18px]" />
                </div>
                <span className="relative z-10 text-[#1F2937] dark:text-[#E5E7EB]">Find words</span>
              </button>

              {/* 3. Font size */}
              <div 
                id="tool-news-font-size"
                onMouseEnter={() => setHoveredItemId('tool-news-font-size')}
                className="relative flex items-center justify-between px-3.5 py-2 rounded-full text-sm font-medium transition-colors cursor-default"
              >
                {renderHoverPill('tool-news-font-size')}
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center text-[#18181B] dark:text-white shrink-0">
                    <Type className="w-[18px] h-[18px]" />
                  </div>
                  <span className="text-[#1F2937] dark:text-[#E5E7EB]">Font size</span>
                </div>
                <div className="relative z-10 tools-font-box flex items-center gap-1.5 bg-[#F1F3F5] dark:bg-[#141318] p-1 rounded-full">
                  <button
                    type="button"
                    onClick={() => onChangeFontSize(Math.max(14, fontSize - 2))}
                    className="tools-font-btn w-6 h-6 rounded-full flex items-center justify-center bg-white dark:bg-[#26262E] hover:bg-neutral-100 dark:hover:bg-[#34343E] text-xs font-bold cursor-default text-[#18181B] dark:text-white shadow-xs"
                    title="Giảm cỡ chữ"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="tools-font-text px-1.5 text-[11px] font-mono font-bold text-[#18181B] dark:text-white">
                    {fontSize}px
                  </span>
                  <button
                    type="button"
                    onClick={() => onChangeFontSize(Math.min(24, fontSize + 2))}
                    className="tools-font-btn w-6 h-6 rounded-full flex items-center justify-center bg-white dark:bg-[#26262E] hover:bg-neutral-100 dark:hover:bg-[#34343E] text-xs font-bold cursor-default text-[#18181B] dark:text-white shadow-xs"
                    title="Tăng cỡ chữ"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* 4. Export as .docx */}
              <button
                id="tool-news-export-docx"
                type="button"
                onMouseEnter={() => setHoveredItemId('tool-news-export-docx')}
                onClick={handleExportDocx}
                disabled={exportingDocx || isCurrentArticleLocked}
                className={`relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-colors text-left cursor-default group ${
                  isCurrentArticleLocked
                    ? 'opacity-40 cursor-not-allowed hover:bg-transparent'
                    : ''
                }`}
                title={isCurrentArticleLocked ? 'Bài viết đang bị khóa, hãy mở khóa để xuất .docx' : 'Xuất bài viết thành file .docx'}
              >
                {!isCurrentArticleLocked && renderHoverPill('tool-news-export-docx')}
                <div className="relative z-10 w-5 h-5 flex items-center justify-center text-[#18181B] dark:text-white shrink-0">
                  <FileDown className="w-[18px] h-[18px]" />
                </div>
                <span className="relative z-10 text-[#1F2937] dark:text-[#E5E7EB]">
                  {isCurrentArticleLocked 
                    ? 'Export as .docx (Khóa)' 
                    : exportingDocx 
                      ? 'Exporting .docx...' 
                      : 'Export as .docx'}
                </span>
              </button>
            </div>
          )}

          {/* Menu Items for LIVE TV */}
          {isLiveTV && (
            <div className="space-y-1" onMouseLeave={() => setHoveredItemId(null)}>
              {/* 1. Thêm vào / Loại bỏ yêu thích */}
              {currentChannel && (
                <button
                  id="tool-tv-toggle-favorite"
                  type="button"
                  onMouseEnter={() => setHoveredItemId('tool-tv-toggle-favorite')}
                  onClick={() => {
                    toggleFavoriteChannel(currentChannel.id);
                    showToast(isFav ? `Đã bỏ thích ${currentChannel.name}` : `Đã thêm ${currentChannel.name} vào yêu thích`);
                  }}
                  className="relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-colors text-left cursor-default group"
                >
                  {renderHoverPill('tool-tv-toggle-favorite')}
                  <div className="relative z-10 w-5 h-5 flex items-center justify-center text-[#18181B] dark:text-white shrink-0">
                    <Heart className={`w-[18px] h-[18px] ${isFav ? 'fill-current' : ''}`} />
                  </div>
                  <span className="relative z-10 text-[#1F2937] dark:text-[#E5E7EB]">
                    {isFav ? 'Loại bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
                  </span>
                </button>
              )}

              {/* 2. Mở luồng gốc */}
              {currentChannel && (
                <button
                  id="tool-tv-open-stream"
                  type="button"
                  onMouseEnter={() => setHoveredItemId('tool-tv-open-stream')}
                  onClick={() => {
                    window.open(currentChannel.streamUrl, '_blank', 'noopener,noreferrer');
                    setIsOpen(false);
                  }}
                  className="relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-colors text-left cursor-default group"
                >
                  {renderHoverPill('tool-tv-open-stream')}
                  <div className="relative z-10 w-5 h-5 flex items-center justify-center text-[#18181B] dark:text-white shrink-0">
                    <ExternalLink className="w-[18px] h-[18px]" />
                  </div>
                  <span className="relative z-10 text-[#1F2937] dark:text-[#E5E7EB]">Mở luồng gốc</span>
                </button>
              )}

              {/* 3. Thêm luồng mới */}
              <button
                id="tool-tv-add-stream"
                type="button"
                onMouseEnter={() => setHoveredItemId('tool-tv-add-stream')}
                onClick={() => {
                  setIsOpen(false);
                  onOpenAddStream();
                }}
                className="relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-colors text-left cursor-default group"
              >
                {renderHoverPill('tool-tv-add-stream')}
                <div className="relative z-10 w-5 h-5 flex items-center justify-center text-[#18181B] dark:text-white shrink-0">
                  <PlusCircle className="w-[18px] h-[18px]" />
                </div>
                <span className="relative z-10 text-[#1F2937] dark:text-[#E5E7EB]">Thêm luồng mới</span>
              </button>

              {/* 4. Nhập file m3u/m3u8 */}
              <button
                id="tool-tv-import-m3u"
                type="button"
                onMouseEnter={() => setHoveredItemId('tool-tv-import-m3u')}
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-colors text-left cursor-default group"
              >
                {renderHoverPill('tool-tv-import-m3u')}
                <div className="relative z-10 w-5 h-5 flex items-center justify-center text-[#18181B] dark:text-white shrink-0">
                  <UploadCloud className="w-[18px] h-[18px]" />
                </div>
                <span className="relative z-10 text-[#1F2937] dark:text-[#E5E7EB]">Nhập file m3u/m3u8</span>
              </button>

              {/* 5. Xuất file m3u/m3u8 */}
              <button
                id="tool-tv-export-m3u"
                type="button"
                onMouseEnter={() => setHoveredItemId('tool-tv-export-m3u')}
                onClick={handleExportM3U8}
                className="relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-colors text-left cursor-default group"
              >
                {renderHoverPill('tool-tv-export-m3u')}
                <div className="relative z-10 w-5 h-5 flex items-center justify-center text-[#18181B] dark:text-white shrink-0">
                  <DownloadCloud className="w-[18px] h-[18px]" />
                </div>
                <span className="relative z-10 text-[#1F2937] dark:text-[#E5E7EB]">Xuất file m3u/m3u8</span>
              </button>
            </div>
          )}

          {/* Quick feedback toast inside dropdown if active */}
          {copiedToast && (
            <div className="tools-toast-badge mt-2 p-2 rounded-full bg-black/10 dark:bg-white/10 text-center text-xs font-semibold text-[#18181B] dark:text-white flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>{copiedToast}</span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
};
