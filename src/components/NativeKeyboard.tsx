import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Delete, Smile, ArrowBigUp, X, Check, Globe, Keyboard, ClipboardList, Copy, Trash2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNativeKeyboard } from '../context/NativeKeyboardContext';
import { useSettings } from '../hooks/useSettings';
import { keyboardSound } from '../utils/keyboardSound';
import { VietnameseInputMethod } from '../utils/vietnameseIME';
import {
  getClipboardHistory,
  addClipboardItem,
  removeClipboardItem,
  clearClipboardHistory,
  ClipboardItem,
} from '../utils/clipboardHistory';
import { EmojiBoard } from './EmojiBoard';

const SF_SEARCH_ICON_URL = 'https://github.com/andrewtavis/sf-symbols-online/blob/master/glyphs/magnifyingglass.png?raw=true';
const SF_MIC_ICON_URL = 'https://github.com/andrewtavis/sf-symbols-online/blob/master/glyphs/mic.png?raw=true';

type KeyboardLayoutMode = 'alpha' | 'numeric' | 'symbols';

const LANGUAGE_OPTIONS: { id: VietnameseInputMethod; label: string; short: string; flag: string }[] = [
  { id: 'vi-telex', label: 'Tiếng Việt (Telex)', short: 'Telex', flag: '🇻🇳' },
  { id: 'vi-vni', label: 'Tiếng Việt (VNI)', short: 'VNI', flag: '🇻🇳' },
  { id: 'en', label: 'Tiếng Anh', short: 'English', flag: '🇬🇧' },
];

