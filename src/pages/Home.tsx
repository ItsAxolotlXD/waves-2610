import React from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import { OnAirSlider } from '../components/OnAirSlider';
import { IntroducingSpatialGlass } from '../components/IntroducingSpatialGlass';
import { NEWS_DATA } from '../data/news';
import { DEFAULT_BANNER_PLACEHOLDER } from '../data/heroSlides';
import { Channel } from '../types';
import { 
  Megaphone, 
  Sparkles, 
  ArrowRight, 
  Shield, 
  ExternalLink,
  Tv, 
  Home as HomeIcon,
  Box, 
  Heart, 
  Settings as SettingsIcon,
  Search,
  SlidersHorizontal,
  Compass,
  Layers
} from 'lucide-react';

interface HomeProps {
  navigate: (route: string, state?: any) => void;
  onSelectChannel: (channel: Channel) => void;
  channels: Channel[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenSpotlight?: () => void;
}

const APP_PAGES = [
  { id: 'page-home', title: 'Trang chủ (Home)', desc: 'Trang tổng quan, xu hướng & kênh nổi bật', route: '/', icon: HomeIcon, keywords: 'home trang chủ tổng quan' },
  { id: 'page-livetv', title: 'Truyền hình trực tuyến (Live TV)', desc: 'Xem trực tiếp các đài VTV, HTV, VTC, Địa phương...', route: '/live-tv', icon: Tv, keywords: 'live tv truyền hình trực tuyến vtv htv vtc' },
  { id: 'page-test', title: 'Kênh kiểm thử (Test Channels)', desc: 'Danh sách kênh phát luồng thử nghiệm', route: '/test', icon: Compass, keywords: 'test kênh kiểm thử thử nghiệm' },
  { id: 'page-channels', title: 'Danh mục kênh (Channels)', desc: 'Khám phá toàn bộ nhóm kênh phân loại', route: '/channels', icon: Box, keywords: 'channels danh mục nhóm kênh thể thao giải trí' },
  { id: 'page-news', title: 'Tin tức & Thông báo (News)', desc: 'Tin tức truyền thông, bản tin đồ họa & nhận diện', route: '/news', icon: Megaphone, keywords: 'news tin tức bài viết thông báo' },
  { id: 'page-fav', title: 'Kênh yêu thích & Đã lưu (Favorites)', desc: 'Kênh và bài viết bạn đã đánh dấu', route: '/favorites', icon: Heart, keywords: 'favorites yêu thích đã lưu bookmarks' },
  { id: 'page-settings', title: 'Cài đặt hệ thống (Settings)', desc: 'Tùy chỉnh giao diện, thanh điều hướng, phím tắt', route: '/settings', icon: SettingsIcon, keywords: 'settings cài đặt cấu hình tùy chỉnh' },
];

const SETTINGS_SHORTCUTS = [
  { id: 'set-floating-search', title: 'Cài đặt: Floating Search Bar', desc: 'Bật/tắt thanh tìm kiếm nổi ở dưới màn hình', route: '/settings', keywords: 'floating search bar thanh tìm kiếm nổi dưới đáy' },
  { id: 'set-font', title: 'Cài đặt: Tỷ lệ cỡ chữ ứng dụng', desc: 'Điều chỉnh cỡ chữ từ 80% đến 125%', route: '/settings', keywords: 'cỡ chữ font chữ zoom tỷ lệ giao diện' },
  { id: 'set-nav', title: 'Cài đặt: Kiểu thanh điều hướng (Navigation Mode)', desc: 'Chuyển đổi giữa Topbar, Sidebar, Tab View, Immersive', route: '/settings', keywords: 'navigation mode topbar sidebar floaty tab view immersive thanh điều hướng' },
  { id: 'set-autohide', title: 'Cài đặt: Tự động ẩn Sidebar', desc: 'Tự động thu gọn thanh bên khi xem nội dung', route: '/settings', keywords: 'tự động ẩn sidebar collapse' },
  { id: 'set-motion', title: 'Cài đặt: Hiệu ứng chuyển động (Motion & Movements)', desc: 'Giảm hoạt ảnh hoặc chuyển trang mượt mà', route: '/settings', keywords: 'motion movements hiệu ứng animation reduce all animation chuyển trang' },
  { id: 'set-keybinds', title: 'Cài đặt: Phím tắt tùy chỉnh (Keybinds)', desc: 'Cấu hình phím tắt cho mọi thao tác', route: '/settings', keywords: 'phím tắt customize keybinds shortcut keyboard alt' },
  { id: 'set-search-cats', title: 'Cài đặt: Tùy chỉnh danh mục tìm kiếm', desc: 'Lựa chọn nhóm kênh hiển thị trong tìm kiếm', route: '/settings', keywords: 'tìm kiếm search spotlight tùy chỉnh danh mục' },
];

export const Home: React.FC<HomeProps> = ({
  navigate,
  onSelectChannel,
  channels,
  searchQuery,
  onSearchChange,
  onOpenSpotlight
}) => {
  const query = (searchQuery || '').trim().toLowerCase();

  // 1. Matching App Pages
  const matchingPages = query
    ? APP_PAGES.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.desc.toLowerCase().includes(query) ||
          p.keywords.toLowerCase().includes(query)
      )
    : [];

