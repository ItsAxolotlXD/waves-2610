import React, { useState, useMemo, useEffect } from 'react';
import { VideoPlayer } from '../components/VideoPlayer';
import { Channel } from '../types';
import {
  Tv,
  FlaskConical,
  Activity,
  Radio,
  Wifi
} from 'lucide-react';

interface TestChannelsProps {
  currentChannel: Channel;
  onSelectChannel: (channel: Channel) => void;
  channels: Channel[];
  onOpenCustomStreamModal: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

// Danh mục bị loại trừ khỏi Tab Test
const EXCLUDED_CATEGORIES = new Set(['Kênh SCTV', 'Kênh quốc tế', 'Kênh thiết yếu']);

const isExcludedCategory = (category: string) => {
  if (EXCLUDED_CATEGORIES.has(category)) return true;
  const lower = category.toLowerCase();
  return (
    lower.includes('sctv') ||
    lower.includes('quốc tế') ||
    lower.includes('thiết yếu') ||
    lower.includes('nước ngoài')
  );
};

// Logo riêng biệt cho các kênh trong Tab Test
const TEST_LOGO_OVERRIDES: Record<string, string> = {
  vtv2: 'https://static.wikia.nocookie.net/ep-deo/images/4/45/Vtv2_front.png/revision/latest?cb=20260913100152',
  vtv6: 'https://static.wikia.nocookie.net/ep-deo/images/3/31/Vtv6_front.png/revision/latest?cb=20260913100008',
};

export const TestChannels: React.FC<TestChannelsProps> = ({
  currentChannel,
  onSelectChannel,
  channels,
  onOpenCustomStreamModal,
  searchQuery,
  onSearchChange
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  // Lọc bỏ nhóm kênh SCTV, Nước ngoài (Kênh quốc tế) và Thiết yếu; đồng thời cập nhật logo chỉ định cho Tab Test
  const testBaseChannels = useMemo(() => {
    return channels
      .filter((c) => !isExcludedCategory(c.category))
      .map((c) => {
        if (TEST_LOGO_OVERRIDES[c.id]) {
          return {
            ...c,
            logo: TEST_LOGO_OVERRIDES[c.id]
          };
        }
        return c;
      });
  }, [channels]);

  // Nếu kênh hiện tại thuộc nhóm bị loại trừ trong tab test, chuyển về kênh đầu tiên hợp lệ
  useEffect(() => {
    if (testBaseChannels.length > 0 && !testBaseChannels.some((c) => c.id === currentChannel.id)) {
      onSelectChannel(testBaseChannels[0]);
    }
  }, [testBaseChannels, currentChannel.id, onSelectChannel]);

  // Logo cập nhật cho kênh hiện tại đang phát trong tab test
  const effectiveCurrentChannel = useMemo(() => {
    if (TEST_LOGO_OVERRIDES[currentChannel.id]) {
      return {
        ...currentChannel,
        logo: TEST_LOGO_OVERRIDES[currentChannel.id]
      };
    }
    return currentChannel;
  }, [currentChannel]);

  // Distinct category list maintaining natural broadcast order
  const distinctCategories = Array.from(new Set(testBaseChannels.map((c) => c.category)));
  const categoryTabs = ['Tất cả', ...distinctCategories];

  // Filter channels by tab & search query
  const query = (searchQuery || '').trim().toLowerCase();
  const filteredChannels = testBaseChannels.filter((c) => {
    const matchesCat = selectedCategory === 'Tất cả' || c.category === selectedCategory;
    const matchesSearch = !query ||
      c.name.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query) ||
      (c.channelNumber && String(c.channelNumber).includes(query)) ||
      (c.tags && c.tags.some((t) => t.toLowerCase().includes(query)));
    return matchesCat && matchesSearch;
  });

  // Group channels by category when viewing "Tất cả" (or show single category if filtered)
  const groupedCategories = distinctCategories
    .map((category) => ({
      category,
      channels: filteredChannels.filter((c) => c.category === category)
    }))
    .filter((group) => group.channels.length > 0);

  return (
    <div className="space-y-4 sm:space-y-8 pb-16">
      {/* Top Banner / Channel Title with Developer Test Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight flex items-center gap-2">
              <span>{`${String(effectiveCurrentChannel.channelNumber || 1).padStart(3, '0')} | ${effectiveCurrentChannel.name}`}</span>
            </h1>
            <span className="px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
              <FlaskConical className="w-3 h-3 text-amber-400" />
              Test nội bộ luồng
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#4B5563] dark:text-[#9CA3AF] mt-0.5 font-medium flex items-center gap-2">
            <span>{effectiveCurrentChannel.category}</span>
            <span className="text-white/20">•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              Luồng phát hoạt động
            </span>
          </p>
        </div>

        {/* Quick Custom Stream Button for Testing */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenCustomStreamModal}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/15 text-white/90 hover:text-white border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer select-none"
          >
            <Activity className="w-3.5 h-3.5 text-[#FF4D8B]" />
            Thử luồng tùy chỉnh
          </button>
        </div>
      </div>

      {/* Video Player Section */}
      <div className="w-full">
        <VideoPlayer
          channel={effectiveCurrentChannel}
          onOpenCustomStreamModal={onOpenCustomStreamModal}
          isTheaterMode={isTheaterMode}
          onToggleTheaterMode={() => setIsTheaterMode(!isTheaterMode)}
        />
      </div>

      {/* Channel List Section */}
      <div className="space-y-6 pt-2">
        {/* Section Header & Filters */}
        <div className="flex flex-col gap-3 sm:gap-3.5">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-[#111827] dark:text-white">
              Danh sách kênh kiểm thử
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1F3F5] dark:bg-[#26262C] text-[#4B5563] dark:text-[#9CA3AF] border border-[#E5E7EB] dark:border-[#383842]">
              {filteredChannels.length} kênh
            </span>
          </div>

          {/* Category Tabs Filter */}
          <div id="livetv-category-tabs" className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categoryTabs.map((cat, idx) => (
              <button
                key={cat}
                id={`livetv-cat-btn-${idx}`}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer select-none ${
                  selectedCategory === cat
                    ? 'bg-[#E50914] text-white shadow-sm'
                    : 'bg-[#F1F3F5] hover:bg-[#E5E7EB] text-[#4B5563] hover:text-[#111827] dark:bg-[#27121d] dark:hover:bg-[#331726] dark:text-[#A1A1AA] dark:hover:text-white border border-[#E5E7EB] dark:border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Channel Categories & Grids */}
        {filteredChannels.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#1E1E22] border border-[#E5E7EB] dark:border-[#2D2D35]">
            <Tv className="w-10 h-10 mx-auto text-[#9CA3AF] mb-2" />
            <p className="text-sm font-semibold text-[#111827] dark:text-white">Không tìm thấy kênh phù hợp</p>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">Vui lòng thử tìm kiếm với từ khóa hoặc số hiệu khác</p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedCategories.map((group) => (
              <section key={group.category} className="space-y-3">
                {/* Category Section Header & Divider */}
                <div className="livetv-category-divider flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#2D2D35] pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-[#E50914] rounded-full" />
                    <h3 className="text-sm sm:text-base font-bold text-[#111827] dark:text-white">
                      {group.category}
                    </h3>
                    <span className="text-[11px] font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
                      ({group.channels.length})
                    </span>
                  </div>
                </div>

                {/* Channel Grid: Unified fixed width & height cards, 6 cols on desktop, 3 cols on mobile */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3.5">
                  {group.channels.map((ch) => {
                    const isSelected = ch.id === currentChannel.id;

                    return (
                      <div
                        key={ch.id}
                        id={`livetv-channel-card-${ch.id}`}
                        onClick={() => onSelectChannel(ch)}
                        className={`group relative w-full aspect-[136/78] rounded-xl sm:rounded-2xl transition-none cursor-pointer overflow-hidden flex items-center justify-center p-1.5 sm:p-2.5 select-none bg-[#353535] ${
                          isSelected ? 'is-selected' : ''
                        }`}
                        title={ch.name}
                      >
                        {/* Channel Logo Box without background */}
                        <div className="w-full h-full flex items-center justify-center p-1 relative">
                          <img
                            src={ch.logo}
                            alt={ch.name}
                            referrerPolicy="no-referrer"
                            className={`${
                              ch.id === 'vtv6'
                                ? 'max-h-[66%] max-w-[88%] scale-110'
                                : ch.category === 'Kênh VTV'
                                  ? 'max-h-[56%] max-w-[80%]'
                                  : 'max-h-[58%] max-w-[82%]'
                            } w-auto h-auto object-contain filter drop-shadow-sm select-none pointer-events-none`}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const orig = channels.find((origCh) => origCh.id === ch.id)?.logo;
                              if (orig && target.src !== orig) {
                                target.src = orig;
                              } else {
                                target.style.display = 'none';
                              }
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {filteredChannels.length === 0 && (
          <div className="py-16 text-center space-y-3 rounded-2xl bg-[#1E1E22]/60 border border-white/10 p-6">
            <p className="text-sm font-medium text-[#9CA3AF]">
              Không tìm thấy kênh kiểm thử phù hợp với từ khóa "{query}"
            </p>
            {onSearchChange && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#E6005A] text-white hover:bg-[#E6005A]/90 transition-colors cursor-pointer"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
