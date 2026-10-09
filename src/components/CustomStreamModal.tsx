import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Upload, Radio, FileText, CheckCircle2, AlertCircle, Copy } from 'lucide-react';
import { parseM3UPlaylist, SAMPLE_M3U_TEMPLATE } from '../utils/m3uParser';
import { Channel } from '../types';
import { useSettings } from '../hooks/useSettings';

interface CustomStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayCustomChannel: (channel: Channel) => void;
  onImportPlaylist: (newChannels: Channel[]) => void;
}

export const CustomStreamModal: React.FC<CustomStreamModalProps> = ({
  isOpen,
  onClose,
  onPlayCustomChannel,
  onImportPlaylist
}) => {
  const { settings } = useSettings();
  const shouldAnimate = !settings.reduceAllMotion && settings.animateModals;
  const [activeTab, setActiveTab] = useState<'single' | 'playlist'>('single');
  const [streamUrl, setStreamUrl] = useState('');
  const [channelName, setChannelName] = useState('Luồng Trực Tiếp Tùy Chỉnh');
  const [playlistText, setPlaylistText] = useState('');
  const [parseStatus, setParseStatus] = useState<string | null>(null);

  const handlePlaySingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamUrl.trim()) return;

    const customChannel: Channel = {
      id: `custom-${Date.now()}`,
      name: channelName.trim() || 'Luồng M3U8 Tùy Chỉnh',
      shortName: channelName.trim() || 'Custom Stream',
      slug: `custom-${Date.now()}`,
      logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=200&auto=format&fit=crop&q=80',
      category: 'Chuyên biệt',
      quality: 'HD',
      streamUrl: streamUrl.trim(),
      isLive: true,
      description: 'Luồng phát sóng do người dùng cấu hình trực tiếp.',
      currentProgram: {
        title: channelName.trim() || 'Luồng trực tiếp tùy chỉnh',
        startTime: '00:00',
        endTime: '24:00',
        progress: 50,
        description: 'Phát sóng trực tiếp theo định dạng HLS/M3U8.'
      }
    };

    onPlayCustomChannel(customChannel);
    onClose();
  };

  const handleImportM3U = () => {
    if (!playlistText.trim()) return;
    try {
      const parsed = parseM3UPlaylist(playlistText);
      if (parsed.length === 0) {
        setParseStatus('Không tìm thấy kênh hợp lệ trong nội dung playlist M3U.');
        return;
      }

      const fullChannels: Channel[] = parsed.map((p, idx) => ({
        id: p.id || `m3u-${Date.now()}-${idx}`,
        name: p.name || `Kênh ${idx + 1}`,
        shortName: p.name || `Kênh ${idx + 1}`,
        slug: p.slug || `m3u-ch-${idx + 1}`,
        logo: p.logo || 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=200&auto=format&fit=crop&q=80',
        category: p.category || 'Chuyên biệt',
        quality: p.quality || 'HD',
        streamUrl: p.streamUrl || '',
        isLive: true,
        description: p.description || 'Kênh từ danh sách M3U nhập ngoài.',
        currentProgram: p.currentProgram || {
          title: p.name || 'Chương trình trực tiếp',
          startTime: '00:00',
          endTime: '24:00',
          progress: 50,
          description: 'Phát trực tiếp.'
        }
      }));

      onImportPlaylist(fullChannels);
      setParseStatus(`Đã nhập thành công ${fullChannels.length} kênh truyền hình!`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setParseStatus('Lỗi phân tích cú pháp playlist M3U. Vui lòng kiểm tra lại cấu trúc.');
    }
  };

  const handleLoadSample = () => {
    setPlaylistText(SAMPLE_M3U_TEMPLATE);
    setParseStatus('Đã nạp playlist mẫu. Bấm "Nhập Danh Sách" để tải kênh.');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="custom-stream-modal-container"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* 1. Backdrop / Lớp nền mờ */}
          <motion.div 
            id="custom-stream-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* 2. Dialog Modal Box - Fluent Design ContentDialog */}
          <motion.div 
            id="custom-stream-dialog"
            initial={shouldAnimate ? { opacity: 0, scale: 0.98, y: 8 } : { opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldAnimate ? { opacity: 0, scale: 0.98, y: 6 } : { opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.1, 0.9, 0.2, 1] }}
            className="fluent-modal-dialog relative z-10 w-full max-w-[500px] bg-white dark:bg-[#202020] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)] border border-black/[0.08] dark:border-white/[0.08] text-[#1F1F1F] dark:text-[#F3F4F6]"
          >
            {/* Header Area */}
            <div className="p-6 pb-3">
              <h2 className="text-[20px] font-semibold text-[#1F1F1F] dark:text-[#FFFFFF] tracking-tight leading-snug font-sans">
                Cấu hình Luồng M3U8 & Playlist
              </h2>
              <p className="text-[14px] text-[#555555] dark:text-[#CCCCCC] leading-normal mt-1.5 font-normal">
                Dán luồng HLS trực tiếp hoặc nhập danh sách kênh file .m3u
              </p>

              {/* Fluent Tab Bar */}
              <div className="flex p-1 mt-4 rounded-md bg-[#F4F4F4] dark:bg-[#2B2B2B] border border-black/[0.06] dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setActiveTab('single')}
                  className={`flex-1 py-1.5 rounded-[4px] text-xs font-medium transition-all cursor-default ${
                    activeTab === 'single'
                      ? 'bg-white dark:bg-[#383838] text-[#1F1F1F] dark:text-[#FFFFFF] shadow-sm font-semibold'
                      : 'text-[#666666] dark:text-[#AAAAAA] hover:text-[#1F1F1F] dark:hover:text-[#FFFFFF]'
                  }`}
                >
                  1 Luồng Trực Tiếp (.m3u8)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('playlist')}
                  className={`flex-1 py-1.5 rounded-[4px] text-xs font-medium transition-all cursor-default ${
                    activeTab === 'playlist'
                      ? 'bg-white dark:bg-[#383838] text-[#1F1F1F] dark:text-[#FFFFFF] shadow-sm font-semibold'
                      : 'text-[#666666] dark:text-[#AAAAAA] hover:text-[#1F1F1F] dark:hover:text-[#FFFFFF]'
                  }`}
                >
                  Nhập Playlist (.m3u)
                </button>
              </div>
            </div>

            {/* Form Body */}
            <div className="px-6 pb-5 pt-1">
              {activeTab === 'single' ? (
                <form id="form-single-stream" onSubmit={handlePlaySingle} className="space-y-3.5">
                  <div>
                    <label className="block text-[13px] font-medium text-[#333333] dark:text-[#DDDDDD] mb-1">
                      Tên kênh / Tiêu đề
                    </label>
                    <input
                      type="text"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      placeholder="Ví dụ: VTV1 HD Nguồn Phụ"
                      className="w-full px-3 py-2 rounded-md bg-[#F9F9F9] dark:bg-[#2B2B2B] border border-black/[0.12] dark:border-white/[0.12] text-[#1F1F1F] dark:text-[#FFFFFF] placeholder:text-[#888888] text-sm focus:outline-none focus:border-[#0067c0] focus:ring-1 focus:ring-[#0067c0] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#333333] dark:text-[#DDDDDD] mb-1">
                      Đường dẫn HLS Stream URL (.m3u8) <span className="text-[#0067C0]">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={streamUrl}
                      onChange={(e) => setStreamUrl(e.target.value)}
                      placeholder="https://example.com/live/channel.m3u8"
                      className="w-full px-3 py-2 rounded-md bg-[#F9F9F9] dark:bg-[#2B2B2B] border border-black/[0.12] dark:border-white/[0.12] text-[#1F1F1F] dark:text-[#FFFFFF] placeholder:text-[#888888] text-sm font-mono focus:outline-none focus:border-[#0067c0] focus:ring-1 focus:ring-[#0067c0] transition-all"
                    />
                  </div>

                  {/* Sample test streams buttons */}
                  <div>
                    <span className="text-[11px] font-medium text-[#666666] dark:text-[#AAAAAA] block mb-1.5">
                      Luồng thử nghiệm nhanh:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setStreamUrl('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
                          setChannelName('Mux HLS Test Multi-Rate');
                        }}
                        className="px-2.5 py-1 rounded-[4px] bg-[#F4F4F4] dark:bg-[#2B2B2B] text-[11px] text-[#333333] dark:text-[#DDDDDD] hover:bg-[#EAEAEA] dark:hover:bg-[#383838] border border-black/[0.08] dark:border-white/[0.1] cursor-default"
                      >
                        Mux HLS HD
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStreamUrl('https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8');
                          setChannelName('Akamai Live Master HLS');
                        }}
                        className="px-2.5 py-1 rounded-[4px] bg-[#F4F4F4] dark:bg-[#2B2B2B] text-[11px] text-[#333333] dark:text-[#DDDDDD] hover:bg-[#EAEAEA] dark:hover:bg-[#383838] border border-black/[0.08] dark:border-white/[0.1] cursor-default"
                      >
                        Akamai Live HD
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[13px] font-medium text-[#333333] dark:text-[#DDDDDD]">
                        Dán nội dung Playlist #EXTM3U
                      </label>
                      <button
                        type="button"
                        onClick={handleLoadSample}
                        className="text-[11px] text-[#0067C0] dark:text-[#4CC2FF] hover:underline cursor-default font-medium"
                      >
                        Nạp playlist mẫu
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      value={playlistText}
                      onChange={(e) => setPlaylistText(e.target.value)}
                      placeholder={`#EXTM3U\n#EXTINF:-1 tvg-id="vtv1" tvg-name="VTV1 HD" group-title="VTV", VTV1 HD\nhttps://example.com/vtv1.m3u8`}
                      className="w-full p-2.5 rounded-md bg-[#F9F9F9] dark:bg-[#2B2B2B] border border-black/[0.12] dark:border-white/[0.12] text-[#1F1F1F] dark:text-[#FFFFFF] placeholder:text-[#888888] text-xs font-mono focus:outline-none focus:border-[#0067c0] resize-none"
                    />
                  </div>

                  {parseStatus && (
                    <div className="p-2.5 rounded-md bg-[#F4F4F4] dark:bg-[#2B2B2B] border border-black/[0.08] dark:border-white/[0.08] text-xs flex items-center gap-2 text-[#1F1F1F] dark:text-[#FFFFFF]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{parseStatus}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Subtle Divider */}
            <div className="h-[1px] w-full bg-[#E5E5E5] dark:bg-[#2F2F2F]" />

            {/* Bottom Actions Footer */}
            <div className="fluent-modal-footer bg-[#F3F3F3] dark:bg-[#272727] px-6 py-3.5 flex items-center justify-end gap-2.5">
              {activeTab === 'single' ? (
                <button
                  type="submit"
                  form="form-single-stream"
                  className="fluent-btn-primary px-5 py-1.5 h-8 sm:h-9 rounded-[4px] bg-[#0067c0] hover:bg-[#1875c7] active:bg-[#005fb8] text-white text-[14px] font-medium shadow-sm transition-colors border border-[#005A9E] border-b-2 border-b-[#004578] flex items-center justify-center cursor-default gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Phát luồng</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleImportM3U}
                  className="fluent-btn-primary px-5 py-1.5 h-8 sm:h-9 rounded-[4px] bg-[#0067c0] hover:bg-[#1875c7] active:bg-[#005fb8] text-white text-[14px] font-medium shadow-sm transition-colors border border-[#005A9E] border-b-2 border-b-[#004578] flex items-center justify-center cursor-default gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Nhập danh sách</span>
                </button>
              )}
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
