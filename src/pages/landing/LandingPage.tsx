import { Link } from "react-router-dom";
import { ParkingSquare, Zap, ShieldCheck, Clock, Camera, ChevronRight, Car, Users, BarChart3 } from "lucide-react";

const features = [
  { icon: Camera,      title: "Nhận diện biển số",  desc: "Camera AI tự động đọc biển số xe khi vào/ra bãi, không cần nhập tay." },
  { icon: Zap,         title: "Check-in tức thì",   desc: "Xe vào bãi trong vòng vài giây. Không còn xếp hàng chờ đợi." },
  { icon: ShieldCheck, title: "Bảo mật cao",        desc: "Mọi giao dịch được ghi nhận, có ảnh xe làm bằng chứng." },
  { icon: Clock,       title: "24/7 hoạt động",     desc: "Hệ thống theo dõi liên tục, báo cáo realtime cho quản lý." },
  { icon: BarChart3,   title: "Thống kê doanh thu", desc: "Manager xem doanh thu theo ngày, tháng, từng bãi đỗ xe." },
  { icon: Users,       title: "Membership",         desc: "Khách hàng đăng ký gói tháng/quý/năm để được ưu đãi phí gửi xe." },
];

const stats = [
  { value: "50+",   label: "Bãi đỗ xe" },
  { value: "10K+",  label: "Lượt xe/ngày" },
  { value: "99.9%", label: "Uptime" },
  { value: "<2s",   label: "Thời gian check-in" },
];

const roles = [
  {
    role: "Khách hàng", icon: Car,
    color: "from-amber-400/20 to-amber-400/5 border-amber-400/20", accent: "text-amber-400",
    features: ["Xem phí gửi xe realtime", "Đăng ký membership", "Tra cứu lịch sử gửi xe", "Báo cáo mất xe"],
  },
  {
    role: "Nhân viên", icon: Zap,
    color: "from-blue-400/20 to-blue-400/5 border-blue-400/20", accent: "text-blue-400",
    features: ["Check-in / Check-out xe", "Xem lịch làm việc", "Tạo báo cáo sự cố hộ khách", "Tra cứu thông tin xe"],
  },
  {
    role: "Quản lý", icon: BarChart3,
    color: "from-emerald-400/20 to-emerald-400/5 border-emerald-400/20", accent: "text-emerald-400",
    features: ["Dashboard doanh thu", "Quản lý nhân viên", "Duyệt báo cáo sự cố", "Cấu hình giá theo bãi"],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-['DM_Sans',sans-serif] overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-md bg-zinc-950/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
            <ParkingSquare size={18} className="text-zinc-950"/>
          </div>
          <span className="font-bold text-base tracking-tight">VPT Parking</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors">Tính năng</a>
          <a href="#roles"    className="hover:text-white transition-colors">Vai trò</a>
          <a href="#stats"    className="hover:text-white transition-colors">Thống kê</a>
        </div>
        <Link to="/login"
          className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
          Đăng nhập <ChevronRight size={14}/>
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)",
          backgroundSize: "40px 40px"
        }}/>
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-400/8 blur-[100px] rounded-full pointer-events-none"/>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"/>
            Vehicle Plate Tracking System
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.05] mb-6">
            Quản lý bãi đỗ xe<br/>
            <span className="text-amber-400">thông minh hơn.</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Hệ thống theo dõi biển số xe tự động — check-in tức thì, thanh toán nhanh,
            báo cáo realtime cho toàn bộ hệ thống bãi đỗ xe VPT.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/login"
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold px-6 py-3 rounded-xl transition-colors text-sm">
              Đăng nhập hệ thống <ChevronRight size={16}/>
            </Link>
            <a href="#features"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm">
              Tìm hiểu thêm
            </a>
          </div>
        </div>

        {/* Visual */}
        <div className="relative z-10 mt-16 w-full max-w-2xl mx-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"/>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500"/>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"/>
              <span className="text-xs text-zinc-600 ml-2">VPT Dashboard — Bãi xe A</span>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {Array.from({ length: 24 }).map((_, i) => {
                const occupied = [0,1,3,4,6,8,9,11,13,15,16,17,20,21].includes(i);
                const active   = i === 8;
                return (
                  <div key={i} className={`h-10 rounded-md flex items-center justify-center transition-colors ${
                    active   ? "bg-amber-400 text-zinc-950 font-bold" :
                    occupied ? "bg-zinc-700 text-zinc-400" :
                               "bg-zinc-800/60 border border-dashed border-zinc-700 text-zinc-600"
                  }`}>
                    {active ? <Car size={14}/> : occupied ? <Car size={12}/> : ""}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-zinc-700 inline-block"/>Đã đỗ: 14</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm border border-dashed border-zinc-600 inline-block"/>Trống: 10</span>
              <span className="text-amber-400 font-medium">Live</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 px-6 border-y border-zinc-800/60">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.value} className="text-center">
              <p className="text-3xl font-black text-amber-400 mb-1">{s.value}</p>
              <p className="text-sm text-zinc-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black mb-3">Tính năng nổi bật</h2>
            <p className="text-zinc-500 text-sm max-w-md mx-auto">Mọi thứ bạn cần để vận hành bãi đỗ xe hiện đại</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(f => (
              <div key={f.title} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 transition-colors group">
                <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-400/20 transition-colors">
                  <f.icon size={18} className="text-amber-400"/>
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{f.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="py-24 px-6 bg-zinc-900/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black mb-3">Thiết kế cho mọi vai trò</h2>
            <p className="text-zinc-500 text-sm">Giao diện và chức năng riêng biệt cho từng người dùng</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {roles.map(r => (
              <div key={r.role} className={`bg-gradient-to-b ${r.color} border rounded-2xl p-6`}>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                  <r.icon size={18} className={r.accent}/>
                </div>
                <h3 className={`font-bold text-base mb-4 ${r.accent}`}>{r.role}</h3>
                <ul className="flex flex-col gap-2">
                  {r.features.map(feat => (
                    <li key={feat} className="flex items-center gap-2 text-xs text-zinc-300">
                      <ChevronRight size={12} className="text-zinc-600 flex-shrink-0"/>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-4">Sẵn sàng bắt đầu?</h2>
          <p className="text-zinc-500 mb-8 text-sm">Đăng nhập để trải nghiệm hệ thống ngay hôm nay</p>
          <Link to="/login"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold px-8 py-3.5 rounded-xl transition-colors">
            Đăng nhập hệ thống <ChevronRight size={16}/>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 px-6 text-center text-xs text-zinc-600">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ParkingSquare size={14} className="text-amber-400"/>
          <span className="font-semibold text-zinc-400">VPT Parking</span>
        </div>
        <p>© 2026 Group 5 — SWD Project. Vehicle Plate Tracking System.</p>
      </footer>
    </div>
  );
}
