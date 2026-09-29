import React from 'react';
import { MONOCHROME_ICON_SRC } from '../assets/monochromeIcon';
import { useSettings } from '../hooks/useSettings';
import { TriangleLoader } from './TriangleLoader';

interface TabLoadingScreenProps {
  className?: string;
}

export const TabLoadingScreen: React.FC<TabLoadingScreenProps> = ({ className = '' }) => {
  const { settings } = useSettings();

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Đang tải..."
      className={`w-full flex-1 flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[55vh] py-16 sm:py-24 select-none ${className}`}
    >
      {settings.triangleExperiment ? (
        <div className="relative flex flex-col items-center justify-center">
          <TriangleLoader size={88} glow={false} />
        </div>
      ) : (
        <div className="relative flex items-center justify-center">
          {/* Gentle ambient background glow */}
          <div
            className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/10 dark:bg-white/15 blur-2xl pointer-events-none"
            aria-hidden="true"
          />

          {/* Rotating Monochrome Icon with gentle glow */}
          <img
            src={MONOCHROME_ICON_SRC}
            alt="Đang tải..."
            className="w-14 h-14 sm:w-16 sm:h-16 object-contain pointer-events-none select-none tab-loading-spinner animate-spin"
            style={{ animationDuration: '1.2s' }}
          />
        </div>
      )}
    </div>
  );
};