  // 2. Matching Settings Shortcuts
  const matchingSettings = query
    ? SETTINGS_SHORTCUTS.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.desc.toLowerCase().includes(query) ||
          s.keywords.toLowerCase().includes(query)
      )
    : [];

  // 3. Matching Channels
  const matchingChannels = query
    ? channels.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query) ||
          (c.channelNumber && String(c.channelNumber).includes(query)) ||
          (c.tags && c.tags.some((t) => t.toLowerCase().includes(query)))
      )
    : [];

  // 4. Matching News
  const matchingNews = query
    ? NEWS_DATA.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.excerpt.toLowerCase().includes(query) ||
          a.category.toLowerCase().includes(query)
      )
    : [];

  const totalMatches = matchingPages.length + matchingSettings.length + matchingChannels.length + matchingNews.length;

  const featuredArticle = NEWS_DATA.find((a) => 
    a.slug.includes('nghe-thuat-cua-su-tien-hoa-tinh-te') ||
    a.title.toLowerCase().includes('tiến hóa tinh tế')
  ) || NEWS_DATA[0];

  if (query) {
    return (
      <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto space-y-8 py-6 pb-24">
        {/* Header with clear & Spotlight trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#E6005A]/20 text-[#FF4D8B] border border-[#E6005A]/30">
                Spotlight Search
              </span>
              <span className="text-xs text-[#9CA3AF]">
                {totalMatches} kết quả trong toàn bộ ứng dụng
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              Kết quả cho "{searchQuery}"
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {onOpenSpotlight && (
              <button
                type="button"
                onClick={onOpenSpotlight}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors cursor-pointer"
                title="Mở cửa sổ Spotlight Search đầy đủ"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Mở Spotlight (⌘K)</span>
              </button>
            )}
            {onSearchChange && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#fd932f] text-white hover:bg-[#e68428] transition-colors cursor-pointer"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>
        </div>

        {/* 1. Trang & Chức năng hệ thống */}
        {matchingPages.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#9CA3AF] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#E6005A]" />
              <span>Trang & Danh mục ({matchingPages.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {matchingPages.map((page) => {
                const IconComponent = page.icon;
                return (
                  <div
                    key={page.id}
                    onClick={() => navigate(page.route)}
                    className="p-3.5 rounded-2xl bg-[#1E1E22] border border-white/10 hover:border-[#E6005A] transition-colors cursor-pointer flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#E6005A]/15 text-[#E6005A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-white group-hover:text-[#FF4D8B] transition-colors truncate">
                        {page.title}
                      </div>
                      <div className="text-xs text-[#9CA3AF] truncate">
                        {page.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 2. Lối tắt cài đặt */}
        {matchingSettings.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#9CA3AF] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#E6005A]" />
              <span>Cài đặt hệ thống ({matchingSettings.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matchingSettings.map((set) => (
                <div
                  key={set.id}
                  onClick={() => navigate(set.route)}
                  className="p-3.5 rounded-2xl bg-[#1E1E22] border border-white/10 hover:border-[#E6005A] transition-colors cursor-pointer flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0 group-hover:bg-[#E6005A] transition-colors">
                    <SettingsIcon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-white group-hover:text-[#FF4D8B] transition-colors truncate">
                      {set.title}
                    </div>
                    <div className="text-xs text-[#9CA3AF] truncate">
                      {set.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. Kênh truyền hình khớp */}
        {matchingChannels.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#9CA3AF] flex items-center gap-2">
              <Tv className="w-4 h-4 text-[#E6005A]" />
              <span>Kênh truyền hình ({matchingChannels.length})</span>
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3.5">
              {matchingChannels.map((ch) => (
                <div
                  key={ch.id}
                  id={`home-channel-card-${ch.id}`}
                  onClick={() => onSelectChannel(ch)}
                  className="group relative w-full aspect-[136/78] rounded-xl sm:rounded-2xl transition-none cursor-pointer overflow-hidden flex items-center justify-center p-1.5 sm:p-2.5 select-none bg-[#353535]"
                  title={ch.name}
                >
                  <img
                    src={ch.logo}
                    alt={ch.name}
                    referrerPolicy="no-referrer"
                    className="max-h-[58%] max-w-[82%] w-auto h-auto object-contain filter drop-shadow-sm select-none pointer-events-none"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Bài viết tin tức khớp */}
        {matchingNews.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#9CA3AF] flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#E6005A]" />
              <span>Bài viết tin tức ({matchingNews.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {matchingNews.map((article) => (
                <div
                  key={article.id}
                  onClick={() => navigate(`/news/${article.slug}`)}
                  className="rounded-2xl bg-[#1E1E22] border border-white/10 p-4 hover:border-[#E6005A] cursor-pointer space-y-2 transition-colors"
                >
                  <span className="text-[10px] font-bold text-[#E6005A] uppercase tracking-wider">
                    {article.category}
                  </span>
                  <h3 className="font-bold text-white text-sm line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-[#9CA3AF] line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {totalMatches === 0 && (
          <div className="py-16 text-center space-y-3 rounded-2xl bg-[#1E1E22]/60 border border-white/10 p-6">
            <p className="text-sm font-medium text-[#9CA3AF]">
              Không tìm thấy nội dung nào phù hợp với từ khóa "{searchQuery}" trong ứng dụng
            </p>
            {onSearchChange && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#fd932f] text-white hover:bg-[#e68428] transition-colors cursor-pointer"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-16">
      {/* Dải màu vàng thông báo trên đầu trang chủ: The next chapter of Vplay */}
      <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto pt-1 sm:pt-2">
        <div
          id="home-announcement-banner"
          className="relative w-full rounded-2xl bg-[#FACC15] text-[#1C1917] px-4 py-3 sm:py-3.5 sm:px-5 flex items-center justify-between gap-3 shadow-lg shadow-amber-500/10 border border-amber-300/40 select-none overflow-hidden"
        >
          {/* Subtle ambient light shape */}
          <div 
            aria-hidden="true" 
            className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/30 blur-xl pointer-events-none" 
          />
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-xl bg-black/10 flex items-center justify-center shrink-0 text-black">
              <Megaphone className="w-4 h-4 text-black" />
            </div>
            <div className="text-xs sm:text-sm text-[#1C1917] leading-relaxed font-normal min-w-0">
              <span className="font-bold text-black">The next chapter of Vplay</span>
              <span className="mx-1.5 font-bold opacity-60">-</span>
              <span>Nền tảng Vplay sẽ chính thức đổi tên thành VNRT Online kể từ 16 tháng 10 năm 2026.</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. 3D Coverflow Hero Banner */}
      <HeroCarousel
        navigate={navigate}
        onSelectChannel={onSelectChannel}
        channels={channels}
      />

      <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto space-y-8 sm:space-y-10">
        {/* 2. Đề xuất cho bạn */}
        <OnAirSlider
          channels={channels}
          onSelectChannel={onSelectChannel}
          navigate={navigate}
        />

        {/* Dòng giới thiệu: Introducing Spatial Glass (gradient đỏ - trắng, chữ có glow và hạt bay chậm) */}
        <IntroducingSpatialGlass />

        {/* 3. News Feed: Banner ngang - Nghệ thuật tiến hóa tinh tế */}
        {featuredArticle && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-[#E6005A]" />
                  <span>News Feed</span>
                </h2>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Tiêu điểm nhận diện thương hiệu & chuyển đổi số truyền hình
                </p>
              </div>

              <button
                id="btn-home-all-news"
                onClick={() => navigate('/news')}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#FF4D8B] hover:text-white transition-colors cursor-pointer"
              >
                <span>Xem tất cả bài viết</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Horizontal Banner */}
            <div
              id="home-news-horizontal-banner"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/news/${featuredArticle.slug}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigate(`/news/${featuredArticle.slug}`);
                }
              }}
              className="group relative w-full overflow-hidden rounded-[24px] sm:rounded-[28px] border-0 bg-[#27121d] hover:bg-[#321726] transition-all duration-300 shadow-2xl cursor-pointer flex flex-col md:flex-row items-stretch select-none"
            >
              {/* Image banner side */}
              <div className="w-full md:w-[42%] lg:w-[40%] relative min-h-[200px] sm:min-h-[230px] md:min-h-[260px] overflow-hidden shrink-0">
                <img
                  src={featuredArticle.coverImage || DEFAULT_BANNER_PLACEHOLDER}
                  alt={featuredArticle.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== DEFAULT_BANNER_PLACEHOLDER) {
                      target.src = DEFAULT_BANNER_PLACEHOLDER;
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/20 to-transparent" />

                {/* Badge on image */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6005A] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-lg">
                    <Sparkles className="w-3 h-3" />
                    <span>Tiêu điểm</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-medium border border-white/10">
                    {featuredArticle.readingTime}
                  </span>
                </div>
              </div>

              {/* Text info side */}
              <div className="flex-1 p-5 sm:p-6 md:p-7 flex flex-col justify-between gap-4">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                    <span className="font-bold text-[#FF4D8B] uppercase tracking-wider text-[11px]">
                      {featuredArticle.category}
                    </span>
                    <span>•</span>
                    <span>{featuredArticle.publishedAt}</span>
                  </div>

                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white group-hover:text-[#FF4D8B] transition-colors leading-snug tracking-tight">
                    {featuredArticle.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#D1D5DB] line-clamp-2 sm:line-clamp-3 leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>
                </div>

                {/* Author & Action footer */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={featuredArticle.author.avatar}
                      alt={featuredArticle.author.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/20"
                    />
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate">
                        {featuredArticle.author.name}
                      </div>
                      <div className="text-[10px] text-[#9CA3AF] truncate">
                        {featuredArticle.author.role}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#fd932f] hover:bg-[#e68428] text-white text-xs font-bold transition-all shadow-md group-hover:scale-105"
                  >
                    <span>Đọc bài viết</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4. Nội dung Giới thiệu Vplay (Chuyển toàn bộ nội dung từ Giới thiệu vào Home) */}
        <section id="home-about-section" className="space-y-8 pt-4 border-t border-[#26262E]">
          {/* Hero Intro */}
          <div className="text-center space-y-4 pt-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
              Vplay -{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2020] via-[#FF3366] to-[#E6005A]">
                Gói trọn Việt Nam trong tầm mắt bạn
              </span>
            </h2>

            <div className="text-sm sm:text-base text-[#9CA3AF] max-w-3xl mx-auto leading-relaxed text-left space-y-3 pt-2">
              <p className="flex items-start gap-2">
                <span className="text-[#E6005A] font-bold select-none">•</span>
                <span>
                  Vplay là nền tảng xem truyền hình trực tuyến phi lợi nhuận cung cấp cho người dùng trải nghiệm xem chất lượng cao, đa dạng cánh sóng và hoàn toàn miễn phí.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-[#E6005A] font-bold select-none">•</span>
                <span>
                  Ngoài ra Vplay còn giữ vai trò cập nhật toàn diện các thông tin về công nghệ phát thanh truyền hình, đồ họa nhận diện và văn hóa truyền thông Việt Nam, các thông báo của Waves nói chung và Vplay nói riêng.
                </span>
              </p>
            </div>
          </div>

          {/* Disclaimer and Ethics Card */}
          <div
            id="home-about-disclaimer-card"
            className="p-6 sm:p-8 rounded-[28px] bg-white/10 backdrop-blur-md shadow-xl space-y-3 transition-all border-0"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-[#E6005A] shrink-0" />
              <h3 id="about-disclaimer-title" className="text-base sm:text-lg font-bold text-white">
                Tuyên bố bản quyền & Nguồn phát sóng
              </h3>
            </div>
            <p id="about-disclaimer-text" className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
              Tất cả logo, nhãn hiệu truyền hình, hình ảnh trường quay và luồng phát sóng thuộc quyền sở hữu trí tuệ của các Đài Truyền hình (Đài Truyền hình Việt Nam VTV, Đài Truyền hình TP.HCM HTV, Đài Truyền hình Kỹ thuật số VTC và các Đài PT-TH địa phương). Vplay phục vụ mục đích nghiên cứu, học thuật, hỗ trợ kỹ thuật và phi thương mại.
            </p>
          </div>

          {/* Community Connect */}
          <div
            id="home-about-community-card"
            className="text-center p-6 sm:p-8 rounded-[28px] bg-white/10 backdrop-blur-md space-y-4 transition-all border-0"
          >
            <h3 className="text-lg sm:text-xl font-bold text-white">Tham gia cộng đồng Waves</h3>
            <p className="text-xs sm:text-sm text-[#D1D5DB] max-w-2xl mx-auto leading-relaxed">
              “Nhịp sóng lưu dấu thời đại” – nơi kết nối những tâm hồn từ khắp mọi miền Bắc – Trung – Nam, cùng gặp gỡ, sẻ chia và trò chuyện qua những câu chuyện của thời đại. Không chỉ là nơi hội tụ của những tiếng nói và góc nhìn đa dạng, đây còn là không gian lưu giữ những ký ức, khoảnh khắc và dấu ấn truyền thông – những mảnh ghép nhỏ góp phần tạo nên bức tranh lớn của một thời đã qua.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                id="btn-home-join-discord"
                href="https://discord.gg/wcdjaDDayK"
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold transition-all shadow-[0_4px_14px_rgba(88,101,242,0.45)] hover:shadow-[0_6px_20px_rgba(88,101,242,0.6)] cursor-pointer active:scale-95"
              >
                <svg className="w-4 h-4 fill-current text-white transition-colors" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.078.078 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span>Join Waves on Discord</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-90 group-hover:opacity-100" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
