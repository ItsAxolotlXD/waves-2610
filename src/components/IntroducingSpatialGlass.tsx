import React from 'react';

// Static particle dots placed at fixed aesthetic positions (100% static, no animation)
const STATIC_PARTICLES = [
  { top: '22%', left: '8%', size: 3, color: '#FF8A00', opacity: 0.6 },
  { top: '35%', left: '16%', size: 2, color: '#E6005A', opacity: 0.5 },
  { top: '70%', left: '12%', size: 4, color: '#FF0A54', opacity: 0.5 },
  { top: '18%', left: '26%', size: 2.5, color: '#FFA500', opacity: 0.4 },
  { top: '78%', left: '30%', size: 3, color: '#E6005A', opacity: 0.6 },
  { top: '15%', left: '72%', size: 2.5, color: '#FF8A00', opacity: 0.6 },
  { top: '30%', left: '82%', size: 3.5, color: '#FF0A54', opacity: 0.5 },
  { top: '68%', left: '76%', size: 2, color: '#FF8A00', opacity: 0.5 },
  { top: '75%', left: '88%', size: 4, color: '#E6005A', opacity: 0.45 },
  { top: '25%', left: '92%', size: 2, color: '#FF0A54', opacity: 0.4 },
];

export const IntroducingSpatialGlass: React.FC = () => {
  return (
    <div
      id="introducing-spatial-glass"
      className="relative w-full py-8 sm:py-12 md:py-14 my-3 rounded-[24px] sm:rounded-[32px] overflow-hidden flex flex-col items-center justify-center text-center select-none border border-white/[0.025] bg-gradient-to-b from-white/[0.04] via-white/[0.015] to-transparent shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
    >
      {/* 1. Static ambient background glow (Diffused Bright Orange - Red Magenta, completely static) */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-xl h-24 sm:h-32 bg-gradient-to-r from-[#FF8A00]/25 via-[#FF0A54]/20 to-[#E6005A]/20 blur-2xl sm:blur-3xl pointer-events-none -z-10 rounded-full"
      />

      {/* 2. Static glowing particle dots (No movement, no CPU/GPU loop) */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none -z-0">
        {STATIC_PARTICLES.map((p, idx) => (
          <div
            key={idx}
            className="absolute rounded-full pointer-events-none"
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              opacity: p.opacity,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            }}
          />
        ))}
      </div>

      {/* 3. Main Headline: Introducing <gradient cam sáng - đỏ magenta>: Spatial Glass. */}
      <div className="relative z-10 px-4 max-w-4xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight sm:leading-none flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-5 gap-y-1.5">
          {/* Word: Introducing */}
          <span
            className="text-white tracking-tight"
            style={{
              textShadow: '0 0 16px rgba(255, 255, 255, 0.4), 0 0 30px rgba(255, 255, 255, 0.2)',
            }}
          >
            Introducing
          </span>

          {/* Word: Spatial Glass. (Gradient Cam sáng - Đỏ Magenta tĩnh với hiệu ứng phát sáng glow) */}
          <span className="relative inline-block">
            {/* Underlying static glow shadow */}
            <span
              aria-hidden="true"
              className="absolute inset-0 select-none pointer-events-none blur-xl opacity-60 font-black text-[#FF0A54]"
            >
              Spatial Glass.
            </span>

            {/* Foreground Static Gradient Text (Cam sáng - Đỏ Magenta) */}
            <span
              className="relative font-black tracking-tight bg-gradient-to-r from-[#FF8A00] via-[#FF0A54] to-[#E6005A] bg-clip-text text-transparent"
              style={{
                filter: 'drop-shadow(0 0 14px rgba(230, 0, 90, 0.45))',
              }}
            >
              Spatial Glass.
            </span>
          </span>
        </h2>
      </div>
    </div>
  );
};
