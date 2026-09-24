import React, { useState, useRef, useEffect } from 'react';
import { 
  Palette, 
  Key, 
  Search, 
  Type, 
  X,
  Sparkles,
  Sliders,
  Mic,
  MicOff,
  Wrench,
  FlaskConical,
  Keyboard,
  RotateCcw,
  AlertCircle,
  Info,
  Tv,
  Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings, FONT_SCALE_CONFIG, SystemSettings } from '../hooks/useSettings';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { WelcomeModal } from '../components/WelcomeModal';
import { SfCheckmark } from '../components/SfCheckmark';
import { KEYBIND_DEFINITIONS, DEFAULT_KEYBINDS, eventToKeyString, validateKeybind } from '../utils/keybinds';
import { KeybindAction } from '../types';

interface SettingsProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  searchQuery: externalSearchQuery,
  onSearchChange: externalOnSearchChange
}) => {
  const { 
    settings, 
    draftSettings, 
    hasChanges, 
    changedKeys, 
    updateDraftSetting, 
    applyDraftSettings 
  } = useSettings();

  const [showApplyToast, setShowApplyToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [internalSearchQuery, setInternalSearchQuery] = useState('');

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = (q: string) => {
    setInternalSearchQuery(q);
    externalOnSearchChange?.(q);
  };

  const [isFocused, setIsFocused] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [editingKeybindId, setEditingKeybindId] = useState<KeybindAction | null>(null);
  const [keybindError, setKeybindError] = useState<{ id: KeybindAction; message: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateDraft = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    updateDraftSetting(key, value);
    if (key === 'superDarkMode') {
      if (value) {
        document.documentElement.classList.add('super-dark');
        document.body?.classList.add('super-dark');
      } else {
        document.documentElement.classList.remove('super-dark');
        document.body?.classList.remove('super-dark');
      }
    }
    if (key === 'disableShinyOutline') {
      if (value) {
        document.documentElement.classList.add('no-shiny-outline');
        document.body?.classList.add('no-shiny-outline');
      } else {
        document.documentElement.classList.remove('no-shiny-outline');
        document.body?.classList.remove('no-shiny-outline');
      }
    }
  };

  const handleApplySettings = () => {
    if (!hasChanges) {
      setToastMessage('Tất cả cài đặt đã được áp dụng');
      setShowApplyToast(true);
      setTimeout(() => setShowApplyToast(false), 2200);
      return;
    }

    applyDraftSettings();
    setToastMessage(`Đã áp dụng ${changedKeys.length} thay đổi cài đặt!`);
    setShowApplyToast(true);
    setTimeout(() => setShowApplyToast(false), 2600);
  };

  useEffect(() => {
    const handleAppliedEvent = () => {
      setToastMessage('Đã áp dụng các thay đổi cài đặt thành công!');
      setShowApplyToast(true);
      setTimeout(() => setShowApplyToast(false), 2600);
    };
    window.addEventListener('settings-applied-toast', handleAppliedEvent);
    return () => window.removeEventListener('settings-applied-toast', handleAppliedEvent);
  }, []);

  const {
    isListening,
    toggleListening
  } = useVoiceSearch((transcript) => {
    setSearchQuery(transcript);
    setIsFocused(true);
    inputRef.current?.focus();
  });

  const matchesSearch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase().trim());
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 pt-2 select-none">
      {/* 1. Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Cài đặt
        </h1>
        <p className="text-xs sm:text-sm text-[#9CA3AF]">
          Quản lý giao diện, trợ năng và tiện ích hệ thống.
        </p>

        {/* Search Header - Hidden when Floaty Search Box option is enabled */}
        {!draftSettings.floatingSearchBar && (
          <div className="pt-2">
            {/* Search Bar Capsule styled with channel card border */}
            <div 
              id="settings-search-container"
              onClick={() => {
                setIsFocused(true);
                inputRef.current?.focus();
              }}
              className="relative w-full h-[48px] flex items-center px-4 rounded-full bg-white/15 backdrop-blur-md text-sm transition-all shadow-lg overflow-hidden cursor-text select-none"
            >
              <motion.div 
                animate={{
                  x: isFocused || searchQuery ? 0 : 'calc(50% - 75px)',
                }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 28,
                  mass: 0.8
                }}
                className={`flex items-center gap-2.5 w-full ${isFocused || isListening ? 'pr-16' : 'pr-8'}`}
              >
                <Search className="w-5 h-5 text-[#9CA3AF] shrink-0" />
                <input
                  ref={inputRef}
                  id="settings-search-input"
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => {
                    if (!searchQuery && !isListening) setIsFocused(false);
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isListening ? "Đang nghe giọng nói..." : "Tìm kiếm cài đặt"}
                  className="w-full bg-transparent text-white placeholder-[#9CA3AF] text-sm focus:outline-none font-medium truncate text-left"
                />
              </motion.div>

              {/* Right Side Actions: Clear & Voice Search Mic (visible when focused/active) */}
              <div className="absolute right-2.5 flex items-center gap-1 shrink-0 overflow-visible">
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button 
                      type="button"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.15 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery('');
                        setIsFocused(true);
                        inputRef.current?.focus();
                      }}
                      className="p-1 rounded-full text-[#8E8E93] hover:text-white transition-colors cursor-default"
                      title="Xóa tìm kiếm"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  )}

                  {(isFocused || isListening) && (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, x: 24, scale: 0.85 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 24, scale: 0.85 }}
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
                      className={`w-7 h-7 rounded-full transition-all cursor-default flex items-center justify-center shrink-0 ${
                        isListening
                          ? 'bg-[#fd932f] shadow-[0_0_14px_rgba(253,147,47,0.8)] scale-105 animate-pulse'
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
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 1. Section: Giới thiệu phiên bản */}
      {(matchesSearch('Giới thiệu phiên bản') ||
        matchesSearch('Phiên bản') ||
        matchesSearch('Giới thiệu') ||
        matchesSearch('Software') ||
        matchesSearch('Software Build') ||
        matchesSearch('Software Update') ||
        matchesSearch('Build') ||
        matchesSearch('Update') ||
        matchesSearch('Compatible') ||
        matchesSearch('Spatial Glass') ||
        matchesSearch('26.10.0') ||
        matchesSearch('26W1002a')) && (
        <section 
          id="settings-section-version"
          className="p-5 sm:p-6 rounded-[28px] bg-white/10 backdrop-blur-md shadow-xl space-y-4"
        >
          {/* Section Header */}
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-white shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Giới thiệu phiên bản
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
                Thông tin bản cập nhật, bản dựng phần mềm và độ tương thích hệ thống.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-[20px] bg-white/5 space-y-3.5 select-text">
            <div className="flex items-center justify-between text-sm sm:text-[15px]">
              <span className="font-medium text-white">Software Update</span>
              <span className="font-semibold text-[#9CA3AF]">26.10.0</span>
            </div>
            <div className="flex items-center justify-between text-sm sm:text-[15px]">
              <span className="font-medium text-white">Software Build</span>
              <span className="font-semibold text-[#9CA3AF]">26W1002a</span>
            </div>
            {/* Dòng chữ to dưới Software Build: Compatible with Spatial Glass */}
            <div id="settings-compatible-spatial-glass" className="pt-3 mt-1 border-t border-white/10 flex items-center">
              <p className="text-base sm:text-lg font-bold tracking-tight text-white">
                Compatible with{' '}
                <span className="bg-gradient-to-r from-[#FF8A00] via-[#FF0A54] to-[#E6005A] bg-clip-text text-transparent font-bold drop-shadow-[0_0_12px_rgba(230,0,90,0.35)]">
                  Spatial Glass.
                </span>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 2. Section: Spatial Glass (Dedicated category with Box / Cube icon) */}
      {(matchesSearch('Spatial Glass') ||
        matchesSearch('spatial') ||
        matchesSearch('glass') ||
        matchesSearch('viền') ||
        matchesSearch('outline') ||
        matchesSearch('shiny') ||
        matchesSearch('Độ trong suốt') ||
        matchesSearch('trong suốt') ||
        matchesSearch('opacity') ||
        matchesSearch('Độ mờ') ||
        matchesSearch('mờ') ||
        matchesSearch('blur') ||
        matchesSearch('Liquid Glass')) && (
        <section 
          id="settings-section-spatial-glass"
          className="p-5 sm:p-6 rounded-[28px] bg-white/10 backdrop-blur-md shadow-xl space-y-4"
        >
          {/* Section Header with Box / Cube Icon */}
          <div className="flex items-start gap-3">
            <Box className="w-5 h-5 text-white shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Spatial Glass
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
                Tùy chỉnh hiệu ứng kính không gian, độ trong suốt và độ mờ thị giác.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-1 select-none">
            {/* 1. Spatial Glass Master Toggle */}
            <div 
              id="setting-spatial-glass"
              className="p-3.5 sm:p-4 rounded-[20px] flex items-center justify-between gap-4 transition-colors hover:bg-white/5"
            >
              <div className="flex-1 min-w-0 pr-2">
                <div className="font-bold text-white text-sm">
                  <span className="bg-gradient-to-r from-[#FF8A00] via-[#FF0A54] to-[#E6005A] bg-clip-text text-transparent font-bold">
                    Spatial Glass
                  </span>
                </div>
                <div className="text-xs text-[#9CA3AF] mt-1 leading-normal">
                  Ngôn ngữ thiết kế giao diện người dùng mới dựa trên Liquid Glass của Apple, mô phỏng hiệu ứng kính mờ trong suốt, có khả năng khúc xạ ánh sáng, tạo chiều sâu thị giác và chuyển động linh hoạt theo thao tác cử chỉ của người dùng.
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                id="toggle-spatial-glass"
                type="button"
                role="switch"
                aria-checked={draftSettings.spatialGlass}
                onClick={() => updateDraft('spatialGlass', !draftSettings.spatialGlass)}
                className={`toggle-switch-btn relative w-[66px] h-7 rounded-full p-[3px] transition-colors duration-200 ease-in-out cursor-default shrink-0 flex items-center ${
                  draftSettings.spatialGlass ? 'bg-[#fd932f]' : 'bg-[#E4E4E7] dark:bg-[#3F3F46]'
                }`}
                title="Bật/Tắt Spatial Glass"
              >
                <span
                  className="toggle-switch-thumb block w-[32px] h-[22px] rounded-full bg-white border border-black/10 dark:border-white/10 shadow-md pointer-events-none"
                />
              </button>
            </div>

            {/* 2. Slider: Độ trong suốt (Opacity) */}
            <div 
              id="setting-spatial-glass-opacity"
              className={`p-3.5 sm:p-4 rounded-[20px] space-y-3 transition-opacity duration-200 ${
                !draftSettings.spatialGlass ? 'opacity-40 pointer-events-none' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">
                    Độ trong suốt (Opacity)
                  </div>
                  <div className="text-xs text-[#9CA3AF] mt-1 leading-normal">
                    Điều chỉnh độ trong suốt từ 0% đến 100%. Khi trên 40%, biểu tượng và chữ trên thanh điều hướng nổi và ô tìm kiếm sẽ tự động chuyển sang màu đen để đảm bảo độ tương phản.
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-[#fd932f] px-2.5 py-1 rounded-full bg-white/10 shrink-0 ml-2">
                  {draftSettings.spatialGlassOpacity ?? 20}%
                </span>
              </div>

              {/* Slider Container */}
              <div className="pt-1">
                <div className="group relative w-full h-10 flex items-center px-1 transition-all settings-slider-capsule select-none">
                  <input
                    id="slider-spatial-glass-opacity"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={draftSettings.spatialGlassOpacity ?? 20}
                    onChange={(e) => updateDraft('spatialGlassOpacity', parseInt(e.target.value, 10))}
                    className="absolute left-1 right-1 top-0 bottom-0 opacity-0 cursor-default z-20"
                    aria-label="Độ trong suốt (Opacity)"
                  />
                  <div className="relative w-full h-2 rounded-full bg-[#383842] overflow-visible pointer-events-none">
                    <div 
                      className="absolute left-0 top-0 h-full rounded-full bg-[#fd932f] transition-all duration-75 ease-out"
                      style={{ width: `${draftSettings.spatialGlassOpacity ?? 20}%` }}
                    />
                    <div 
                      id="settings-slider-thumb-opacity"
                      className="settings-slider-thumb absolute w-11 h-6 rounded-full bg-white border border-black/10 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.25)] pointer-events-none flex items-center justify-center"
                      style={{ 
                        left: `${draftSettings.spatialGlassOpacity ?? 20}%`,
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-[#6B7280] px-1 pt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* 3. Slider: Độ mờ (Blur) */}
            <div 
              id="setting-spatial-glass-blur"
              className={`p-3.5 sm:p-4 rounded-[20px] space-y-3 transition-opacity duration-200 ${
                !draftSettings.spatialGlass ? 'opacity-40 pointer-events-none' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">
                    Độ mờ (Blur)
                  </div>
                  <div className="text-xs text-[#9CA3AF] mt-1 leading-normal">
                    Điều chỉnh độ nhòe mờ phông nền (backdrop blur) từ 0% đến 100% cho nút, tabs, thanh điều hướng nổi và ô tìm kiếm.
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-[#fd932f] px-2.5 py-1 rounded-full bg-white/10 shrink-0 ml-2">
                  {draftSettings.spatialGlassBlur ?? 10}%
                </span>
              </div>

              {/* Slider Container */}
              <div className="pt-1">
                <div className="group relative w-full h-10 flex items-center px-1 transition-all settings-slider-capsule select-none">
                  <input
                    id="slider-spatial-glass-blur"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={draftSettings.spatialGlassBlur ?? 10}
                    onChange={(e) => updateDraft('spatialGlassBlur', parseInt(e.target.value, 10))}
                    className="absolute left-1 right-1 top-0 bottom-0 opacity-0 cursor-default z-20"
                    aria-label="Độ mờ (Blur)"
                  />
                  <div className="relative w-full h-2 rounded-full bg-[#383842] overflow-visible pointer-events-none">
                    <div 
                      className="absolute left-0 top-0 h-full rounded-full bg-[#fd932f] transition-all duration-75 ease-out"
                      style={{ width: `${draftSettings.spatialGlassBlur ?? 10}%` }}
                    />
                    <div 
                      id="settings-slider-thumb-blur"
                      className="settings-slider-thumb absolute w-11 h-6 rounded-full bg-white border border-black/10 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.25)] pointer-events-none flex items-center justify-center"
                      style={{ 
                        left: `${draftSettings.spatialGlassBlur ?? 10}%`,
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-[#6B7280] px-1 pt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Section: Giao diện */}
      {(matchesSearch('Giao diện') ||
        matchesSearch('Chế độ giao diện') ||
        matchesSearch('Sáng') ||
        matchesSearch('Tối') ||
        matchesSearch('Theme') ||
        matchesSearch('Thu phóng giao diện') ||
        matchesSearch('Cỡ chữ ứng dụng') ||
        matchesSearch('Cỡ chữ') ||
        matchesSearch('Immersive sidebar') ||
        matchesSearch('Thanh điều hướng') ||
        matchesSearch('Sidebar') ||
        matchesSearch('Immersive') ||
        matchesSearch('Floaty bar') ||
        matchesSearch('Sidebar position') ||
        matchesSearch('thanh bên') ||
        matchesSearch('trái') ||
        matchesSearch('phải') ||
        matchesSearch('OLED Dark') ||
        matchesSearch('Super Dark Mode') ||
        matchesSearch('Super Dark') ||
        matchesSearch('Thanh tìm kiếm nổi') ||
        matchesSearch('Floaty Search Box') ||
        matchesSearch('Floating Search Bar')) && (
        <section 
          id="settings-section-interface"
          className="p-5 sm:p-6 rounded-[28px] bg-white/10 backdrop-blur-md shadow-xl space-y-4"
        >
          {/* Section Header without background container on icon */}
          <div className="flex items-start gap-3">
            <Palette className="w-5 h-5 text-white shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Giao diện
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
                Tùy biến chế độ sáng/tối và tỷ lệ cỡ chữ toàn hệ thống.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {/* 1. Thanh điều hướng */}
            {(matchesSearch('Thanh điều hướng') || matchesSearch('Top Bar') || matchesSearch('Giao diện Top Bar')) && (
              <div className="p-3 sm:p-4 rounded-[20px] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div>
                    <div className="font-bold text-white text-sm">Thanh điều hướng</div>
                    <div className="text-xs text-[#9CA3AF] mt-1 leading-normal">Lựa chọn kiểu điều hướng của ứng dụng.</div>
                  </div>
                  {draftSettings.navigationMode === 'topbar' && (
                    <span className="inline-flex items-center text-[11px] font-medium text-[#fd932f] bg-[#fd932f]/10 px-2 py-0.5 rounded-full self-start sm:self-auto">
                      Progressive Blur Top Bar
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 rounded-full bg-[#18181b]/80 border border-white/10 p-1.5 backdrop-blur-md" role="group" aria-label="Thanh điều hướng">
                  {([
                    ['sidebar', 'Sidebar'],
                    ['topbar', 'Top bar'],
                    ['floaty', 'Floaty bar'],
                    ['immersive_floaty', 'Immersive Floaty'],
                  ] as const).map(([value, label]) => (
                    <button 
                      key={value} 
                      type="button" 
                      onClick={() => { 
                        updateDraft('navigationMode', value); 
                        updateDraft('immersiveSidebar', false); 
                      }} 
                      className={`rounded-full px-3 py-2 text-xs font-semibold transition-all cursor-default text-center truncate ${
                        draftSettings.navigationMode === value
                          ? 'bg-[#fd932f] text-white shadow-[0_2px_10px_rgba(253,147,47,0.35)]'
                          : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                      }`} 
                      aria-pressed={draftSettings.navigationMode === value}
                      title={label}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {draftSettings.navigationMode === 'topbar' && (
                  <p className="text-[12px] text-[#9CA3AF] leading-relaxed pt-1">
                    Giao diện Top Bar sẽ đưa thanh điều khiển và điều hướng (Logo trang chủ, Truyền hình, News và các công cụ, icon cài đặt) lên thanh Progressive Blur trên cùng màn hình.
                  </p>
                )}
              </div>
            )}

            {/* 3. Thu phóng giao diện (trước là Cỡ chữ ứng dụng) */}
            {(matchesSearch('Thu phóng giao diện') || matchesSearch('Cỡ chữ ứng dụng') || matchesSearch('Cỡ chữ')) && (
              <div className="p-3 sm:p-4 rounded-[20px] space-y-4">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Type className="w-4.5 h-4.5 text-[#9CA3AF]" />
                      <span className="font-bold text-white text-sm">
                        Thu phóng giao diện
                      </span>
                    </div>
                    <div className="text-xs text-[#9CA3AF] mt-1 leading-normal">
                      Tùy chỉnh kích cỡ giao diện ứng dụng để phù hợp với thiết bị của bạn.
                    </div>
                  </div>
                </div>

                {/* Slider Container (No background) */}
                <div className="pt-1">
                  <div className="group relative w-full h-10 flex items-center px-1 transition-all settings-slider-capsule select-none">
                    {/* Native Range Input (Transparent Overlay for Smooth Drag & Touch) */}
                    <input
                      id="slider-font-scale"
                      type="range"
                      min="0"
                      max={FONT_SCALE_CONFIG.length - 1}
                      step="1"
                      value={draftSettings.fontScale}
                      onChange={(e) => updateDraft('fontScale', parseInt(e.target.value, 10))}
                      className="absolute left-1 right-1 top-0 bottom-0 opacity-0 cursor-default z-20"
                      aria-label="Thu phóng giao diện"
                    />

                    {/* Track Background */}
                    <div className="relative w-full h-2 rounded-full bg-[#383842] dark:bg-[#383842] overflow-visible pointer-events-none">
                      {/* Active Magenta Track */}
                      <div 
                        className="absolute left-0 top-0 h-full rounded-full bg-[#fd932f] transition-all duration-150 ease-out"
                        style={{ width: `${(draftSettings.fontScale / (FONT_SCALE_CONFIG.length - 1)) * 100}%` }}
                      />
                      
                      {/* White Pill Thumb Handle with Normal Border & No Dash */}
                      <div 
                        id="settings-slider-thumb"
                        className="settings-slider-thumb absolute w-11 h-6 rounded-full bg-white border border-black/10 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.25)] pointer-events-none flex items-center justify-center"
                        style={{ 
                          left: `${(draftSettings.fontScale / (FONT_SCALE_CONFIG.length - 1)) * 100}%`,
                          top: '50%',
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Step Labels */}
                  <div className="relative flex items-center justify-between text-[11px] pt-3 px-1 sm:px-2">
                    {FONT_SCALE_CONFIG.map((item, idx) => {
                      const isSelected = draftSettings.fontScale === idx;
                      let alignClass = 'text-center';
                      if (idx === 0) alignClass = 'text-left';
                      else if (idx === FONT_SCALE_CONFIG.length - 1) alignClass = 'text-right';
                      return (
                        <button
                          key={item.label}
                          type="button"
                          id={`btn-font-scale-${idx}`}
                          onClick={() => updateDraft('fontScale', idx)}
                          className={`cursor-default transition-colors py-1 ${alignClass} ${
                            isSelected
                              ? 'text-[#fd932f] font-bold text-xs'
                              : 'text-[#6B7280] hover:text-[#9CA3AF]'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 4. Vị trí thanh bên (nếu dùng chế độ Sidebar) */}
            {draftSettings.navigationMode === 'sidebar' && (matchesSearch('Sidebar position') || matchesSearch('Vị trí sidebar') || matchesSearch('thanh bên') || matchesSearch('trái') || matchesSearch('phải')) && (
              <div
                id="setting-sidebar-position"
                className="p-3 sm:p-4 rounded-[20px] space-y-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-white text-sm">Vị trí thanh bên (Sidebar position)</div>
                    <div className="text-xs text-[#9CA3AF] mt-1 leading-normal">Chọn vị trí hiển thị thanh bên trái hoặc phải.</div>
                  </div>
                  <div className="flex rounded-full bg-[#1E1D24] p-1 shrink-0" role="group" aria-label="Sidebar position">
                    {(['left', 'right'] as const).map((position) => (
                      <button
                        key={position}
                        type="button"
                        onClick={() => updateDraft('sidebarPosition', position)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-default ${
                          draftSettings.sidebarPosition === position ? 'bg-[#fd932f] text-white' : 'text-[#9CA3AF] hover:text-white'
                        }`}
                      >
                        {position === 'left' ? 'Trái' : 'Phải'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. OLED Dark (trước là Super Dark Mode) */}
            {(matchesSearch('OLED Dark') || matchesSearch('Super Dark Mode') || matchesSearch('Super Dark') || matchesSearch('Tối') || matchesSearch('Giao diện')) && (
              <div 
                id="setting-super-dark-mode"
                className="p-3.5 sm:p-4 rounded-[20px] flex items-center justify-between gap-4 transition-colors hover:bg-white/5"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      OLED Dark
                    </span>
                    {draftSettings.superDarkMode && (
                      <span className="inline-flex items-center text-[10px] font-semibold text-white bg-black/80 border border-white/20 px-2 py-0.5 rounded-full">
                        True Black OLED
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#9CA3AF] mt-1 leading-normal">
                    Chế độ tối... nhưng tối hơn.
                  </div>
                </div>

                {/* Magenta Toggle Switch */}
                <button
                  id="toggle-super-dark-mode"
                  type="button"
                  role="switch"
                  aria-checked={draftSettings.superDarkMode}
                  onClick={() => updateDraft('superDarkMode', !draftSettings.superDarkMode)}
                  className={`toggle-switch-btn relative w-[66px] h-7 rounded-full p-[3px] transition-colors duration-200 ease-in-out cursor-default shrink-0 flex items-center ${
                    draftSettings.superDarkMode ? 'bg-[#fd932f]' : 'bg-[#E4E4E7] dark:bg-[#3F3F46]'
                  }`}
                  title="Bật/Tắt OLED Dark"
                >
                  <span
                    className="toggle-switch-thumb block w-[32px] h-[22px] rounded-full bg-white border border-black/10 dark:border-white/10 shadow-md pointer-events-none"
                  />
                </button>
              </div>
            )}

            {/* 6. Thanh tìm kiếm nổi (trước là Floaty Search Box) */}
            {(matchesSearch('Thanh tìm kiếm nổi') || matchesSearch('Floaty Search Box') || matchesSearch('Floating Search Bar') || matchesSearch('Giao diện') || matchesSearch('Tìm kiếm')) && (
              <div 
                id="setting-floating-search-bar"
                className="p-3.5 sm:p-4 rounded-[20px] flex items-center justify-between gap-4 transition-colors hover:bg-white/5"
              >
                <div>
                  <div className="font-bold text-white text-sm">
                    Thanh tìm kiếm nổi
                  </div>
                  <div className="text-xs text-[#9CA3AF] mt-1 leading-normal">
                    Hiển thị thanh tìm kiếm nổi dưới màn hình để tìm kiếm nhanh bất cứ lúc nào.
                  </div>
                </div>

                {/* Magenta Toggle Switch */}
                <button
                  id="toggle-floating-search-bar"
                  type="button"
                  role="switch"
                  aria-checked={draftSettings.floatingSearchBar}
                  onClick={() => updateDraft('floatingSearchBar', !draftSettings.floatingSearchBar)}
                  className={`toggle-switch-btn relative w-[66px] h-7 rounded-full p-[3px] transition-colors duration-200 ease-in-out cursor-default shrink-0 flex items-center ${
                    draftSettings.floatingSearchBar ? 'bg-[#fd932f]' : 'bg-[#E4E4E7] dark:bg-[#3F3F46]'
                  }`}
                  title="Bật/Tắt Thanh tìm kiếm nổi"
                >
                  <span
                    className="toggle-switch-thumb block w-[32px] h-[22px] rounded-full bg-white border border-black/10 dark:border-white/10 shadow-md pointer-events-none"
                  />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. Section 2: Trợ năng */}
      {(matchesSearch('Trợ năng') ||
        matchesSearch('Tỉ lệ khung hình') ||
        matchesSearch('Tỉ lệ luồng') ||
        matchesSearch('16:9') ||
        matchesSearch('4:3') ||
        matchesSearch('4.3') ||
        matchesSearch('chuẩn vuông') ||
        matchesSearch('chuẩn rộng') ||
        matchesSearch('squish') ||
        matchesSearch('truyền hình') ||
        matchesSearch('resolution') ||
        matchesSearch('Tự động ẩn Sidebar')) && (
        <section 
          id="settings-section-accessibility"
          className="p-5 sm:p-6 rounded-[28px] bg-white/10 backdrop-blur-md shadow-xl space-y-4"
        >
          {/* Section Header without background container on icon */}
          <div className="flex items-start gap-3">
            <Key className="w-5 h-5 text-white shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Trợ năng
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
                Điều chỉnh tương tác hiển thị và thanh điều hướng.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {/* 1. Tỉ lệ khung hình (Chuyển vào cài đặt trợ năng) */}
            {(matchesSearch('Tỉ lệ khung hình') || matchesSearch('Tỉ lệ luồng') || matchesSearch('16:9') || matchesSearch('4:3') || matchesSearch('4.3') || matchesSearch('chuẩn vuông') || matchesSearch('chuẩn rộng') || matchesSearch('squish') || matchesSearch('truyền hình') || matchesSearch('resolution') || matchesSearch('Trợ năng')) && (
              <div className="p-3 sm:p-4 rounded-[20px] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tv className="w-4.5 h-4.5 text-[#9CA3AF]" />
                    <span className="font-bold text-white text-sm">
                      Tỉ lệ khung hình
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#fd932f] font-mono">
                    {draftSettings.streamAspectRatio === '4:3' ? '4.3 (chuẩn vuông)' : '16:9 (chuẩn rộng)'}
                  </span>
                </div>
                <div className="text-xs text-[#9CA3AF] leading-relaxed">
                  Chuyển đổi tỉ lệ khung hình khi xem giữa 4:3 hoặc 16:9.
                </div>
                <div className="grid grid-cols-2 gap-1.5 rounded-full bg-[#18181b]/80 border border-white/10 p-1.5 backdrop-blur-md pt-1">
                  {[
                    { value: '16:9', label: '16:9 (chuẩn rộng)' },
                    { value: '4:3', label: '4.3 (chuẩn vuông)' },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      id={`btn-aspect-${value.replace(':', '-')}`}
                      onClick={() => updateDraft('streamAspectRatio', value as '16:9' | '4:3')}
                      className={`h-9 sm:h-10 rounded-full font-semibold text-xs sm:text-sm transition-all cursor-default flex items-center justify-center ${
                        draftSettings.streamAspectRatio === value
                          ? 'bg-[#fd932f] text-white shadow-[0_2px_10px_rgba(253,147,47,0.35)]'
                          : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                      }`}
                      aria-pressed={draftSettings.streamAspectRatio === value}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Card: Tự động ẩn Sidebar (No Border) */}
            {matchesSearch('Tự động ẩn Sidebar') && (
              <div className="p-3.5 sm:p-4 rounded-[20px] flex items-center justify-between gap-4 transition-colors hover:bg-white/5">
                <div>
                  <div className="font-bold text-white text-sm">
                    Tự động ẩn Sidebar
                  </div>
                  <div className="text-xs text-[#9CA3AF] mt-1 leading-normal">
                    Tự động thu gọn thanh menu khi không di chuột vào.
                  </div>
                </div>

                {/* Magenta Toggle Switch */}
                <button
                  id="toggle-autohide-sidebar"
                  type="button"
                  role="switch"
                  aria-checked={draftSettings.autoHideSidebar}
                  onClick={() => updateDraft('autoHideSidebar', !draftSettings.autoHideSidebar)}
                  className={`toggle-switch-btn relative w-[66px] h-7 rounded-full p-[3px] transition-colors duration-200 ease-in-out cursor-default shrink-0 flex items-center ${
                    draftSettings.autoHideSidebar ? 'bg-[#fd932f]' : 'bg-[#E4E4E7] dark:bg-[#3F3F46]'
                  }`}
                >
                  <span
                    className="toggle-switch-thumb block w-[32px] h-[22px] rounded-full bg-white border border-black/10 dark:border-white/10 shadow-md pointer-events-none"
                  />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4. Section 3: Motion and Movements */}
      {(matchesSearch('Motion and Movements') ||
        matchesSearch('Reduce all animation') ||
        matchesSearch('Sidebar') ||
        matchesSearch('Hộp thoại') ||
        matchesSearch('Modal dialog') ||
        matchesSearch('Chuyển trang')) && (
        <section 
          id="settings-section-motion"
          className="p-5 sm:p-6 rounded-[28px] bg-white/10 backdrop-blur-md shadow-xl space-y-4"
        >
          {/* Section Header */}
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-white shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Motion and Movements
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
                Tùy chỉnh hiệu ứng trong ứng dụng.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {/* 1. Reduce all animation */}
            {matchesSearch('Reduce all animation') && (
              <div 
                id="setting-motion-reduce-all"
                onClick={() => updateDraft('reduceAllMotion', !draftSettings.reduceAllMotion)}
                className="group p-3.5 sm:p-4 rounded-[20px] flex items-center justify-between gap-4 cursor-default hover:bg-white/5 transition-colors"
              >
                <div>
                  <div className="font-bold text-white text-sm">
                    Reduce all animation
                  </div>
                  <div className="text-xs text-[#9CA3AF] mt-1 leading-normal">
                    Giảm và tắt toàn bộ các hiệu ứng chuyển động trong ứng dụng.
                  </div>
                </div>

                <button
                  id="toggle-motion-reduce-all"
                  type="button"
                  role="switch"
                  aria-checked={draftSettings.reduceAllMotion}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateDraft('reduceAllMotion', !draftSettings.reduceAllMotion);
                  }}
                  className={`toggle-switch-btn relative w-[66px] h-7 rounded-full p-[3px] transition-colors duration-200 ease-in-out cursor-default shrink-0 flex items-center ${
                    draftSettings.reduceAllMotion ? 'bg-[#fd932f]' : 'bg-[#E4E4E7] dark:bg-[#3F3F46]'
                  }`}
                >
                  <span className="toggle-switch-thumb block w-[32px] h-[22px] rounded-full bg-white border border-black/10 dark:border-white/10 shadow-md pointer-events-none" />
                </button>
              </div>
            )}

            {/* Divider */}
            <hr className="border-white/10" />

            {/* Sub-options Container: Grayed out and disabled when Reduce all animation is active */}
            <div 
              className={`space-y-3 transition-opacity duration-200 ${
                draftSettings.reduceAllMotion 
                  ? 'opacity-35 pointer-events-none select-none filter grayscale-[30%]' 
                  : ''
              }`}
            >
              {/* 2. Sidebar */}
              {matchesSearch('Sidebar') && (
                <div 
                  id="setting-motion-sidebar"
                  onClick={() => {
                    if (!draftSettings.reduceAllMotion) {
                      updateDraft('animateSidebar', !draftSettings.animateSidebar);
                    }
                  }}
                  className="group p-3.5 sm:p-4 rounded-[20px] flex items-center justify-between gap-4 cursor-default hover:bg-white/5 transition-colors"
                >
                  <div>
                    <div className="font-bold text-white text-sm">
                      Sidebar
                    </div>
                    <div className="text-xs text-[#9CA3AF] mt-1 leading-normal">
                      Hiệu ứng mở rộng/thu gọn và trượt ngăn kéo menu bên.
                    </div>
                  </div>

                  <button
                    id="toggle-motion-sidebar"
                    type="button"
                    role="switch"
                    aria-checked={draftSettings.animateSidebar && !draftSettings.reduceAllMotion}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateDraft('animateSidebar', !draftSettings.animateSidebar);
                    }}
                    className={`toggle-switch-btn relative w-[66px] h-7 rounded-full p-[3px] transition-colors duration-200 ease-in-out cursor-default shrink-0 flex items-center ${
                      draftSettings.animateSidebar && !draftSettings.reduceAllMotion ? 'bg-[#fd932f]' : 'bg-[#E4E4E7] dark:bg-[#3F3F46]'
                    }`}
                  >
                    <span className="toggle-switch-thumb block w-[32px] h-[22px] rounded-full bg-white border border-black/10 dark:border-white/10 shadow-md pointer-events-none" />
                  </button>
                </div>
              )}

              {/* 3. Hộp thoại (Modal dialog) */}
              {(matchesSearch('Hộp thoại') || matchesSearch('Modal dialog')) && (
                <div 
                  id="setting-motion-modals"
                  onClick={() => {
                    if (!draftSettings.reduceAllMotion) {
                      updateDraft('animateModals', !draftSettings.animateModals);
                    }
                  }}
                  className="group p-3.5 sm:p-4 rounded-[20px] flex items-center justify-between gap-4 cursor-default hover:bg-white/5 transition-colors"
                >
                  <div>
                    <div className="font-bold text-white text-sm">
                      Hộp thoại (Modal dialog)
                    </div>
                    <div className="text-xs text-[#9CA3AF] mt-1 leading-normal">
                      Hiệu ứng phóng to, thu nhỏ và làm mờ các cửa sổ bật lên.
                    </div>
                  </div>

                  <button
                    id="toggle-motion-modals"
                    type="button"
                    role="switch"
                    aria-checked={draftSettings.animateModals && !draftSettings.reduceAllMotion}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateDraft('animateModals', !draftSettings.animateModals);
                    }}
                    className={`toggle-switch-btn relative w-[66px] h-7 rounded-full p-[3px] transition-colors duration-200 ease-in-out cursor-default shrink-0 flex items-center ${
                      draftSettings.animateModals && !draftSettings.reduceAllMotion ? 'bg-[#fd932f]' : 'bg-[#E4E4E7] dark:bg-[#3F3F46]'
                    }`}
                  >
                    <span className="toggle-switch-thumb block w-[32px] h-[22px] rounded-full bg-white border border-black/10 dark:border-white/10 shadow-md pointer-events-none" />
                  </button>
                </div>
              )}

              {/* 4. Chuyển trang */}
              {matchesSearch('Chuyển trang') && (
                <div 
                  id="setting-motion-page-transitions"
                  onClick={() => {
                    if (!draftSettings.reduceAllMotion) {
                      updateDraft('animatePageTransitions', !draftSettings.animatePageTransitions);
                    }
                  }}
                  className="group p-3.5 sm:p-4 rounded-[20px] flex items-center justify-between gap-4 cursor-default hover:bg-white/5 transition-colors"
                >
                  <div>
                    <div className="font-bold text-white text-sm">
                      Chuyển trang
                    </div>
                    <div className="text-xs text-[#9CA3AF] mt-1 leading-normal">
                      Hiệu ứng trượt lên (slide up) các thành phần khi chuyển giữa các trang.
                    </div>
                  </div>

                  <button
                    id="toggle-motion-page-transitions"
                    type="button"
                    role="switch"
                    aria-checked={draftSettings.animatePageTransitions && !draftSettings.reduceAllMotion}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateDraft('animatePageTransitions', !draftSettings.animatePageTransitions);
                    }}
                    className={`toggle-switch-btn relative w-[66px] h-7 rounded-full p-[3px] transition-colors duration-200 ease-in-out cursor-default shrink-0 flex items-center ${
                      draftSettings.animatePageTransitions && !draftSettings.reduceAllMotion ? 'bg-[#fd932f]' : 'bg-[#E4E4E7] dark:bg-[#3F3F46]'
                    }`}
                  >
                    <span className="toggle-switch-thumb block w-[32px] h-[22px] rounded-full bg-white border border-black/10 dark:border-white/10 shadow-md pointer-events-none" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 5. Section 4: Tìm kiếm */}
      {(matchesSearch('Tìm kiếm') ||
        matchesSearch('Danh mục') ||
        matchesSearch('Tin tức') ||
        matchesSearch('Truyền hình') ||
        matchesSearch('Toolbox') ||
        matchesSearch('Cài đặt')) && (
        <section 
          id="settings-section-search"
          className="p-5 sm:p-6 rounded-[28px] bg-white/10 backdrop-blur-md shadow-xl space-y-4"
        >
          {/* Section Header without background container on icon */}
          <div className="flex items-start gap-3">
            <Search className="w-5 h-5 text-white shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Tìm kiếm
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
                Tùy chỉnh các danh mục kết quả hiển thị trong Spotlight Search.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {/* 1. Danh mục */}
            {matchesSearch('Danh mục') && (
              <div 
                id="setting-search-categories"
                onClick={() => updateDraft('searchCategories', !draftSettings.searchCategories)}
                className="group p-3.5 sm:p-4 rounded-[20px] flex items-center justify-between gap-4 cursor-default hover:bg-white/5 transition-colors"
              >
                <div>
                  <div className="font-bold text-white text-sm">
                    Danh mục
                  </div>
                  <div className="text-xs text-[#9CA3AF] mt-1 leading-normal">
                    Hiển thị các tab và điều hướng hệ thống (Home, Live TV, News, v.v.).
                  </div>
                </div>

                <button
                  id="toggle-search-categories"
                  type="button"
                  role="switch"
                  aria-checked={draftSettings.searchCategories}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateDraft('searchCategories', !draftSettings.searchCategories);
                  }}
                  className={`toggle-switch-btn relative w-[66px] h-7 rounded-full p-[3px] transition-colors duration-200 ease-in-out cursor-default shrink-0 flex items-center ${
                    draftSettings.searchCategories ? 'bg-[#fd932f]' : 'bg-[#E4E4E7] dark:bg-[#3F3F46]'
                  }`}
                >
                  <span className="toggle-switch-thumb block w-[32px] h-[22px] rounded-full bg-white border border-black/10 dark:border-white/10 shadow-md pointer-events-none" />
                </button>
              </div>
            )}

            {/* 2. Tin tức */}
            {matchesSearch('Tin tức') && (
              <div 
                id="setting-search-news"
                onClick={() => updateDraft('searchNews', !draftSettings.searchNews)}
                className="group p-3.5 sm:p-4 rounded-[20px] flex items-center justify-between gap-4 cursor-default hover:bg-white/5 transition-colors"
              >
                <div>
                  <div className="font-bold text-white text-sm">
                    Tin tức
                  </div>
                  <div className="text-xs text-[#9CA3AF] mt-1 leading-normal">
                    Hiển thị các bài viết tin tức, thông báo cộng đồng và sự kiện Discord.
                  </div>
                </div>

                <button
                  id="toggle-search-news"
                  type="button"
                  role="switch"
                  aria-checked={draftSettings.searchNews}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateDraft('searchNews', !draftSettings.searchNews);
                  }}
                  className={`toggle-switch-btn relative w-[66px] h-7 rounded-full p-[3px] transition-colors duration-200 ease-in-out cursor-default shrink-0 flex items-center ${
                    draftSettings.searchNews ? 'bg-[#fd932f]' : 'bg-[#E4E4E7] dark:bg-[#3F3F46]'
                  }`}
                >
                  <span className="toggle-switch-thumb block w-[32px] h-[22px] rounded-full bg-white border border-black/10 dark:border-white/10 shadow-md pointer-events-none" />
                </button>
              </div>
            )}

            {/* 3. Truyền hình & Tìm kênh theo số hiệu */}
            {(matchesSearch('Truyền hình') || matchesSearch('Tìm kênh theo số hiệu kênh')) && (
              <div className="p-3.5 sm:p-4 rounded-[20px] space-y-4">
                {/* 3.1 Truyền hình */}
                {matchesSearch('Truyền hình') && (
                  <div 
                    id="setting-search-tv"
                    onClick={() => updateDraft('searchTv', !draftSettings.searchTv)}
                    className="group flex items-center justify-between gap-4 cursor-default"
                  >
                    <div>
                      <div className="font-bold text-white text-sm">
                        Truyền hình
                      </div>
                      <div className="text-xs text-[#9CA3AF] mt-1 leading-normal">
                        Hiển thị danh sách kênh truyền hình trực tiếp theo tên hoặc nhóm kênh.
                      </div>
                    </div>

                    <button
                      id="toggle-search-tv"
                      type="button"
                      role="switch"
                      aria-checked={draftSettings.searchTv}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateDraft('searchTv', !draftSettings.searchTv);
                      }}
                      className={`toggle-switch-btn relative w-[66px] h-7 rounded-full p-[3px] transition-colors duration-200 ease-in-out cursor-default shrink-0 flex items-center ${
                        draftSettings.searchTv ? 'bg-[#fd932f]' : 'bg-[#E4E4E7] dark:bg-[#3F3F46]'
                      }`}
                    >
                      <span className="toggle-switch-thumb block w-[32px] h-[22px] rounded-full bg-white border border-black/10 dark:border-white/10 shadow-md pointer-events-none" />
                    </button>
                  </div>
                )}

                {/* Divider */}
                <hr className="border-white/10" />

                {/* 3.2 Tìm kênh theo số hiệu kênh */}
                {matchesSearch('Tìm kênh theo số hiệu kênh') && (
                  <div 
                    id="setting-search-channel-number"
                    onClick={() => updateDraft('searchChannelNumber', !draftSettings.searchChannelNumber)}
                    className="group flex items-center justify-between gap-4 cursor-default"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          Tìm kênh theo số hiệu kênh
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#fd932f]/20 text-[#fd932f] tracking-wider">
                          CH #
                        </span>
                      </div>
                      <div className="text-xs text-[#9CA3AF] mt-1 leading-normal">
                        Cho phép gõ số kênh (ví dụ: 1, 001, #12, kênh 5) để tìm nhanh.
                      </div>
                    </div>

                    <button
                      id="toggle-search-channel-number"
                      type="button"
                      role="switch"
                      aria-checked={draftSettings.searchChannelNumber}
                      onClick={(e) => {
                        e.stopPropagation();
                        updateDraft('searchChannelNumber', !draftSettings.searchChannelNumber);
                      }}
                      className={`toggle-switch-btn relative w-[66px] h-7 rounded-full p-[3px] transition-colors duration-200 ease-in-out cursor-default shrink-0 flex items-center ${
                        draftSettings.searchChannelNumber ? 'bg-[#fd932f]' : 'bg-[#E4E4E7] dark:bg-[#3F3F46]'
                      }`}
                    >
                      <span className="toggle-switch-thumb block w-[32px] h-[22px] rounded-full bg-white border border-black/10 dark:border-white/10 shadow-md pointer-events-none" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 4. Cài đặt */}
            {matchesSearch('Cài đặt') && (
              <div 
                id="setting-search-settings"
                onClick={() => updateDraft('searchSettings', !draftSettings.searchSettings)}
                className="group p-3.5 sm:p-4 rounded-[20px] flex items-center justify-between gap-4 cursor-default hover:bg-white/5 transition-colors"
              >
                <div>
                  <div className="font-bold text-white text-sm">
                    Cài đặt
                  </div>
                  <div className="text-xs text-[#9CA3AF] mt-1 leading-normal">
                    Quản lý và chuyển nhanh tới các mục tùy chọn hệ thống.
                  </div>
                </div>

                <button
                  id="toggle-search-settings"
                  type="button"
                  role="switch"
                  aria-checked={draftSettings.searchSettings}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateDraft('searchSettings', !draftSettings.searchSettings);
                  }}
                  className={`toggle-switch-btn relative w-[66px] h-7 rounded-full p-[3px] transition-colors duration-200 ease-in-out cursor-default shrink-0 flex items-center ${
                    draftSettings.searchSettings ? 'bg-[#fd932f]' : 'bg-[#E4E4E7] dark:bg-[#3F3F46]'
                  }`}
                >
                  <span className="toggle-switch-thumb block w-[32px] h-[22px] rounded-full bg-white border border-black/10 dark:border-white/10 shadow-md pointer-events-none" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Section: Bàn phím */}
      {(matchesSearch('Bàn phím') ||
        matchesSearch('Keyboard') ||
        matchesSearch('Bàn phím số') ||
        matchesSearch('Clipboard') ||
        matchesSearch('Sao chép') ||
        matchesSearch('Âm bàn phím') ||
        matchesSearch('Âm thanh') ||
        matchesSearch('Sound') ||
        matchesSearch('pop') ||
        matchesSearch('Lịch sử sao chép')) && (
        <section 
          id="settings-section-keyboard"
          className="p-5 sm:p-6 rounded-[28px] bg-white/10 backdrop-blur-md shadow-xl space-y-4"
        >
          {/* Section Header */}
          <div className="flex items-start gap-3">
            <Keyboard className="w-5 h-5 text-white shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Bàn phím
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
                Tùy chỉnh cấu hình và hành vi bàn phím ảo trong ứng dụng.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {/* 1. Bàn phím số (off by default) */}
            {(matchesSearch('Bàn phím số') ||
              matchesSearch('Bàn phím') ||
              matchesSearch('Keyboard') ||
              matchesSearch('dải phím chữ') ||
              matchesSearch('0 đến 9') ||
              matchesSearch('số')) && (
              <div 
                id="setting-keyboard-number-row"
                onClick={() => updateDraft('keyboardNumberRow', !draftSettings.keyboardNumberRow)}
                className="group p-3.5 sm:p-4 rounded-[20px] flex items-center justify-between gap-4 cursor-default hover:bg-white/5 transition-colors"
              >
                <div>
                  <div className="font-bold text-white text-sm">
                    Bàn phím số
                  </div>
                  <div className="text-xs text-[#9CA3AF] mt-1 leading-normal">
                    Hiển thị bàn phím số từ 0 đến 9 ngay trên dải phím chữ.
                  </div>
                </div>

                <button
                  id="toggle-keyboard-number-row"
                  type="button"
                  role="switch"
                  aria-checked={draftSettings.keyboardNumberRow}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateDraft('keyboardNumberRow', !draftSettings.keyboardNumberRow);
                  }}
                  className={`toggle-switch-btn relative w-[66px] h-7 rounded-full p-[3px] transition-colors duration-200 ease-in-out cursor-default shrink-0 flex items-center ${
                    draftSettings.keyboardNumberRow ? 'bg-[#fd932f]' : 'bg-[#E4E4E7] dark:bg-[#3F3F46]'
                  }`}
                >
                  <span className="toggle-switch-thumb block w-[32px] h-[22px] rounded-full bg-white border border-black/10 dark:border-white/10 shadow-md pointer-events-none" />
                </button>
              </div>
            )}

            {/* 2. Clipboard (on by default) */}
            {(matchesSearch('Clipboard') ||
              matchesSearch('Bàn phím') ||
              matchesSearch('Keyboard') ||
              matchesSearch('Sao chép') ||
              matchesSearch('Lịch sử sao chép') ||
              matchesSearch('Danh sách lịch sử sao chép trong ứng dụng.')) && (
              <div 
                id="setting-keyboard-clipboard"
                onClick={() => updateDraft('keyboardClipboard', !draftSettings.keyboardClipboard)}
                className="group p-3.5 sm:p-4 rounded-[20px] flex items-center justify-between gap-4 cursor-default hover:bg-white/5 transition-colors"
              >
                <div>
                  <div className="font-bold text-white text-sm">
                    Clipboard
                  </div>
                  <div className="text-xs text-[#9CA3AF] mt-1 leading-normal">
                    Danh sách lịch sử sao chép trong ứng dụng.
                  </div>
                </div>

                <button
                  id="toggle-keyboard-clipboard"
                  type="button"
                  role="switch"
                  aria-checked={draftSettings.keyboardClipboard}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateDraft('keyboardClipboard', !draftSettings.keyboardClipboard);
                  }}
                  className={`toggle-switch-btn relative w-[66px] h-7 rounded-full p-[3px] transition-colors duration-200 ease-in-out cursor-default shrink-0 flex items-center ${
                    draftSettings.keyboardClipboard ? 'bg-[#fd932f]' : 'bg-[#E4E4E7] dark:bg-[#3F3F46]'
                  }`}
                >
                  <span className="toggle-switch-thumb block w-[32px] h-[22px] rounded-full bg-white border border-black/10 dark:border-white/10 shadow-md pointer-events-none" />
                </button>
              </div>
            )}

            {/* 3. Âm bàn phím (on by default) */}
            {(matchesSearch('Âm bàn phím') ||
              matchesSearch('Bàn phím') ||
              matchesSearch('Keyboard') ||
              matchesSearch('Âm thanh') ||
              matchesSearch('Sound') ||
              matchesSearch('pop') ||
              matchesSearch('Phát ra tiếng "pop" khi gõ trên bàn phím.')) && (
              <div 
                id="setting-keyboard-sound"
                onClick={() => updateDraft('keyboardSoundEnabled', !draftSettings.keyboardSoundEnabled)}
                className="group p-3.5 sm:p-4 rounded-[20px] flex items-center justify-between gap-4 cursor-default hover:bg-white/5 transition-colors"
              >
                <div>
                  <div className="font-bold text-white text-sm">
                    Âm bàn phím
                  </div>
                  <div className="text-xs text-[#9CA3AF] mt-1 leading-normal">
                    Phát ra tiếng "pop" khi gõ trên bàn phím.
                  </div>
                </div>

                <button
                  id="toggle-keyboard-sound"
                  type="button"
                  role="switch"
                  aria-checked={draftSettings.keyboardSoundEnabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateDraft('keyboardSoundEnabled', !draftSettings.keyboardSoundEnabled);
                  }}
                  className={`toggle-switch-btn relative w-[66px] h-7 rounded-full p-[3px] transition-colors duration-200 ease-in-out cursor-default shrink-0 flex items-center ${
                    draftSettings.keyboardSoundEnabled ? 'bg-[#fd932f]' : 'bg-[#E4E4E7] dark:bg-[#3F3F46]'
                  }`}
                >
                  <span className="toggle-switch-thumb block w-[32px] h-[22px] rounded-full bg-white border border-black/10 dark:border-white/10 shadow-md pointer-events-none" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Experimental Features Section */}
      {(matchesSearch('Experimental') ||
        matchesSearch('Experimental Features') ||
        matchesSearch('Native keyboard') ||
        matchesSearch('Native') ||
        matchesSearch('Bàn phím') ||
        matchesSearch('Keyboard') ||
        matchesSearch('Immersive') ||
        matchesSearch('Immersive search experience') ||
        matchesSearch('Search UI that looks immersive.') ||
        matchesSearch('Thử nghiệm') ||
        matchesSearch('Tính năng thử nghiệm')) && (
        <section 
          id="settings-section-experimental"
          className="p-5 sm:p-6 rounded-[28px] bg-white/10 backdrop-blur-md shadow-xl space-y-4"
        >
          {/* Section Header with triangle lab flask icon */}
          <div className="flex items-start gap-3">
            <FlaskConical className="w-5 h-5 text-white shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-white leading-tight flex items-center gap-2">
                <span>Experimental Features</span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-[#fd932f]/20 text-[#FF4D8B] border border-[#fd932f]/30">
                  Lab
                </span>
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
                Các tính năng và giao diện trải nghiệm mới đang trong giai đoạn thử nghiệm.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {/* Toggle: Native keyboard */}
            {(matchesSearch('Native keyboard') ||
              matchesSearch('Native') ||
              matchesSearch('Bàn phím') ||
              matchesSearch('Keyboard') ||
              matchesSearch('bàn phím của ứng dụng') ||
              matchesSearch('thiết bị cảm ứng') ||
              matchesSearch('Thử nghiệm') ||
              matchesSearch('Experimental')) && (
              <div 
                id="setting-experimental-native-keyboard"
                onClick={() => updateDraft('nativeKeyboard', !draftSettings.nativeKeyboard)}
                className="group p-3.5 sm:p-4 rounded-[20px] flex items-center justify-between gap-4 cursor-default hover:bg-white/5 transition-colors"
              >
                <div>
                  <div className="font-bold text-white text-sm">
                    Native keyboard
                  </div>
                  <div className="text-xs text-[#9CA3AF] mt-1 leading-normal">
                    Sử dụng bàn phím của ứng dụng thay vì bàn phím của thiết bị (chỉ áp dụng cho thiết bị cảm ứng).
                  </div>
                </div>

                <button
                  id="toggle-native-keyboard"
                  type="button"
                  role="switch"
                  aria-checked={draftSettings.nativeKeyboard}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateDraft('nativeKeyboard', !draftSettings.nativeKeyboard);
                  }}
                  className={`toggle-switch-btn relative w-[66px] h-7 rounded-full p-[3px] transition-colors duration-200 ease-in-out cursor-default shrink-0 flex items-center ${
                    draftSettings.nativeKeyboard ? 'bg-[#fd932f]' : 'bg-[#E4E4E7] dark:bg-[#3F3F46]'
                  }`}
                >
                  <span className="toggle-switch-thumb block w-[32px] h-[22px] rounded-full bg-white border border-black/10 dark:border-white/10 shadow-md pointer-events-none" />
                </button>
              </div>
            )}

            {/* Toggle: Immersive search experience */}
            <div 
              id="setting-experimental-immersive-search"
              onClick={() => updateDraft('immersiveSearch', !draftSettings.immersiveSearch)}
              className="group p-3.5 sm:p-4 rounded-[20px] flex items-center justify-between gap-4 cursor-default hover:bg-white/5 transition-colors"
            >
              <div>
                <div className="font-bold text-white text-sm">
                  Immersive search experience
                </div>
                <div className="text-xs text-[#9CA3AF] mt-1 leading-normal">
                  Search UI that looks immersive.
                </div>
              </div>

              <button
                id="toggle-immersive-search"
                type="button"
                role="switch"
                aria-checked={draftSettings.immersiveSearch}
                onClick={(e) => {
                  e.stopPropagation();
                  updateDraft('immersiveSearch', !draftSettings.immersiveSearch);
                }}
                className={`toggle-switch-btn relative w-[66px] h-7 rounded-full p-[3px] transition-colors duration-200 ease-in-out cursor-default shrink-0 flex items-center ${
                  draftSettings.immersiveSearch ? 'bg-[#fd932f]' : 'bg-[#E4E4E7] dark:bg-[#3F3F46]'
                }`}
              >
                <span className="toggle-switch-thumb block w-[32px] h-[22px] rounded-full bg-white border border-black/10 dark:border-white/10 shadow-md pointer-events-none" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. Section: Customize keybinds (Tùy chỉnh phím tắt) */}
      {(matchesSearch('Customize keybinds') ||
        matchesSearch('Phím tắt') ||
        matchesSearch('Keybinds') ||
        matchesSearch('Keyboard') ||
        matchesSearch('Shortcut') ||
        matchesSearch('Home') ||
        matchesSearch('Search') ||
        matchesSearch('Tools') ||
        matchesSearch('Settings') ||
        matchesSearch('Kênh xem gần nhất')) && (
        <section 
          id="settings-section-keybinds"
          className="p-5 sm:p-6 rounded-[28px] bg-white/10 backdrop-blur-md shadow-xl space-y-4"
        >
          {/* Section Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Keyboard className="w-5 h-5 text-white shrink-0 mt-0.5" />
              <div>
                <h2 className="text-base font-bold text-white leading-tight flex items-center gap-2">
                  <span>Customize keybinds</span>
                </h2>
                <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
                  Thiết lập phím tắt nhanh để điều hướng ứng dụng (hệ thống tự động bảo vệ tránh xung đột với phím tắt của trình duyệt).
                </p>
              </div>
            </div>

            {/* Reset all to default button */}
            <button
              type="button"
              id="btn-reset-keybinds"
              onClick={() => {
                updateDraft('customKeybinds', { ...DEFAULT_KEYBINDS });
                setEditingKeybindId(null);
                setKeybindError(null);
              }}
              title="Đặt lại tất cả phím tắt về mặc định"
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#A1A1AA] hover:text-white bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5 shrink-0 cursor-default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mặc định</span>
            </button>
          </div>

          {/* Keybind items list */}
          <div className="space-y-2.5 pt-1">
            {KEYBIND_DEFINITIONS.map((def) => {
              const currentKey = draftSettings.customKeybinds?.[def.id] || def.defaultKey;
              const isEditing = editingKeybindId === def.id;
              const error = keybindError?.id === def.id ? keybindError.message : null;

              if (
                searchQuery &&
                !matchesSearch(def.label) &&
                !matchesSearch(def.description) &&
                !matchesSearch(currentKey) &&
                !matchesSearch('Customize keybinds')
              ) {
                return null;
              }

              return (
                <div
                  key={def.id}
                  id={`keybind-row-${def.id}`}
                  className="p-3.5 sm:p-4 rounded-[20px] flex flex-col gap-2 transition-colors hover:bg-white/5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <span>{def.label}</span>
                        {currentKey !== def.defaultKey && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fd932f]/20 text-[#FF4D8B] font-medium border border-[#fd932f]/30">
                            Đã đổi
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#9CA3AF] mt-0.5 leading-normal">
                        {def.description}
                      </div>
                    </div>

                    {/* Key assignment control */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            autoFocus
                            readOnly
                            data-keybind-recording="true"
                            value="Nhấn tổ hợp phím..."
                            onKeyDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();

                              if (e.key === 'Escape') {
                                setEditingKeybindId(null);
                                setKeybindError(null);
                                return;
                              }

                              const keyStr = eventToKeyString(e.nativeEvent);
                              if (!keyStr) return; // modifier alone

                              const validation = validateKeybind(keyStr);
                              if (!validation.valid) {
                                setKeybindError({ id: def.id, message: validation.reason || 'Phím tắt không hợp lệ.' });
                                return;
                              }

                              // Check if duplicate with another action
                              const existingAction = Object.entries(draftSettings.customKeybinds || {}).find(
                                ([act, key]) => act !== def.id && typeof key === 'string' && key.toLowerCase() === keyStr.toLowerCase()
                              );

                              if (existingAction) {
                                const targetDef = KEYBIND_DEFINITIONS.find(d => d.id === existingAction[0]);
                                setKeybindError({
                                  id: def.id,
                                  message: `Tổ hợp này đã gán cho mục "${targetDef?.label || existingAction[0]}".`
                                });
                                return;
                              }

                              // Save
                              const updated = {
                                ...(draftSettings.customKeybinds || DEFAULT_KEYBINDS),
                                [def.id]: keyStr
                              };
                              updateDraft('customKeybinds', updated);
                              setEditingKeybindId(null);
                              setKeybindError(null);
                            }}
                            onBlur={() => {
                              setEditingKeybindId(null);
                            }}
                            className="px-3 py-1.5 text-xs rounded-xl bg-[#fd932f]/20 border-2 border-[#fd932f] text-white font-mono animate-pulse text-center w-36 cursor-default outline-none select-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setEditingKeybindId(null);
                              setKeybindError(null);
                            }}
                            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white bg-white/5 hover:bg-white/10 text-xs transition-colors"
                            title="Hủy"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            id={`btn-edit-keybind-${def.id}`}
                            onClick={() => {
                              setEditingKeybindId(def.id);
                              setKeybindError(null);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#1F1E24] hover:bg-[#34333C] border border-white/10 hover:border-[#fd932f]/60 text-white font-mono text-xs font-bold transition-all shadow-inner active:scale-95 cursor-default"
                            title="Nhấp để thay đổi phím tắt"
                          >
                            {currentKey}
                          </button>

                          {currentKey !== def.defaultKey && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = {
                                  ...(draftSettings.customKeybinds || DEFAULT_KEYBINDS),
                                  [def.id]: def.defaultKey
                                };
                                updateDraft('customKeybinds', updated);
                                setKeybindError(null);
                              }}
                              className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-default"
                              title="Khôi phục mặc định"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inline Error Message */}
                  {error && (
                    <div className="flex items-start gap-1.5 text-xs text-[#FF4D8B] bg-[#fd932f]/10 border border-[#fd932f]/30 p-2 rounded-xl">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. Section 5: Khác */}

      {(matchesSearch('Khác') ||
        matchesSearch('Changelogs') ||
        matchesSearch('Nhật ký thay đổi') ||
        matchesSearch('Cập nhật') ||
        matchesSearch('Release Notes') ||
        matchesSearch('Test Vplay') ||
        matchesSearch('Test') ||
        matchesSearch('Vplay')) && (
        <section 
          id="settings-section-other"
          className="p-5 sm:p-6 rounded-[28px] bg-white/10 backdrop-blur-md shadow-xl space-y-4"
        >
          {/* Section Header */}
          <div className="flex items-start gap-3">
            <Wrench className="w-5 h-5 text-white shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Khác
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
                Thông tin phiên bản, nhật ký cập nhật và các tiện ích bổ sung.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {/* Test Vplay Option Card */}
            {(matchesSearch('Test Vplay') || matchesSearch('Test') || matchesSearch('Khác') || matchesSearch('Vplay')) && (
              <div className="p-3.5 sm:p-4 rounded-[20px] flex items-center justify-between gap-4 transition-colors hover:bg-white/5">
                <div>
                  <div className="font-bold text-white text-sm">
                    Test Vplay
                  </div>
                  <div className="text-xs text-[#9CA3AF] mt-1 leading-normal">
                    Try our test builds of Vplay with new, early unreleased features.
                  </div>
                </div>

                {/* Colored Button: Switch */}
                <a
                  id="btn-test-vplay-switch"
                  href="https://test-vplay.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 rounded-full font-bold text-white bg-[#fd932f] hover:bg-[#e68428] active:scale-[0.96] transition-all text-xs sm:text-sm cursor-default flex items-center justify-center shrink-0 shadow-md tracking-tight text-center select-none"
                >
                  Switch
                </a>
              </div>
            )}

            {/* Changelogs Option Card */}
            {(matchesSearch('Changelogs') || matchesSearch('Khác') || matchesSearch('Nhật ký thay đổi') || matchesSearch('Cập nhật') || matchesSearch('Release Notes') || matchesSearch('Vplay')) && (
              <div className="p-3.5 sm:p-4 rounded-[20px] flex items-center justify-between gap-4 transition-colors hover:bg-white/5">
                <div>
                  <div className="font-bold text-white text-sm">
                    Changelogs
                  </div>
                  <div className="text-xs text-[#9CA3AF] mt-1 leading-normal">
                    Danh sách những sự thay đổi trong bản cập nhật mới nhất của Vplay.
                  </div>
                </div>

                {/* Colored Button: Read */}
                <button
                  id="btn-changelogs-read"
                  type="button"
                  onClick={() => setIsWelcomeModalOpen(true)}
                  className="px-5 py-2 rounded-full font-bold text-white bg-[#fd932f] hover:bg-[#e68428] active:scale-[0.96] transition-all text-xs sm:text-sm cursor-default flex items-center justify-center shrink-0 shadow-md tracking-tight text-center"
                >
                  Read
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Welcome to Vplay 26.9 / Changelogs Modal Dialog */}
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
      />

      {/* Floating Apply Feedback Toast */}
      <AnimatePresence>
        {showApplyToast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#1E1D24] border border-[#fd932f]/60 text-white text-xs sm:text-sm font-semibold shadow-2xl backdrop-blur-md"
          >
            <div className="w-5 h-5 rounded-full bg-[#fd932f] flex items-center justify-center shrink-0">
              <SfCheckmark className="w-3 h-3" />
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
