import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search,
  X, 
  Flame, 
  Play, 
  Tv, 
  Newspaper, 
  SlidersHorizontal,
  ChevronRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CHANNELS_DATA } from '../data/channels';
import { NEWS_DATA } from '../data/news';
import { Channel, NewsArticle } from '../types';

interface ImmersiveSearchProps {
  navigate: (path: string, state?: any) => void;
  onSelectChannel: (channel: Channel) => void;
  onClose?: () => void;
}

// Popular searches styled as circular badges (hình tròn)
interface PopularSearchItem {
  id: string;
  title: string;
  searchTerm: string;
  subText?: string;
  circleBg: string;
  borderColor: string;
  textColor: string;
  icon: React.ReactNode;
}

const POPULAR_SEARCH_ITEMS: PopularSearchItem[] = [
  {
    id: 'loi-chao-ngay-moi',
    title: 'Lời chào ngày mới',
    searchTerm: 'Lời chào ngày mới',
    subText: 'BUỔI SÁNG',
    circleBg: 'radial-gradient(circle, #ff6b35 0%, #b83200 65%, #4a1200 100%)',
    borderColor: '#ff8c42',
    textColor: '#ffe5d9',
    icon: <Flame className="w-6 h-6 text-white drop-shadow-md" />,
  },
  {
    id: 'mua-he-nam-ay',
    title: 'Mùa hè năm ấy',
    searchTerm: 'Mùa hè năm ấy',
    subText: 'PHIM TRUYỆN',
    circleBg: 'radial-gradient(circle, #e6005a 0%, #99003c 65%, #3d0018 100%)',
    borderColor: '#ff3385',
    textColor: '#ffccd5',
    icon: <Sparkles className="w-6 h-6 text-white drop-shadow-md" />,
  },
  {
    id: 'lua-trang',
    title: 'Lửa trắng',
    searchTerm: 'Lửa trắng',
    subText: 'SERIES HOT',
    circleBg: 'radial-gradient(circle, #ff0055 0%, #a80038 65%, #470018 100%)',
    borderColor: '#ff4d88',
    textColor: '#ffffff',
    icon: <Flame className="w-6 h-6 text-white drop-shadow-md" />,
  },
  {
    id: 'thoi-su-19h',
    title: 'Thời sự 19h',
    searchTerm: 'Thời sự 19h',
    subText: 'VTV1 LIVE',
    circleBg: 'radial-gradient(circle, #c9184a 0%, #800f2f 65%, #420516 100%)',
    borderColor: '#ff4d6d',
    textColor: '#ffffff',
    icon: <Newspaper className="w-6 h-6 text-white drop-shadow-md" />,
  },
  {
    id: 'doi-bong-nu',
    title: 'Đội bóng nữ làng Xuân',
    searchTerm: 'Đội bóng nữ làng Xuân',
    subText: 'HÀI HƯỚC',
    circleBg: 'radial-gradient(circle, #00b4d8 0%, #0077b6 65%, #023e8a 100%)',
    borderColor: '#48cae4',
    textColor: '#caf0f8',
    icon: <Tv className="w-6 h-6 text-white drop-shadow-md" />,
  },
  {
    id: 'phu-sa',
    title: 'Phù sa',
    searchTerm: 'Phù sa',
    subText: 'PHIM KINH ĐIỂN',
    circleBg: 'radial-gradient(circle, #7209b7 0%, #480ca8 65%, #240046 100%)',
    borderColor: '#9d4edd',
    textColor: '#e0aaff',
    icon: <Play className="w-6 h-6 text-white fill-white drop-shadow-md" />,
  },
  {
    id: 'khai-giang',
    title: 'Khai giảng năm học',
    searchTerm: 'Khai giảng',
    subText: 'GIÁO DỤC',
    circleBg: 'radial-gradient(circle, #f77f00 0%, #d62828 65%, #6a040f 100%)',
    borderColor: '#fcbf49',
    textColor: '#ffeaa7',
    icon: <Sparkles className="w-6 h-6 text-white drop-shadow-md" />,
  },
  {
    id: 'pccc',
    title: 'Phòng cháy chữa cháy',
    searchTerm: 'Phòng cháy chữa cháy',
    subText: 'KỸ NĂNG',
    circleBg: 'radial-gradient(circle, #d90429 0%, #8d0801 65%, #370617 100%)',
    borderColor: '#ef233c',
    textColor: '#ffb3c1',
    icon: <Flame className="w-6 h-6 text-white drop-shadow-md" />,
  },
  {
    id: 'chinh-phu',
    title: 'Chính phủ kiến tạo',
    searchTerm: 'Chính phủ kiến tạo',
    subText: 'CHÍNH TRỊ',
    circleBg: 'radial-gradient(circle, #2a6f97 0%, #014f86 65%, #012a4a 100%)',
    borderColor: '#468faf',
    textColor: '#e0fbfc',
    icon: <Newspaper className="w-6 h-6 text-white drop-shadow-md" />,
  },
  {
    id: 'tin-tuc-21h',
    title: 'Tin tức 21h',
    searchTerm: 'Tin tức 21h',
    subText: 'TỔNG HỢP',
    circleBg: 'radial-gradient(circle, #8338ec 0%, #5a189a 65%, #3c096c 100%)',
    borderColor: '#9d4edd',
    textColor: '#f3c4fb',
    icon: <Clock className="w-6 h-6 text-white drop-shadow-md" />,
  },
  {
    id: 'vtv-giai-tri',
    title: 'VTV Giải trí',
    searchTerm: 'Giải trí',
    subText: 'SHOWS & NHẠC',
    circleBg: 'radial-gradient(circle, #b5179e 0%, #7209b7 65%, #3a0ca3 100%)',
    borderColor: '#f72585',
    textColor: '#ffb3c6',
    icon: <Tv className="w-6 h-6 text-white drop-shadow-md" />,
  },
  {
    id: 'thoi-tiet',
    title: 'Thời tiết Việt Nam',
    searchTerm: 'Thời tiết',
    subText: 'DỰ BÁO',
    circleBg: 'radial-gradient(circle, #0096c7 0%, #0077b6 65%, #03045e 100%)',
    borderColor: '#48cae4',
    textColor: '#caf0f8',
    icon: <Sparkles className="w-6 h-6 text-white drop-shadow-md" />,
  },
];

