import { useEffect, useState } from "react";
import { transactionService } from "../../services/transactionService";
import { paymentService }     from "../../services/paymentService";
import {
  Receipt, Loader2, Banknote, CreditCard,
  ArrowRightLeft, ChevronDown, ChevronUp, FileDown, QrCode
} from "lucide-react";

interface Transaction {
  transId: number; sessionId: number; amount: number; discountAmount: number;
  paymentMethod: string; feeType: string; paymentStatus: string; createdAt: string;
}

const PAY_ICON: Record<string, React.ElementType> = {
  cash: Banknote, card: CreditCard, transfer: ArrowRightLeft, vnpay: QrCode,
};
const PAY_LABEL: Record<string, string> = {
  cash: "Tiền mặt", card: "Thẻ ngân hàng",
  transfer: "Chuyển khoản", vnpay: "VNPay",
};
const FEE_LABEL: Record<string, string> = {
  normal: "Giờ thường", peak: "Giờ cao điểm", overnight: "Qua đêm",
};
const STATUS_COLOR: Record<string, string> = {
  paid:    "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  pending: "text-amber-400  bg-amber-400/10  border-amber-400/20",
};
const fmt = (n: number) => n.toLocaleString("vi-VN") + " ₫";

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [expandedId,   setExpandedId]   = useState<number | null>(null);
  const [downloading,  setDownloading]  = useState<number | null>(null);

  useEffect(() => {
    transactionService.getMine()
      .then(res => setTransactions(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (transId: number) => {
    setDownloading(transId);
    try { await paymentService.downloadInvoice(transId); }
    catch (e: any) { alert("Lỗi tải hóa đơn"); }
    finally { setDownloading(null); }
  };

  const totalPaid = transactions
    .filter(t => t.paymentStatus === "paid")
    .reduce((s, t) => s + t.amount, 0);

  if (loading) return (
    <div className="flex justify-center py-16">
      <Loader2 className="animate-spin text-amber-400" size={24}/>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Lịch sử giao dịch</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{transactions.length} giao dịch</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-1">Tổng đã thanh toán</p>
          <p className="text-xl font-black text-amber-400">{fmt(totalPaid)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-1">Số lần gửi xe</p>
          <p className="text-xl font-black text-white">{transactions.length}</p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-zinc-600">
          <Receipt size={32} className="mb-2"/>
          <p className="text-sm">Chưa có giao dịch nào</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {transactions.map(t => {
            const PayIcon  = PAY_ICON[t.paymentMethod] ?? Banknote;
            const expanded = expandedId === t.transId;
            return (
              <div key={t.transId} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                  onClick={() => setExpandedId(expanded ? null : t.transId)}>
                  <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <PayIcon size={18} className="text-amber-400"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{fmt(t.amount)}</span>
                      {t.discountAmount > 0 && (
                        <span className="text-xs text-emerald-400">
                          (giảm {fmt(t.discountAmount)})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{t.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLOR[t.paymentStatus] ?? ""}`}>
                      {t.paymentStatus === "paid" ? "Đã TT" : "Chờ"}
                    </span>
                    {expanded ? <ChevronUp size={14} className="text-zinc-500"/> : <ChevronDown size={14} className="text-zinc-500"/>}
                  </div>
                </div>

                {expanded && (
                  <div className="border-t border-zinc-800 p-4 bg-zinc-800/30 flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                      {[
                        ["Mã giao dịch",    `#${t.transId}`],
                        ["Phiên gửi",       `#${t.sessionId}`],
                        ["Loại giờ",        FEE_LABEL[t.feeType] ?? t.feeType],
                        ["Thanh toán bằng", PAY_LABEL[t.paymentMethod] ?? t.paymentMethod],
                        ["Phí gốc",         fmt(t.amount + t.discountAmount)],
                        ["Giảm giá",        t.discountAmount > 0 ? `− ${fmt(t.discountAmount)}` : "Không có"],
                      ].map(([label, val]) => (
                        <div key={label}>
                          <p className="text-xs text-zinc-500">{label}</p>
                          <p className="text-xs font-medium text-white mt-0.5">{val}</p>
                        </div>
                      ))}
                    </div>

                    {t.paymentStatus === "paid" && (
                      <button
                        onClick={() => handleDownload(t.transId)}
                        disabled={downloading === t.transId}
                        className="flex items-center justify-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs py-2 rounded-xl transition-colors">
                        {downloading === t.transId
                          ? <><Loader2 size={12} className="animate-spin"/>Đang tạo PDF...</>
                          : <><FileDown size={12}/>Tải hóa đơn PDF</>
                        }
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
