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
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* 2. Dialog Modal Box */}
          <motion.div
            id="developer-mode-modal-dialog"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: {
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              },
            }}
            exit={{
              opacity: 0,
              scale: 1.08,
              transition: {
                duration: 0.26,
                ease: [0.25, 0.1, 0.25, 1],
              },
            }}
            className="relative z-10 w-full max-w-[420px] sm:max-w-[440px] bg-[#27282D] rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 shadow-2xl border border-white/10"
          >
            {/* Title */}
            <h1
              id="developer-mode-modal-title"
              className="text-xl sm:text-[23px] font-bold text-white tracking-tight mb-2.5 font-sans leading-tight"
            >
              Mã kích hoạt
            </h1>

            {/* Description */}
            <p
              id="developer-mode-modal-description"
              className="text-xs sm:text-sm text-[#D1D5DB] leading-relaxed mb-5 font-normal"
            >
              Vui lòng nhập mật khẩu 6 ký tự được cung cấp nếu bạn là nhà phát triển để kích hoạt chế độ.
            </p>

            {/* 6-character Code Input Field */}
            <div className="mb-5">
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-white/40 pointer-events-none">
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
                  className="w-full bg-[#28272E] border border-white/10 rounded-2xl pl-10 pr-11 py-3 text-center text-lg sm:text-xl font-mono tracking-[0.35em] text-white placeholder:text-gray-500 placeholder:tracking-normal placeholder:font-sans placeholder:text-sm focus:outline-none focus:border-[#E6005A] focus:ring-1 focus:ring-[#E6005A] transition-all"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-white/40 hover:text-white transition-colors cursor-pointer p-1"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Error or hint */}
              {error && (
                <p className="text-xs text-rose-400 mt-2 px-1 font-medium">
                  {error}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              {/* Button colored: Kích hoạt */}
              <button
                type="button"
                id="btn-devmode-activate"
                onClick={handleActivate}
                className="w-full py-2.5 sm:py-3 px-5 rounded-full font-bold text-white bg-[#E6005A] hover:bg-[#FF267A] active:scale-[0.98] transition-all text-sm sm:text-base cursor-pointer flex items-center justify-center shadow-md tracking-tight text-center"
              >
                Kích hoạt
              </button>

              {/* Button normal: Close */}
              <button
                type="button"
                id="btn-devmode-close"
                onClick={onClose}
                className="w-full py-2.5 sm:py-3 px-5 rounded-full font-semibold text-gray-300 hover:text-white bg-white/10 hover:bg-white/15 active:scale-[0.98] transition-all text-sm sm:text-base cursor-pointer flex items-center justify-center text-center"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