export const ImmersiveSearch: React.FC<ImmersiveSearchProps> = ({
  navigate,
  onSelectChannel,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'channels' | 'news'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  // Automatically focus the search input upon mounting
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle closing / exiting search
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/');
    }
  };

  // Keyboard shortcut listener (Escape to exit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (query) {
          setQuery('');
        } else {
          handleClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [query]);

  // Normalized search query
  const trimmed = query.trim().toLowerCase();

  // Search Results
  const matchedChannels = useMemo(() => {
    if (!trimmed) return [];
    return CHANNELS_DATA.filter((ch) => {
      const matchName = ch.name.toLowerCase().includes(trimmed);
      const matchShort = ch.shortName?.toLowerCase().includes(trimmed);
      const matchCategory = ch.category.toLowerCase().includes(trimmed);
      const matchSlug = ch.slug.toLowerCase().includes(trimmed);
      const matchNumber = String(ch.channelNumber || '').includes(trimmed);
      return matchName || matchShort || matchCategory || matchSlug || matchNumber;
    });
  }, [trimmed]);

  const matchedNews = useMemo(() => {
    if (!trimmed) return [];
    return NEWS_DATA.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(trimmed);
      const matchCategory = item.category.toLowerCase().includes(trimmed);
      const matchExcerpt = item.excerpt?.toLowerCase().includes(trimmed);
      return matchTitle || matchCategory || matchExcerpt;
    });
  }, [trimmed]);

  const totalMatches = matchedChannels.length + matchedNews.length;

  return (
    <div 
      id="immersive-search-page"
      className="w-full min-h-[calc(100vh-80px)] text-white px-3 sm:px-6 md:px-10 py-4 sm:py-6 select-none"
    >
      <div className="max-w-6xl mx-auto space-y-7 sm:space-y-9">
        {/* Top Search Bar Row */}
        <div className="flex items-center justify-center gap-3 w-full">
          {/* Capsule Pill Search Input Bar - Centered with 15% opacity & thinner hover border */}
          <div 
            id="immersive-search-capsule"
            onClick={() => {
              inputRef.current?.focus();
            }}
            className="relative w-full max-w-md sm:max-w-lg h-[48px] md:h-[52px] flex items-center px-4 md:px-5 rounded-full overflow-hidden cursor-text select-none bg-white/15 backdrop-blur-md border border-transparent hover:border-white/40 focus-within:border-white/65 transition-all shadow-lg"
          >
            <div className="flex items-center gap-3 w-full">
              <Search className="w-5 h-5 text-[#9CA3AF] shrink-0" />
              <input
                ref={inputRef}
                id="immersive-search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find and search"
                className="w-full bg-transparent text-white text-base placeholder-[#9CA3AF] focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="p-1 rounded-full text-[#9CA3AF] hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Xóa nội dung"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Display: Search Results or Default Sections */}
        {trimmed ? (
          /* Search Results View */
          <div className="space-y-6">
            {/* Filter Tabs & Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#3b1540] pb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#D4CAD6]">
                  Kết quả cho &ldquo;<span className="text-white font-bold">{query}</span>&rdquo;
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#E6005A]/20 text-[#FF4D8B] border border-[#E6005A]/30">
                  {totalMatches} kết quả
                </span>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1.5 bg-[#200d23] p-1 rounded-full border border-[#3b1540]">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-[#E6005A] text-white shadow-md'
                      : 'text-[#8A798C] hover:text-white'
                  }`}
                >
                  Tất cả ({totalMatches})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('channels')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'channels'
                      ? 'bg-[#E6005A] text-white shadow-md'
                      : 'text-[#8A798C] hover:text-white'
                  }`}
                >
                  Kênh ({matchedChannels.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('news')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'news'
                      ? 'bg-[#E6005A] text-white shadow-md'
                      : 'text-[#8A798C] hover:text-white'
                  }`}
                >
                  Tin tức ({matchedNews.length})
                </button>
              </div>
            </div>

            {totalMatches === 0 ? (
              /* Empty state */
              <div className="py-16 text-center space-y-3 bg-[#200d23]/40 rounded-3xl border border-[#3b1540]/60 p-8">
                <div className="w-14 h-14 rounded-full bg-[#E6005A]/10 text-[#E6005A] flex items-center justify-center mx-auto border border-[#E6005A]/20">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Không tìm thấy kết quả phù hợp</h3>
                <p className="text-xs sm:text-sm text-[#8A798C] max-w-md mx-auto">
                  Hãy thử kiểm tra lỗi chính tả hoặc tìm với từ khóa chung hơn như &ldquo;VTV&rdquo;, &ldquo;Thể thao&rdquo;, &ldquo;Thời sự&rdquo;.
                </p>
              </div>
            ) : (
              <div className="space-y-7">
                {/* 1. Matched Channels */}
                {(activeTab === 'all' || activeTab === 'channels') && matchedChannels.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#E6005A]">
                      <Tv className="w-4 h-4" />
                      <span>KÊNH TRUYỀN HÌNH ({matchedChannels.length})</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                      {matchedChannels.map((ch) => (
                        <div
                          key={ch.id}
                          onClick={() => {
                            onSelectChannel(ch);
                            navigate(`/live-tv?channel=${ch.slug}`);
                          }}
                          className="group relative p-3 rounded-2xl bg-[#353535] hover:bg-[#3d3d3d] border border-white/10 hover:border-[#FFFFFF] flex flex-col items-center text-center cursor-pointer transition-all shadow-md"
                        >
                          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-2 rounded-xl bg-[#2a2a2a] border border-white/5 mb-2 overflow-hidden">
                            <img
                              src={ch.logo}
                              alt={ch.name}
                              referrerPolicy="no-referrer"
                              className={`w-full h-full object-contain filter drop-shadow-sm ${
                                ch.id === 'vtv1' || ch.id === 'vtv3' ? 'scale-[0.90]' : ''
                              }`}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-white group-hover:text-[#E6005A] transition-colors line-clamp-1">
                            {ch.shortName || ch.name}
                          </span>
                          <span className="text-[10px] text-[#8A798C] mt-0.5">
                            {ch.category}
                          </span>

                          <div className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-full bg-[#E6005A]/10 group-hover:bg-[#E6005A] text-[11px] font-semibold text-[#FF4D8B] group-hover:text-white transition-all">
                            <Play className="w-3 h-3 fill-current" />
                            <span>Xem trực tiếp</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Matched News */}
                {(activeTab === 'all' || activeTab === 'news') && matchedNews.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#E6005A]">
                      <Newspaper className="w-4 h-4" />
                      <span>BẢN TIN & BÀI VIẾT ({matchedNews.length})</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                      {matchedNews.map((news) => (
                        <div
                          key={news.id}
                          onClick={() => navigate(`/news/${news.slug}`)}
                          className="group p-3.5 rounded-2xl bg-[#200d23] hover:bg-[#2e1233] border border-[#3b1540] hover:border-[#E6005A]/60 flex gap-3.5 cursor-pointer transition-all shadow-md"
                        >
                          <div className="w-24 h-20 sm:w-28 sm:h-22 rounded-xl overflow-hidden bg-[#1B0912] shrink-0 relative">
                            <img
                              src={news.coverImage}
                              alt={news.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[9px] font-bold rounded bg-black/70 text-white backdrop-blur-xs">
                              {news.category}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#E6005A] line-clamp-2 leading-snug transition-colors">
                              {news.title}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[10px] text-[#8A798C] mt-2">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>{news.publishedAt}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Default Immersive View with circular popular searches */
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#E6005A] fill-[#E6005A]" />
                <span>Tìm kiếm đang phổ biến</span>
              </h3>
              <span className="text-xs text-[#8A798C]">Nhấn để tìm nhanh</span>
            </div>

            {/* Circular Badges Grid (hình tròn giống chuyên trang đề xuất) */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-6 gap-4 sm:gap-6 pt-2">
              {POPULAR_SEARCH_ITEMS.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setQuery(item.searchTerm);
                    inputRef.current?.focus();
                  }}
                  className="group flex flex-col items-center text-center cursor-pointer transition-all"
                >
                  {/* Circle Orb */}
                  <div 
                    className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex flex-col items-center justify-center p-2 text-center shadow-lg group-hover:scale-108 group-hover:shadow-[0_0_22px_rgba(230,0,90,0.45)] transition-all duration-300 overflow-hidden border-2 cursor-pointer"
                    style={{
                      background: item.circleBg,
                      borderColor: item.borderColor,
                    }}
                  >
                    {/* Glossy overlay sheen */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/35 pointer-events-none rounded-full" />
                    
                    <div className="z-10 mb-1 transform group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>

                    {item.subText && (
                      <span 
                        className="text-[8px] sm:text-[9px] font-extrabold tracking-wider uppercase drop-shadow-sm z-10 px-1 line-clamp-1"
                        style={{ color: item.textColor }}
                      >
                        {item.subText}
                      </span>
                    )}
                  </div>

                  <span className="mt-2.5 text-xs font-semibold text-[#D4CAD6] group-hover:text-white transition-colors line-clamp-2 max-w-[105px] leading-tight">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
