import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Radio, Play } from 'lucide-react';
import { Channel } from '../types';
import { useSettings } from '../hooks/useSettings';

interface AddStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStream: (channel: Channel) => void;
}

export const AddStreamModal: React.FC<AddStreamModalProps> = ({
  isOpen,
  onClose,
  onAddStream
}) => {
  const { settings } = useSettings();
  const shouldAnimate = !settings.reduceAllMotion && settings.animateModals;
  const [streamName, setStreamName] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [streamQuality, setStreamQuality] = useState<'HD' | 'Full HD' | '4K' | 'SD'>('HD');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamUrl.trim()) return;

    const name = streamName.trim() || 'Luồng trực tiếp mới';
    const newChannel: Channel = {
      id: `custom-stream-${Date.now()}`,
      name: name,
      shortName: name,
      slug: `custom-${Date.now()}`,
      logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=200&auto=format&fit=crop&q=80',
      category: 'Chuyên biệt',
      quality: streamQuality,
      streamUrl: streamUrl.trim(),
      isLive: true,
      description: 'Luồng phát sóng trực tiếp do người dùng thêm vào hệ thống.',
      currentProgram: {
        title: name,
        startTime: '00:00',
        endTime: '24:00',
        progress: 50,
        description: 'Phát trực tiếp qua giao thức HLS M3U8.'
      }
    };

    onAddStream(newChannel);
    setStreamName('');
    setStreamUrl('');
    onClose();
  };

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
            id="add-stream-dialog"
            initial={shouldAnimate ? { opacity: 0, scale: 1.08 } : { opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={shouldAnimate ? { opacity: 0, scale: 1.05 } : { opacity: 0 }}
            transition={{ duration: shouldAnimate ? 0.35 : 0, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[390px] bg-[#27282D] border border-white/10 rounded-[26px] p-5 sm:p-6 shadow-2xl z-10 text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#2C2C34]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#E6005A]/20 text-[#E6005A] flex items-center justify-center border border-[#E6005A]/30">
                  <Plus className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Thêm luồng trực tiếp mới</h3>
                  <p className="text-[11px] text-[#9CA3AF]">Nhập thông tin luồng HLS / M3U8</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-[#27121d] flex items-center justify-center text-[#9CA3AF] hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#D1D5DB] mb-1">
                  Tên luồng <span className="text-[#FF4D8D]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={streamName}
                  onChange={(e) => setStreamName(e.target.value)}
                  placeholder="Ví dụ: VTV3 HD 1080p Nguồn 2"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141318] border border-[#2D2D36] text-white text-xs sm:text-sm focus:outline-none focus:border-[#E6005A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D1D5DB] mb-1">
                  Địa chỉ luồng (.m3u8) <span className="text-[#FF4D8D]">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="https://domain.com/live/stream.m3u8"
                  className="w-full px-4 py-3 rounded-2xl bg-[#141318] border border-[#2D2D36] text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-[#E6005A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
                  Chất lượng
                </label>
                <div className="flex gap-2">
                  {(['SD', 'HD', 'Full HD', '4K'] as const).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setStreamQuality(q)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        streamQuality === q
                          ? 'bg-[#E6005A] text-white shadow-md'
                          : 'bg-[#27121d] text-[#8E8E93] hover:text-white border border-white/10'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 sm:py-3 rounded-full bg-[#E6005A] hover:bg-[#FF267A] active:scale-[0.98] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Thêm & Phát luồng ngay</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
