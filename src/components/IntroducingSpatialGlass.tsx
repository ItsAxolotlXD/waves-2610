import React, { useMemo } from 'react';

interface Particle {
  id: number;
  left: number; // 2% - 98%
  size: number; // 2px - 5px
  color: string;
  duration: number; // 5s - 10s
  delay: number; // 0s - 6s
  driftX: number; // horizontal sway distance in px
  opacity: number;
}

export const IntroducingSpatialGlass: React.FC = () => {
  // Pre-calculate deterministic, beautifully distributed slow-floating particles
  const particles: Particle[] = useMemo(() => {
    const colors = [
      '#FF003F', // Vivid Crimson Red
      '#FF2A5F', // Rose Red
      '#FF6B8B', // Coral Pink
      '#FFFFFF', // Crisp White
      '#FFE8EF', // Glowing White-Pink
    ];

    const list: Particle[] = [];
    const count = 18;

    for (let i = 0; i < count; i++) {
      const left = Math.round(4 + ((i * 5.4) % 92));
      const size = 2.5 + ((i % 4 === 0) ? 2.5 : (i % 3 === 0) ? 1.5 : (i % 2 === 0) ? 2 : 1);
      const color = colors[i % colors.length];
      const duration = 6 + ((i * 1.3) % 6); // 6s - 12s
      const delay = (i * 0.45) % 6;
      const driftX = ((i % 2 === 0 ? 1 : -1) * (12 + (i % 5) * 4));
      const opacity = 0.55 + ((i % 4) * 0.12);

      list.push({
        id: i,
        left,
        size,
        color,
        duration,
        delay,
        driftX,
        opacity,
      });
    }

    return list;
  }, []);

  return (
    <>
      <style>{`
        @keyframes spatialFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -6px, 0);
          }
        }

        @keyframes spatialGradientFlow {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }

        @keyframes auraBreathe {
          0%, 100% {
            transform: translate3d(-50%, -50%, 0) scale(0.94);
            opacity: 0.65;
          }
          50% {
            transform: translate3d(-50%, -50%, 0) scale(1.08);
            opacity: 0.95;
          }
        }

        @keyframes glassSheenPass {
          0% {
            transform: translate3d(-150%, 0, 0) rotate(22deg);
          }
          30%, 100% {
            transform: translate3d(250%, 0, 0) rotate(22deg);
          }
        }

        @keyframes particleRise {
          0% {
            transform: translate3d(0, 100px, 0) scale(0.6);
            opacity: 0;
          }
          18% {
            opacity: var(--p-opacity, 0.8);
          }
          82% {
            opacity: var(--p-opacity, 0.8);
          }
          100% {
            transform: translate3d(var(--p-drift, 20px), -120px, 0) scale(1.1);
            opacity: 0;
          }
        }

        .spatial-glass-card {
          animation: spatialFloat 5s ease-in-out infinite;
          will-change: transform;
        }

        .spatial-gradient-text {
          background: linear-gradient(90deg, #FF003F 0%, #FF2B66 22%, #FFFFFF 50%, #FF2B66 78%, #FF003F 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: spatialGradientFlow 3.8s linear infinite;
          will-change: background-position;
        }

        .spatial-aura {
          animation: auraBreathe 4.5s ease-in-out infinite;
          will-change: transform, opacity;
        }

        .spatial-sheen {
          animation: glassSheenPass 7s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          will-change: transform;
        }

        .spatial-particle {
          animation-name: particleRise;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: transform, opacity;
        }
      `}</style>

      <div
        id="introducing-spatial-glass"
        className="spatial-glass-card relative w-full py-9 sm:py-13 md:py-16 my-3 rounded-[28px] sm:rounded-[36px] overflow-hidden flex flex-col items-center justify-center text-center select-none border border-white/[0.14] bg-gradient-to-b from-white/[0.05] via-white/[0.02] to-transparent shadow-[0_12px_44px_rgba(0,0,0,0.45)]"
      >
        {/* 1. Ambient Background Glow Aura (Diffused Red - White radial lighting with dynamic pulse) */}
        <div
          className="spatial-aura absolute top-1/2 left-1/2 w-[85%] max-w-2xl h-28 sm:h-36 bg-gradient-to-r from-[#FF003F]/40 via-[#FF3366]/30 to-white/25 blur-[50px] sm:blur-[65px] pointer-events-none -z-10 rounded-full"
        />

        {/* 2. Secondary soft specular center light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-20 bg-white/12 blur-[35px] pointer-events-none -z-10 rounded-full" />

        {/* 3. Glass Sheen Reflection Beam sweeping across the card */}
        <div
          className="spatial-sheen absolute top-0 left-0 w-32 sm:w-48 h-[250%] -top-[75%] bg-gradient-to-r from-transparent via-white/[0.07] to-transparent pointer-events-none -z-0"
        />

        {/* 4. Slow Floating Glowing Particles ("một số hạt bay chậm") */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-0">
          {particles.map((p) => (
            <div
              key={p.id}
              className="spatial-particle absolute rounded-full"
              style={{
                left: `${p.left}%`,
                top: '50%',
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                boxShadow: `0 0 ${p.size * 2}px ${p.color}, 0 0 ${p.size * 4}px ${p.color}`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                ['--p-drift' as any]: `${p.driftX}px`,
                ['--p-opacity' as any]: p.opacity,
              }}
            />
          ))}
        </div>

        {/* 5. Main Headline: Introducing <gradient đỏ - trắng>: Spatial Glass. */}
        <div className="relative z-10 px-4 max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight sm:leading-none flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-5 gap-y-1.5">
            {/* Word: Introducing */}
            <span
              className="text-white tracking-tight"
              style={{
                textShadow: '0 0 20px rgba(255, 255, 255, 0.45), 0 0 35px rgba(255, 255, 255, 0.2)',
              }}
            >
              Introducing
            </span>

            {/* Word: Spatial Glass. (Gradient Đỏ - Trắng with animated flow & intense ambient glow) */}
            <span className="relative inline-block">
              {/* Underlying blurred glow duplicate for high-performance luminous backlight */}
              <span
                aria-hidden="true"
                className="absolute inset-0 select-none pointer-events-none blur-xl sm:blur-2xl opacity-75 font-black text-[#FF0A48]"
              >
                Spatial Glass.
              </span>

              {/* Foreground Animated Flowing Gradient Text */}
              <span className="spatial-gradient-text relative font-black tracking-tight">
                Spatial Glass.
              </span>
            </span>
          </h2>
        </div>
      </div>
    </>
  );
};
