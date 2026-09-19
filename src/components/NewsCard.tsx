import React from 'react';
import { Calendar, ArrowRight, Bookmark, Lock } from 'lucide-react';
import { NewsArticle } from '../types';
import { useFavorites } from '../hooks/useFavorites';
import { DEFAULT_BANNER_PLACEHOLDER } from '../data/heroSlides';

interface NewsCardProps {
  article: NewsArticle;
  onClick: (article: NewsArticle) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, onClick }) => {
  const { isNewsBookmarked, toggleBookmarkNews } = useFavorites();
  const bookmarked = isNewsBookmarked(article.slug);

  return (
    <div
      onClick={() => onClick(article)}
      className="group rounded-[24px] bg-white dark:bg-[#1E1E22] border border-[#E5E7EB] dark:border-[#2D2D35] hover:border-[#E50914]/60 hover:bg-[#F9FAFB] dark:hover:bg-[#25252C] transition-all overflow-hidden flex flex-col justify-between cursor-pointer shadow-sm hover:shadow-lg hover:scale-[1.01]"
    >
      {/* Cover Image */}
      <div className="relative h-44 sm:h-48 overflow-hidden">
        <img
          src={article.coverImage || DEFAULT_BANNER_PLACEHOLDER}
          alt={article.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== DEFAULT_BANNER_PLACEHOLDER) {
              target.src = DEFAULT_BANNER_PLACEHOLDER;
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {/* Category Badge & Lock Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
            {article.category}
          </div>
          {article.isLocked && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-md border border-amber-400 text-[10px] font-bold text-white shadow-xs">
              <Lock className="w-3 h-3" />
              <span>Khóa</span>
            </div>
          )}
        </div>

        {/* Bookmark Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleBookmarkNews(article.slug);
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-colors ${
            bookmarked 
              ? 'bg-[#E50914] text-white border-[#E50914]' 
              : 'bg-black/60 text-[#A1A1AA] hover:text-white border-white/10'
          }`}
          title={bookmarked ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 pt-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-[#111827] dark:text-white group-hover:text-[#E50914] transition-colors leading-snug line-clamp-2">
            {article.title}
          </h3>
          <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] line-clamp-2 mt-2 leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        {/* Metadata Footer */}
        <div className="mt-4 pt-3 border-t border-[#E5E7EB] dark:border-[#2A2A30] flex items-center justify-between text-xs text-[#6B7280] dark:text-[#8E8E93]">
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>{article.publishedAt}</span>
          </div>

          <div className="flex items-center gap-1 text-[#E50914] font-semibold text-xs group-hover:translate-x-1 transition-transform">
            <span>{article.isLocked ? 'Mở khóa' : 'Chi tiết'}</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
};
