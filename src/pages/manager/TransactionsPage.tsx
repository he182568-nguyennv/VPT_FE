import { useEffect, useState } from "react";
import { transactionService } from "../../services/transactionService";
import { lotService }         from "../../services/lotService";
import { Loader2, Search, Banknote, CreditCard, ArrowRightLeft, TrendingUp, QrCode } from "lucide-react";

interface Transaction {
  transId:number; sessionId:number; amount:number; discountAmount:number;
  paymentMethod:string; feeType:string; paymentStatus:string; createdAt:string;
}
interface Lot { lotId:number; lotName:string }

const PAY_COLOR: Record<string,string> = {
  cash:     "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  card:     "text-blue-400   bg-blue-400/10   border-blue-400/20",
  transfer: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  vnpay:    "text-blue-300   bg-blue-300/10   border-blue-300/20",
};
const PAY_LABEL: Record<string,string> = {
  cash:"Tiền mặt", card:"Thẻ", transfer:"Chuyển khoản", vnpay:"VNPay",
};
const FEE_COLOR: Record<string,string> = {
  normal:"text-emerald-400", peak:"text-amber-400", overnight:"text-blue-400",
};
const FEE_LABEL: Record<string,string> = {
  normal:"Thường", peak:"Cao điểm", overnight:"Qua đêm",
};
const fmt = (n:number) => n.toLocaleString("vi-VN") + " ₫";
const today = new Date().toISOString().split("T")[0];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lots,         setLots]         = useState<Lot[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [from,  setFrom]  = useState(today);
  const [to,    setTo]    = useState(today);
  const [lotId, setLotId] = useState(0);

  useEffect(() => {
    lotService.getAll().then(res => setLots(res.data.data ?? [])).catch(console.error);
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    transactionService.getAll({
      lotId: lotId || undefined,
      from:  from + " 00:00:00",
      to:    to   + " 23:59:59",
    })
      .then(res => setTransactions(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const total      = transactions.reduce((s,t) => s + t.amount, 0);
  const discount   = transactions.reduce((s,t) => s + t.discountAmount, 0);
  const byCash     = transactions.filter(t => t.paymentMethod==="cash").reduce((s,t) => s+t.amount, 0);
  const byCard     = transactions.filter(t => t.paymentMethod==="card").reduce((s,t) => s+t.amount, 0);
  const byTransfer = transactions.filter(t => t.paymentMethod==="transfer").reduce((s,t) => s+t.amount, 0);
  const byVnpay    = transactions.filter(t => t.paymentMethod==="vnpay").reduce((s,t) => s+t.amount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Giao dịch thanh toán</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Lịch sử tất cả giao dịch trong hệ thống</p>
      </div>

      {/* Filter */}
      <div className="flex gap-3 flex-wrap items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">Từ ngày</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"/>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">Đến ngày</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"/>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500">Bãi xe</label>
          <select value={lotId} onChange={e => setLotId(+e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400">
            <option value={0}>Tất cả</option>
            {lots.map(l => <option key={l.lotId} value={l.lotId}>{l.lotName}</option>)}
          </select>
        </div>
        <button onClick={fetchData}
          className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
          <Search size={14}/> Lọc
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:"Tổng doanh thu", value:fmt(total),      icon:TrendingUp,     color:"text-amber-400   bg-amber-400/10"   },
          { label:"Tiền mặt",       value:fmt(byCash),     icon:Banknote,       color:"text-emerald-400 bg-emerald-400/10" },
          { label:"Thẻ / Chuyển khoản", value:fmt(byCard+byTransfer), icon:CreditCard, color:"text-blue-400 bg-blue-400/10" },
          { label:"VNPay",          value:fmt(byVnpay),    icon:QrCode,         color:"text-purple-400  bg-purple-400/10"  },
        ].map(k => (
          <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500">{k.label}</span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${k.color.split(" ")[1]}`}>
                <k.icon size={14} className={k.color.split(" ")[0]}/>
              </div>
            </div>
            <p className="text-base font-black text-white">{k.value}</p>
          </div>
        ))}
      </div>

      {discount > 0 && (
        <div className="flex items-center gap-3 bg-emerald-400/10 border border-emerald-400/20 rounded-xl px-4 py-3">
          <span className="text-xs text-emerald-400">Tổng giảm giá membership:</span>
          <span className="text-sm font-bold text-emerald-400">− {fmt(discount)}</span>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-amber-400" size={24}/></div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                {["Mã GD","Session","Số tiền","Giảm giá","Thanh toán","Loại giờ","Thời gian","Trạng thái"].map(h => (
                  <th key={h} className="text-left px-3 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.transId} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-3 py-3 text-xs font-mono text-zinc-400">#{t.transId}</td>
                  <td className="px-3 py-3 text-xs font-mono text-zinc-400">#{t.sessionId}</td>
                  <td className="px-3 py-3 text-sm font-bold text-amber-400">{fmt(t.amount)}</td>
                  <td className="px-3 py-3 text-xs text-emerald-400">
                    {t.discountAmount > 0 ? `− ${fmt(t.discountAmount)}` : "—"}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${PAY_COLOR[t.paymentMethod] ?? ""}`}>
                      {PAY_LABEL[t.paymentMethod] ?? t.paymentMethod}
                    </span>
                  </td>
                  <td className={`px-3 py-3 text-xs ${FEE_COLOR[t.feeType] ?? "text-zinc-400"}`}>
                    {FEE_LABEL[t.feeType] ?? t.feeType}
                  </td>
                  <td className="px-3 py-3 text-xs text-zinc-500">{t.createdAt}</td>
                  <td className="px-3 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      t.paymentStatus === "paid"
                        ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                        : "text-amber-400  bg-amber-400/10  border-amber-400/20"
                    }`}>{t.paymentStatus === "paid" ? "Đã thu" : "Chờ"}</span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-zinc-600 text-sm">
                  Không có giao dịch trong kỳ này
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