export const NativeKeyboard: React.FC = () => {
  const { settings } = useSettings();
  const {
    isOpen,
    keyboardHeight,
    closeKeyboard,
    switchToDeviceKeyboard,
    insertText,
    deleteChar,
    submitAction,
    isNativeKeyboardEnabled,
    activeInput,
    inputMethod,
    setInputMethod,
  } = useNativeKeyboard();

  const [layoutMode, setLayoutMode] = useState<KeyboardLayoutMode>('alpha');
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [isCapsLock, setIsCapsLock] = useState(false);
  const [isMicListening, setIsMicListening] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiSearchQuery, setEmojiSearchQuery] = useState('');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showClipboard, setShowClipboard] = useState(false);
  const [clipboardList, setClipboardList] = useState<ClipboardItem[]>([]);
  const [copiedFeedback, setCopiedFeedback] = useState<string | null>(null);
  const [activeBubbleKey, setActiveBubbleKey] = useState<string | null>(null);

  const lastShiftTapRef = useRef<number>(0);
  const backspaceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const backspaceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSoundTimeRef = useRef<number>(0);

  // Play key sound with throttling to avoid double clicks between pointerdown and click
  const playSound = useCallback((type: 'char' | 'space' | 'delete' | 'action' | 'modifier' = 'char') => {
    const now = Date.now();
    if (now - lastSoundTimeRef.current > 35) {
      keyboardSound.playKeyClick(type);
      lastSoundTimeRef.current = now;
    }
  }, []);

  // Global pointer release to always clear bubble tooltip
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      setActiveBubbleKey(null);
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, []);

  // Reset states when keyboard opens
  useEffect(() => {
    if (isOpen) {
      setLayoutMode('alpha');
      setIsShiftActive(false);
      setIsCapsLock(false);
      setShowEmojiPicker(false);
      setEmojiSearchQuery('');
      setShowLanguageMenu(false);
      setShowClipboard(false);
      setActiveBubbleKey(null);
      setCopiedFeedback(null);
      keyboardSound.unlockAudio();
    }
  }, [isOpen]);

  // Keep clipboard history synchronized
  useEffect(() => {
    const updateList = () => {
      setClipboardList(getClipboardHistory());
    };
    updateList();
    window.addEventListener('waves_clipboard_updated', updateList);
    return () => window.removeEventListener('waves_clipboard_updated', updateList);
  }, []);

  const handlePasteClipboardItem = (text: string) => {
    insertText(text);
    setCopiedFeedback('Đã dán!');
    setTimeout(() => setCopiedFeedback(null), 1200);
  };

  const handlePasteFromDevice = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          addClipboardItem(text);
          insertText(text);
          setCopiedFeedback('Đã dán!');
          setTimeout(() => setCopiedFeedback(null), 1200);
          return;
        }
      }
    } catch {
      // Permission blocked or unsupported
    }
  };

  const handleClearAllClipboard = () => {
    clearClipboardHistory();
  };

  const handleDeleteClipboardItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeClipboardItem(id);
  };

  // Clean up backspace repeat timers
  const clearBackspaceTimers = useCallback(() => {
    if (backspaceTimerRef.current) {
      clearTimeout(backspaceTimerRef.current);
      backspaceTimerRef.current = null;
    }
    if (backspaceIntervalRef.current) {
      clearInterval(backspaceIntervalRef.current);
      backspaceIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearBackspaceTimers();
  }, [clearBackspaceTimers]);

  // Click outside listener to dismiss language selection flyout
  useEffect(() => {
    if (!showLanguageMenu) return;
    const handleOutsideClick = (e: MouseEvent | PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        !target.closest('#native-keyboard-globe-btn') &&
        !target.closest('#native-keyboard-lang-menu')
      ) {
        setShowLanguageMenu(false);
      }
    };
    window.addEventListener('pointerdown', handleOutsideClick);
    return () => {
      window.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, [showLanguageMenu]);

  if (!isNativeKeyboardEnabled) return null;

  // Key press handlers (Sound is triggered exclusively on pointerdown/press, NEVER on release/click)
  const handleCharPress = (char: string) => {
    const output = (isShiftActive || isCapsLock) ? char.toUpperCase() : char.toLowerCase();
    insertText(output);

    // If shift was active (and not caps lock), turn off after one character
    if (isShiftActive && !isCapsLock) {
      setIsShiftActive(false);
    }
  };

  const handleSpacePress = () => {
    insertText(' ');
  };

  const handleDeleteDown = () => {
    playSound('delete');
    if (navigator.vibrate) {
      try { navigator.vibrate(12); } catch {}
    }
    deleteChar();

    clearBackspaceTimers();
    // Start repeating after 350ms hold
    backspaceTimerRef.current = setTimeout(() => {
      backspaceIntervalRef.current = setInterval(() => {
        keyboardSound.playKeyClick('delete');
        deleteChar();
      }, 75);
    }, 350);
  };

  const handleDeleteUp = () => {
    clearBackspaceTimers();
  };

  const handleShiftTap = () => {
    const now = Date.now();
    // Double tap within 300ms toggles Caps Lock
    if (now - lastShiftTapRef.current < 300) {
      setIsCapsLock((prev) => !prev);
      setIsShiftActive(false);
    } else {
      if (isCapsLock) {
        setIsCapsLock(false);
        setIsShiftActive(false);
      } else {
        setIsShiftActive((prev) => !prev);
      }
    }
    lastShiftTapRef.current = now;
  };

  const handleSearchAction = () => {
    submitAction();
  };

  const toggleMic = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      insertText('🎤 ');
      return;
    }

    try {
      const SpeechRecognition =
        (window as unknown as { SpeechRecognition: any }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition: any }).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsMicListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          insertText(transcript);
        }
        setIsMicListening(false);
      };
      recognition.onerror = () => setIsMicListening(false);
      recognition.onend = () => setIsMicListening(false);

      recognition.start();
    } catch {
      setIsMicListening(false);
    }
  };

  // Keyboard Rows definition
  const rowNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const row1Alpha = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  const row2Alpha = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
  const row3Alpha = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

  const row1Num = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const row2Num = ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'];
  const row3Num = ['.', ',', '?', '!', "'"];

  const row1Sym = ['[', ']', '{', '}', '#', '%', '^', '*', '+', '='];
  const row2Sym = ['_', '\\', '|', '~', '<', '>', '€', '£', '¥', '•'];
  const row3Sym = ['.', ',', '?', '!', "'"];

  const hasNumberRow = Boolean(settings.keyboardNumberRow && layoutMode === 'alpha');
  const keyHeightClass = hasNumberRow
    ? 'h-[36px] sm:h-[40px] md:h-[44px]'
    : 'h-[42px] sm:h-[46px] md:h-[50px]';

  // Render individual character key with bubble tooltip
  const renderCharKey = (char: string, rowIndex: number, colIndex: number, totalCols: number) => {
    const keyId = `${layoutMode}-${rowIndex}-${char}-${colIndex}`;
    const isNumber = !isNaN(Number(char));
    const displayChar = (!isNumber && (isShiftActive || isCapsLock)) ? char.toUpperCase() : char;
    const isBubbleActive = activeBubbleKey === keyId;

    return (
      <button
        key={keyId}
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onPointerDown={(e) => {
          e.preventDefault();
          playSound('char');
          if (navigator.vibrate) {
            try { navigator.vibrate(8); } catch {}
          }
          setActiveBubbleKey(keyId);
        }}
        onPointerUp={() => {
          setActiveBubbleKey(null);
        }}
        onPointerLeave={() => {
          setActiveBubbleKey(null);
        }}
        onPointerCancel={() => {
          setActiveBubbleKey(null);
        }}
        onClick={() => handleCharPress(char)}
        className={`relative flex-1 min-w-0 ${keyHeightClass} rounded-[7px] sm:rounded-[9px] bg-white/40 hover:bg-white/50 active:bg-white/60 backdrop-blur-md text-black border border-white/25 shadow-[0_1px_2px_rgba(0,0,0,0.14)] font-semibold ${
          hasNumberRow ? 'text-[17px] sm:text-[19px] md:text-[21px]' : 'text-[19px] sm:text-[21px] md:text-[23px]'
        } flex items-center justify-center transition-colors cursor-default font-sans select-none ${
          isBubbleActive ? 'z-40 bg-white/70' : 'z-10'
        }`}
      >
        {displayChar}

        {/* iOS-Style Key Press Bubble Tooltip */}
        {isBubbleActive && (
          <div
            className={`absolute -top-[52px] sm:-top-[58px] pointer-events-none select-none flex flex-col z-50 animate-in fade-in zoom-in-90 duration-75 ${
              colIndex === 0
                ? 'left-0 items-start'
                : colIndex === totalCols - 1
                ? 'right-0 items-end'
                : 'left-1/2 -translate-x-1/2 items-center'
            }`}
            style={{ filter: 'drop-shadow(0 8px 18px rgba(0, 0, 0, 0.32))' }}
          >
            {/* Bubble body with bold black enlarged letter */}
            <div className="w-[48px] sm:w-[54px] h-[50px] sm:h-[56px] rounded-[14px] sm:rounded-[16px] bg-white border border-black/10 flex items-center justify-center shadow-xs">
              <span className="text-black font-semibold text-[26px] sm:text-[30px] font-sans leading-none select-none">
                {displayChar}
              </span>
            </div>
            {/* Downward triangle/tail pointing to the key center */}
            <div
              className={`-mt-1.5 w-3.5 h-3.5 bg-white rotate-45 border-r border-b border-black/10 ${
                colIndex === 0 ? 'ml-4' : colIndex === totalCols - 1 ? 'mr-4' : ''
              }`}
            />
          </div>
        )}
      </button>
    );
  };

  return (
    <div
      id="vplay-native-keyboard"
      aria-label="Vplay Native Keyboard"
      style={{
        height: `${keyboardHeight}px`,
        backgroundColor: 'rgba(255, 255, 255, 0.60)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
      }}
      className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-[32px] sm:rounded-t-[36px] border-t border-white/25 shadow-[0_-10px_36px_rgba(0,0,0,0.30)] transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform select-none flex flex-col justify-between ${
        isOpen ? 'translate-y-0 pointer-events-auto' : 'translate-y-full pointer-events-none'
      }`}
    >
      <div className="w-full max-w-full md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto flex flex-col justify-between h-full px-2 sm:px-3 md:px-5 pt-1.5 pb-2">
        {/* Top bar with Switch to device's keyboard button and emoji search bar when in emoji mode */}
        <div className="relative flex items-center justify-center gap-2 px-1 pt-0.5 pb-1 select-none min-h-[34px]">
          {/* Switch to device's keyboard button - Hide title text when in emoji board */}
          <button
            type="button"
            id="btn-switch-to-device-keyboard"
            onMouseDown={(e) => e.preventDefault()}
            onPointerDown={(e) => {
              e.preventDefault();
              playSound('action');
            }}
            onClick={() => {
              switchToDeviceKeyboard();
            }}
            className={`flex items-center gap-1.5 rounded-full bg-black/10 hover:bg-black/15 text-black tracking-tight transition-all cursor-default shadow-xs shrink-0 ${
              showEmojiPicker
                ? 'p-2'
                : 'px-3 py-1 text-[11px] sm:text-xs font-semibold'
            }`}
            title="Switch to device's keyboard"
            aria-label="Switch to device's keyboard"
          >
            <Keyboard className="w-3.5 h-3.5 text-black shrink-0" />
            {!showEmojiPicker && (
              <span className="text-black whitespace-nowrap">Switch to device's keyboard</span>
            )}
          </button>

          {/* Emoji search bar placed right next to switch button when in emoji board */}
          {showEmojiPicker && (
            <div className="relative flex items-center shrink-0 w-44 xs:w-52 sm:w-64 md:w-80 animate-in fade-in duration-150">
              <input
                type="text"
                value={emojiSearchQuery}
                onChange={(e) => setEmojiSearchQuery(e.target.value)}
                placeholder="Tìm kiếm emoji..."
                className="w-full h-7 pl-6 pr-6 rounded-full bg-white/60 hover:bg-white/70 border border-black/10 text-xs text-black placeholder:text-black/50 focus:outline-none focus:bg-white/85 transition-colors"
              />
              <Search className="w-3.5 h-3.5 text-black/50 absolute left-2 pointer-events-none" />
              {emojiSearchQuery && (
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setEmojiSearchQuery('')}
                  className="absolute right-1.5 p-0.5 text-black/50 hover:text-black cursor-default"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Active input hint / indicator & Dismiss button - Pinned to right */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {!showEmojiPicker && (
              <span className="text-[11px] font-medium text-black truncate max-w-[100px] sm:max-w-[180px] select-none hidden xs:inline">
                {activeInput?.placeholder || 'Vplay Keyboard'}
              </span>
            )}

            {/* Dismiss button */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onPointerDown={(e) => {
                e.preventDefault();
                playSound('action');
              }}
              onClick={closeKeyboard}
              className="p-1 rounded-full text-black hover:bg-black/10 transition-colors cursor-default"
              title="Đóng bàn phím"
              aria-label="Đóng bàn phím"
            >
              <X className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>

        {showClipboard ? (
          /* Clipboard History Tray */
          <div className="flex-1 flex flex-col justify-between px-1.5 py-1 min-h-0 overflow-hidden">
            {/* Clipboard Header */}
            <div className="flex items-center justify-between pb-1 px-1 border-b border-black/10">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-black" />
                <span className="text-xs font-bold text-black tracking-tight">Lịch sử sao chép (Clipboard)</span>
                {copiedFeedback && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full animate-in fade-in duration-150">
                    {copiedFeedback}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {/* Paste from device button */}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onPointerDown={() => playSound('action')}
                  onClick={handlePasteFromDevice}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/10 hover:bg-black/15 active:bg-black/20 text-black text-[11px] font-medium transition-colors cursor-default"
                  title="Dán từ bộ nhớ tạm của thiết bị"
                >
                  <Copy className="w-3 h-3 text-black" />
                  <span>Dán từ thiết bị</span>
                </button>

                {/* Clear all if items exist */}
                {clipboardList.length > 0 && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onPointerDown={() => playSound('delete')}
                    onClick={handleClearAllClipboard}
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 text-red-700 text-[11px] font-medium transition-colors cursor-default"
                    title="Xóa tất cả lịch sử sao chép"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span className="hidden xs:inline">Xóa tất cả</span>
                  </button>
                )}

                {/* Close panel */}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onPointerDown={() => playSound('modifier')}
                  onClick={() => setShowClipboard(false)}
                  className="p-1 rounded-full text-black hover:bg-black/10 transition-colors cursor-default"
                  title="Quay lại bàn phím"
                >
                  <X className="w-4 h-4 text-black" />
                </button>
              </div>
            </div>

            {/* Clipboard List */}
            <div className="flex-1 overflow-y-auto py-1.5 space-y-1.5 pr-1 max-h-[220px] scrollbar-thin">
              {clipboardList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-6 text-center text-black/70 space-y-1.5">
                  <div className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center text-black/50">
                    <ClipboardList className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-xs font-semibold text-black">Chưa có nội dung sao chép nào</div>
                  <div className="text-[11px] text-black/60 max-w-sm px-4 leading-normal">
                    Mọi văn bản bạn sao chép trong ứng dụng sẽ tự động lưu lại đây để chạm và dán nhanh.
                  </div>
                </div>
              ) : (
                clipboardList.map((item) => (
                  <div
                    key={item.id}
                    onPointerDown={() => playSound('action')}
                    onClick={() => handlePasteClipboardItem(item.text)}
                    className="group w-full flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/50 hover:bg-white/70 active:bg-white/80 border border-white/30 backdrop-blur-md shadow-xs cursor-default transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-black line-clamp-2 select-none break-words">
                        {item.text}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-black/50">
                        <span>Chạm để dán</span>
                        <span>•</span>
                        <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        playSound('delete');
                      }}
                      onClick={(e) => handleDeleteClipboardItem(item.id, e)}
                      className="p-1.5 rounded-lg text-black/40 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-default"
                      title="Xóa mục này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Bottom bar of Clipboard view */}
            <div className="flex items-center justify-between pt-1 border-t border-black/10">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onPointerDown={() => playSound('modifier')}
                onClick={() => setShowClipboard(false)}
                className="px-4 py-1.5 rounded-xl bg-white/50 backdrop-blur-md text-xs font-semibold text-black border border-white/25 hover:bg-white/70 transition-colors cursor-default"
              >
                Bàn phím
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onPointerDown={() => playSound('action')}
                onClick={closeKeyboard}
                className="px-4 py-1.5 rounded-xl bg-[#007AFF] text-xs font-semibold text-white shadow-xs hover:bg-[#006FDF] transition-colors cursor-default"
              >
                Xong
              </button>
            </div>
          </div>
        ) : showEmojiPicker ? (
          /* Full Horizontal Scrolling Emoji Board with Unicode Categories */
          <EmojiBoard
            searchQuery={emojiSearchQuery}
            onInsertEmoji={(emoji) => handleCharPress(emoji)}
            onDeleteChar={deleteChar}
            onCloseKeyboard={closeKeyboard}
            onSwitchToABC={() => {
              setShowEmojiPicker(false);
              setEmojiSearchQuery('');
            }}
          />
        ) : (
          /* Standard Keyboard Grid - 40% Opacity Keys, Black Text & Icons, Bubble Tooltips */
          <div className="flex flex-col gap-1 sm:gap-1.5 md:gap-2 flex-1 justify-center">
            {/* ROW 0: Dedicated Number Row (Bàn phím số: 0 đến 9 trên dải phím chữ) */}
            {hasNumberRow && (
              <div className="flex items-center justify-between gap-1 sm:gap-1.5 md:gap-2 w-full">
                {rowNumbers.map((char, colIndex, arr) =>
                  renderCharKey(char, 0, colIndex, arr.length)
                )}
              </div>
            )}

            {/* ROW 1 */}
            <div className="flex items-center justify-between gap-1 sm:gap-1.5 md:gap-2 w-full">
              {(layoutMode === 'alpha' ? row1Alpha : layoutMode === 'numeric' ? row1Num : row1Sym).map((char, colIndex, arr) =>
                renderCharKey(char, 1, colIndex, arr.length)
              )}
            </div>

            {/* ROW 2 (indented) */}
            <div className="flex items-center justify-between gap-1 sm:gap-1.5 md:gap-2 w-full px-[3%] sm:px-[3.5%] md:px-[4%]">
              {(layoutMode === 'alpha' ? row2Alpha : layoutMode === 'numeric' ? row2Num : row2Sym).map((char, colIndex, arr) =>
                renderCharKey(char, 2, colIndex, arr.length)
              )}
            </div>

            {/* ROW 3: Shift / Mode, Characters, Backspace */}
            <div className="flex items-center justify-between gap-1 sm:gap-1.5 md:gap-2 w-full">
              {layoutMode === 'alpha' ? (
                /* Shift Key - Black text and icon */
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    playSound('modifier');
                    if (navigator.vibrate) {
                      try { navigator.vibrate(10); } catch {}
                    }
                  }}
                  onClick={handleShiftTap}
                  className={`w-[13.5%] min-w-[38px] sm:min-w-[48px] ${keyHeightClass} rounded-[7px] sm:rounded-[9px] flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.14)] transition-colors cursor-default backdrop-blur-md border ${
                    isCapsLock || isShiftActive
                      ? 'bg-white/75 text-black border-white/50 shadow-sm'
                      : 'bg-white/40 hover:bg-white/50 text-black border-white/25'
                  }`}
                  title={isCapsLock ? 'Caps Lock BẬT' : isShiftActive ? 'Shift BẬT' : 'Shift'}
                  aria-label="Shift"
                >
                  <ArrowBigUp className={`w-5 h-5 text-black ${isCapsLock || isShiftActive ? 'fill-black' : ''}`} />
                </button>
              ) : (
                /* #+= or 123 Toggle - Black text */
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    playSound('modifier');
                  }}
                  onClick={() => {
                    setLayoutMode(layoutMode === 'numeric' ? 'symbols' : 'numeric');
                  }}
                  className={`w-[13.5%] min-w-[38px] sm:min-w-[48px] ${keyHeightClass} rounded-[7px] sm:rounded-[9px] bg-white/40 hover:bg-white/50 backdrop-blur-md text-black border border-white/25 text-xs sm:text-sm font-semibold flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.14)] transition-colors cursor-default font-sans`}
                >
                  {layoutMode === 'numeric' ? '#+=' : '123'}
                </button>
              )}

              {/* Characters */}
              {(layoutMode === 'alpha' ? row3Alpha : layoutMode === 'numeric' ? row3Num : row3Sym).map((char, colIndex, arr) =>
                renderCharKey(char, 3, colIndex, arr.length)
              )}

              {/* Backspace Key - Black icon */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleDeleteDown();
                }}
                onPointerUp={handleDeleteUp}
                onPointerLeave={handleDeleteUp}
                onPointerCancel={handleDeleteUp}
                className={`w-[13.5%] min-w-[38px] sm:min-w-[48px] ${keyHeightClass} rounded-[7px] sm:rounded-[9px] bg-white/40 hover:bg-white/50 backdrop-blur-md text-black border border-white/25 flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.14)] transition-colors cursor-default`}
                title="Xóa"
                aria-label="Xóa"
              >
                <Delete className="w-5 h-5 text-black" />
              </button>
            </div>

            {/* ROW 4: 123 / ABC, Spacebar, Blue Search Button */}
            <div className="flex items-center justify-between gap-1.5 w-full">
              {/* Layout Switch: 123 or ABC - Black text */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onPointerDown={(e) => {
                  e.preventDefault();
                  playSound('modifier');
                }}
                onClick={() => {
                  setLayoutMode(layoutMode === 'alpha' ? 'numeric' : 'alpha');
                }}
                className={`w-[18%] sm:w-[16%] min-w-[50px] sm:min-w-[70px] ${keyHeightClass} rounded-[7px] sm:rounded-[9px] bg-white/40 hover:bg-white/50 backdrop-blur-md text-black border border-white/25 font-semibold text-sm sm:text-base flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.14)] transition-colors cursor-default font-sans`}
              >
                {layoutMode === 'alpha' ? '123' : 'ABC'}
              </button>

              {/* Spacebar - 40% Opacity, Black text */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onPointerDown={(e) => {
                  e.preventDefault();
                  playSound('space');
                  if (navigator.vibrate) {
                    try { navigator.vibrate(10); } catch {}
                  }
                }}
                onClick={handleSpacePress}
                className={`flex-1 min-w-0 ${keyHeightClass} rounded-[7px] sm:rounded-[9px] bg-white/40 hover:bg-white/50 active:bg-white/60 backdrop-blur-md text-black border border-white/25 font-semibold text-sm flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.14)] transition-colors cursor-default`}
                aria-label="Phím cách"
              >
                <span className="text-[11px] sm:text-xs text-black font-semibold font-sans tracking-wide truncate px-2">
                  {inputMethod === 'vi-telex'
                    ? 'cách • Tiếng Việt (Telex)'
                    : inputMethod === 'vi-vni'
                    ? 'cách • Tiếng Việt (VNI)'
                    : 'space • Tiếng Anh'}
                </span>
              </button>

              {/* Blue Search / Action Button (No Glow) */}
              <button
                type="button"
                id="btn-native-keyboard-search"
                onMouseDown={(e) => e.preventDefault()}
                onPointerDown={(e) => {
                  e.preventDefault();
                  playSound('action');
                  if (navigator.vibrate) {
                    try { navigator.vibrate(16); } catch {}
                  }
                }}
                onClick={handleSearchAction}
                className={`w-[22%] sm:w-[20%] min-w-[65px] sm:min-w-[85px] ${keyHeightClass} rounded-[7px] sm:rounded-[9px] bg-[#007AFF] hover:bg-[#006FDF] active:bg-[#005EC4] text-white flex items-center justify-center shadow-none border-0 transition-colors cursor-default`}
                title="Tìm kiếm"
                aria-label="Tìm kiếm"
              >
                <img
                  src={SF_SEARCH_ICON_URL}
                  alt="Search"
                  className="w-5 h-5 sm:w-5.5 sm:h-5.5 object-contain filter brightness-0 invert select-none pointer-events-none transition-transform"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/icons/sf-magnifyingglass.png';
                  }}
                />
              </button>
            </div>
          </div>
        )}

        {/* ROW 5: Bottom Utility Bar - All text and icons black */}
        <div className="relative flex items-center justify-between px-2 pt-1 pb-1 select-none">
          {/* Left section: Emoji, Globe language switcher, and Clipboard button */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Emoji toggle - Black icon */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onPointerDown={(e) => {
                e.preventDefault();
                playSound('modifier');
              }}
              onClick={() => {
                setShowClipboard(false);
                setShowLanguageMenu(false);
                setShowEmojiPicker((prev) => !prev);
              }}
              className="p-1 text-black hover:text-black transition-colors cursor-default"
              title="Emoji"
              aria-label="Emoji"
            >
              <Smile className="w-5 h-5 text-black" />
            </button>

            {/* Clipboard Button (if enabled in settings) */}
            {settings.keyboardClipboard && (
              <button
                type="button"
                id="btn-native-keyboard-clipboard"
                onMouseDown={(e) => e.preventDefault()}
                onPointerDown={(e) => {
                  e.preventDefault();
                  playSound('modifier');
                }}
                onClick={() => {
                  setShowLanguageMenu(false);
                  setShowEmojiPicker(false);
                  setShowClipboard((prev) => !prev);
                }}
                className={`p-1 rounded-full text-black transition-colors cursor-default flex items-center justify-center ${
                  showClipboard ? 'bg-black/20 text-black shadow-xs' : 'hover:bg-black/10'
                }`}
                title="Lịch sử sao chép (Clipboard)"
                aria-label="Lịch sử sao chép"
              >
                <ClipboardList className="w-5 h-5 text-black" />
              </button>
            )}

            {/* Globe Language Switcher Button - Black icon and text */}
            <div className="relative">
              <button
                type="button"
                id="native-keyboard-globe-btn"
                onMouseDown={(e) => e.preventDefault()}
                onPointerDown={(e) => {
                  e.preventDefault();
                  playSound('modifier');
                }}
                onClick={() => {
                  setShowEmojiPicker(false);
                  setShowLanguageMenu((prev) => !prev);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-default ${
                  showLanguageMenu
                    ? 'bg-black/20 text-black shadow-xs'
                    : 'text-black bg-black/10 hover:bg-black/15'
                }`}
                title="Chuyển ngôn ngữ gõ: Tiếng Anh, Tiếng Việt (Telex), Tiếng Việt (VNI)"
                aria-label="Chuyển ngôn ngữ gõ"
              >
                <Globe className="w-4 h-4 text-black" />
                <span className="text-[11px] font-semibold tracking-tight text-black">
                  {inputMethod === 'vi-telex' ? 'Telex' : inputMethod === 'vi-vni' ? 'VNI' : 'EN'}
                </span>
              </button>

              {/* Language Selection Popup Menu - Styled with 20% white backdrop blur */}
              <AnimatePresence>
                {showLanguageMenu && (
                  <motion.div
                    id="native-keyboard-lang-menu"
                    initial={{ opacity: 0, y: 14, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 20,
                      mass: 0.75
                    }}
                    className="absolute bottom-full left-0 mb-3 z-50 w-64 rounded-[28px] p-3 select-none cursor-default origin-bottom-left overflow-hidden shadow-2xl bg-white/20 backdrop-blur-xl border border-white/30"
                  >
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-black/70 uppercase tracking-wider">
                      Ngôn ngữ gõ
                    </div>
                    <div className="space-y-1 mt-1">
                      {LANGUAGE_OPTIONS.map((lang) => {
                        const isSelected = inputMethod === lang.id;
                        return (
                          <button
                            key={lang.id}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onPointerDown={(e) => {
                              e.preventDefault();
                              playSound('action');
                            }}
                            onClick={() => {
                              setInputMethod(lang.id);
                              setShowLanguageMenu(false);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-default text-left ${
                              isSelected
                                ? 'bg-[#E6005A] text-white font-semibold shadow-xs'
                                : 'text-black hover:bg-white/25 active:bg-white/35'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-lg leading-none">{lang.flag}</span>
                              <span className="text-sm font-medium">{lang.label}</span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 stroke-[2.5] text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right section: SF Symbol Microphone - Pure black icon */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onPointerDown={(e) => {
                e.preventDefault();
                playSound('action');
              }}
              onClick={toggleMic}
              className={`p-1.5 rounded-full transition-colors cursor-default flex items-center justify-center ${
                isMicListening
                  ? 'bg-red-500/25 ring-2 ring-red-500/50'
                  : 'hover:bg-black/10'
              }`}
              title={isMicListening ? 'Đang nghe...' : 'Nhập bằng giọng nói'}
              aria-label="Microphone"
            >
              <img
                src={SF_MIC_ICON_URL}
                alt="Mic"
                className={`w-5 h-5 sm:w-5.5 sm:h-5.5 object-contain select-none pointer-events-none transition-opacity filter brightness-0 ${
                  isMicListening ? 'opacity-100' : 'opacity-90 hover:opacity-100'
                }`}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/icons/sf-mic.png';
                }}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
