import React, { useState } from 'react';
import { NEWS_DATA } from '../data/news';
import { NewsCard } from '../components/NewsCard';
import { TrendingUp, Lock } from 'lucide-react';
import { DEFAULT_BANNER_PLACEHOLDER } from '../data/heroSlides';

interface NewsProps {
  navigate: (route: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const News: React.FC<NewsProps> = ({ navigate, searchQuery, onSearchChange }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');

  const categories = [
    'Tất cả',
    'Cộng đồng & Kỷ niệm',
    'Thời sự truyền hình',
    'Công nghệ phát sóng',
    'Hậu trường & Kỹ thuật',
    'Đồ hoạ & Nhận diện'
  ];

  const query = (searchQuery || '').trim().toLowerCase();
  const filteredNews = NEWS_DATA.filter((article) => {
    const matchesCat = selectedCategory === 'Tất cả' || article.category === selectedCategory;
    const matchesSearch = !query ||
      article.title.toLowerCase().includes(query) ||
      article.excerpt.toLowerCase().includes(query) ||
      article.category.toLowerCase().includes(query);
    return matchesCat && matchesSearch;
  });

  const featured = NEWS_DATA[0];

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight">
          News Feed
        </h1>
        <p className="text-xs sm:text-sm text-[#4B5563] dark:text-[#9CA3AF] mt-1.5 leading-relaxed max-w-4xl">
          Cập nhật toàn diện các thông tin về công nghệ phát thanh truyền hình, đồ họa nhận diện và văn hóa truyền thông Việt Nam, các thông báo của Waves nói chung và Vplay nói riêng.
        </p>
      </div>

      {/* Featured Compact Article Header Card */}
      {featured && selectedCategory === 'Tất cả' && (
        <div
          onClick={() => navigate(`/news/${featured.slug}`)}
          className="relative rounded-[24px] sm:rounded-[28px] overflow-hidden bg-white dark:bg-[#1E1E22] border border-[#E5E7EB] dark:border-[#2D2D35] hover:border-[#E50914]/60 hover:shadow-xl cursor-pointer group shadow-md transition-all"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[200px] md:min-h-[220px]">
            {/* Image */}
            <div className="md:col-span-6 lg:col-span-5 relative h-48 md:h-full overflow-hidden">
              <img
                src={featured.coverImage || DEFAULT_BANNER_PLACEHOLDER}
                alt={featured.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== DEFAULT_BANNER_PLACEHOLDER) {
                    target.src = DEFAULT_BANNER_PLACEHOLDER;
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-black/20 to-black/60 md:to-[#1E1E22] hidden dark:block" />
              
              <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF2020] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                  <TrendingUp className="w-3 h-3" />
                  <span>Tiêu điểm</span>
                </div>
                {featured.isLocked && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                    <Lock className="w-3 h-3" />
                    <span>Bảo vệ mật mã</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="md:col-span-6 lg:col-span-7 p-5 sm:p-6 md:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#E50914]">
                    {featured.category}
                  </span>
                  <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium">
                    {featured.publishedAt}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#111827] dark:text-white mt-2 group-hover:text-[#E50914] transition-colors leading-snug">
                  {featured.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#4B5563] dark:text-[#9CA3AF] mt-2 leading-relaxed line-clamp-2">
                  {featured.excerpt}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-[#E5E7EB] dark:border-[#2A2A30] flex items-center justify-between text-xs">
                <span className="text-[#6B7280] dark:text-[#8E8E93]">
                  {featured.subtitle}
                </span>
                <span className="text-[#E50914] font-bold shrink-0 ml-2">
                  Xem bài viết →
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Pills */}
      <div id="news-category-tabs" className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat, idx) => (
          <button
            key={cat}
            id={`news-cat-btn-${idx}`}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer select-none ${
              selectedCategory === cat
                ? 'bg-[#E50914] text-white shadow-sm'
                : 'bg-[#F1F3F5] hover:bg-[#E5E7EB] text-[#4B5563] hover:text-[#111827] dark:bg-[#27121d] dark:hover:bg-[#331726] dark:text-[#A1A1AA] dark:hover:text-white border border-[#E5E7EB] dark:border-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      {filteredNews.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
              onClick={(a) => navigate(`/news/${a.slug}`)}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3 rounded-2xl bg-[#1E1E22]/60 border border-white/10 p-6">
          <p className="text-sm font-medium text-[#9CA3AF]">
            Không tìm thấy bài viết tin tức phù hợp với từ khóa "{query}"
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
  );
};
