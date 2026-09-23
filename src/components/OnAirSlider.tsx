import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Channel } from '../types';

interface OnAirSliderProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  navigate: (route: string) => void;
}

export const OnAirSlider: React.FC<OnAirSliderProps> = ({
  channels,
  onSelectChannel,
  navigate
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // Hàm cuộn mượt mà có gia tốc animation (smooth kinetic easeInOutCubic scroll)
  const animatedScroll = (distance: number, duration: number = 600) => {
    const container = scrollContainerRef.current;
    if (!container || isScrolling) return;

    setIsScrolling(true);
    const start = container.scrollLeft;
    const startTime = performance.now();

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = easeInOutCubic(progress);

      container.scrollLeft = start + distance * ease;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setIsScrolling(false);
      }
    };

    requestAnimationFrame(step);
  };

  const scroll = (direction: 'left' | 'right') => {
    const offset = direction === 'left' ? -460 : 460;
    animatedScroll(offset, 650);
  };

  return (
    <section className="w-full">
      {/* Header with Title & Slider Controls */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#E6005A]" />
          <span>Đề xuất cho bạn</span>
        </h2>

        <div className="flex items-center gap-2">
          <motion.button
            id="slider-prev-btn"
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-white bg-white/5 hover:bg-white/10 transition-all cursor-default"
            aria-label="Cuộn sang trái"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
          <motion.button
            id="slider-next-btn"
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#A1A1AA] hover:text-white bg-white/5 hover:bg-white/10 transition-all cursor-default"
            aria-label="Cuộn sang phải"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Horizontal Cards Scroll với hiệu ứng lướt mượt mà */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2.5 sm:gap-3.5 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth"
      >
        {channels.map((ch, idx) => (
          <motion.div
            key={ch.id}
            id={`recommended-channel-${ch.id}`}
            role="button"
            tabIndex={0}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => {
              onSelectChannel(ch);
              navigate(`/live-tv?channel=${ch.slug}`);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelectChannel(ch);
                navigate(`/live-tv?channel=${ch.slug}`);
              }
            }}
            className="min-w-[84px] sm:min-w-[96px] md:min-w-[108px] h-[46px] sm:h-[52px] md:h-[58px] shrink-0 rounded-xl sm:rounded-2xl p-2 flex items-center justify-center cursor-default group select-none bg-[#353535] hover:bg-[#3d3d3d] transition-colors shadow-sm"
            title={ch.name}
            aria-label={ch.name}
          >
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={ch.logo}
                alt={ch.name}
                referrerPolicy="no-referrer"
                className="max-h-6 sm:max-h-7 md:max-h-7.5 max-w-[82%] w-auto object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
