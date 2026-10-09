import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface DiscordWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiscordWelcomeModal: React.FC<DiscordWelcomeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const handleJoin = () => {
    window.open('https://discord.gg/wcdjaDDayK', '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="discord-welcome-container"
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6"
        >
          {/* 1. Backdrop / Lớp nền mờ */}
          <motion.div
            id="discord-welcome-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
          />

          {/* 2. Dialog Modal Box - Fluent Design ContentDialog */}
          <motion.div
            id="discord-welcome-dialog"
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
            className="fluent-modal-dialog relative z-10 w-full max-w-[450px] bg-white dark:bg-[#202020] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)] select-none border border-black/[0.08] dark:border-white/[0.08] text-[#1F1F1F] dark:text-[#F3F4F6]"
          >
            {/* Header & Body Content Area */}
            <div className="p-6 pb-5">
              <h2
                id="discord-welcome-title"
                className="text-[20px] font-semibold text-[#1F1F1F] dark:text-[#FFFFFF] tracking-tight leading-snug font-sans"
              >
                Chào mừng bạn đến với Waves!
              </h2>

              <p
                id="discord-welcome-subtitle"
                className="text-[14px] text-[#555555] dark:text-[#CCCCCC] leading-relaxed mt-2.5 font-normal"
              >
                “Nhịp sóng lưu dấu thời đại” – nơi kết nối cộng đồng từ khắp mọi miền Bắc – Trung – Nam, cùng gặp gỡ, sẻ chia và lưu giữ những khoảnh khắc, ký ức và dấu ấn truyền thông Việt Nam.
              </p>
            </div>

            {/* Subtle Divider */}
            <div className="h-[1px] w-full bg-[#E5E5E5] dark:bg-[#2F2F2F]" />

            {/* Bottom Actions Footer */}
            <div className="fluent-modal-footer bg-[#F3F3F3] dark:bg-[#272727] px-6 py-3.5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                id="btn-discord-join"
                onClick={handleJoin}
                className="fluent-btn-primary px-5 py-1.5 h-8 sm:h-9 rounded-[4px] bg-[#5865F2] hover:bg-[#4752C4] active:bg-[#3C45A5] text-white text-[14px] font-medium shadow-sm transition-colors border border-[#4752C4] border-b-2 border-b-[#3C45A5] flex items-center justify-center cursor-default"
              >
                Join Discord
              </button>
              <button
                type="button"
                id="btn-discord-close"
                onClick={onClose}
                className="fluent-btn-secondary px-5 py-1.5 h-8 sm:h-9 rounded-[4px] bg-white dark:bg-[#2D2D2D] hover:bg-[#F9F9F9] dark:hover:bg-[#383838] active:bg-[#EEEEEE] dark:active:bg-[#222222] text-[#1F1F1F] dark:text-[#FFFFFF] border border-[#d1d1d1] dark:border-[#3E3E3E] border-b-[#b5b5b5] dark:border-b-[#4F4F4F] text-[14px] font-normal shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors flex items-center justify-center cursor-default"
              >
                Để sau
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
