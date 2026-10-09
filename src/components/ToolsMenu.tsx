import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
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
  Volume2,
  Wrench
} from 'lucide-react';
import { Channel, NewsArticle } from '../types';
import { useFavorites } from '../hooks/useFavorites';
import { useSettings } from '../hooks/useSettings';
import { useRevealEffect } from '../hooks/useRevealEffect';
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

  const [copiedToast, setCopiedToast] = useState<string | null>(null);
  const [exportingDocx, setExportingDocx] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const revealProps = useRevealEffect();

  const isRelevant = true; // Always available on all pages

  const handleTriggerClick = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleToggleTools = () => {
      setIsOpen((prev) => !prev);
    };
    window.addEventListener('vplay:toggle-tools', handleToggleTools);
    return () => window.removeEventListener('vplay:toggle-tools', handleToggleTools);
  }, []);

  const { isChannelFavorite, toggleFavoriteChannel } = useFavorites();
  const isFav = currentChannel ? isChannelFavorite(currentChannel.id) : false;

  const { settings } = useSettings();

  // Determine current active section & whether Tools is relevant for this page
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
    }, 200);
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

      {/* Tools Trigger Button with Tools icon (Fluent button style) */}
      {showTrigger && (
        <button
          id="btn-top-tools-menu"
          type="button"
          disabled={!isRelevant}
          onClick={handleTriggerClick}
          className={`fluent-reveal-item w-9 h-9 rounded-md flex items-center justify-center transition-colors cursor-default relative text-neutral-800 dark:text-neutral-200 hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/5 ${
            isOpen ? 'bg-black/10 dark:bg-white/10' : ''
          }`}
          title={isRelevant ? "Công cụ & Tiện ích VNRT Online (Tools)" : "Không có công cụ khả dụng"}
          aria-label="Menu công cụ VNRT Online"
          aria-expanded={isOpen}
          {...revealProps}
        >
          <img
            src="https://static.wikia.nocookie.net/ep-deo/images/3/3c/Tools_menu.png/revision/latest?cb=20260905055712"
            alt="Tools"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/icons/copilot.png';
            }}
            className="w-5 h-5 object-contain"
          />
        </button>
      )}

      {/* Fluent Menu Flyout (Context Menu) - Zero Blur, Crisp Windows 11 Fluent 2 Design */}
      <AnimatePresence>
        {isOpen && isRelevant && (
          <motion.div
            id="vplay-tools-dropdown-card"
            initial={{ opacity: 0, y: placement === 'bottom' ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: placement === 'bottom' ? 4 : -4, scale: 0.98 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className={`${
              showTrigger
                ? (placement === 'bottom' ? 'absolute right-0 bottom-full mb-2 origin-bottom-right' : 'absolute right-0 mt-1.5 origin-top-right')
                : 'relative origin-bottom-right'
            } w-[276px] max-w-[calc(100vw-24px)] rounded-[8px] p-1.5 z-50 select-none cursor-default overflow-hidden bg-[#ffffff] dark:bg-[#2c2c2c] text-[#1b1b1b] dark:text-[#f3f3f3] border border-[#e5e5e5] dark:border-[#383838] shadow-[0_8px_18px_rgba(0,0,0,0.14),0_0_2px_rgba(0,0,0,0.10)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.40),0_0_2px_rgba(0,0,0,0.26)] ${className || ''}`}
          >
            {/* Context Menu Header */}
            <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-black/[0.08] dark:border-white/[0.08] mb-1">
              <div className="flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 text-[#0067c0] dark:text-[#60cdff]" />
                <span className="font-semibold text-xs tracking-tight text-[#1b1b1b] dark:text-[#f3f3f3]">
                  Công cụ & Tiện ích
                </span>
              </div>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-[3px] bg-black/5 dark:bg-white/10 text-neutral-600 dark:text-neutral-400">
                {isNews ? 'Tin tức' : isLiveTV ? 'Truyền hình' : 'Hệ thống'}
              </span>
            </div>

            {/* Menu Items for HOME & OTHER PAGES */}
            {isOther && (
              <div className="space-y-0.5">
                <button
                  id="tool-home-help"
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenHelp();
                  }}
                  className="fluent-reveal-item w-full h-[34px] px-2.5 rounded-[4px] flex items-center justify-between text-[13px] font-normal transition-colors text-left cursor-default text-[#1b1b1b] dark:text-[#f3f3f3] hover:bg-black/5 dark:hover:bg-white/[0.08] active:bg-black/10 dark:active:bg-white/[0.05]"
                  {...revealProps}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <BookOpen className="w-4 h-4 text-[#555555] dark:text-[#cccccc] shrink-0" />
                    <span className="truncate">Trợ giúp & Phím tắt</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">F1</span>
                </button>

                <button
                  id="tool-home-discord"
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenDiscord();
                  }}
                  className="fluent-reveal-item w-full h-[34px] px-2.5 rounded-[4px] flex items-center justify-between text-[13px] font-normal transition-colors text-left cursor-default text-[#1b1b1b] dark:text-[#f3f3f3] hover:bg-black/5 dark:hover:bg-white/[0.08] active:bg-black/10 dark:active:bg-white/[0.05]"
                  {...revealProps}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <svg className="w-4 h-4 fill-current text-[#5865F2] shrink-0" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.078.078 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    <span className="truncate">Cộng đồng Discord</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-[2px] bg-[#5865F2]/10 text-[#5865F2] font-medium">Join</span>
                </button>

                <div className="my-1 mx-1 h-[1px] bg-black/[0.08] dark:bg-white/[0.08]" />

                <button
                  id="tool-home-add-stream"
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenAddStream();
                  }}
                  className="fluent-reveal-item w-full h-[34px] px-2.5 rounded-[4px] flex items-center justify-between text-[13px] font-normal transition-colors text-left cursor-default text-[#1b1b1b] dark:text-[#f3f3f3] hover:bg-black/5 dark:hover:bg-white/[0.08] active:bg-black/10 dark:active:bg-white/[0.05]"
                  {...revealProps}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <PlusCircle className="w-4 h-4 text-[#0067c0] dark:text-[#60cdff] shrink-0" />
                    <span className="truncate">Thêm luồng mới</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">+URL</span>
                </button>

                <button
                  id="tool-home-import-m3u"
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="fluent-reveal-item w-full h-[34px] px-2.5 rounded-[4px] flex items-center justify-between text-[13px] font-normal transition-colors text-left cursor-default text-[#1b1b1b] dark:text-[#f3f3f3] hover:bg-black/5 dark:hover:bg-white/[0.08] active:bg-black/10 dark:active:bg-white/[0.05]"
                  {...revealProps}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <UploadCloud className="w-4 h-4 text-[#555555] dark:text-[#cccccc] shrink-0" />
                    <span className="truncate">Nhập danh sách phát</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">.m3u</span>
                </button>

                <button
                  id="tool-home-export-m3u"
                  type="button"
                  onClick={handleExportM3U8}
                  className="fluent-reveal-item w-full h-[34px] px-2.5 rounded-[4px] flex items-center justify-between text-[13px] font-normal transition-colors text-left cursor-default text-[#1b1b1b] dark:text-[#f3f3f3] hover:bg-black/5 dark:hover:bg-white/[0.08] active:bg-black/10 dark:active:bg-white/[0.05]"
                  {...revealProps}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <DownloadCloud className="w-4 h-4 text-[#555555] dark:text-[#cccccc] shrink-0" />
                    <span className="truncate">Xuất danh sách phát</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">.m3u8</span>
                </button>

                <div className="my-1 mx-1 h-[1px] bg-black/[0.08] dark:bg-white/[0.08]" />

                <button
                  id="tool-home-text-to-speech"
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenTextToSpeech?.(NEWS_DATA[0]);
                  }}
                  className="fluent-reveal-item w-full h-[34px] px-2.5 rounded-[4px] flex items-center justify-between text-[13px] font-normal transition-colors text-left cursor-default text-[#1b1b1b] dark:text-[#f3f3f3] hover:bg-black/5 dark:hover:bg-white/[0.08] active:bg-black/10 dark:active:bg-white/[0.05]"
                  {...revealProps}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Volume2 className="w-4 h-4 text-[#555555] dark:text-[#cccccc] shrink-0" />
                    <span className="truncate">Đọc văn bản</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">TTS</span>
                </button>
              </div>
            )}

            {/* Menu Items for NEWS */}
            {isNews && (
              <div className="space-y-0.5">
                {/* 1. Summarize News */}
                <button
                  id="tool-news-summarize"
                  type="button"
                  disabled={isCurrentArticleLocked}
                  onClick={() => {
                    if (isCurrentArticleLocked) return;
                    setIsOpen(false);
                    onOpenSummarize(currentNewsArticle);
                  }}
                  className={`fluent-reveal-item w-full h-[34px] px-2.5 rounded-[4px] flex items-center justify-between text-[13px] font-normal transition-colors text-left cursor-default ${
                    isCurrentArticleLocked 
                      ? 'opacity-40 cursor-not-allowed' 
                      : 'text-[#1b1b1b] dark:text-[#f3f3f3] hover:bg-black/5 dark:hover:bg-white/[0.08] active:bg-black/10 dark:active:bg-white/[0.05]'
                  }`}
                  title={isCurrentArticleLocked ? 'Bài viết đang bị khóa, hãy mở khóa để tóm tắt' : 'Tóm tắt nội dung bài viết bằng AI'}
                  {...revealProps}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Sparkles className="w-4 h-4 text-[#0067c0] dark:text-[#60cdff] shrink-0" />
                    <span className="truncate">
                      {isCurrentArticleLocked ? 'Tóm tắt bài viết (Khóa)' : 'Tóm tắt nội dung'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] bg-[#0067c0]/15 text-[#0067c0] dark:text-[#60cdff]">
                    AI
                  </span>
                </button>

                {/* 2. Text to speech */}
                <button
                  id="tool-news-text-to-speech"
                  type="button"
                  disabled={isCurrentArticleLocked}
                  onClick={() => {
                    if (isCurrentArticleLocked) return;
                    setIsOpen(false);
                    onOpenTextToSpeech?.(currentNewsArticle);
                  }}
                  className={`fluent-reveal-item w-full h-[34px] px-2.5 rounded-[4px] flex items-center justify-between text-[13px] font-normal transition-colors text-left cursor-default ${
                    isCurrentArticleLocked 
                      ? 'opacity-40 cursor-not-allowed' 
                      : 'text-[#1b1b1b] dark:text-[#f3f3f3] hover:bg-black/5 dark:hover:bg-white/[0.08] active:bg-black/10 dark:active:bg-white/[0.05]'
                  }`}
                  title={isCurrentArticleLocked ? 'Bài viết đang bị khóa, hãy mở khóa để nghe đọc' : 'Đọc bài viết bằng giọng AI'}
                  {...revealProps}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Volume2 className="w-4 h-4 text-[#555555] dark:text-[#cccccc] shrink-0" />
                    <span className="truncate">
                      {isCurrentArticleLocked ? 'Đọc bài viết (Khóa)' : 'Đọc bài viết'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
                    TTS
                  </span>
                </button>

                {/* 3. Find words */}
                <button
                  id="tool-news-find-words"
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenFindWords();
                  }}
                  className="fluent-reveal-item w-full h-[34px] px-2.5 rounded-[4px] flex items-center justify-between text-[13px] font-normal transition-colors text-left cursor-default text-[#1b1b1b] dark:text-[#f3f3f3] hover:bg-black/5 dark:hover:bg-white/[0.08] active:bg-black/10 dark:active:bg-white/[0.05]"
                  {...revealProps}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Search className="w-4 h-4 text-[#555555] dark:text-[#cccccc] shrink-0" />
                    <span className="truncate">Tìm từ trong bài</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">⌘F</span>
                </button>

                <div className="my-1 mx-1 h-[1px] bg-black/[0.08] dark:bg-white/[0.08]" />

                {/* 4. Font size with Fluent Number Stepper */}
                <div 
                  id="tool-news-font-size"
                  className="fluent-reveal-item w-full h-[34px] px-2.5 rounded-[4px] flex items-center justify-between text-[13px] font-normal text-[#1b1b1b] dark:text-[#f3f3f3] cursor-default"
                  {...revealProps}
                >
                  <div className="flex items-center gap-2.5">
                    <Type className="w-4 h-4 text-[#555555] dark:text-[#cccccc] shrink-0" />
                    <span>Cỡ chữ đọc</span>
                  </div>
                  <div className="flex items-center rounded-[4px] border border-black/15 dark:border-white/15 bg-black/5 dark:bg-white/5 h-6">
                    <button
                      type="button"
                      onClick={() => onChangeFontSize(Math.max(14, fontSize - 2))}
                      className="w-6 h-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 rounded-l-[3px] text-xs transition-colors cursor-default"
                      title="Giảm cỡ chữ"
                    >
                      <Minus className="w-3 h-3 text-[#1b1b1b] dark:text-[#f3f3f3]" />
                    </button>
                    <span className="px-1.5 text-[11px] font-mono font-medium text-center min-w-[32px] text-[#1b1b1b] dark:text-[#f3f3f3]">
                      {fontSize}px
                    </span>
                    <button
                      type="button"
                      onClick={() => onChangeFontSize(Math.min(24, fontSize + 2))}
                      className="w-6 h-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 rounded-r-[3px] text-xs transition-colors cursor-default"
                      title="Tăng cỡ chữ"
                    >
                      <Plus className="w-3 h-3 text-[#1b1b1b] dark:text-[#f3f3f3]" />
                    </button>
                  </div>
                </div>

                {/* 5. Export as .docx */}
                <button
                  id="tool-news-export-docx"
                  type="button"
                  onClick={handleExportDocx}
                  disabled={exportingDocx || isCurrentArticleLocked}
                  className={`fluent-reveal-item w-full h-[34px] px-2.5 rounded-[4px] flex items-center justify-between text-[13px] font-normal transition-colors text-left cursor-default ${
                    isCurrentArticleLocked
                      ? 'opacity-40 cursor-not-allowed'
                      : 'text-[#1b1b1b] dark:text-[#f3f3f3] hover:bg-black/5 dark:hover:bg-white/[0.08] active:bg-black/10 dark:active:bg-white/[0.05]'
                  }`}
                  title={isCurrentArticleLocked ? 'Bài viết đang bị khóa, hãy mở khóa để xuất .docx' : 'Xuất bài viết thành file .docx'}
                  {...revealProps}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileDown className="w-4 h-4 text-[#555555] dark:text-[#cccccc] shrink-0" />
                    <span className="truncate">
                      {isCurrentArticleLocked 
                        ? 'Xuất .docx (Khóa)' 
                        : exportingDocx 
                          ? 'Đang xuất .docx...' 
                          : 'Xuất file Word'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">.docx</span>
                </button>
              </div>
            )}

            {/* Menu Items for LIVE TV */}
            {isLiveTV && (
              <div className="space-y-0.5">
                {/* 1. Thêm vào / Loại bỏ yêu thích */}
                {currentChannel && (
                  <button
                    id="tool-tv-toggle-favorite"
                    type="button"
                    onClick={() => {
                      toggleFavoriteChannel(currentChannel.id);
                      showToast(isFav ? `Đã bỏ thích ${currentChannel.name}` : `Đã thêm ${currentChannel.name} vào yêu thích`);
                    }}
                    className="fluent-reveal-item w-full h-[34px] px-2.5 rounded-[4px] flex items-center justify-between text-[13px] font-normal transition-colors text-left cursor-default text-[#1b1b1b] dark:text-[#f3f3f3] hover:bg-black/5 dark:hover:bg-white/[0.08] active:bg-black/10 dark:active:bg-white/[0.05]"
                    {...revealProps}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Heart className={`w-4 h-4 ${isFav ? 'text-[#e81123] fill-current' : 'text-[#555555] dark:text-[#cccccc]'}`} />
                      <span className="truncate">
                        {isFav ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
                      </span>
                    </div>
                    {isFav && <span className="text-[10px] text-[#e81123] font-medium">★</span>}
                  </button>
                )}

                {/* 2. Mở luồng gốc */}
                {currentChannel && (
                  <button
                    id="tool-tv-open-stream"
                    type="button"
                    onClick={() => {
                      window.open(currentChannel.streamUrl, '_blank', 'noopener,noreferrer');
                      setIsOpen(false);
                    }}
                    className="fluent-reveal-item w-full h-[34px] px-2.5 rounded-[4px] flex items-center justify-between text-[13px] font-normal transition-colors text-left cursor-default text-[#1b1b1b] dark:text-[#f3f3f3] hover:bg-black/5 dark:hover:bg-white/[0.08] active:bg-black/10 dark:active:bg-white/[0.05]"
                    {...revealProps}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <ExternalLink className="w-4 h-4 text-[#555555] dark:text-[#cccccc] shrink-0" />
                      <span className="truncate">Mở luồng phát gốc</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">M3U8</span>
                  </button>
                )}

                <div className="my-1 mx-1 h-[1px] bg-black/[0.08] dark:bg-white/[0.08]" />

                {/* 3. Thêm luồng mới */}
                <button
                  id="tool-tv-add-stream"
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenAddStream();
                  }}
                  className="fluent-reveal-item w-full h-[34px] px-2.5 rounded-[4px] flex items-center justify-between text-[13px] font-normal transition-colors text-left cursor-default text-[#1b1b1b] dark:text-[#f3f3f3] hover:bg-black/5 dark:hover:bg-white/[0.08] active:bg-black/10 dark:active:bg-white/[0.05]"
                  {...revealProps}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <PlusCircle className="w-4 h-4 text-[#0067c0] dark:text-[#60cdff] shrink-0" />
                    <span className="truncate">Thêm kênh mới</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">+URL</span>
                </button>

                {/* 4. Nhập file m3u/m3u8 */}
                <button
                  id="tool-tv-import-m3u"
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="fluent-reveal-item w-full h-[34px] px-2.5 rounded-[4px] flex items-center justify-between text-[13px] font-normal transition-colors text-left cursor-default text-[#1b1b1b] dark:text-[#f3f3f3] hover:bg-black/5 dark:hover:bg-white/[0.08] active:bg-black/10 dark:active:bg-white/[0.05]"
                  {...revealProps}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <UploadCloud className="w-4 h-4 text-[#555555] dark:text-[#cccccc] shrink-0" />
                    <span className="truncate">Nhập danh sách (.m3u)</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">Import</span>
                </button>

                {/* 5. Xuất file m3u/m3u8 */}
                <button
                  id="tool-tv-export-m3u"
                  type="button"
                  onClick={handleExportM3U8}
                  className="fluent-reveal-item w-full h-[34px] px-2.5 rounded-[4px] flex items-center justify-between text-[13px] font-normal transition-colors text-left cursor-default text-[#1b1b1b] dark:text-[#f3f3f3] hover:bg-black/5 dark:hover:bg-white/[0.08] active:bg-black/10 dark:active:bg-white/[0.05]"
                  {...revealProps}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <DownloadCloud className="w-4 h-4 text-[#555555] dark:text-[#cccccc] shrink-0" />
                    <span className="truncate">Xuất danh sách (.m3u)</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">Export</span>
                </button>
              </div>
            )}

            {/* Quick feedback toast inside flyout */}
            {copiedToast && (
              <div className="mt-1.5 p-1.5 rounded-[4px] bg-[#0067c0]/15 border border-[#0067c0]/30 text-center text-xs font-medium text-[#0067c0] dark:text-[#60cdff] flex items-center justify-center gap-1.5">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{copiedToast}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
