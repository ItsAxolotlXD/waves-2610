import React, { useState } from 'react';
import { VideoPlayer } from '../components/VideoPlayer';
import { Channel } from '../types';
import {
  Tv,
  ChevronRight,
  Hash,
} from 'lucide-react';
import { motion } from 'motion/react';

interface LiveTVProps {
  currentChannel: Channel;
  onSelectChannel: (channel: Channel) => void;
  channels: Channel[];
  onOpenCustomStreamModal: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const LiveTV: React.FC<LiveTVProps> = ({
  currentChannel,
  onSelectChannel,
  channels,
  onOpenCustomStreamModal,
  searchQuery,
  onSearchChange
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  // Distinct category list maintaining natural broadcast order
  const distinctCategories = Array.from(new Set(channels.map((c) => c.category)));
  const categoryTabs = ['Tất cả', ...distinctCategories];

  // Filter channels by tab & search query
  const query = (searchQuery || '').trim().toLowerCase();
  const filteredChannels = channels.filter((c) => {
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
      {/* Top Banner / Channel Title */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight flex items-center gap-2">
            <span>{`${String(currentChannel.channelNumber || 1).padStart(3, '0')} | ${currentChannel.name}`}</span>
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#4B5563] dark:text-[#9CA3AF] mt-0.5 font-medium flex items-center gap-2">
          <span>{currentChannel.category}</span>
        </p>
      </div>

      {/* Video Player Section */}
      <div className="w-full">
        <VideoPlayer
          channel={currentChannel}
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
              Danh sách kênh
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
                        {/* Channel Logo Box without background (strictly only logo) */}
                        <div className="w-full h-full flex items-center justify-center p-1 relative">
                          <img
                            src={ch.logo}
                            alt={ch.name}
                            referrerPolicy="no-referrer"
                            className={`${
                              ch.category === 'Kênh VTV'
                                ? 'max-h-[56%] max-w-[80%]'
                                : 'max-h-[58%] max-w-[82%]'
                            } w-auto h-auto object-contain filter drop-shadow-sm select-none pointer-events-none`}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
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
              Không tìm thấy kênh truyền hình phù hợp với từ khóa "{query}"
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
