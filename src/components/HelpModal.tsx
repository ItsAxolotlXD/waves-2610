import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Keyboard, HelpCircle, Tv, Search, Moon, Bookmark, Share2 } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { settings } = useSettings();
  const shouldAnimate = !settings.reduceAllMotion && settings.animateModals;

  const shortcuts = [
    { key: 'Alt + 1', desc: 'Trang chủ (Home)' },
    { key: 'Alt + 2', desc: 'Tìm kiếm (Spotlight Search)' },
    { key: 'Alt + 3', desc: 'Menu tiện ích (Tools menu)' },
    { key: 'Alt + 4', desc: 'Cài đặt (Settings)' },
    { key: 'Alt + 5', desc: 'Kênh xem gần nhất' },
    { key: '⌘ + K / Ctrl + K', desc: 'Mở Spotlight tìm kiếm nhanh' },
    { key: 'Space', desc: 'Tạm dừng / Tiếp tục phát luồng Live TV' },
    { key: 'M', desc: 'Bật / Tắt âm thanh (Mute / Unmute)' },
    { key: 'F', desc: 'Xem toàn màn hình (Fullscreen Player)' },
    { key: 'T', desc: 'Chế độ Rạp chiếu (Theater Mode)' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            id="help-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
          />

          <motion.div
            id="help-modal-dialog"
            initial={shouldAnimate ? { opacity: 0, scale: 0.98, y: 8 } : { opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldAnimate ? { opacity: 0, scale: 0.98, y: 6 } : { opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.1, 0.9, 0.2, 1] }}
            className="fluent-modal-dialog relative z-10 w-full max-w-[480px] bg-white dark:bg-[#202020] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)] border border-black/[0.08] dark:border-white/[0.08] text-[#1F1F1F] dark:text-[#F3F4F6]"
          >
            {/* Header & Body Content Area */}
            <div className="p-6 pb-4 max-h-[75vh] overflow-y-auto">
              <h2 className="text-[20px] font-semibold text-[#1F1F1F] dark:text-[#FFFFFF] tracking-tight leading-snug font-sans">
                Trợ giúp & Phím tắt VNRT Online
              </h2>
              <p className="text-[14px] text-[#555555] dark:text-[#CCCCCC] leading-normal mt-1.5 font-normal">
                Danh sách phím tắt thao tác nhanh và mẹo sử dụng nền tảng
              </p>

              <div className="mt-4 space-y-3">
                <div className="space-y-1.5">
                  {shortcuts.map((sc, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2 rounded-md bg-[#F9F9F9] dark:bg-[#2B2B2B] border border-black/[0.06] dark:border-white/[0.08] text-[13px]"
                    >
                      <span className="text-[#333333] dark:text-[#DDDDDD] font-normal">{sc.desc}</span>
                      <kbd className="px-2 py-0.5 rounded bg-black/[0.06] dark:bg-white/[0.1] font-mono text-[11px] text-[#0067C0] dark:text-[#4CC2FF] border border-black/[0.08] dark:border-white/[0.1]">
                        {sc.key}
                      </kbd>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-[#F9F9F9] dark:bg-[#2B2B2B] border border-black/[0.06] dark:border-white/[0.08] text-[12px] text-[#555555] dark:text-[#AAAAAA] space-y-1 leading-relaxed">
                  <p className="font-semibold text-[#1F1F1F] dark:text-[#FFFFFF]">💡 Mẹo sử dụng:</p>
                  <p>• Dùng menu Tools trên thanh công cụ để nhập luồng M3U8 tùy chỉnh hoặc xuất danh sách kênh của bạn.</p>
                  <p>• Trong trang tin tức, công cụ Tools hỗ trợ tóm tắt AI, tìm kiếm từ ngữ và xuất file Word .docx.</p>
                </div>
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="h-[1px] w-full bg-[#E5E5E5] dark:bg-[#2F2F2F]" />

            {/* Bottom Actions Footer */}
            <div className="fluent-modal-footer bg-[#F3F3F3] dark:bg-[#272727] px-6 py-3.5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="fluent-btn-primary px-5 py-1.5 h-8 sm:h-9 rounded-[4px] bg-[#0067c0] hover:bg-[#1875c7] active:bg-[#005fb8] text-white text-[14px] font-medium shadow-sm transition-colors border border-[#005A9E] border-b-2 border-b-[#004578] flex items-center justify-center cursor-default"
              >
                Đã hiểu
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
