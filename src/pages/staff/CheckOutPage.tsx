import { useState } from "react";
import { transactionService } from "../../services/transactionService";
import { parkingService }     from "../../services/parkingService";
import { paymentService }     from "../../services/paymentService";
import {
  ScanLine, Loader2, CheckCircle2, AlertCircle,
  Clock, Tag, CreditCard, Banknote, ArrowRightLeft,
  Search, X, QrCode, FileDown, ExternalLink
} from "lucide-react";

interface FeePreview {
  sessionId: number; plateNumber: string; lotId: number;
  checkinTime: string; durationMinutes: number; feeType: string;
  baseFee: number; discountPct: number; discountAmount: number;
  hasMembership: boolean; finalFee: number;
}
interface CheckOutResult {
  transId: number; plateNumber: string; durationMinutes: number;
  baseFee: number; discountAmount: number; finalFee: number; paymentMethod: string;
}

const FEE_TYPE: Record<string, { label: string; color: string }> = {
  normal:    { label: "Giờ thường",    color: "text-emerald-400" },
  peak:      { label: "Giờ cao điểm",  color: "text-amber-400"   },
  overnight: { label: "Qua đêm",       color: "text-blue-400"    },
};
const fmt = (n: number) => n.toLocaleString("vi-VN") + " ₫";
const fmtDuration = (mins: number) => {
  const h = Math.floor(mins / 60); const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m} phút`;
};

export default function CheckOutPage() {
  const [plateInput,  setPlateInput]  = useState("");
  const [searching,   setSearching]   = useState(false);
  const [preview,     setPreview]     = useState<FeePreview | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [payMode,     setPayMode]     = useState<"direct" | "vnpay">("direct");
  const [payMethod,   setPayMethod]   = useState<"cash" | "card" | "transfer">("cash");
  const [submitting,  setSubmitting]  = useState(false);
  const [result,      setResult]      = useState<CheckOutResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [vnpayUrl,    setVnpayUrl]    = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleSearch = async () => {
    const plate = plateInput.trim().toUpperCase();
    if (!plate) return;
    setSearching(true); setSearchError(null); setPreview(null);
    setResult(null); setSubmitError(null); setVnpayUrl(null);
    try {
      const res = await transactionService.previewFee(plate);
      setPreview(res.data);
    } catch (err: any) {
      setSearchError(err.response?.data?.message ?? "Không tìm thấy xe trong bãi");
    } finally { setSearching(false); }
  };

  const handleClear = () => {
    setPlateInput(""); setPreview(null); setSearchError(null);
    setResult(null); setSubmitError(null); setVnpayUrl(null);
  };

  // Thanh toán trực tiếp (tiền mặt / thẻ / chuyển khoản)
  const handleDirectPay = async () => {
    if (!preview) return;
    setSubmitting(true); setSubmitError(null);
    try {
      const res = await parkingService.checkOut({
        plateNumber: preview.plateNumber, paymentMethod: payMethod,
      });
      setResult(res.data);
      handleClear();
    } catch (err: any) {
      setSubmitError(err.response?.data?.message ?? "Lỗi khi checkout");
    } finally { setSubmitting(false); }
  };

  // Tạo link VNPay
  const handleVNPay = async () => {
    if (!preview) return;
    setSubmitting(true); setSubmitError(null);
    try {
      // Bước 1: checkout trước để tạo transaction (status = pending)
      const checkoutRes = await parkingService.checkOut({
        plateNumber: preview.plateNumber, paymentMethod: "vnpay",
      });
      const transId = checkoutRes.data.transId;

      // Bước 2: tạo link VNPay
      const returnUrl = window.location.origin + "/payment/result?transId=" + transId;
      const payRes = await paymentService.createVNPay(transId, returnUrl);
      setVnpayUrl(payRes.data.payUrl);
      setResult({ ...checkoutRes.data, paymentMethod: "vnpay" });
      setPreview(null);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message ?? "Lỗi tạo link VNPay");
    } finally { setSubmitting(false); }
  };

  const handleDownloadInvoice = async (transId: number) => {
    setDownloading(true);
    try { await paymentService.downloadInvoice(transId); }
    catch (err: any) { alert("Lỗi tải hóa đơn: " + (err.message ?? "unknown")); }
    finally { setDownloading(false); }
  };

  const DIRECT_OPTS = [
    { value: "cash",     label: "Tiền mặt",     icon: Banknote       },
    { value: "card",     label: "Thẻ NH",        icon: CreditCard     },
    { value: "transfer", label: "Chuyển khoản",  icon: ArrowRightLeft },
  ] as const;

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div>
        <h1 className="text-xl font-bold text-white">Check-out xe</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Tìm xe → xem phí → thu tiền</p>
      </div>

      {/* Step 1 — Tìm xe */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide flex items-center gap-1.5">
          <Search size={12}/> Bước 1 — Tìm xe
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <ScanLine size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"/>
            <input
              value={plateInput}
              onChange={e => setPlateInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleSearch())}
              placeholder="30A-12345"
              disabled={!!preview}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 font-mono tracking-widest disabled:opacity-50 transition-colors"
            />
          </div>
          {preview ? (
            <button onClick={handleClear}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm rounded-lg transition-colors flex-shrink-0">
              <X size={14}/> Đổi xe
            </button>
          ) : (
            <button onClick={handleSearch} disabled={!plateInput.trim() || searching}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-zinc-950 font-semibold text-sm rounded-lg transition-colors flex-shrink-0">
              {searching ? <Loader2 size={14} className="animate-spin"/> : <Search size={14}/>}
              {searching ? "Đang tìm..." : "Tìm xe"}
            </button>
          )}
        </div>

        {searchError && (
          <div className="flex items-start gap-2 bg-red-400/10 border border-red-400/20 text-red-400 text-xs px-3 py-2.5 rounded-lg">
            <AlertCircle size={13} className="mt-0.5 flex-shrink-0"/>{searchError}
          </div>
        )}

        {/* Fee preview */}
        {preview && (
          <div className="bg-zinc-800 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-white text-base">{preview.plateNumber}</span>
              <span className={`text-xs font-medium ${FEE_TYPE[preview.feeType]?.color ?? "text-zinc-400"}`}>
                {FEE_TYPE[preview.feeType]?.label}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
              <span className="flex items-center gap-1 text-zinc-400"><Clock size={10}/>Check-in</span>
              <span className="text-zinc-300 text-right">{preview.checkinTime}</span>
              <span className="flex items-center gap-1 text-zinc-400"><Clock size={10}/>Thời gian gửi</span>
              <span className="text-zinc-300 text-right">{fmtDuration(preview.durationMinutes)}</span>
            </div>
            <div className="border-t border-zinc-700 pt-3 flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Phí cơ bản</span>
                <span className="text-zinc-300">{fmt(preview.baseFee)}</span>
              </div>
              {preview.hasMembership && preview.discountAmount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Tag size={10}/> Giảm membership ({preview.discountPct}%)
                  </span>
                  <span className="text-emerald-400">− {fmt(preview.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1.5 border-t border-zinc-700">
                <span className="text-sm font-semibold text-white">Tổng cần thu</span>
                <span className="text-xl font-black text-amber-400">{fmt(preview.finalFee)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step 2 — Phương thức TT */}
      {preview && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
            Bước 2 — Phương thức thanh toán
          </p>

          {/* Mode selector */}
          <div className="flex gap-2">
            <button onClick={() => setPayMode("direct")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                payMode === "direct"
                  ? "bg-amber-400 border-amber-400 text-zinc-950"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}>
              Trực tiếp tại quầy
            </button>
            <button onClick={() => setPayMode("vnpay")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                payMode === "vnpay"
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}>
              <QrCode size={13}/> VNPay
            </button>
          </div>

          {payMode === "direct" && (
            <div className="grid grid-cols-3 gap-2">
              {DIRECT_OPTS.map(({ value, label, icon: Icon }) => (
                <button key={value} onClick={() => setPayMethod(value)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium border transition-all ${
                    payMethod === value
                      ? "bg-amber-400 border-amber-400 text-zinc-950"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}>
                  <Icon size={16}/>{label}
                </button>
              ))}
            </div>
          )}

          {payMode === "vnpay" && (
            <div className="bg-blue-400/10 border border-blue-400/20 rounded-xl px-4 py-3 text-xs text-blue-300 leading-relaxed">
              Hệ thống sẽ tạo link thanh toán VNPay.
              Gửi link cho customer tự thanh toán trên điện thoại.
              Sau khi thanh toán thành công, hóa đơn PDF sẽ được tạo tự động.
            </div>
          )}

          {submitError && (
            <div className="flex items-center gap-2 bg-red-400/10 border border-red-400/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              <AlertCircle size={15}/>{submitError}
            </div>
          )}

          <button
            onClick={payMode === "vnpay" ? handleVNPay : handleDirectPay}
            disabled={submitting}
            className={`font-bold text-sm rounded-xl py-3.5 flex items-center justify-center gap-2 transition-colors disabled:opacity-40 ${
              payMode === "vnpay"
                ? "bg-blue-500 hover:bg-blue-400 text-white"
                : "bg-amber-400 hover:bg-amber-300 text-zinc-950"
            }`}>
            {submitting && <Loader2 size={15} className="animate-spin"/>}
            {submitting
              ? "Đang xử lý..."
              : payMode === "vnpay"
                ? `Tạo link VNPay · ${fmt(preview.finalFee)}`
                : `Thu ${fmt(preview.finalFee)} · Xác nhận check-out`
            }
          </button>
        </div>
      )}

      {/* VNPay link result */}
      {vnpayUrl && result && (
        <div className="bg-blue-400/10 border border-blue-400/20 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <QrCode size={18} className="text-blue-400"/>
            <span className="text-sm font-semibold text-blue-400">Link VNPay đã tạo</span>
          </div>
          <p className="text-xs text-zinc-400">
            Gửi link sau cho customer. Sau khi thanh toán thành công, trạng thái sẽ tự cập nhật.
          </p>
          <div className="bg-zinc-800 rounded-lg px-3 py-2 flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400 truncate flex-1">{vnpayUrl}</span>
            <button
              onClick={() => { navigator.clipboard.writeText(vnpayUrl); }}
              className="text-xs text-amber-400 hover:text-amber-300 flex-shrink-0 transition-colors">
              Copy
            </button>
          </div>
          <a href={vnpayUrl} target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors">
            <ExternalLink size={14}/> Mở VNPay (test)
          </a>
          <button
            onClick={() => handleDownloadInvoice(result.transId)}
            disabled={downloading}
            className="flex items-center justify-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm px-4 py-2 rounded-xl transition-colors">
            {downloading ? <Loader2 size={14} className="animate-spin"/> : <FileDown size={14}/>}
            {downloading ? "Đang tạo..." : "Tải hóa đơn PDF"}
          </button>
        </div>
      )}

      {/* Direct pay receipt */}
      {result && !vnpayUrl && (
        <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400"/>
            <span className="text-sm font-semibold text-emerald-400">Check-out thành công!</span>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
            {[
              ["Biển số",       result.plateNumber],
              ["Mã GD",         `#${result.transId}`],
              ["Thời gian gửi", fmtDuration(result.durationMinutes)],
              ["Phí gốc",       fmt(result.baseFee)],
              ["Giảm giá",      result.discountAmount > 0 ? `− ${fmt(result.discountAmount)}` : "—"],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-zinc-500">{label}</p>
                <p className="text-white font-medium mt-0.5">{val}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-emerald-400/20 pt-2 flex justify-between items-center">
            <span className="text-xs text-zinc-400">Đã thu</span>
            <span className="text-lg font-black text-emerald-400">{fmt(result.finalFee)}</span>
          </div>
          <button
            onClick={() => handleDownloadInvoice(result.transId)}
            disabled={downloading}
            className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm px-4 py-2 rounded-xl transition-colors">
            {downloading ? <Loader2 size={14} className="animate-spin"/> : <FileDown size={14}/>}
            {downloading ? "Đang tạo PDF..." : "Tải hóa đơn PDF"}
          </button>
        </div>
      )}
    </div>
  );
}
