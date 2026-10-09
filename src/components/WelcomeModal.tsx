import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
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
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
          />

          {/* 2. Dialog Modal Box - Fluent Design ContentDialog */}
          <motion.div
            id="welcome-modal-dialog"
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: 0,
              transition: {
                duration: 0.22,
                ease: [0.1, 0.9, 0.2, 1]
              }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.98,
              y: 6,
              transition: {
                duration: 0.16,
                ease: 'easeIn'
              }
            }}
            className="fluent-modal-dialog relative z-10 w-full max-w-[440px] bg-white dark:bg-[#202020] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)] border border-black/[0.08] dark:border-white/[0.08] text-[#1F1F1F] dark:text-[#F3F4F6]"
          >
            {/* Header & Body Content Area */}
            <div className="p-6 pb-5">
              <h2
                id="welcome-modal-title"
                className="text-[20px] font-semibold text-[#1F1F1F] dark:text-[#FFFFFF] tracking-tight leading-snug font-sans"
              >
                Cập nhật thành công
              </h2>

              <p
                id="welcome-modal-description"
                className="text-[14px] text-[#555555] dark:text-[#CCCCCC] leading-normal mt-2.5 font-normal"
              >
                Phiên bản VNRT Online của bạn đã được cập nhật thành công với giao diện Microsoft Fluent Design hiện đại, mượt mà và trực quan.
              </p>

              {/* Version Specs in Fluent Card */}
              <div className="mt-4 p-3.5 rounded-lg bg-[#F9F9F9] dark:bg-[#2B2B2B] border border-black/[0.06] dark:border-white/[0.08] space-y-2 select-text text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#666666] dark:text-[#AAAAAA]">Software Update</span>
                  <span className="font-semibold text-[#1F1F1F] dark:text-[#FFFFFF]">26.10.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#666666] dark:text-[#AAAAAA]">Software Build</span>
                  <span className="font-semibold text-[#1F1F1F] dark:text-[#FFFFFF]">26v1009</span>
                </div>
                <div className="pt-2 mt-1 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
                  <span className="text-[#666666] dark:text-[#AAAAAA]">Design System</span>
                  <span className="font-semibold text-[#0067C0] dark:text-[#4CC2FF]">
                    Microsoft Fluent Design
                  </span>
                </div>
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="h-[1px] w-full bg-[#E5E5E5] dark:bg-[#2F2F2F]" />

            {/* Bottom Actions Footer */}
            <div className="fluent-modal-footer bg-[#F3F3F3] dark:bg-[#272727] px-6 py-3.5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                id="btn-welcome-close"
                onClick={onClose}
                className="fluent-btn-primary px-5 py-1.5 h-8 sm:h-9 rounded-[4px] bg-[#0067c0] hover:bg-[#1875c7] active:bg-[#005fb8] text-white text-[14px] font-medium shadow-sm transition-colors border border-[#005A9E] border-b-2 border-b-[#004578] flex items-center justify-center cursor-default"
              >
                Đồng ý
              </button>
              <button
                type="button"
                onClick={onClose}
                className="fluent-btn-secondary px-5 py-1.5 h-8 sm:h-9 rounded-[4px] bg-white dark:bg-[#2D2D2D] hover:bg-[#F9F9F9] dark:hover:bg-[#383838] active:bg-[#EEEEEE] dark:active:bg-[#222222] text-[#1F1F1F] dark:text-[#FFFFFF] border border-[#d1d1d1] dark:border-[#3E3E3E] border-b-[#b5b5b5] dark:border-b-[#4F4F4F] text-[14px] font-normal shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors flex items-center justify-center cursor-default"
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
