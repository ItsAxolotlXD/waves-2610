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
            transition={{ duration: shouldAnimate ? 0.35 : 0, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* 2. Dialog Modal Box */}
          <motion.div 
            id="custom-stream-dialog"
            initial={shouldAnimate ? { opacity: 0, scale: 1.10 } : { opacity: 1, scale: 1 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              transition: {
                duration: shouldAnimate ? 0.40 : 0,
                ease: [0.16, 1, 0.3, 1]
              }
            }}
            exit={shouldAnimate ? { 
              opacity: 0, 
              scale: 1.08,
              transition: {
                duration: 0.26,
                ease: [0.25, 0.1, 0.25, 1]
              }
            } : { opacity: 0 }}
            className="relative w-full max-w-[480px] bg-[#27282D] border border-white/10 rounded-[28px] shadow-2xl overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 pb-3.5 border-b border-[#2C2C34]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E6005A]/20 text-[#E6005A] flex items-center justify-center border border-[#E6005A]/30">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Cấu hình Luồng M3U8 & Playlist
                  </h3>
                  <p className="text-[11px] text-[#9CA3AF]">
                    Dán luồng HLS trực tiếp hoặc nhập playlist .m3u
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-[#27121d] flex items-center justify-center text-[#9CA3AF] hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tab Toggle */}
            <div className="flex p-1 mx-5 mt-3.5 rounded-full bg-[#141318] border border-[#2D2D35]">
              <button
                type="button"
                onClick={() => setActiveTab('single')}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'single'
                    ? 'bg-[#E6005A] text-white shadow-md'
                    : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                1 Luồng Trực Tiếp (.m3u8)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('playlist')}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'playlist'
                    ? 'bg-[#E6005A] text-white shadow-md'
                    : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                Nhập Playlist (.m3u)
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 pt-4">
              {activeTab === 'single' ? (
                <form onSubmit={handlePlaySingle} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
                      Tên kênh / Tiêu đề
                    </label>
                    <input
                      type="text"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      placeholder="Ví dụ: VTV1 HD Nguồn Phụ"
                      className="w-full px-4 py-3 rounded-full bg-[#141318] border border-[#2D2D36] text-white text-sm focus:outline-none focus:border-[#E6005A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#D1D5DB] mb-1.5">
                      Đường dẫn HLS Stream URL (.m3u8) <span className="text-[#FF267A]">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={streamUrl}
                      onChange={(e) => setStreamUrl(e.target.value)}
                      placeholder="https://example.com/live/channel.m3u8"
                      className="w-full px-4 py-3 rounded-full bg-[#141318] border border-[#2D2D36] text-white text-sm focus:outline-none focus:border-[#E6005A]"
                    />
                  </div>

                  {/* Sample test streams buttons */}
                  <div>
                    <span className="text-[11px] font-medium text-[#8E8E93] block mb-2">
                      Luồng thử nghiệm nhanh:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setStreamUrl('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
                          setChannelName('Mux HLS Test Multi-Rate');
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-[#27121d] text-[11px] text-[#C5C5CE] hover:text-white hover:bg-[#331726] border border-white/10 cursor-pointer"
                      >
                        Mux HLS HD
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStreamUrl('https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8');
                          setChannelName('Akamai Live Master HLS');
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-[#27121d] text-[11px] text-[#C5C5CE] hover:text-white hover:bg-[#331726] border border-white/10 cursor-pointer"
                      >
                        Akamai Live HD
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-4 rounded-full bg-[#E6005A] text-white text-base font-bold flex items-center justify-center gap-2 hover:bg-[#FF267A] active:scale-[0.98] transition-all shadow-md cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                      <span>Phát Ngay Trên Player</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-[#D1D5DB]">
                        Dán nội dung Playlist định dạng #EXTM3U
                      </label>
                      <button
                        type="button"
                        onClick={handleLoadSample}
                        className="text-[11px] text-[#E6005A] hover:underline cursor-pointer font-semibold"
                      >
                        Nạp playlist mẫu
                      </button>
                    </div>
                    <textarea
                      rows={6}
                      value={playlistText}
                      onChange={(e) => setPlaylistText(e.target.value)}
                      placeholder={`#EXTM3U\n#EXTINF:-1 tvg-id="vtv1" tvg-name="VTV1 HD" group-title="VTV", VTV1 HD\nhttps://example.com/vtv1.m3u8`}
                      className="w-full p-3.5 rounded-2xl bg-[#141318] border border-[#2D2D36] text-white text-xs font-mono focus:outline-none focus:border-[#E6005A] resize-none"
                    />
                  </div>

                  {parseStatus && (
                    <div className="p-3 rounded-2xl bg-[#141318] border border-[#36363E] text-xs flex items-center gap-2 text-white">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{parseStatus}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleImportM3U}
                    className="w-full py-4 rounded-full bg-[#E6005A] text-white text-base font-bold flex items-center justify-center gap-2 hover:bg-[#FF267A] active:scale-[0.98] transition-all shadow-md cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Nhập Toàn Bộ Kênh Vào Danh Sách</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
