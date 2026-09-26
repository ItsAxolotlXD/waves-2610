import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings } = useSettings();
  const shouldAnimate = !settings.reduceAllMotion && settings.animateModals;

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="welcome-modal-container"
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 select-none"
        >
          {/* 1. Backdrop / Lớp nền mờ */}
          <motion.div
            id="welcome-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/10 backdrop-blur-md"
          />

          {/* 2. Dialog Modal Box */}
          <motion.div
            id="welcome-modal-dialog"
            initial={{ opacity: 0, scale: 1.10 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              transition: {
                duration: 0.40,
                ease: [0.16, 1, 0.3, 1]
              }
            }}
            exit={{ 
              opacity: 0, 
              scale: 1.08,
              transition: {
                duration: 0.26,
                ease: [0.25, 0.1, 0.25, 1]
              }
            }}
            className="spatial-glass-modal relative z-10 w-full max-w-[450px] bg-white/70 rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 shadow-2xl border border-white/50 text-black"
          >
            {/* Top Close Button (Clean, no background, no border) */}
            <div className="flex items-center justify-end mb-2">
              <button
                type="button"
                id="btn-welcome-close-icon"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-transparent hover:bg-transparent border-none text-neutral-700 hover:text-black flex items-center justify-center transition-colors cursor-default"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title */}
            <h1
              id="welcome-modal-title"
              className="text-xl sm:text-[22px] font-bold text-black tracking-tight mb-2 font-sans leading-tight"
            >
              Cập nhật thành công
            </h1>

            {/* Description */}
            <p
              id="welcome-modal-description"
              className="text-xs sm:text-sm text-neutral-800 leading-relaxed mb-4 font-normal"
            >
              Phiên bản VNRT Online của bạn đã được cập nhật thành công lên phiên bản mới nhất. Dưới đây là một số thông tin về phiên bản này
            </p>

            {/* Bảng Giới thiệu phiên bản (Từ settings) */}
            <div className="p-4 sm:p-5 rounded-[20px] bg-black/5 border border-black/10 space-y-3.5 select-text mb-5">
              <div className="flex items-center justify-between text-sm sm:text-[15px]">
                <span className="font-medium text-black">Software Update</span>
                <span className="font-semibold text-neutral-800">26.10.0</span>
              </div>
              <div className="flex items-center justify-between text-sm sm:text-[15px]">
                <span className="font-medium text-black">Software Build</span>
                <span className="font-semibold text-neutral-800">26V1005</span>
              </div>
              {/* Dòng chữ to dưới Software Build: Compatible with Spatial Glass */}
              <div id="settings-compatible-spatial-glass" className="pt-3 mt-1 border-t border-black/10 flex items-center">
                <p className="text-base sm:text-lg font-bold tracking-tight text-black">
                  Compatible with{' '}
                  <span className="bg-gradient-to-r from-[#FF8A00] via-[#FF0A54] to-[#E6005A] bg-clip-text text-transparent font-bold drop-shadow-[0_0_12px_rgba(230,0,90,0.35)]">
                    Spatial Glass.
                  </span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              {/* Button colored: Close */}
              <button
                type="button"
                id="btn-welcome-close"
                onClick={onClose}
                className="w-full py-2.5 sm:py-3 px-5 rounded-full font-bold text-white bg-[#fd932f] hover:bg-[#e68428] active:scale-[0.98] transition-all text-sm sm:text-base cursor-default flex items-center justify-center shadow-md tracking-tight text-center"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
