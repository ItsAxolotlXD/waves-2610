import React, { useState } from 'react';
import { motion } from 'motion/react';

const ONLINE_ICON_URL =
  'https://static.wikia.nocookie.net/ep-deo/images/7/72/Monochrom.png/revision/latest/scale-to-width-down/1000?cb=20260825072411';
const LOCAL_ICON_URL = '/icons/monochrome-loader.png';

interface TabLoadingScreenProps {
  className?: string;
}

export const TabLoadingScreen: React.FC<TabLoadingScreenProps> = ({ className = '' }) => {
  const [imgSrc, setImgSrc] = useState(ONLINE_ICON_URL);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Đang tải..."
      className={`flex-1 flex flex-col items-center justify-center min-h-[52vh] sm:min-h-[58vh] py-16 sm:py-24 select-none ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {/* Gentle ambient background glow */}
        <div
          className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 dark:bg-white/15 blur-2xl pointer-events-none animate-pulse"
          aria-hidden="true"
        />

        {/* Rotating Monochrome Icon with gentle glow */}
        <motion.img
          src={imgSrc}
          onError={() => setImgSrc(LOCAL_ICON_URL)}
          alt="Đang tải..."
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 1.25,
            ease: 'linear',
          }}
          className="w-14 h-14 sm:w-16 sm:h-16 object-contain pointer-events-none select-none tab-loading-spinner"
        />
      </div>
    </div>
  );
};
