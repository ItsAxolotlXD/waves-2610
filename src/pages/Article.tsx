import React, { useState } from 'react';
import { NEWS_DATA } from '../data/news';
import { NewsArticle } from '../types';
import { NewsCard } from '../components/NewsCard';
import { useFavorites } from '../hooks/useFavorites';
import { 
  ArrowLeft, 
  Calendar, 
  Bookmark, 
  Share2, 
  CheckCircle2, 
  Tag, 
  Lock, 
  Unlock, 
  ShieldAlert,
  Award,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X
} from 'lucide-react';

interface ArticleProps {
  slug: string;
  navigate: (route: string) => void;
  fontSize?: number;
}

export const Article: React.FC<ArticleProps> = ({ slug, navigate, fontSize = 16 }) => {
  const [copied, setCopied] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [unlockedArticles, setUnlockedArticles] = useState<Record<string, boolean>>(() => {
    try {
      const saved = sessionStorage.getItem('waves_unlocked_articles');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const article = NEWS_DATA.find((a) => a.slug === slug) || NEWS_DATA[0];

  const { isNewsBookmarked, toggleBookmarkNews } = useFavorites();
  const bookmarked = isNewsBookmarked(article.slug);

  const isLocked = article.isLocked && !unlockedArticles[article.slug];

  const relatedArticles = NEWS_DATA.filter((a) => a.id !== article.id).slice(0, 2);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword.trim() === article.password) {
      const updated = { ...unlockedArticles, [article.slug]: true };
      setUnlockedArticles(updated);
      setPasswordError(false);
      try {
        sessionStorage.setItem('waves_unlocked_articles', JSON.stringify(updated));
      } catch {}
    } else {
      setPasswordError(true);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-20">
      {/* Back Button */}
      <button
        onClick={() => navigate('/news')}
        className="flex items-center gap-2 text-xs font-bold text-[#6B7280] dark:text-[#A1A1AA] hover:text-[#111827] dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại News Feed</span>
      </button>

      {/* When Locked: Hide the article header (titles, hero cover, actions) and only show password protection gate */}
      {isLocked ? (
        <div className="p-8 sm:p-12 rounded-[28px] bg-white dark:bg-[#1A1A1E] border border-amber-500/40 dark:border-amber-500/30 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#111827] dark:text-white">
              Bài viết được bảo vệ bằng mật mã
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">
              Nội dung bài viết này được đặt mật khẩu bảo vệ. Vui lòng nhập đúng mật khẩu để mở khóa tiêu đề, thông tin và toàn bộ nội dung.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="max-w-sm mx-auto space-y-3">
            <div className="relative">
              <input
                type="password"
                value={inputPassword}
                onChange={(e) => {
                  setInputPassword(e.target.value);
                  setPasswordError(false);
                }}
                placeholder="Nhập mật khẩu truy cập..."
                className={`w-full px-4 py-3 rounded-full bg-[#F3F4F6] dark:bg-[#222228] border ${
                  passwordError 
                    ? 'border-red-500 focus:border-red-500 ring-2 ring-red-500/20' 
                    : 'border-[#D1D5DB] dark:border-[#383842] focus:border-[#E50914]'
                } text-sm text-[#111827] dark:text-white placeholder-[#9CA3AF] focus:outline-none transition-all text-center`}
              />
            </div>

            {passwordError && (
              <p className="text-xs text-red-500 font-semibold flex items-center justify-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Mật khẩu không chính xác. Vui lòng thử lại.</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 px-6 rounded-full bg-[#E50914] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#CC0812] hover:shadow-red-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Mở khóa bài viết</span>
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Header metadata pill */}
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1 rounded-full bg-[#E50914]/10 dark:bg-[#FF2020]/20 text-[#E50914] dark:text-[#FF4D4D] border border-[#E50914]/30 dark:border-[#FF2020]/40 text-xs font-bold uppercase tracking-wider">
              {article.category}
            </span>
            <span className="text-xs text-[#6B7280] dark:text-[#8E8E93] flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              {article.publishedAt}
            </span>
            {article.isLocked && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                <Unlock className="w-3.5 h-3.5" />
                <span>Đã mở khóa</span>
              </span>
            )}
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#111827] dark:text-white tracking-tight leading-tight">
            {article.title}
          </h1>

          {/* Subtitle */}
          {article.subtitle && (
            <p className="text-base sm:text-lg md:text-xl font-semibold text-[#E50914] dark:text-[#FF4D8B]">
              {article.subtitle}
            </p>
          )}

          {/* Action Bar (Share & Bookmark) */}
          <div className="flex items-center justify-end gap-2 p-3 sm:p-4 rounded-[20px] bg-white dark:bg-[#1E1E22] border border-[#E5E7EB] dark:border-[#2D2D35] shadow-xs">
            <button
              onClick={() => toggleBookmarkNews(article.slug)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                bookmarked
                  ? 'bg-[#E50914] border-[#E50914] text-white shadow-xs'
                  : 'bg-[#F3F4F6] dark:bg-[#27121d] border-[#E5E7EB] dark:border-white/10 text-[#4B5563] dark:text-[#D1D5DB] hover:text-[#111827] dark:hover:text-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
              <span>{bookmarked ? 'Đã lưu' : 'Lưu bài'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F3F4F6] dark:bg-[#27121d] hover:bg-[#E5E7EB] dark:hover:bg-[#331726] border border-[#E5E7EB] dark:border-white/10 text-xs font-semibold text-[#4B5563] dark:text-[#D1D5DB] hover:text-[#111827] dark:hover:text-white transition-colors cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã chép link' : 'Chia sẻ'}</span>
            </button>
          </div>

          {/* Hero Cover Image */}
          <div 
            onClick={() => {
              setLightboxImage(article.coverImage);
              setLightboxZoom(1);
            }}
            className="group relative rounded-[24px] sm:rounded-[28px] overflow-hidden bg-black/5 dark:bg-[#1E1E22] border border-[#E5E7EB] dark:border-[#2D2D35] aspect-video sm:aspect-[21/9] shadow-md cursor-pointer"
            title="Nhấp để xem kích thước đầy đủ"
          >
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
            />
            <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Xem kích thước đầy đủ</span>
            </div>
          </div>

          {/* Full Article Body Content */}
          <div 
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.75 }}
            className="p-6 md:p-10 rounded-[28px] bg-white dark:bg-[#1A1A1E] border border-[#E5E7EB] dark:border-[#2A2A32] shadow-md text-[#374151] dark:text-[#D1D5DB] space-y-8"
          >
            {/* Excerpt Lead */}
            <p 
              style={{ fontSize: `${fontSize * 1.125}px` }}
              className="font-semibold text-[#111827] dark:text-white leading-relaxed border-l-4 border-[#E50914] pl-4 italic bg-[#F9FAFB] dark:bg-transparent py-2 rounded-r-lg"
            >
              {article.excerpt}
            </p>

            {/* Article Body Paragraphs */}
            <div className="space-y-6">
              {article.content.map((paragraph, idx) => {
                // Image element (no caption/description) - Displayed Full Size
                if (paragraph.startsWith('<image>')) {
                  const imgUrl = paragraph.replace('<image>', '').trim();
                  return (
                    <figure 
                      key={idx} 
                      className="my-8 rounded-[24px] overflow-hidden border border-[#E5E7EB] dark:border-[#2D2D35] bg-[#0C0D12] shadow-xl group relative cursor-pointer"
                      onClick={() => {
                        setLightboxImage(imgUrl);
                        setLightboxZoom(1);
                      }}
                      title="Nhấp để mở xem chi tiết kích thước gốc (Full size)"
                    >
                      <img
                        src={imgUrl}
                        alt="Hình ảnh bài viết full size"
                        referrerPolicy="no-referrer"
                        className="w-full h-auto block object-contain mx-auto group-hover:opacity-95 transition-opacity"
                        loading="lazy"
                      />
                      <div className="absolute top-4 right-4 px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-md border border-white/10 opacity-80 group-hover:opacity-100 transition-opacity">
                        <ZoomIn className="w-4 h-4 text-[#FF4D8B]" />
                        <span>Kích thước đầy đủ (Full size)</span>
                      </div>
                    </figure>
                  );
                }

                // Section headings (e.g. I. MỘT HÀNH TRÌNH..., II. NHỮNG CÁI TÊN...)
                const isRomanSection = /^[I|V|X]+\.\s/.test(paragraph);
                const isMajorHeading = [
                  'TƯỞNG NHƯ KHÔNG ĐỔI, NHƯNG ĐÃ ĐỔI THAY RẤT NHIỀU',
                  '“CHẮT LỌC VÀ KẾT NỐI GIÁ TRỊ”: TRIẾT LÝ DẪN DẮT CỦA MỘT "CURATOR" QUỐC GIA',
                  'BỘ DNA MỚI: SỰ GIAO THOA GIỮA “NHÀ HIỀN TRIẾT” VÀ “NGƯỜI BÌNH ĐẲNG”',
                  'BẢN LĨNH CỦA MỘT ĐỊNH CHẾ TRUYỀN THÔNG QUỐC GIA'
                ].includes(paragraph);

                if (isRomanSection || isMajorHeading) {
                  return (
                    <h2 
                      key={idx}
                      className="text-lg sm:text-xl md:text-2xl font-black text-[#111827] dark:text-white pt-8 pb-3 border-b border-[#E5E7EB] dark:border-[#2D2D35] flex items-center gap-3 tracking-tight"
                    >
                      <span className="w-2.5 h-6 bg-gradient-to-b from-[#E50914] to-[#B80710] rounded-full inline-block shrink-0 shadow-sm" />
                      <span>{paragraph}</span>
                    </h2>
                  );
                }

                // Quotes (e.g. "Waves - Nhịp sóng lưu dấu thời đại")
                if (paragraph.startsWith('"Waves -')) {
                  return (
                    <div 
                      key={idx}
                      className="my-6 p-6 rounded-2xl bg-[#E50914]/5 dark:bg-[#E50914]/10 border-l-4 border-[#E50914] text-center sm:text-left"
                    >
                      <p className="text-base sm:text-lg font-bold text-[#E50914] dark:text-[#FF4D8B] italic whitespace-pre-line">
                        {paragraph}
                      </p>
                    </div>
                  );
                }

                // Congratulations message highlight
                if (paragraph.startsWith('Chúc mừng hành trình mới')) {
                  return (
                    <div 
                      key={idx}
                      className="my-8 p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#E50914]/15 via-[#E50914]/5 to-transparent border-l-4 border-[#E50914] flex items-center gap-4 shadow-sm"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#E50914]/20 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6 text-[#E50914] dark:text-[#FF4D8B]" />
                      </div>
                      <div>
                        <p className="text-lg sm:text-xl font-extrabold text-[#E50914] dark:text-[#FF4D8B]">
                          {paragraph}
                        </p>
                        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
                          07.09.1970 - 07.09.2026 • 56 năm phát sóng Đài Truyền hình Việt Nam
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <p key={idx} className="whitespace-pre-line leading-relaxed text-[#374151] dark:text-[#D1D5DB]">
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Tags */}
            <div className="pt-6 border-t border-[#E5E7EB] dark:border-[#2A2A30] flex flex-wrap items-center gap-2">
              <Tag className="w-4 h-4 text-[#E50914]" />
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-[#F3F4F6] dark:bg-[#24242A] text-xs text-[#4B5563] dark:text-[#A1A1AA] border border-[#E5E7EB] dark:border-[#34343E]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Related News */}
      <div className="space-y-4 pt-6">
        <h3 className="text-xl font-bold text-[#111827] dark:text-white">Bài viết khác</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {relatedArticles.map((rel) => (
            <NewsCard
              key={rel.id}
              article={rel}
              onClick={(a) => navigate(`/news/${a.slug}`)}
            />
          ))}
        </div>
      </div>

      {/* Full Size Image Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          {/* Top Control Bar */}
          <div 
            className="absolute top-4 right-4 flex items-center gap-2 bg-[#25141E]/90 border border-white/20 rounded-full px-3 py-1.5 shadow-2xl z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightboxZoom((prev) => Math.min(3, prev + 0.25))}
              className="p-1.5 rounded-full hover:bg-white/15 text-white transition-colors cursor-pointer"
              title="Phóng to"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-white/90 px-1">
              {Math.round(lightboxZoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setLightboxZoom((prev) => Math.max(0.5, prev - 0.25))}
              className="p-1.5 rounded-full hover:bg-white/15 text-white transition-colors cursor-pointer"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setLightboxZoom(1)}
              className="p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Đặt lại kích thước"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-white/20 mx-1" />
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="p-1.5 rounded-full hover:bg-red-500/80 text-white transition-colors cursor-pointer"
              title="Đóng (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Image Container */}
          <div 
            className="max-w-[95vw] max-h-[88vh] overflow-auto flex items-center justify-center p-2 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage}
              alt="Full size view"
              referrerPolicy="no-referrer"
              style={{ transform: `scale(${lightboxZoom})`, transformOrigin: 'center center' }}
              className="max-w-full max-h-[85vh] object-contain transition-transform duration-200 shadow-2xl rounded-xl"
            />
          </div>
        </div>
      )}
    </article>
  );
};
