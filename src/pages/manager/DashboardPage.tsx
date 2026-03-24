import { useEffect, useState } from "react";
import { managerService } from "../../services/managerService";
import {
  TrendingUp, TrendingDown, Users, AlertCircle,
  UserCheck, Car, BarChart2, Loader2, FileWarning, CheckCircle2, Clock
} from "lucide-react";

interface DashboardData {
  todayRevenue:    number;
  pendingReports:  number;
  totalStaff:      number;
  totalCustomers:  number;
  activeSessions:  number;
  todaySessions:   number;
  growthPct:       number;
  revenueTrend:    { date: string; revenue: number; sessions: number }[];
  recentReports:   { reportId: number; reportType: string; status: string; createdAt: string }[];
}

const fmt = (n: number) =>
  n >= 1_000_000
    ? (n / 1_000_000).toFixed(1) + "M ₫"
    : n >= 1_000
    ? (n / 1_000).toFixed(0) + "K ₫"
    : n + " ₫";

const fmtFull = (n: number) => n.toLocaleString("vi-VN") + " ₫";

const REPORT_TYPE_LABEL: Record<string, string> = {
  lost_vehicle: "Mất xe",
  lost_card:    "Mất thẻ",
};
const STATUS_CFG: Record<string, { color: string; icon: React.ElementType }> = {
  pending:  { color: "text-amber-400",   icon: Clock        },
  approved: { color: "text-emerald-400", icon: CheckCircle2 },
  rejected: { color: "text-red-400",     icon: AlertCircle  },
};

