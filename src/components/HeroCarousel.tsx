import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HERO_SLIDES, DEFAULT_BANNER_PLACEHOLDER } from '../data/heroSlides';
import { Channel } from '../types';
import { CHANNELS_DATA } from '../data/channels';

interface HeroCarouselProps {
  navigate?: (route: string) => void;
  onSelectChannel?: (channel: Channel) => void;
  channels?: Channel[];
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  channels
}) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Danh sách kênh hợp lệ có logo
  const channelList = useMemo(() => {
    const list = (channels && channels.length > 0) ? channels : CHANNELS_DATA;
    return list.filter((c) => Boolean(c.logo));
  }, [channels]);

  // Hàm chọn ngẫu nhiên 1 kênh đề xuất
  const pickRandomChannel = (excludeId?: string): Channel => {
    const available = channelList.filter((c) => c.id !== excludeId);
    const pool = available.length > 0 ? available : channelList;
    if (pool.length === 0) return CHANNELS_DATA[0];
    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
  };

  // State kênh đề xuất ngẫu nhiên
  const [recommendedChannel, setRecommendedChannel] = useState<Channel>(() => {
    return channelList.length > 0 ? channelList[0] : CHANNELS_DATA[0];
  });

  // Tạo danh sách slide gồm các banner gốc + 1 banner kênh đề xuất
  const allSlides = useMemo(() => {
    const recSlide = {
      id: 'banner-recommended-channel',
      isRecommended: true,
      title: recommendedChannel.name,
      channel: recommendedChannel,
      backgroundImage: recommendedChannel.logo,
    };
    return [...HERO_SLIDES, recSlide];
  }, [recommendedChannel]);

  const totalSlides = allSlides.length;

  const [slideState, setSlideState] = useState({ current: 0, prev: 0 });
  const { current: currentIndex, prev: prevIndex } = slideState;

  // Preload banner images to avoid layout reflow or frame drop during animation
  useEffect(() => {
    allSlides.forEach((s) => {
      const src = s.backgroundImage || s.channel?.logo;
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

  const nextSlide = (isManualArrow = false) => {
    if (totalSlides > 1) {
      setSlideState((s) => ({
        current: (s.current + 1) % totalSlides,
        prev: s.current,
      }));
      if (isManualArrow) {
        resetTimer();
        setTimeout(() => {
          setRecommendedChannel((prev) => pickRandomChannel(prev.id));
        }, 900);
      }
    }
  };

  const prevSlide = (isManualArrow = false) => {
    if (totalSlides > 1) {
      setSlideState((s) => ({
        current: (s.current - 1 + totalSlides) % totalSlides,
        prev: s.current,
      }));
      if (isManualArrow) {
        resetTimer();
        setTimeout(() => {
          setRecommendedChannel((prev) => pickRandomChannel(prev.id));
        }, 900);
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

  // Cứ mỗi 5 giây banner sẽ chuyển liên tục không delay
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
    
    // If predominantly horizontal movement, pause auto-scroll
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

    // Minimum swipe threshold: 35px horizontal, deltaX > deltaY
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Swiped left -> next slide
        nextSlide(true);
      } else {
        // Swiped right -> prev slide
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
  const currentBannerBg = currentSlide ? (currentSlide.backgroundImage || currentSlide.channel?.logo || DEFAULT_BANNER_PLACEHOLDER) : '';

  return (
    <div 
      id="hero-3d-coverflow-carousel"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'pan-y' }}
      className="relative w-full overflow-hidden select-none pt-1 sm:pt-2 pb-0"
    >
      {/* Nền phía sau các banner: Lấy hình ảnh banner chính với hiệu ứng backdrop blur & diffuse ambient glow */}
      <div 
        id="hero-banner-ambient-background" 
        className="absolute inset-0 -top-16 -bottom-20 pointer-events-none overflow-hidden select-none -z-10"
        aria-hidden="true"
      >
        {/* Layer hình ảnh banner chính được phóng to và làm mờ đa tầng */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="popLayout">
            {currentBannerBg && (
              <motion.img
                key={`hero-bg-${currentIndex}-${currentBannerBg}`}
                src={currentBannerBg}
                alt=""
                referrerPolicy="no-referrer"
                initial={{ opacity: 0, scale: 1.25 }}
                animate={{ opacity: 0.50, scale: 1.45 }}
                exit={{ opacity: 0, scale: 1.45 }}
                transition={{ duration: 0.85, ease: 'easeOut' }}
                className="w-full h-full object-cover select-none pointer-events-none"
                style={{
                  filter: 'blur(55px) saturate(160%)',
                  WebkitFilter: 'blur(55px) saturate(160%)',
                  transform: 'scale(1.45) translateZ(0)',
                  willChange: 'filter, opacity, transform',
                }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Lớp kính mờ Backdrop Blur overlay phủ lên trên */}
        <div 
          className="absolute inset-0 backdrop-blur-2xl bg-[#181818]/40"
          style={{
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
          }}
        />

        {/* Chuyển sắc mượt mà hòa vào màu nền ứng dụng #181818 ở trên, dưới và 2 bên */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#181818]/80 via-transparent to-[#181818]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#181818]/85 via-transparent to-[#181818]/85" />
      </div>

      {/* 3D Stage Container */}
      <div 
        className="relative w-full flex items-center justify-center"
        style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
      >
        {/* Aspect ratio spacer so stage height strictly matches the banner height without dead gap */}
        <div 
          className="w-[88%] sm:w-[74%] md:w-[65%] lg:w-[62%] max-w-[840px] aspect-[16/9] pointer-events-none invisible" 
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
          const isRec = 'isRecommended' in slide && slide.isRecommended;

          // Xây dựng style 3D Coverflow mượt mà, thời gian 1.08s vừa vặn, trôi êm ái hơn
          let transformStyle: React.CSSProperties = {
            transition: !isWrapJump && isNear
              ? 'transform 1.08s cubic-bezier(0.22, 1, 0.36, 1), opacity 1.08s cubic-bezier(0.22, 1, 0.36, 1)'
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
              transform: 'translate3d(-50%, 0, -110px) rotateY(38deg) scale(0.78)',
              zIndex: 20,
              opacity: 0.7,
              visibility: 'visible',
            };
          } else if (isRight) {
            transformStyle = {
              ...transformStyle,
              transform: 'translate3d(50%, 0, -110px) rotateY(-38deg) scale(0.78)',
              zIndex: 20,
              opacity: 0.7,
              visibility: 'visible',
            };
          } else if (isFarLeft) {
            transformStyle = {
              ...transformStyle,
              transform: 'translate3d(-80%, 0, -230px) rotateY(50deg) scale(0.64)',
              zIndex: 10,
              opacity: 0,
              visibility: 'visible',
            };
          } else if (isFarRight) {
            transformStyle = {
              ...transformStyle,
              transform: 'translate3d(80%, 0, -230px) rotateY(-50deg) scale(0.64)',
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
              style={transformStyle}
              className={`absolute inset-0 m-auto w-[88%] sm:w-[74%] md:w-[65%] lg:w-[62%] max-w-[840px] aspect-[16/9] rounded-2xl sm:rounded-[24px] overflow-hidden border border-white/10 cursor-default select-none pointer-events-none transition-shadow duration-500 ${
                isCenter
                  ? 'shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_35px_rgba(230,0,90,0.32)] ring-1 ring-white/20'
                  : 'shadow-[0_16px_40px_rgba(0,0,0,0.7)]'
              }`}
            >
              {isRec ? (
                /* Banner Kênh Đề Xuất (Sử dụng logo kênh với hiệu ứng studio broadcast) */
                <div className="w-full h-full relative flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#1C1C24] via-[#121217] to-[#0A0A0D]">
                  {/* Studio ambient radial glow */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                    <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-[#E6005A]/25 to-[#FF3366]/20 blur-3xl opacity-80" />
                  </div>

                  {/* Logo chính giữa hiển thị nổi bật */}
                  <div className="relative z-10 w-full max-w-[240px] sm:max-w-[320px] max-h-[95px] sm:max-h-[120px] flex items-center justify-center p-2">
                    <img
                      src={recommendedChannel.logo}
                      alt={recommendedChannel.name}
                      referrerPolicy="no-referrer"
                      className="max-h-[75px] sm:max-h-[95px] max-w-full object-contain filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.75)]"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src !== DEFAULT_BANNER_PLACEHOLDER) {
                          target.src = DEFAULT_BANNER_PLACEHOLDER;
                        }
                      }}
                    />
                  </div>

                  {/* Tên kênh & Thể loại */}
                  <div className="relative z-10 mt-3 text-center">
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-wide">
                      {recommendedChannel.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#9CA3AF] mt-0.5 font-medium">
                      {recommendedChannel.category}
                    </p>
                  </div>
                </div>
              ) : (
                /* Ảnh nền slide thông thường - Chỉ xem, không thể bấm */
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
              )}

              {/* Lớp phủ tối mờ khi slide ở 2 bên */}
              {!isCenter && (
                <div className="absolute inset-0 bg-black/40 hover:bg-black/15 transition-colors z-10 pointer-events-none" />
              )}
            </div>
          );
        })}

        {/* Nút mũi tên Chevron trái (<) - bấm sẽ randomize 1 kênh đề xuất */}
        {totalSlides > 1 && (
          <button
            id="btn-coverflow-prev"
            onClick={() => prevSlide(true)}
            aria-label="Slide trước"
            className="absolute left-[2%] sm:left-[6%] md:left-[10%] lg:left-[13%] top-1/2 -translate-y-1/2 z-40 text-white/90 hover:text-white hover:scale-125 active:scale-95 transition-all p-2 cursor-pointer drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
          >
            <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 stroke-[2.5]" />
          </button>
        )}

        {/* Nút mũi tên Chevron phải (>) - bấm sẽ randomize 1 kênh đề xuất */}
        {totalSlides > 1 && (
          <button
            id="btn-coverflow-next"
            onClick={() => nextSlide(true)}
            aria-label="Slide tiếp theo"
            className="absolute right-[2%] sm:right-[6%] md:right-[10%] lg:right-[13%] top-1/2 -translate-y-1/2 z-40 text-white/90 hover:text-white hover:scale-125 active:scale-95 transition-all p-2 cursor-pointer drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
          >
            <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Pagination Indicators có animation mượt mà sử dụng motion layout */}
      {totalSlides > 1 && (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-2.5 sm:mt-3">
          {allSlides.map((_, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className="relative py-1.5 px-0.5 flex items-center justify-center cursor-pointer group focus:outline-none"
                aria-label={`Đi tới slide ${idx + 1}`}
              >
                {isActive ? (
                  <motion.span
                    layoutId="hero-active-pill"
                    className="w-7 sm:w-9 h-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.95)]"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                ) : (
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-white/30 group-hover:bg-white/60 transition-colors"
                    layout
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
