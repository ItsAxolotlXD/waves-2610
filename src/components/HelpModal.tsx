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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldAnimate ? 0.3 : 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            id="help-modal-dialog"
            initial={shouldAnimate ? { opacity: 0, scale: 1.08 } : { opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={shouldAnimate ? { opacity: 0, scale: 1.05 } : { opacity: 0 }}
            transition={{ duration: shouldAnimate ? 0.35 : 0, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[450px] bg-[#27282D] border border-white/10 rounded-[26px] p-5 sm:p-6 shadow-2xl z-10 text-white"
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-[#2C2C34]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#E6005A]/20 text-[#E6005A] flex items-center justify-center border border-[#E6005A]/30">
                  <HelpCircle className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Trợ giúp & Hướng dẫn Vplay</h3>
                  <p className="text-[11px] text-[#9CA3AF]">Phím tắt và mẹo sử dụng nền tảng</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-[#27121d] flex items-center justify-center text-[#9CA3AF] hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#E6005A] flex items-center gap-1.5 mb-2">
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>Phím tắt thao tác nhanh</span>
                </h4>
                <div className="space-y-1.5">
                  {shortcuts.map((sc, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-xl bg-[#141318] border border-[#2D2D35] text-xs"
                    >
                      <span className="text-[#D1D5DB] text-[11.5px]">{sc.desc}</span>
                      <kbd className="px-1.5 py-0.5 rounded-md bg-[#24242B] border border-[#3E3E48] font-mono text-[10px] text-[#FF4D8D]">
                        {sc.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#141318] border border-[#2D2D35] text-[11px] text-[#9CA3AF] space-y-1 leading-relaxed">
                <p className="font-semibold text-white">💡 Mẹo phát luồng:</p>
                <p>• Dùng menu Tools trên thanh công cụ để nhập luồng M3U8 tùy chỉnh hoặc xuất danh sách kênh của bạn.</p>
                <p>• Trong trang tin tức, công cụ Tools hỗ trợ tóm tắt AI, tìm kiếm từ ngữ và xuất file Word .docx.</p>
              </div>
            </div>

            <div className="mt-5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 sm:py-3 rounded-full bg-[#E6005A] text-white font-bold text-xs sm:text-sm hover:bg-[#FF267A] transition-all cursor-pointer shadow-md"
              >
                Đã hiểu
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
