import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HERO_SLIDES, DEFAULT_BANNER_PLACEHOLDER } from '../data/heroSlides';
import { Channel } from '../types';

interface HeroCarouselProps {
  navigate?: (route: string) => void;
  onSelectChannel?: (channel: Channel) => void;
  channels?: Channel[];
}

export const HeroCarousel: React.FC<HeroCarouselProps> = () => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Danh sách slide gồm các banner chất lượng cao
  const allSlides = HERO_SLIDES;
  const totalSlides = allSlides.length;

  // Mặc định hiển thị THỜI SỰ 19H ở trung tâm (index 3), bên trái là CHÀO BUỔI SÁNG, bên phải là WAVES
  const initialIndex = allSlides.findIndex((s) => s.id === 'thoi-su-19h-vtv');
  const defaultIndex = initialIndex >= 0 ? initialIndex : 0;

  const [slideState, setSlideState] = useState({ current: defaultIndex, prev: defaultIndex });
  const { current: currentIndex, prev: prevIndex } = slideState;

  // Preload banner images to avoid layout reflow or frame drop
  useEffect(() => {
    allSlides.forEach((s) => {
      const src = s.backgroundImage;
      if (src) {
        const img = new Image();
        img.src = src;
      }
    });
  }, [allSlides]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSlideState((s) => ({
        current: (s.current + 1) % totalSlides,
        prev: s.current,
      }));
    }, 5000);
  };

  const nextSlide = (isManual = false) => {
    if (totalSlides > 1) {
      setSlideState((s) => ({
        current: (s.current + 1) % totalSlides,
        prev: s.current,
      }));
      if (isManual) {
        resetTimer();
      }
    }
  };

  const prevSlide = (isManual = false) => {
    if (totalSlides > 1) {
      setSlideState((s) => ({
        current: (s.current - 1 + totalSlides) % totalSlides,
        prev: s.current,
      }));
      if (isManual) {
        resetTimer();
      }
    }
  };

  const goToSlide = (idx: number) => {
    if (idx !== currentIndex) {
      setSlideState({
        current: idx,
        prev: currentIndex,
      });
      resetTimer();
    }
  };

  // Cứ mỗi 5 giây banner tự động chuyển slide mượt mà
  useEffect(() => {
    if (totalSlides > 1) {
      resetTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalSlides]);

  // Tính khoảng cách vòng tròn (circular diff) giữa index i và vị trí slide hiện tại
  const getSlidePosition = (i: number, current: number) => {
    let diff = (i - current) % totalSlides;
    if (diff < -Math.floor(totalSlides / 2)) {
      diff += totalSlides;
    } else if (diff > Math.floor(totalSlides / 2)) {
      diff -= totalSlides;
    }
    return diff;
  };

  // Touch swipe handling for mobile / tablets
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const isSwipingRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
      isSwipingRef.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwipingRef.current || touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.touches[0].clientX - touchStartXRef.current;
    const deltaY = e.touches[0].clientY - touchStartYRef.current;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isSwipingRef.current || touchStartXRef.current === null || touchStartYRef.current === null) {
      isSwipingRef.current = false;
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartXRef.current;
    const deltaY = touchEndY - touchStartYRef.current;

    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        nextSlide(true);
      } else {
        prevSlide(true);
      }
    } else {
      resetTimer();
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
    isSwipingRef.current = false;
  };

  const currentSlide = allSlides[currentIndex];
  const currentBannerBg = currentSlide ? (currentSlide.backgroundImage || DEFAULT_BANNER_PLACEHOLDER) : '';

  return (
    <div
      id="hero-3d-coverflow-carousel"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'pan-y' }}
      className="relative w-full overflow-hidden select-none pt-1 sm:pt-2 pb-1"
    >
      {/* Nền phía sau các banner: Lấy hình ảnh banner chính với hiệu ứng backdrop blur & diffuse ambient glow */}
      <div
        id="hero-banner-ambient-background"
        className="absolute inset-0 -top-16 -bottom-20 pointer-events-none overflow-hidden select-none -z-10"
        aria-hidden="true"
      >
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="popLayout">
            {currentBannerBg && (
              <motion.img
                key={`hero-bg-${currentIndex}-${currentBannerBg}`}
                src={currentBannerBg}
                alt=""
                referrerPolicy="no-referrer"
                initial={{ opacity: 0, scale: 1.15 }}
                animate={{ opacity: 0.38, scale: 1.25 }}
                exit={{ opacity: 0, scale: 1.25 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                className="w-full h-full object-cover select-none pointer-events-none"
                style={{
                  filter: 'blur(28px) saturate(140%)',
                  WebkitFilter: 'blur(28px) saturate(140%)',
                  transform: 'scale(1.25) translateZ(0)',
                  willChange: 'opacity',
                }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Lớp phủ chuyển sắc mượt mà hòa vào màu nền ứng dụng #181818 */}
        <div className="absolute inset-0 bg-[#181818]/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#181818]/85 via-transparent to-[#181818]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#181818]/90 via-transparent to-[#181818]/90" />
      </div>

      {/* 3D Stage Container */}
      <div
        className="relative w-full flex items-center justify-center"
        style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
      >
        {/* Aspect ratio spacer so stage height strictly matches banner height */}
        <div
          className="w-[88%] sm:w-[76%] md:w-[66%] lg:w-[62%] max-w-[860px] aspect-[16/9] pointer-events-none invisible"
          aria-hidden="true"
        />

        {allSlides.map((slide, i) => {
          const diff = getSlidePosition(i, currentIndex);
          const prevDiff = getSlidePosition(i, prevIndex);
          const diffDelta = Math.abs(diff - prevDiff);
          const isWrapJump = diffDelta > 1;

          const isCenter = diff === 0;
          const isLeft = diff === -1;
          const isRight = diff === 1;
          const isFarLeft = diff === -2;
          const isFarRight = diff === 2;
          const isNear = Math.abs(diff) <= 2;

          // Xây dựng style 3D Coverflow mượt mà
          let transformStyle: React.CSSProperties = {
            transition: !isWrapJump && isNear
              ? 'transform 0.95s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.95s cubic-bezier(0.22, 1, 0.36, 1)'
              : 'none',
            willChange: isNear ? 'transform, opacity' : 'auto',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden',
          };

          if (isCenter) {
            transformStyle = {
              ...transformStyle,
              transform: 'translate3d(0%, 0, 0px) rotateY(0deg) scale(1)',
              zIndex: 30,
              opacity: 1,
              visibility: 'visible',
            };
          } else if (isLeft) {
            transformStyle = {
              ...transformStyle,
              transform: 'translate3d(-52%, 0, -100px) rotateY(38deg) scale(0.80)',
              zIndex: 20,
              opacity: 0.85,
              visibility: 'visible',
            };
          } else if (isRight) {
            transformStyle = {
              ...transformStyle,
              transform: 'translate3d(52%, 0, -100px) rotateY(-38deg) scale(0.80)',
              zIndex: 20,
              opacity: 0.85,
              visibility: 'visible',
            };
          } else if (isFarLeft) {
            transformStyle = {
              ...transformStyle,
              transform: 'translate3d(-85%, 0, -220px) rotateY(48deg) scale(0.65)',
              zIndex: 10,
              opacity: 0,
              visibility: 'visible',
            };
          } else if (isFarRight) {
            transformStyle = {
              ...transformStyle,
              transform: 'translate3d(85%, 0, -220px) rotateY(-48deg) scale(0.65)',
              zIndex: 10,
              opacity: 0,
              visibility: 'visible',
            };
          } else {
            transformStyle = {
              ...transformStyle,
              transform: 'translate3d(0%, 0, -260px) scale(0.55)',
              zIndex: 0,
              opacity: 0,
              visibility: 'hidden',
              transition: 'none',
            };
          }

          return (
            <div
              key={slide.id}
              id={`hero-carousel-slide-${slide.id}`}
              style={transformStyle}
              className={`hero-carousel-slide absolute inset-0 m-auto w-[88%] sm:w-[76%] md:w-[66%] lg:w-[62%] max-w-[860px] aspect-[16/9] rounded-2xl sm:rounded-[24px] overflow-hidden cursor-default select-none pointer-events-none transition-shadow duration-500 ${
                isCenter
                  ? 'is-center shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_35px_rgba(230,0,90,0.32)]'
                  : 'shadow-[0_16px_40px_rgba(0,0,0,0.7)]'
              }`}
            >
              {/* Ảnh nền banner - 16:9 với object-cover */}
              <img
                src={slide.backgroundImage || DEFAULT_BANNER_PLACEHOLDER}
                alt={slide.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center pointer-events-none select-none"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== DEFAULT_BANNER_PLACEHOLDER) {
                    target.src = DEFAULT_BANNER_PLACEHOLDER;
                  }
                }}
              />

              {/* Lớp phủ tối mờ tinh tế khi slide ở 2 bên góc nhìn 3D */}
              {!isCenter && (
                <div className="absolute inset-0 bg-black/35 hover:bg-black/15 transition-colors z-10 pointer-events-none" />
              )}

              {/* Spatial Glass: Viền trắng ở 2 cạnh trên - dưới, mỏng 1px với opacity 40% */}
              <div
                className="hero-slide-glass-border absolute inset-0 pointer-events-none z-30 rounded-[inherit]"
                aria-hidden="true"
              />
            </div>
          );
        })}

        {/* Nút mũi tên Chevron trái (<) - Kính mờ tròn chuẩn theo ảnh */}
        {totalSlides > 1 && (
          <button
            id="btn-coverflow-prev"
            onClick={() => prevSlide(true)}
            aria-label="Slide trước"
            className="absolute left-[3%] sm:left-[6%] md:left-[9%] lg:left-[11%] top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-[#1c1c1f]/60 hover:bg-[#1c1c1f]/90 active:scale-95 hover:scale-110 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 hover:text-white transition-all shadow-[0_8px_25px_rgba(0,0,0,0.7)] cursor-default select-none outline-none"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </button>
        )}

        {/* Nút mũi tên Chevron phải (>) - Kính mờ tròn chuẩn theo ảnh */}
        {totalSlides > 1 && (
          <button
            id="btn-coverflow-next"
            onClick={() => nextSlide(true)}
            aria-label="Slide tiếp theo"
            className="absolute right-[3%] sm:right-[6%] md:right-[9%] lg:right-[11%] top-1/2 -translate-y-1/2 z-40 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-[#1c1c1f]/60 hover:bg-[#1c1c1f]/90 active:scale-95 hover:scale-110 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 hover:text-white transition-all shadow-[0_8px_25px_rgba(0,0,0,0.7)] cursor-default select-none outline-none"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Pagination Indicators chuẩn thiết kế: Các chấm tròn và thanh dài ở trung tâm */}
      {totalSlides > 1 && (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-3.5">
          {allSlides.map((_, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className="relative py-1.5 px-0.5 flex items-center justify-center cursor-default group focus:outline-none"
                aria-label={`Đi tới slide ${idx + 1}`}
              >
                {isActive ? (
                  <motion.span
                    layoutId="hero-active-pill"
                    className="w-7 sm:w-8 h-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.95)]"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                ) : (
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-white/30 group-hover:bg-white/60 transition-colors"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
