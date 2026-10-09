import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

interface DeveloperModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivate: () => void;
}

export const DeveloperModeModal: React.FC<DeveloperModeModalProps> = ({
  isOpen,
  onClose,
  onActivate,
}) => {
  const { settings } = useSettings();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input and reset when opened
  useEffect(() => {
    if (isOpen) {
      setCode('');
      setError(null);
      setShowPassword(false);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Listen for Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleActivate = () => {
    const cleanCode = code.trim();
    if (cleanCode.length !== 6) {
      setError('Vui lòng nhập đúng 6 ký tự.');
      inputRef.current?.focus();
      return;
    }

    // Activated successfully
    setError(null);
    onActivate();
    onClose();
  };

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleActivate();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="developer-mode-modal-container"
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 select-none"
        >
          {/* 1. Backdrop / Lớp nền mờ */}
          <motion.div
            id="developer-mode-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
          />

          {/* 2. Dialog Modal Box - Fluent Design ContentDialog */}
          <motion.div
            id="developer-mode-modal-dialog"
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: {
                duration: 0.22,
                ease: [0.1, 0.9, 0.2, 1],
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.98,
              y: 6,
              transition: {
                duration: 0.16,
                ease: 'easeIn',
              },
            }}
            className="fluent-modal-dialog relative z-10 w-full max-w-[440px] bg-white dark:bg-[#202020] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)] border border-black/[0.08] dark:border-white/[0.08] text-[#1F1F1F] dark:text-[#F3F4F6]"
          >
            {/* Header & Body Content Area */}
            <div className="p-6 pb-5">
              <h2
                id="developer-mode-modal-title"
                className="text-[20px] font-semibold text-[#1F1F1F] dark:text-[#FFFFFF] tracking-tight leading-snug font-sans"
              >
                Kích hoạt chế độ Nhà phát triển
              </h2>

              <p
                id="developer-mode-modal-description"
                className="text-[14px] text-[#555555] dark:text-[#CCCCCC] leading-normal mt-2.5 font-normal"
              >
                Nhập mã bảo mật 6 ký tự được cung cấp để mở khóa các công cụ và thử nghiệm nâng cao trên hệ thống.
              </p>

              {/* 6-character Code Input Field */}
              <div className="mt-4">
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-[#777777] pointer-events-none">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    ref={inputRef}
                    id="input-developer-code"
                    type={showPassword ? 'text' : 'password'}
                    maxLength={6}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.slice(0, 6));
                      if (error) setError(null);
                    }}
                    onKeyDown={handleKeyDownInput}
                    placeholder="••••••"
                    className="w-full bg-[#F9F9F9] dark:bg-[#2B2B2B] border border-black/[0.12] dark:border-white/[0.12] rounded-md pl-9 pr-10 py-2 text-center text-lg font-mono tracking-[0.3em] text-[#1F1F1F] dark:text-[#FFFFFF] placeholder:text-[#888888] focus:outline-none focus:border-[#0067c0] focus:ring-1 focus:ring-[#0067c0] transition-all"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[#777777] hover:text-[#1F1F1F] dark:hover:text-[#FFFFFF] transition-colors cursor-default p-1"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {error && (
                  <p className="text-xs text-rose-500 mt-2 px-1 font-medium">
                    {error}
                  </p>
                )}
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="h-[1px] w-full bg-[#E5E5E5] dark:bg-[#2F2F2F]" />

            {/* Bottom Actions Footer */}
            <div className="fluent-modal-footer bg-[#F3F3F3] dark:bg-[#272727] px-6 py-3.5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                id="btn-devmode-activate"
                onClick={handleActivate}
                className="fluent-btn-primary px-5 py-1.5 h-8 sm:h-9 rounded-[4px] bg-[#0067c0] hover:bg-[#1875c7] active:bg-[#005fb8] text-white text-[14px] font-medium shadow-sm transition-colors border border-[#005A9E] border-b-2 border-b-[#004578] flex items-center justify-center cursor-default"
              >
                Kích hoạt
              </button>
              <button
                type="button"
                id="btn-devmode-close"
                onClick={onClose}
                className="fluent-btn-secondary px-5 py-1.5 h-8 sm:h-9 rounded-[4px] bg-white dark:bg-[#2D2D2D] hover:bg-[#F9F9F9] dark:hover:bg-[#383838] active:bg-[#EEEEEE] dark:active:bg-[#222222] text-[#1F1F1F] dark:text-[#FFFFFF] border border-[#d1d1d1] dark:border-[#3E3E3E] border-b-[#b5b5b5] dark:border-b-[#4F4F4F] text-[14px] font-normal shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors flex items-center justify-center cursor-default"
              >
                Hủy bỏ
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
