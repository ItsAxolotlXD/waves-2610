import React from 'react';

interface TriangleLoaderProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export const TriangleLoader: React.FC<TriangleLoaderProps> = ({
  size = 76,
  className = '',
  glow = false
}) => {
  return (
    <div
      role="status"
      aria-label="Đang tải..."
      className={`relative inline-flex items-center justify-center select-none ${className}`}
    >
      {/* Radiant ambient glow in red-orange if explicitly requested */}
      {glow && (
        <div
          className="absolute -inset-4 sm:-inset-6 rounded-full bg-gradient-to-tr from-[#FF1E27]/25 via-[#FF4A00]/20 to-[#FF8800]/25 blur-2xl animate-pulse pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Inverted Triangle loader - Stationary (NO spin), crisp lines running continuously with no stroke glow */}
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none select-none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="vplay-triangle-loader-grad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#FF1E27" />
            <stop offset="50%" stopColor="#FF4A00" />
            <stop offset="100%" stopColor="#FF8800" />
          </linearGradient>
        </defs>

        {/* 1. Base track: shows the full hollow inverted triangle silhouette with hole */}
        <path
          d="M 2.2 3.6 H 21.8 L 12 21.6 Z"
          stroke="url(#vplay-triangle-loader-grad)"
          strokeWidth="3.4"
          strokeOpacity="0.2"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />

        {/* 2. Primary crisp beam running along the edges and continuously disappearing behind (NO glow) */}
        <path
          pathLength={100}
          d="M 2.2 3.6 H 21.8 L 12 21.6 Z"
          stroke="url(#vplay-triangle-loader-grad)"
          strokeWidth="3.6"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
          className="triangle-dash-flowing"
        />
      </svg>
    </div>
  );
};
