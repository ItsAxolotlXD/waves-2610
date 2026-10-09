import React from 'react';
import { Heart } from 'lucide-react';

export const FarewellAnnouncement: React.FC = () => {
  return (
    <section
      id="home-farewell-announcement"
      aria-label="Thông báo dừng sản xuất nền tảng truyền hình VPlay"
      className="relative w-full rounded-[28px] sm:rounded-[32px] overflow-hidden bg-white/95 dark:bg-gradient-to-b dark:from-[#1C1C22]/90 dark:via-[#18181D]/90 dark:to-[#121216]/95 border border-black/10 dark:border-white/10 shadow-xl dark:shadow-2xl p-6 sm:p-8 md:p-10 select-text transition-colors duration-200"
    >
      {/* Decorative ambient background glows */}
      <div 
        aria-hidden="true"
        className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-gradient-to-br from-[#E6005A]/10 to-[#FF8A00]/10 dark:from-[#E6005A]/15 dark:to-[#FF8A00]/10 blur-3xl pointer-events-none"
      />
      <div 
        aria-hidden="true"
        className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-gradient-to-tr from-[#3B82F6]/5 to-[#8B5CF6]/5 dark:from-[#3B82F6]/10 dark:to-[#8B5CF6]/10 blur-3xl pointer-events-none"
      />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6 sm:space-y-7">
        {/* Header Tag */}
        <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6005A]/10 text-[#D60052] dark:bg-[#E6005A]/15 dark:text-[#FF2D78] text-xs font-bold font-square uppercase tracking-wider border border-[#E6005A]/25 dark:border-[#E6005A]/30">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>LỜI CẢM ƠN VÀ TẠM BIỆT</span>
          </div>
        </div>

        {/* Main Title */}
        <div className="space-y-2">
          <h2 className="font-square text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-[#111827] dark:text-white uppercase leading-snug">
            THÔNG BÁO DỪNG SẢN XUẤT NỀN TẢNG TRUYỀN HÌNH VPLAY
          </h2>
        </div>

        {/* Announcement Body Content */}
        <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#374151] dark:text-[#D1D5DB] font-normal">
          <p>
            Sau một khoảng thời gian hoạt động và đồng hành cùng mọi người, VPlay chính thức dừng sản xuất và phát triển kể từ ngày <strong className="font-bold text-[#111827] dark:text-white">02/10/2026</strong>, khép lại hành trình từ <strong className="font-bold text-[#111827] dark:text-white">xx/03/2026 – 02/10/2026</strong>.
          </p>

          <p>
            Đây là một quyết định không hề dễ dàng, nhưng có lẽ cũng là thời điểm thích hợp để VPlay dừng lại.
          </p>

          <p>
            Trong suốt thời gian hoạt động, VPlay đã cố gắng mang đến một nền tảng xem truyền hình với những nội dung và trải nghiệm riêng. Tuy nhiên, thực tế là nền tảng chưa nhận được nhiều sự tương tác và quan tâm như kỳ vọng. Lượng người dùng cũng như mức độ hoạt động của VPlay khá thấp, khiến dự án dần trở nên ít sôi động và không đạt được mục tiêu ban đầu.
          </p>

          <p>
            Bên cạnh đó, các nhà sáng lập và đội ngũ phát triển hiện cũng đang bận rộn với nhiều công việc và dự án khác. Thời gian dành cho VPlay ngày càng hạn chế, và quan trọng hơn, chúng mình cũng không còn đủ cảm hứng để tiếp tục phát triển nền tảng như trước. Thay vì cố gắng duy trì một dự án mà chính những người thực hiện không còn đủ thời gian và nhiệt huyết nên chúng tôi lựa chọn dừng lại tại đây.
          </p>

          <p>
            Có thể VPlay chưa phải là một dự án lớn, cũng chưa đạt được những gì từng kỳ vọng. Nhưng với những người đã tạo ra nó, VPlay vẫn là một phần ký ức rất đáng nhớ. Dự án được bắt đầu từ niềm yêu thích và mong muốn tạo ra một nơi để mọi người cùng xem, cùng trải nghiệm truyền hình theo một cách riêng.
          </p>

          <div className="farewell-quote p-4 sm:p-5 rounded-2xl bg-black/[0.04] dark:bg-white/5 border-l-4 border-[#E6005A] text-[#111827] dark:text-white font-medium leading-relaxed my-2">
            Xin gửi lời cảm ơn chân thành đến tất cả những ai từng biết đến, sử dụng, ủng hộ và đồng hành cùng VPlay trong suốt thời gian qua. Dù sự đồng hành ấy có thể chỉ là một lần truy cập, một lượt xem, một lời góp ý hay đơn giản là biết đến cái tên VPlay, tất cả đều có ý nghĩa đối với chúng tôi.
          </div>
        </div>

        {/* Footer Sign-off: Dòng vplay end of an era đặt trên dòng (có thể trong tương lai...) */}
        <div className="pt-5 border-t border-black/10 dark:border-white/10 flex flex-col items-start gap-2.5">
          <div className="font-square text-lg sm:text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FF2020] via-[#FF3366] to-[#E6005A]">
            VPlay - End of an era.
          </div>
          <p className="farewell-footer-note text-xs text-[#6B7280] dark:text-[#9CA3AF] italic leading-relaxed">
            (Có thể trong tương lai website này sẽ được tái sử dụng cho mục đích mới khác hoặc Vplay sẽ được hồi sinh dưới một đơn vị quản lý và phát triển mới. Ai mà biết được?)
          </p>
        </div>
      </div>
    </section>
  );
};
