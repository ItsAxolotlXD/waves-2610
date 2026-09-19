import React from 'react';
import { Sparkles, Shield, ExternalLink } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Hero Intro */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E6005A]/15 border border-[#E6005A]/30 text-[#E6005A] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Về Vplay</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111827] dark:text-white tracking-tight">
          Vplay -{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2020] via-[#FF3366] to-[#E6005A]">
            Gói trọn Việt Nam trong tầm mắt bạn
          </span>
        </h1>

        <div className="text-sm sm:text-base text-[#4B5563] dark:text-[#9CA3AF] max-w-3xl mx-auto leading-relaxed text-left space-y-3 pt-2">
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
        id="about-disclaimer-card"
        className="p-8 rounded-[30px] bg-white dark:bg-gradient-to-br dark:from-[#1E1E24] dark:to-[#161618] border border-[#E5E7EB] dark:border-[#34343E] shadow-sm dark:shadow-xl space-y-4 transition-all"
      >
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-[#E6005A] shrink-0" />
          <h3 id="about-disclaimer-title" className="text-lg font-bold text-[#111827] dark:text-white">
            Tuyên bố bản quyền & Nguồn phát sóng
          </h3>
        </div>
        <p id="about-disclaimer-text" className="text-xs sm:text-sm text-[#4B5563] dark:text-[#A1A1AA] leading-relaxed">
          Tất cả logo, nhãn hiệu truyền hình, hình ảnh trường quay và luồng phát sóng thuộc quyền sở hữu trí tuệ của các Đài Truyền hình (Đài Truyền hình Việt Nam VTV, Đài Truyền hình TP.HCM HTV, Đài Truyền hình Kỹ thuật số VTC và các Đài PT-TH địa phương). Vplay phục vụ mục đích nghiên cứu, học thuật, hỗ trợ kỹ thuật và phi thương mại.
        </p>
      </div>

      {/* Community Connect */}
      <div
        id="about-community-card"
        className="text-center p-8 rounded-[30px] bg-white dark:bg-[#1E1E22] border border-[#E5E7EB] dark:border-[#2D2D35] shadow-sm dark:shadow-none space-y-4 transition-all"
      >
        <h3 className="text-xl font-bold text-[#111827] dark:text-white">Tham gia cùng Vplay</h3>
        <p className="text-xs sm:text-sm text-[#4B5563] dark:text-[#9CA3AF] max-w-lg mx-auto">
          Cùng trao đổi về kỹ thuật trường quay ảo, tần số DVB-T2, đồ họa nhận diện On-Air Graphics và chia sẻ tư liệu truyền hình quý giá.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href="https://discord.gg/wcdjaDDayK"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold shadow-lg transition-all"
          >
            <span>Tham gia Discord Cộng Đồng</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] dark:bg-[#27121d] dark:hover:bg-[#331726] text-[#111827] dark:text-white text-xs font-bold border border-[#E5E7EB] dark:border-white/10 transition-all"
          >
            <span>Facebook Group Truyền Hình</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