export default function DashboardPage() {
  const [data,    setData]    = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    managerService.getDashboard()
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.message ?? "Lỗi kết nối server"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-amber-400" size={28}/>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center py-16 text-zinc-500 gap-3">
      <AlertCircle size={32} className="text-red-400"/>
      <p className="text-sm">{error}</p>
      <button onClick={fetchData}
        className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
        Thử lại
      </button>
    </div>
  );

  const trend     = data?.revenueTrend ?? [];
  const maxRev    = Math.max(...trend.map(d => d.revenue), 1);
  const growing   = (data?.growthPct ?? 0) >= 0;
  const todayData = trend[trend.length - 1];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Tổng quan hôm nay</p>
        </div>
        <button onClick={fetchData}
          className="text-xs text-zinc-500 hover:text-amber-400 transition-colors flex items-center gap-1">
          <BarChart2 size={12}/> Làm mới
        </button>
      </div>

      {/* ── KPI row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Doanh thu hôm nay */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500">Doanh thu hôm nay</span>
            <div className="w-8 h-8 bg-amber-400/10 rounded-lg flex items-center justify-center">
              <TrendingUp size={15} className="text-amber-400"/>
            </div>
          </div>
          <p className="text-2xl font-black text-white">
            {fmtFull(data?.todayRevenue ?? 0)}
          </p>
          <div className={`flex items-center gap-1 mt-1.5 text-xs ${growing ? "text-emerald-400" : "text-red-400"}`}>
            {growing
              ? <TrendingUp size={11}/>
              : <TrendingDown size={11}/>
            }
            <span>
              {growing ? "+" : ""}{data?.growthPct ?? 0}% so với hôm qua
            </span>
          </div>
        </div>

        {/* Active sessions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500">Xe đang trong bãi</span>
            <div className="w-8 h-8 bg-blue-400/10 rounded-lg flex items-center justify-center">
              <Car size={15} className="text-blue-400"/>
            </div>
          </div>
          <p className="text-2xl font-black text-white">{data?.activeSessions ?? 0}</p>
          <p className="text-xs text-zinc-600 mt-1.5">Tổng hôm nay: {data?.todaySessions ?? 0} lượt</p>
        </div>

        {/* Pending reports */}
        <div className={`bg-zinc-900 border rounded-2xl p-5 ${
          (data?.pendingReports ?? 0) > 0 ? "border-amber-400/30" : "border-zinc-800"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500">Report chờ duyệt</span>
            <div className="w-8 h-8 bg-amber-400/10 rounded-lg flex items-center justify-center">
              <AlertCircle size={15} className="text-amber-400"/>
            </div>
          </div>
          <p className={`text-2xl font-black ${
            (data?.pendingReports ?? 0) > 0 ? "text-amber-400" : "text-white"
          }`}>{data?.pendingReports ?? 0}</p>
          <p className="text-xs text-zinc-600 mt-1.5">
            {(data?.pendingReports ?? 0) > 0 ? "Cần xử lý" : "Không có"}
          </p>
        </div>

        {/* Staff */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500">Nhân viên</span>
            <div className="w-8 h-8 bg-teal-400/10 rounded-lg flex items-center justify-center">
              <UserCheck size={15} className="text-teal-400"/>
            </div>
          </div>
          <p className="text-2xl font-black text-white">{data?.totalStaff ?? 0}</p>
        </div>

        {/* Customers */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500">Khách hàng</span>
            <div className="w-8 h-8 bg-purple-400/10 rounded-lg flex items-center justify-center">
              <Users size={15} className="text-purple-400"/>
            </div>
          </div>
          <p className="text-2xl font-black text-white">{data?.totalCustomers ?? 0}</p>
        </div>
      </div>

      {/* ── Revenue trend chart ──────────────────────────────── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-semibold text-white">Doanh thu 7 ngày gần nhất</p>
          {todayData && (
            <span className="text-xs text-zinc-500">
              Hôm nay: <span className="text-amber-400 font-semibold">{fmt(todayData.revenue)}</span>
            </span>
          )}
        </div>

        {trend.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-zinc-600 text-sm">
            Chưa có dữ liệu
          </div>
        ) : (
          <div className="flex items-end gap-2 h-36">
            {trend.map((d, i) => {
              const isToday  = i === trend.length - 1;
              const barPct   = maxRev > 0 ? Math.round((d.revenue / maxRev) * 100) : 0;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 group">
                  {/* Value tooltip */}
                  <span className="text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors">
                    {d.revenue > 0 ? fmt(d.revenue) : "—"}
                  </span>
                  {/* Bar */}
                  <div className="w-full relative">
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        isToday ? "bg-amber-400" : "bg-zinc-700 group-hover:bg-zinc-500"
                      }`}
                      style={{ height: `${Math.max(barPct, 4)}%`, minHeight: "6px" }}
                    />
                  </div>
                  {/* Date + sessions */}
                  <span className="text-xs text-zinc-500">{d.date}</span>
                  <span className="text-xs text-zinc-700">{d.sessions}xe</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Recent reports ───────────────────────────────────── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-white">Báo cáo gần đây</p>
          <a href="/manager/reports"
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
            Xem tất cả →
          </a>
        </div>

        {(data?.recentReports ?? []).length === 0 ? (
          <div className="flex flex-col items-center py-8 text-zinc-600">
            <FileWarning size={24} className="mb-2"/>
            <p className="text-xs">Chưa có báo cáo nào</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {(data?.recentReports ?? []).map(r => {
              const cfg  = STATUS_CFG[r.status] ?? STATUS_CFG.pending;
              const Icon = cfg.icon;
              return (
                <div key={r.reportId}
                  className="flex items-center gap-3 px-3 py-2.5 bg-zinc-800/50 rounded-xl">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-400/10`}>
                    <FileWarning size={13} className="text-amber-400"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white">
                      {REPORT_TYPE_LABEL[r.reportType] ?? r.reportType} — #{r.reportId}
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5">{r.createdAt}</p>
                  </div>
                  <span className={`flex items-center gap-1 text-xs flex-shrink-0 ${cfg.color}`}>
                    <Icon size={11}/>
                    {r.status === "pending" ? "Chờ" : r.status === "approved" ? "Đã duyệt" : "Từ chối"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
