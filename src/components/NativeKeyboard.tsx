import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Delete, Smile, ArrowBigUp, X, Check, Globe, Keyboard } from 'lucide-react';
import { useNativeKeyboard } from '../context/NativeKeyboardContext';
import { keyboardSound } from '../utils/keyboardSound';
import { VietnameseInputMethod } from '../utils/vietnameseIME';

const SF_SEARCH_ICON_URL = 'https://github.com/andrewtavis/sf-symbols-online/blob/master/glyphs/magnifyingglass.png?raw=true';
const SF_MIC_ICON_URL = 'https://github.com/andrewtavis/sf-symbols-online/blob/master/glyphs/mic.png?raw=true';

type KeyboardLayoutMode = 'alpha' | 'numeric' | 'symbols';

const LANGUAGE_OPTIONS: { id: VietnameseInputMethod; label: string; short: string; flag: string }[] = [
  { id: 'vi-telex', label: 'Tiếng Việt (Telex)', short: 'Telex', flag: '🇻🇳' },
  { id: 'vi-vni', label: 'Tiếng Việt (VNI)', short: 'VNI', flag: '🇻🇳' },
  { id: 'en', label: 'Tiếng Anh', short: 'English', flag: '🇬🇧' },
];

export const NativeKeyboard: React.FC = () => {
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
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
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
      setShowLanguageMenu(false);
      setActiveBubbleKey(null);
      keyboardSound.unlockAudio();
    }
  }, [isOpen]);

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

  if (!isNativeKeyboardEnabled) return null;

  // Key press handlers
  const handleCharPress = (char: string) => {
    playSound('char');
    if (navigator.vibrate) {
      try { navigator.vibrate(8); } catch {}
    }

    const output = (isShiftActive || isCapsLock) ? char.toUpperCase() : char.toLowerCase();
    insertText(output);

    // If shift was active (and not caps lock), turn off after one character
    if (isShiftActive && !isCapsLock) {
      setIsShiftActive(false);
    }
  };

  const handleSpacePress = () => {
    playSound('space');
    if (navigator.vibrate) {
      try { navigator.vibrate(10); } catch {}
    }
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
    playSound('modifier');
    if (navigator.vibrate) {
      try { navigator.vibrate(10); } catch {}
    }

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
    playSound('action');
    if (navigator.vibrate) {
      try { navigator.vibrate(18); } catch {}
    }
    submitAction();
  };

  const toggleMic = () => {
    playSound('action');
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
  const row1Alpha = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  const row2Alpha = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
  const row3Alpha = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

  const row1Num = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const row2Num = ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'];
  const row3Num = ['.', ',', '?', '!', "'"];

  const row1Sym = ['[', ']', '{', '}', '#', '%', '^', '*', '+', '='];
  const row2Sym = ['_', '\\', '|', '~', '<', '>', '€', '£', '¥', '•'];
  const row3Sym = ['.', ',', '?', '!', "'"];

  const commonEmojis = [
    '😀', '😂', '😍', '👍', '🔥', '❤️', '🎉', '🇻🇳', '📺', '⭐',
    '🎬', '🍿', '⚡', '✨', '👏', '🥳', '😎', '💯', '🚀', '👀'
  ];

  // Render individual character key with bubble tooltip
  const renderCharKey = (char: string, rowIndex: number, colIndex: number, totalCols: number) => {
    const keyId = `${layoutMode}-${rowIndex}-${char}-${colIndex}`;
    const displayChar = (isShiftActive || isCapsLock) ? char.toUpperCase() : char;
    const isBubbleActive = activeBubbleKey === keyId;

    return (
      <button
        key={keyId}
        type="button"
        onPointerDown={(e) => {
          playSound('char');
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
        className={`relative flex-1 min-w-0 h-[42px] sm:h-[46px] md:h-[50px] rounded-[7px] sm:rounded-[9px] bg-white/40 hover:bg-white/50 active:bg-white/60 backdrop-blur-md text-black border border-white/40 shadow-[0_1px_2px_rgba(0,0,0,0.14)] font-semibold text-[19px] sm:text-[21px] md:text-[23px] flex items-center justify-center transition-all cursor-pointer font-sans select-none ${
          isBubbleActive ? 'z-40 bg-white/70 scale-[0.97]' : 'z-10'
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
        {/* Top bar with Switch to device's keyboard button and dismiss button */}
        <div className="flex items-center justify-between px-1 pt-0.5 pb-1 select-none">
          {/* Switch to device's keyboard button - Text and icon are black */}
          <button
            type="button"
            id="btn-switch-to-device-keyboard"
            onPointerDown={() => playSound('action')}
            onClick={() => {
              switchToDeviceKeyboard();
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/10 hover:bg-black/15 text-black text-[11px] sm:text-xs font-semibold tracking-tight transition-all active:scale-95 cursor-pointer shadow-xs"
            title="Switch to device's keyboard"
          >
            <Keyboard className="w-3.5 h-3.5 text-black" />
            <span className="text-black">Switch to device's keyboard</span>
          </button>

          {/* Active input hint / indicator & Dismiss button - Text and icon are black */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-black truncate max-w-[130px] sm:max-w-[220px] select-none hidden xs:inline">
              {activeInput?.placeholder || 'Vplay Keyboard'}
            </span>

            {/* Dismiss button */}
            <button
              type="button"
              onPointerDown={() => playSound('action')}
              onClick={closeKeyboard}
              className="p-1 rounded-full text-black hover:bg-black/10 active:scale-95 transition-all cursor-pointer"
              title="Đóng bàn phím"
              aria-label="Đóng bàn phím"
            >
              <X className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>

        {showEmojiPicker ? (
          /* Emoji Quick Picker */
          <div className="flex-1 flex flex-col justify-between px-2 py-1">
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 p-1 overflow-y-auto max-h-[160px]">
              {commonEmojis.map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  onPointerDown={() => playSound('char')}
                  onClick={() => {
                    handleCharPress(emoji);
                  }}
                  className="h-10 text-2xl flex items-center justify-center bg-white/40 backdrop-blur-md rounded-xl hover:bg-white/60 active:scale-90 transition-all shadow-sm border border-white/40"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onPointerDown={() => playSound('modifier')}
                onClick={() => setShowEmojiPicker(false)}
                className="px-4 py-1.5 rounded-xl bg-white/40 backdrop-blur-md text-xs font-semibold text-black border border-white/40 hover:bg-white/60 transition-all"
              >
                ABC
              </button>
              <button
                type="button"
                onPointerDown={() => playSound('action')}
                onClick={closeKeyboard}
                className="px-4 py-1.5 rounded-xl bg-[#007AFF] text-xs font-semibold text-white shadow-sm hover:bg-[#006FDF] active:scale-95 transition-all"
              >
                Xong
              </button>
            </div>
          </div>
        ) : (
          /* Standard Keyboard Grid - 40% Opacity Keys, Black Text & Icons, Bubble Tooltips */
          <div className="flex flex-col gap-1.5 sm:gap-2 flex-1 justify-center">
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
                  onPointerDown={() => playSound('modifier')}
                  onClick={handleShiftTap}
                  className={`w-[13.5%] min-w-[38px] sm:min-w-[48px] h-[42px] sm:h-[46px] md:h-[50px] rounded-[7px] sm:rounded-[9px] flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.14)] transition-all cursor-pointer active:scale-95 backdrop-blur-md border ${
                    isCapsLock || isShiftActive
                      ? 'bg-white/75 text-black border-white/60 shadow-sm'
                      : 'bg-white/40 hover:bg-white/50 text-black border-white/40'
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
                  onPointerDown={() => playSound('modifier')}
                  onClick={() => {
                    setLayoutMode(layoutMode === 'numeric' ? 'symbols' : 'numeric');
                  }}
                  className="w-[13.5%] min-w-[38px] sm:min-w-[48px] h-[42px] sm:h-[46px] md:h-[50px] rounded-[7px] sm:rounded-[9px] bg-white/40 hover:bg-white/50 backdrop-blur-md text-black border border-white/40 text-xs sm:text-sm font-semibold flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.14)] active:scale-95 transition-all cursor-pointer font-sans"
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
                onMouseDown={handleDeleteDown}
                onMouseUp={handleDeleteUp}
                onMouseLeave={handleDeleteUp}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleDeleteDown();
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleDeleteUp();
                }}
                className="w-[13.5%] min-w-[38px] sm:min-w-[48px] h-[42px] sm:h-[46px] md:h-[50px] rounded-[7px] sm:rounded-[9px] bg-white/40 hover:bg-white/50 backdrop-blur-md text-black border border-white/40 flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.14)] active:scale-95 transition-all cursor-pointer"
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
                onPointerDown={() => playSound('modifier')}
                onClick={() => {
                  setLayoutMode(layoutMode === 'alpha' ? 'numeric' : 'alpha');
                }}
                className="w-[18%] sm:w-[16%] min-w-[50px] sm:min-w-[70px] h-[42px] sm:h-[46px] md:h-[50px] rounded-[7px] sm:rounded-[9px] bg-white/40 hover:bg-white/50 backdrop-blur-md text-black border border-white/40 font-semibold text-sm sm:text-base flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.14)] active:scale-95 transition-all cursor-pointer font-sans"
              >
                {layoutMode === 'alpha' ? '123' : 'ABC'}
              </button>

              {/* Spacebar - 40% Opacity, Black text */}
              <button
                type="button"
                onPointerDown={() => playSound('space')}
                onClick={handleSpacePress}
                className="flex-1 min-w-0 h-[42px] sm:h-[46px] md:h-[50px] rounded-[7px] sm:rounded-[9px] bg-white/40 hover:bg-white/50 active:bg-white/60 backdrop-blur-md text-black border border-white/40 font-semibold text-sm flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.14)] active:scale-[0.98] transition-all cursor-pointer"
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

              {/* Blue Search / Action Button (NO changes - kept blue with white search icon as instructed) */}
              <button
                type="button"
                onPointerDown={() => playSound('action')}
                onClick={handleSearchAction}
                className="w-[22%] sm:w-[20%] min-w-[65px] sm:min-w-[85px] h-[42px] sm:h-[46px] md:h-[50px] rounded-[7px] sm:rounded-[9px] bg-[#007AFF] hover:bg-[#006FDF] active:bg-[#005EC4] text-white flex items-center justify-center shadow-[0_2px_6px_rgba(0,122,255,0.40)] active:scale-[0.95] transition-all cursor-pointer"
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
          {/* Left section: Emoji and Globe language switcher */}
          <div className="flex items-center gap-2">
            {/* Emoji toggle - Black icon */}
            <button
              type="button"
              onPointerDown={() => playSound('modifier')}
              onClick={() => {
                setShowLanguageMenu(false);
                setShowEmojiPicker((prev) => !prev);
              }}
              className="p-1 text-black hover:text-black active:scale-90 transition-transform cursor-pointer"
              title="Emoji"
              aria-label="Emoji"
            >
              <Smile className="w-5 h-5 text-black" />
            </button>

            {/* Globe Language Switcher Button - Black icon and text */}
            <div className="relative">
              <button
                type="button"
                id="native-keyboard-globe-btn"
                onPointerDown={() => playSound('modifier')}
                onClick={() => {
                  setShowEmojiPicker(false);
                  setShowLanguageMenu((prev) => !prev);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all active:scale-90 cursor-pointer ${
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

              {/* Language Selection Popup Menu */}
              {showLanguageMenu && (
                <div
                  id="native-keyboard-lang-menu"
                  className="absolute bottom-full left-0 mb-3 z-50 w-56 rounded-2xl border border-black/10 bg-white/95 backdrop-blur-2xl shadow-2xl p-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200"
                  style={{
                    boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
                  }}
                >
                  <div className="px-3 py-1 text-[11px] font-semibold text-black/70 uppercase tracking-wider">
                    Ngôn ngữ gõ
                  </div>
                  <div className="space-y-1">
                    {LANGUAGE_OPTIONS.map((lang) => {
                      const isSelected = inputMethod === lang.id;
                      return (
                        <button
                          key={lang.id}
                          type="button"
                          onPointerDown={() => playSound('action')}
                          onClick={() => {
                            setInputMethod(lang.id);
                            setShowLanguageMenu(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                            isSelected
                              ? 'bg-[#007AFF] text-white font-semibold'
                              : 'text-black hover:bg-black/10'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{lang.flag}</span>
                            <span className={isSelected ? 'text-white' : 'text-black'}>{lang.label}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 stroke-[2.5] text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right section: SF Symbol Microphone - Pure black icon */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onPointerDown={() => playSound('action')}
              onClick={toggleMic}
              className={`p-1.5 rounded-full transition-all active:scale-90 cursor-pointer flex items-center justify-center ${
                isMicListening
                  ? 'bg-red-500/25 ring-2 ring-red-500/50 scale-105'
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
