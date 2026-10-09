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
            id="add-stream-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
          />

          <motion.div
            id="add-stream-dialog"
            initial={shouldAnimate ? { opacity: 0, scale: 0.98, y: 8 } : { opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldAnimate ? { opacity: 0, scale: 0.98, y: 6 } : { opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.1, 0.9, 0.2, 1] }}
            className="fluent-modal-dialog relative z-10 w-full max-w-[440px] bg-white dark:bg-[#202020] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)] border border-black/[0.08] dark:border-white/[0.08] text-[#1F1F1F] dark:text-[#F3F4F6]"
          >
            {/* Header & Body Content Area */}
            <form onSubmit={handleSubmit}>
              <div className="p-6 pb-5 space-y-4">
                <div>
                  <h2 className="text-[20px] font-semibold text-[#1F1F1F] dark:text-[#FFFFFF] tracking-tight leading-snug font-sans">
                    Thêm luồng trực tiếp mới
                  </h2>
                  <p className="text-[14px] text-[#555555] dark:text-[#CCCCCC] leading-normal mt-1.5 font-normal">
                    Nhập thông tin luồng HLS / M3U8 để phát trực tiếp
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[13px] font-medium text-[#333333] dark:text-[#DDDDDD] mb-1">
                      Tên luồng <span className="text-[#0067C0]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={streamName}
                      onChange={(e) => setStreamName(e.target.value)}
                      placeholder="Ví dụ: VTV3 HD Nguồn 2"
                      className="w-full px-3 py-2 rounded-md bg-[#F9F9F9] dark:bg-[#2B2B2B] border border-black/[0.12] dark:border-white/[0.12] text-[#1F1F1F] dark:text-[#FFFFFF] placeholder:text-[#888888] text-sm focus:outline-none focus:border-[#0067c0] focus:ring-1 focus:ring-[#0067c0] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#333333] dark:text-[#DDDDDD] mb-1">
                      Địa chỉ luồng (.m3u8) <span className="text-[#0067C0]">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={streamUrl}
                      onChange={(e) => setStreamUrl(e.target.value)}
                      placeholder="https://domain.com/live/stream.m3u8"
                      className="w-full px-3 py-2 rounded-md bg-[#F9F9F9] dark:bg-[#2B2B2B] border border-black/[0.12] dark:border-white/[0.12] text-[#1F1F1F] dark:text-[#FFFFFF] placeholder:text-[#888888] text-sm font-mono focus:outline-none focus:border-[#0067c0] focus:ring-1 focus:ring-[#0067c0] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#333333] dark:text-[#DDDDDD] mb-1.5">
                      Chất lượng
                    </label>
                    <div className="flex gap-2">
                      {(['SD', 'HD', 'Full HD', '4K'] as const).map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setStreamQuality(q)}
                          className={`flex-1 py-1.5 rounded-[4px] text-xs font-medium transition-all cursor-default border ${
                            streamQuality === q
                              ? 'bg-[#0067C0] text-white border-[#005A9E] shadow-sm'
                              : 'bg-white dark:bg-[#2B2B2B] text-[#555555] dark:text-[#AAAAAA] hover:text-[#1F1F1F] dark:hover:text-[#FFFFFF] border-[#d1d1d1] dark:border-[#3E3E3E]'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtle Divider */}
              <div className="h-[1px] w-full bg-[#E5E5E5] dark:bg-[#2F2F2F]" />

              {/* Bottom Actions Footer */}
              <div className="fluent-modal-footer bg-[#F3F3F3] dark:bg-[#272727] px-6 py-3.5 flex items-center justify-end gap-2.5">
                <button
                  type="submit"
                  id="btn-add-stream-submit"
                  className="fluent-btn-primary px-5 py-1.5 h-8 sm:h-9 rounded-[4px] bg-[#0067c0] hover:bg-[#1875c7] active:bg-[#005fb8] text-white text-[14px] font-medium shadow-sm transition-colors border border-[#005A9E] border-b-2 border-b-[#004578] flex items-center justify-center cursor-default gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Phát luồng</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="fluent-btn-secondary px-5 py-1.5 h-8 sm:h-9 rounded-[4px] bg-white dark:bg-[#2D2D2D] hover:bg-[#F9F9F9] dark:hover:bg-[#383838] active:bg-[#EEEEEE] dark:active:bg-[#222222] text-[#1F1F1F] dark:text-[#FFFFFF] border border-[#d1d1d1] dark:border-[#3E3E3E] border-b-[#b5b5b5] dark:border-b-[#4F4F4F] text-[14px] font-normal shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors flex items-center justify-center cursor-default"
                >
                  Hủy bỏ
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
