import { useEffect, useState } from "react";
import { revenueService } from "../../services/revenueService";
import { TrendingUp, TrendingDown, DollarSign, Car, BarChart2, Loader2 } from "lucide-react";

interface DayData  { date:string; revenue:number; sessions:number; }
interface LotData  { lotName:string; revenue:number; }

const fmt = (n: number) => n.toLocaleString("vi-VN") + "₫";

export default function RevenuePage() {
  const [range,    setRange]    = useState<"7d"|"30d"|"90d">("7d");
  const [loading,  setLoading]  = useState(true);
  const [daily,    setDaily]    = useState<DayData[]>([]);
  const [byLot,    setByLot]    = useState<LotData[]>([]);
  const [totalRev, setTotalRev] = useState(0);
  const [totalSes, setTotalSes] = useState(0);

  const fetchRevenue = (r: "7d"|"30d"|"90d") => {
    setLoading(true);
    revenueService.get(r)
      .then(res => {
        const d = res.data;
        setDaily(d.dailyData ?? []);
        setByLot(d.byLot ?? []);
        setTotalRev(d.totalRevenue ?? 0);
        setTotalSes(d.totalSessions ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRevenue(range); }, [range]);

  const maxRev      = daily.length > 0 ? Math.max(...daily.map(d => d.revenue), 1) : 1;
  const avgDaily    = daily.length > 0 ? Math.round(totalRev / daily.length) : 0;
  const last        = daily[daily.length - 1];
  const prev        = daily[daily.length - 2];
  const growthPct   = last && prev && prev.revenue > 0
    ? Math.round(((last.revenue - prev.revenue) / prev.revenue) * 100) : 0;

  const totalLotRev = byLot.reduce((s, l) => s + l.revenue, 0) || 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Doanh thu</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Thống kê doanh thu theo thời gian</p>
        </div>
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          {(["7d","30d","90d"] as const).map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                range === r ? "bg-amber-400 text-zinc-950" : "text-zinc-400 hover:text-white"
              }`}>{r === "7d" ? "7 ngày" : r === "30d" ? "30 ngày" : "3 tháng"}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-amber-400" size={28}/></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label:`Tổng ${range}`,       value: fmt(totalRev),         icon: DollarSign, color: "text-amber-400   bg-amber-400/10"   },
              { label:"Hôm nay",             value: fmt(last?.revenue??0), icon: TrendingUp, color: "text-emerald-400 bg-emerald-400/10" },
              { label:"Trung bình/ngày",     value: fmt(avgDaily),         icon: BarChart2,  color: "text-blue-400   bg-blue-400/10"    },
              { label:"Tổng lượt xe",        value: totalSes + " lượt",    icon: Car,        color: "text-purple-400 bg-purple-400/10"  },
            ].map(k => (
              <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-500">{k.label}</span>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${k.color.split(" ")[1]}`}>
                    <k.icon size={14} className={k.color.split(" ")[0]}/>
                  </div>
                </div>
                <p className="text-lg font-black text-white">{k.value}</p>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-semibold text-white">Doanh thu theo ngày</p>
              <div className="flex items-center gap-1 text-xs">
                {growthPct >= 0
                  ? <><TrendingUp size={12} className="text-emerald-400"/><span className="text-emerald-400">+{growthPct}% so với hôm qua</span></>
                  : <><TrendingDown size={12} className="text-red-400"/><span className="text-red-400">{growthPct}% so với hôm qua</span></>
                }
              </div>
            </div>
            <div className="flex items-end gap-1 h-40">
              {daily.map((d, i) => {
                const h = Math.round((d.revenue / maxRev) * 100);
                const isLast = i === daily.length - 1;
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-zinc-500 font-mono leading-none">
                      {d.revenue > 0 ? (d.revenue / 1000000).toFixed(1) + "M" : ""}
                    </span>
                    <div className="w-full relative group cursor-pointer">
                      <div className={`w-full rounded-t-sm transition-all ${isLast ? "bg-amber-400" : "bg-zinc-700 group-hover:bg-zinc-500"}`}
                        style={{ height: `${Math.max(h, 2)}%`, minHeight: "4px" }}/>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 text-xs text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {fmt(d.revenue)}
                      </div>
                    </div>
                    <span className="text-xs text-zinc-500 leading-none">{d.date}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* By lot */}
          {byLot.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <p className="text-sm font-semibold text-white mb-4">Theo bãi xe</p>
              <div className="flex flex-col gap-4">
                {byLot.map(l => {
                  const pct = Math.round((l.revenue / totalLotRev) * 100);
                  return (
                    <div key={l.lotName}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-zinc-300 font-medium">{l.lotName}</span>
                        <span className="text-xs text-zinc-500">{fmt(l.revenue)}</span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }}/>
                      </div>
                      <p className="text-xs text-zinc-600 mt-1 text-right">{pct}%</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
