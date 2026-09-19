import React, { useState } from 'react';
import { Channel } from '../types';
import { ChannelCard } from '../components/ChannelCard';
import { Tag, Search, Radio, Filter, Tv, CheckCircle2, Sparkles, Satellite } from 'lucide-react';

interface ChannelsProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  navigate: (route: string) => void;
  onOpenCustomStreamModal: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const Channels: React.FC<ChannelsProps> = ({
  channels,
  onSelectChannel,
  navigate,
  onOpenCustomStreamModal,
  searchQuery: externalSearchQuery,
  onSearchChange: externalOnSearchChange
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('Tất cả');
  const [internalSearchQuery, setInternalSearchQuery] = useState<string>('');

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = externalOnSearchChange || setInternalSearchQuery;

  const groups = ['Tất cả', 'VTV', 'HTV', 'VTC', 'Địa phương', 'Chuyên biệt', 'Quốc tế'];

  const filteredChannels = channels.filter((c) => {
    const matchesGroup = selectedGroup === 'Tất cả' || c.category === selectedGroup;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#C83DFF] font-bold uppercase tracking-wider mb-1">
            <Tag className="w-4 h-4" />
            <span>Danh mục Hạ tầng Truyền hình</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Chuyên kênh Truyền hình Việt Nam
          </h1>
          <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1">
            Hệ thống kênh truyền hình thiết yếu quốc gia, kênh giải trí, khoa giáo và kênh đối ngoại phục vụ cộng đồng.
          </p>
        </div>

        <button
          onClick={onOpenCustomStreamModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-purple-active text-white text-xs font-bold shadow-lg glow-purple shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Nhập Kênh M3U8</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-[28px] bg-[#1E1E22] border border-[#2D2D35] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Groups */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
          {groups.map((grp) => (
            <button
              key={grp}
              onClick={() => setSelectedGroup(grp)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedGroup === grp
                  ? 'bg-[#DF37EE] text-white shadow-md'
                  : 'bg-[#141416] text-[#A1A1AA] hover:text-white border border-[#2D2D35]'
              }`}
            >
              {grp}
            </button>
          ))}
        </div>

        {/* Search */}
        <div id="channels-search-container" className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#8E8E93]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm kênh truyền hình..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-[#141416] border border-[#34343C] text-xs text-white placeholder-[#8E8E93] focus:outline-none focus:border-[#DF37EE]"
          />
        </div>
      </div>

      {/* Grid of channels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredChannels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            onSelect={(ch) => {
              onSelectChannel(ch);
              navigate(`/live-tv?channel=${ch.slug}`);
            }}
          />
        ))}
      </div>
    </div>
  );
};
