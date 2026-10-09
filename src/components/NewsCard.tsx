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
      id={`news-card-${article.slug}`}
      onClick={() => onClick(article)}
      className="fluent-reveal-item news-card group relative rounded-[8px] bg-white dark:bg-[#2b2b2b] border border-[#e5e5e5] dark:border-[#383838] hover:border-[#cccccc] dark:hover:border-[#505050] hover:bg-[#fafafa] dark:hover:bg-[#323232] transition-colors overflow-hidden flex flex-col justify-between cursor-default shadow-xs"
    >
      {/* Cover Image */}
      <div className="relative h-44 sm:h-48 overflow-hidden bg-neutral-100 dark:bg-[#202020]">
        <img
          src={article.coverImage || DEFAULT_BANNER_PLACEHOLDER}
          alt={article.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== DEFAULT_BANNER_PLACEHOLDER) {
              target.src = DEFAULT_BANNER_PLACEHOLDER;
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {/* Category Badge & Lock Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <div className="px-2 py-0.5 rounded-[3px] bg-black/75 text-[10px] font-semibold text-white uppercase tracking-wider">
            {article.category}
          </div>
          {article.isLocked && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-amber-600 text-[10px] font-semibold text-white">
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
          className={`absolute top-2.5 right-2.5 z-30 w-7 h-7 rounded-[4px] flex items-center justify-center transition-colors ${
            bookmarked 
              ? 'bg-[#e81123] text-white' 
              : 'bg-black/60 text-white hover:bg-black/80'
          }`}
          title={bookmarked ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 pt-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-[14.5px] font-semibold text-[#111827] dark:text-white group-hover:text-[#0067c0] dark:group-hover:text-[#60cdff] transition-colors leading-snug line-clamp-2">
            {article.title}
          </h3>
          <p className="text-xs text-[#4b5563] dark:text-[#9ca3af] line-clamp-2 mt-1.5 leading-relaxed font-normal">
            {article.excerpt}
          </p>
        </div>

        {/* Metadata Footer */}
        <div className="mt-3.5 pt-2.5 border-t border-[#e5e7eb] dark:border-[#383838] flex items-center justify-between text-xs text-[#6b7280] dark:text-[#8e8e93]">
          <div className="flex items-center gap-1.5 font-normal">
            <Calendar className="w-3.5 h-3.5" />
            <span>{article.publishedAt}</span>
          </div>

          <div className="flex items-center gap-1 text-[#0067c0] dark:text-[#60cdff] font-medium text-xs group-hover:translate-x-0.5 transition-transform">
            <span>{article.isLocked ? 'Mở khóa' : 'Chi tiết'}</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
};
