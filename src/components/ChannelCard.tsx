import React from 'react';
import { Play, Heart, Radio, Sparkles } from 'lucide-react';
import { Channel } from '../types';
import { useFavorites } from '../hooks/useFavorites';
import { DEFAULT_BANNER_PLACEHOLDER } from '../data/heroSlides';

interface ChannelCardProps {
  channel: Channel;
  onSelect: (channel: Channel) => void;
  isActive?: boolean;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  onSelect,
  isActive
}) => {
  const { isChannelFavorite, toggleFavoriteChannel } = useFavorites();
  const isFav = isChannelFavorite(channel.id);

  return (
    <div
      id={`channel-card-${channel.id}`}
      onClick={() => onSelect(channel)}
      className={`group relative rounded-[28px] bg-[#353535] transition-none overflow-hidden cursor-default ${
        isActive
          ? 'is-selected border-[#FFFFFF] bg-[#353535]'
          : 'hover:bg-[#3d3d3d]'
      }`}
    >
      {/* Top Banner / Logo Area */}
      <div className="relative h-32 bg-gradient-to-b from-[#404040] to-[#353535] flex items-center justify-center p-4 overflow-hidden">
        <img
          src={channel.bannerImage || DEFAULT_BANNER_PLACEHOLDER}
          alt={channel.name}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-35 transition-opacity"
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== DEFAULT_BANNER_PLACEHOLDER) {
              target.src = DEFAULT_BANNER_PLACEHOLDER;
            }
          }}
        />

        {/* Center Channel Logo */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#141416]/90 border border-white/15 flex items-center justify-center p-1.5 overflow-hidden shadow-md">
          <img
            src={channel.logo}
            alt={channel.name}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-contain filter drop-shadow-sm ${
              channel.category === 'Kênh VTV' ? 'scale-[0.96] p-0.5' : ''
            }`}
            onError={(e) => {
              // Graceful fallback to stylish initial badge if image link has network issues
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Live Status Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF2020]/20 text-[#FF4D4D] border border-[#FF2020]/40 text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF2020] animate-pulse" />
          <span>TRỰC TIẾP</span>
        </div>

        {/* Quality Pill */}
        <div className="absolute top-3 right-12 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-extrabold text-white">
          {channel.quality}
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavoriteChannel(channel.id);
          }}
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center ${
            isFav 
              ? 'bg-[#FF2020] text-white shadow-md' 
              : 'bg-black/60 text-[#A1A1AA] hover:text-white border border-white/10'
          }`}
          title={isFav ? 'Bỏ yêu thích' : 'Yêu thích kênh'}
        >
          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Hover Play Button Overlay without fade/cross-dissolve */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-gradient-purple-active flex items-center justify-center text-white shadow-xl glow-purple">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* Card Info Content */}
      <div className="p-4 pt-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="text-sm font-bold text-white group-hover:text-[#E50914] truncate">
              {channel.shortName || channel.name}
            </h3>
          </div>
          <span className="text-[11px] font-medium text-[#8E8E93] shrink-0">
            {channel.category}
          </span>
        </div>

        {/* Current Program on Air */}
        <div className="mt-2.5 p-2.5 rounded-2xl bg-[#141416]/60 border border-[#2D2D35]">
          <div className="flex items-center justify-between text-[11px] text-[#A1A1AA] mb-1">
            <span className="font-semibold text-white truncate max-w-[170px]">
              {channel.currentProgram?.title || 'Chương trình trực tiếp'}
            </span>
            <span className="text-[10px] text-[#8E8E93] shrink-0 font-mono">
              {channel.currentProgram?.startTime} - {channel.currentProgram?.endTime}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#2A2A32] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#FF2020] to-[#E50914] h-full rounded-full"
              style={{ width: `${channel.currentProgram?.progress || 50}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
