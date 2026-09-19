import React, { useState } from 'react';
import { Channel } from '../types';
import { ChannelCard } from '../components/ChannelCard';
import { NewsCard } from '../components/NewsCard';
import { NEWS_DATA } from '../data/news';
import { useFavorites } from '../hooks/useFavorites';
import { Heart, Bookmark, Tv, Newspaper, Trash2, ArrowRight } from 'lucide-react';

interface FavoritesProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  navigate: (route: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const Favorites: React.FC<FavoritesProps> = ({
  channels,
  onSelectChannel,
  navigate,
  searchQuery,
  onSearchChange
}) => {
  const [activeTab, setActiveTab] = useState<'channels' | 'news'>('channels');
  const { favoriteChannelIds, bookmarkedNewsSlugs, clearAllFavorites } = useFavorites();

  const query = (searchQuery || '').trim().toLowerCase();
  const favoriteChannels = channels.filter((c) => {
    const isFav = favoriteChannelIds.includes(c.id);
    const matchesSearch = !query ||
      c.name.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query);
    return isFav && matchesSearch;
  });

  const bookmarkedNews = NEWS_DATA.filter((n) => {
    const isBookmarked = bookmarkedNewsSlugs.includes(n.slug);
    const matchesSearch = !query ||
      n.title.toLowerCase().includes(query) ||
      n.excerpt.toLowerCase().includes(query) ||
      n.category.toLowerCase().includes(query);
    return isBookmarked && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#FF2020] font-bold uppercase tracking-wider mb-1">
            <Heart className="w-4 h-4 fill-current" />
            <span>Nội dung đã lưu</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Kênh & Bài viết Yêu thích
          </h1>
          <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1">
            Tất cả các kênh truyền hình và bài viết bạn đã đánh dấu để truy cập nhanh chóng.
          </p>
        </div>

        {(favoriteChannels.length > 0 || bookmarkedNews.length > 0) && (
          <button
            onClick={() => {
              if (window.confirm('Bạn có chắc muốn xóa toàn bộ danh sách yêu thích?')) {
                clearAllFavorites();
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#27121d] hover:bg-[#FF2020]/20 text-[#A1A1AA] hover:text-[#FF4D4D] border border-white/10 text-xs font-semibold transition-colors shrink-0 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa tất cả</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 rounded-full bg-[#1E1E22] border border-[#2D2D35] max-w-sm">
        <button
          onClick={() => setActiveTab('channels')}
          className={`flex-1 py-2 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'channels'
              ? 'bg-gradient-purple-active text-white shadow-md'
              : 'text-[#9CA3AF] hover:text-white'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>Kênh yêu thích ({favoriteChannels.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('news')}
          className={`flex-1 py-2 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'news'
              ? 'bg-gradient-purple-active text-white shadow-md'
              : 'text-[#9CA3AF] hover:text-white'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Bài viết đã lưu ({bookmarkedNews.length})</span>
        </button>
      </div>

      {/* Channels List */}
      {activeTab === 'channels' && (
        <div>
          {favoriteChannels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {favoriteChannels.map((channel) => (
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
          ) : (
            <div className="text-center py-16 p-8 rounded-[30px] bg-[#1E1E22] border border-[#2D2D35]">
              <div className="w-16 h-16 rounded-full bg-[#26262C] flex items-center justify-center text-[#A1A1AA] mx-auto mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Chưa có kênh yêu thích nào</h3>
              <p className="text-xs text-[#9CA3AF] max-w-md mx-auto mb-6">
                Nhấp vào biểu tượng trái tim trên bất kỳ kênh truyền hình nào để lưu vào danh sách truy cập nhanh của bạn.
              </p>
              <button
                onClick={() => navigate('/live-tv')}
                className="px-6 py-2.5 rounded-full bg-gradient-purple-active text-white text-xs font-bold shadow-lg glow-purple"
              >
                Khám phá Live TV
              </button>
            </div>
          )}
        </div>
      )}

      {/* News List */}
      {activeTab === 'news' && (
        <div>
          {bookmarkedNews.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarkedNews.map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  onClick={(a) => navigate(`/news/${a.slug}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 p-8 rounded-[30px] bg-[#1E1E22] border border-[#2D2D35]">
              <div className="w-16 h-16 rounded-full bg-[#26262C] flex items-center justify-center text-[#A1A1AA] mx-auto mb-4">
                <Bookmark className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Chưa lưu bài viết nào</h3>
              <p className="text-xs text-[#9CA3AF] max-w-md mx-auto mb-6">
                Lưu các bài viết chuyên san kỹ thuật phát sóng và lịch sử truyền hình để đọc lại khi cần.
              </p>
              <button
                onClick={() => navigate('/news')}
                className="px-6 py-2.5 rounded-full bg-gradient-purple-active text-white text-xs font-bold shadow-lg glow-purple"
              >
                Đọc tin tức truyền hình
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
