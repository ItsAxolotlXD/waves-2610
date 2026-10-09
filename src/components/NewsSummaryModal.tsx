import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, CheckCircle2, FileText } from 'lucide-react';
import { NewsArticle } from '../types';
import { exportArticleToDocx } from '../utils/docxExport';
import { useSettings } from '../hooks/useSettings';

interface NewsSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: NewsArticle;
}

export const NewsSummaryModal: React.FC<NewsSummaryModalProps> = ({
  isOpen,
  onClose,
  article
}) => {
  const { settings } = useSettings();
  const shouldAnimate = !settings.reduceAllMotion && settings.animateModals;
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 10-second loading simulation when summarize news is opened
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setIsLoading(true);
      timer = setTimeout(() => {
        setIsLoading(false);
      }, 10000);
    } else {
      setIsLoading(true);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOpen, article.id]);

  // Generate structured summary bullet points from article content or explicit summary
  const bulletPoints = article.summary?.points && article.summary.points.length > 0
    ? article.summary.points
    : article.content.slice(0, 3).map((p) => {
        const firstSentence = p.split(/[.!?]/)[0];
        return firstSentence.length > 20 ? firstSentence + '.' : p;
      });

  const leadText = article.summary?.lead || article.excerpt;

  const handleCopySummary = () => {
    const pointsFormatted = bulletPoints.map((b) => `- ${b}`).join('\n');
    const conclusionText = article.summary?.conclusion ? `\n\n${article.summary.conclusion}` : '';
    const summaryText = `[TÓM TẮT TIN TỨC - ${article.title}]\n\n• ${leadText}\n\nĐiểm tin chính:\n${pointsFormatted}${conclusionText}\n\nNguồn: Waves / VNRT Online News (${article.publishedAt})`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportDocx = async () => {
    setExporting(true);
    try {
      await exportArticleToDocx(article);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            id="news-summary-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldAnimate ? 0.3 : 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/10 backdrop-blur-md"
          />

          <motion.div
            id="news-summary-dialog"
            initial={shouldAnimate ? { opacity: 0, scale: 1.05 } : { opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={shouldAnimate ? { opacity: 0, scale: 1.05 } : { opacity: 0 }}
            transition={{ duration: shouldAnimate ? 0.25 : 0, ease: [0.16, 1, 0.3, 1] }}
            className="spatial-glass-modal relative w-full max-w-[480px] bg-white/70 border border-white/50 rounded-[24px] p-5 sm:p-6 shadow-2xl z-10 text-black"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-black/10">
              <h3 className="text-base sm:text-lg font-bold text-black">
                Tóm tắt bài viết
              </h3>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-transparent hover:bg-transparent border-none flex items-center justify-center text-neutral-700 hover:text-black cursor-default transition-colors"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Loading 10-second State with spinning monochrome tools logo icon & "Crafting ideas..." */}
            {isLoading ? (
              <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-5 my-2">
                {/* Rotating Tools Logo Icon Container - Monochrome black */}
                <div className="flex items-center justify-center py-2">
                  <img
                    src="https://static.wikia.nocookie.net/ep-deo/images/3/3c/Tools_menu.png/revision/latest?cb=20260905055712"
                    alt="Tools logo"
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 object-contain animate-spin brightness-0"
                    style={{ animationDuration: '2.5s' }}
                  />
                </div>

                {/* Animated Text */}
                <div className="space-y-2">
                  <h4 className="text-lg sm:text-xl font-bold tracking-wide text-black">
                    Crafting ideas...
                  </h4>
                  <p className="text-xs text-neutral-700 max-w-[320px] leading-relaxed">
                    Đang phân tích và chắt lọc nội dung bài viết
                  </p>
                </div>

                {/* 10-second progress indicator */}
                <div className="w-56 h-1.5 bg-black/10 rounded-full overflow-hidden mt-2 relative">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 10, ease: 'linear' }}
                    className="h-full bg-gradient-to-r from-[#E6005A] via-[#FF4D8D] to-[#E6005A] rounded-full"
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Content */}
                <motion.div 
                  initial={shouldAnimate ? { opacity: 0, y: 6 } : { opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mt-5 space-y-4 max-h-[60vh] overflow-y-auto pr-1"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF4D8D]">
                      {article.category}
                    </span>
                    <h4 className="text-base font-bold text-black mt-1 leading-snug">
                      {article.title}
                    </h4>
                  </div>

                  {/* Core takeaway - no italic */}
                  <div className="p-4 rounded-2xl bg-black/5 border border-black/10 border-l-4 border-l-[#E6005A]">
                    <p className="text-xs sm:text-sm font-medium text-black leading-relaxed">
                      "{leadText}"
                    </p>
                  </div>

                  {/* Bullet points */}
                  <div>
                    <h5 className="text-xs font-bold uppercase text-neutral-700 mb-2 tracking-wider">
                      Các điểm mấu chốt:
                    </h5>
                    <div className="space-y-2">
                      {bulletPoints.map((bp, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-black/5 border border-black/10 text-xs text-neutral-800 flex items-start gap-2.5"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#E6005A]/15 text-[#E6005A] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="leading-relaxed font-medium">{bp}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Conclusion if provided - no italic */}
                  {article.summary?.conclusion && (
                    <div className="p-3 rounded-xl bg-black/5 border border-black/10 text-xs text-neutral-800 leading-relaxed font-medium">
                      {article.summary.conclusion}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-neutral-700 pt-2 border-t border-black/10">
                    <span>Chuyên mục: <strong className="text-black">{article.category}</strong></span>
                    <span>Ngày xuất bản: {article.publishedAt}</span>
                  </div>
                </motion.div>

                {/* Actions */}
                <div className="mt-6 pt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="flex-1 py-3 px-4 rounded-full bg-black/5 hover:bg-black/10 border border-black/10 text-xs font-bold text-black flex items-center justify-center gap-2 transition-all cursor-default"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Đã sao chép tóm tắt' : 'Sao chép tóm tắt'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportDocx}
                    disabled={exporting}
                    className="flex-1 py-3 px-4 rounded-full bg-[#E50914] hover:bg-[#CC0812] text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-default shadow-md"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{exporting ? 'Đang xuất...' : 'Xuất .docx'}</span>
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
