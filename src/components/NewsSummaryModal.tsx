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
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
          />

          <motion.div
            id="news-summary-dialog"
            initial={shouldAnimate ? { opacity: 0, scale: 0.98, y: 8 } : { opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldAnimate ? { opacity: 0, scale: 0.98, y: 6 } : { opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.1, 0.9, 0.2, 1] }}
            className="fluent-modal-dialog relative w-full max-w-[500px] bg-white dark:bg-[#202020] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)] border border-black/[0.08] dark:border-white/[0.08] z-10 text-[#1F1F1F] dark:text-[#F3F4F6]"
          >
            {/* Header & Body Area */}
            <div className="p-6 pb-4">
              <h2 className="text-[20px] font-semibold text-[#1F1F1F] dark:text-[#FFFFFF] tracking-tight leading-snug font-sans">
                Tóm tắt bài viết
              </h2>

              {/* Loading State */}
              {isLoading ? (
                <div className="py-10 px-4 flex flex-col items-center justify-center text-center space-y-4 my-2">
                  <div className="flex items-center justify-center py-2">
                    <img
                      src="https://static.wikia.nocookie.net/ep-deo/images/3/3c/Tools_menu.png/revision/latest?cb=20260905055712"
                      alt="Tools logo"
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 object-contain animate-spin brightness-0 dark:brightness-100"
                      style={{ animationDuration: '2.5s' }}
                    />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-[#1F1F1F] dark:text-[#FFFFFF]">
                      Đang xử lý nội dung...
                    </h3>
                    <p className="text-xs text-[#666666] dark:text-[#AAAAAA] max-w-[300px]">
                      Trích xuất thông tin trọng tâm của bản tin
                    </p>
                  </div>

                  {/* 10-second progress indicator */}
                  <div className="w-48 h-1.5 bg-black/[0.08] dark:bg-white/[0.1] rounded-full overflow-hidden mt-2 relative">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 10, ease: 'linear' }}
                      className="h-full bg-[#0067C0] rounded-full"
                    />
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={shouldAnimate ? { opacity: 0, y: 6 } : { opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 space-y-3.5 max-h-[55vh] overflow-y-auto pr-1"
                >
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0067C0] dark:text-[#4CC2FF]">
                      {article.category}
                    </span>
                    <h3 className="text-base font-semibold text-[#1F1F1F] dark:text-[#FFFFFF] mt-0.5 leading-snug">
                      {article.title}
                    </h3>
                  </div>

                  {/* Core takeaway */}
                  <div className="p-3.5 rounded-lg bg-[#F9F9F9] dark:bg-[#2B2B2B] border border-black/[0.06] dark:border-white/[0.08] border-l-4 border-l-[#0067C0]">
                    <p className="text-[13px] font-normal text-[#1F1F1F] dark:text-[#E0E0E0] leading-relaxed">
                      "{leadText}"
                    </p>
                  </div>

                  {/* Bullet points */}
                  <div>
                    <h4 className="text-xs font-semibold text-[#666666] dark:text-[#AAAAAA] mb-2 uppercase tracking-wide">
                      Các điểm mấu chốt:
                    </h4>
                    <div className="space-y-1.5">
                      {bulletPoints.map((bp, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-md bg-[#F9F9F9] dark:bg-[#2B2B2B] border border-black/[0.06] dark:border-white/[0.08] text-[13px] text-[#333333] dark:text-[#DDDDDD] flex items-start gap-2.5"
                        >
                          <span className="w-4.5 h-4.5 rounded-full bg-[#0067C0]/15 text-[#0067C0] dark:text-[#4CC2FF] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="leading-relaxed font-normal">{bp}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {article.summary?.conclusion && (
                    <div className="p-3 rounded-md bg-[#F9F9F9] dark:bg-[#2B2B2B] border border-black/[0.06] dark:border-white/[0.08] text-[13px] text-[#333333] dark:text-[#DDDDDD] leading-relaxed font-normal">
                      {article.summary.conclusion}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-[#777777] dark:text-[#999999] pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                    <span>Chuyên mục: <strong className="text-[#1F1F1F] dark:text-[#FFFFFF]">{article.category}</strong></span>
                    <span>Ngày xuất bản: {article.publishedAt}</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Subtle Divider */}
            <div className="h-[1px] w-full bg-[#E5E5E5] dark:bg-[#2F2F2F]" />

            {/* Bottom Actions Footer */}
            <div className="fluent-modal-footer bg-[#F3F3F3] dark:bg-[#272727] px-6 py-3.5 flex items-center justify-end gap-2.5">
              {!isLoading && (
                <>
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="fluent-btn-primary px-4 py-1.5 h-8 sm:h-9 rounded-[4px] bg-[#0067c0] hover:bg-[#1875c7] active:bg-[#005fb8] text-white text-[13px] font-medium shadow-sm transition-colors border border-[#005A9E] border-b-2 border-b-[#004578] flex items-center justify-center cursor-default gap-1.5"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportDocx}
                    disabled={exporting}
                    className="fluent-btn-secondary px-4 py-1.5 h-8 sm:h-9 rounded-[4px] bg-white dark:bg-[#2D2D2D] hover:bg-[#F9F9F9] dark:hover:bg-[#383838] active:bg-[#EEEEEE] dark:active:bg-[#222222] text-[#1F1F1F] dark:text-[#FFFFFF] border border-[#d1d1d1] dark:border-[#3E3E3E] border-b-[#b5b5b5] dark:border-b-[#4F4F4F] text-[13px] font-normal shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors flex items-center justify-center cursor-default gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{exporting ? 'Đang xuất...' : 'Xuất Word'}</span>
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={onClose}
                className="fluent-btn-secondary px-4 py-1.5 h-8 sm:h-9 rounded-[4px] bg-white dark:bg-[#2D2D2D] hover:bg-[#F9F9F9] dark:hover:bg-[#383838] active:bg-[#EEEEEE] dark:active:bg-[#222222] text-[#1F1F1F] dark:text-[#FFFFFF] border border-[#d1d1d1] dark:border-[#3E3E3E] border-b-[#b5b5b5] dark:border-b-[#4F4F4F] text-[13px] font-normal shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors flex items-center justify-center cursor-default"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
