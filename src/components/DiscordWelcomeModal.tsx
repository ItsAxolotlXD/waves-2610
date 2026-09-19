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
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* 2. Dialog Modal Box */}
          <motion.div
            id="discord-welcome-dialog"
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
            className="relative z-10 w-full max-w-[450px] bg-[#27282D] rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 shadow-2xl select-none border border-white/10"
          >
            {/* Title */}
            <h1
              id="discord-welcome-title"
              className="text-xl sm:text-[23px] font-bold text-white tracking-tight mb-2.5 font-sans leading-tight"
            >
              Chào mừng bạn!
            </h1>

            {/* Subtitle */}
            <p
              id="discord-welcome-subtitle"
              className="text-xs sm:text-sm text-[#D1D5DB] leading-relaxed mb-5 font-normal"
            >
              “Nhịp sóng lưu dấu thời đại” – nơi kết nối những tâm hồn từ khắp mọi miền Bắc – Trung – Nam, cùng gặp gỡ, sẻ chia và trò chuyện qua những câu chuyện của thời đại. Không chỉ là nơi hội tụ của những tiếng nói và góc nhìn đa dạng, đây còn là không gian lưu giữ những ký ức, khoảnh khắc và dấu ấn truyền thông – những mảnh ghép nhỏ góp phần tạo nên bức tranh lớn của một thời đã qua.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              {/* Button colored: Join Waves on Discord */}
              <button
                type="button"
                id="btn-discord-join"
                onClick={handleJoin}
                className="w-full h-11 sm:h-12 px-5 rounded-full font-bold text-white bg-[#5865F2] hover:bg-[#4752C4] active:scale-[0.98] transition-all text-sm sm:text-base cursor-pointer flex items-center justify-center shadow-md tracking-tight text-center"
              >
                Join Waves on Discord
              </button>

              {/* Button normal: Close */}
              <button
                type="button"
                id="btn-discord-close"
                onClick={onClose}
                className="w-full h-11 sm:h-12 px-5 rounded-full font-semibold text-[#D1D5DB] hover:text-white active:scale-[0.98] transition-all text-sm sm:text-base cursor-pointer flex items-center justify-center text-center"
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
