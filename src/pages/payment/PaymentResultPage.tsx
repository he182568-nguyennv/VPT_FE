import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { paymentService } from "../../services/paymentService";
import { CheckCircle2, XCircle, Loader2, FileDown, Home } from "lucide-react";

export default function PaymentResultPage() {
  const [params]     = useSearchParams();
  const [status,     setStatus]     = useState<"loading" | "success" | "failed">("loading");
  const [message,    setMessage]    = useState("");
  const [transId,    setTransId]    = useState<number | null>(null);
  const [downloading,setDownloading]= useState(false);

  useEffect(() => {
    const code    = params.get("vnp_ResponseCode");
    const txnRef  = params.get("vnp_TxnRef");
    const tid     = txnRef ? parseInt(txnRef) : null;

    if (code === null) {
      // Trường hợp redirect từ app nội bộ (không phải từ VNPay)
      const directTransId = params.get("transId");
      if (directTransId) {
        setTransId(parseInt(directTransId));
        setStatus("success");
        setMessage("Thanh toán hoàn tất");
      } else {
        setStatus("failed");
        setMessage("Không có thông tin thanh toán");
      }
      return;
    }

    // VNPay trả về
    setTransId(tid);
    if (code === "00") {
      setStatus("success");
      setMessage("Thanh toán VNPay thành công!");
    } else {
      setStatus("failed");
      setMessage(vnpayMsg(code));
    }
  }, []);

  const handleDownload = async () => {
    if (!transId) return;
    setDownloading(true);
    try { await paymentService.downloadInvoice(transId); }
    catch (e: any) { alert("Lỗi tải hóa đơn: " + e.message); }
    finally { setDownloading(false); }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center gap-5 text-center">

        {status === "loading" && (
          <>
            <Loader2 size={48} className="text-amber-400 animate-spin"/>
            <p className="text-white font-semibold">Đang xử lý kết quả...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-emerald-400/10 border border-emerald-400/20 rounded-full flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-400"/>
            </div>
            <div>
              <p className="text-lg font-bold text-white mb-1">Thanh toán thành công!</p>
              <p className="text-sm text-zinc-400">{message}</p>
              {transId && (
                <p className="text-xs text-zinc-600 mt-1">Mã giao dịch: #{transId}</p>
              )}
            </div>

            {transId && (
              <button onClick={handleDownload} disabled={downloading}
                className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 font-semibold text-sm py-3 rounded-xl transition-colors">
                {downloading
                  ? <><Loader2 size={15} className="animate-spin"/>Đang tạo PDF...</>
                  : <><FileDown size={15}/>Tải hóa đơn PDF</>
                }
              </button>
            )}

            <Link to="/" className="text-xs text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
              <Home size={12}/> Về trang chủ
            </Link>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="w-16 h-16 bg-red-400/10 border border-red-400/20 rounded-full flex items-center justify-center">
              <XCircle size={32} className="text-red-400"/>
            </div>
            <div>
              <p className="text-lg font-bold text-white mb-1">Thanh toán thất bại</p>
              <p className="text-sm text-zinc-400">{message}</p>
            </div>
            <Link to="/"
              className="w-full flex items-center justify-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm py-3 rounded-xl transition-colors">
              <Home size={14}/> Về trang chủ
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function vnpayMsg(code: string): string {
  const map: Record<string, string> = {
    "07": "Giao dịch bị nghi ngờ", "09": "Chưa đăng ký Internet Banking",
    "10": "Xác thực thẻ quá 3 lần", "11": "Hết hạn chờ thanh toán",
    "12": "Thẻ bị khóa", "13": "Sai OTP", "24": "Khách hủy giao dịch",
    "51": "Tài khoản không đủ số dư", "65": "Vượt hạn mức giao dịch",
    "75": "Ngân hàng đang bảo trì", "79": "Sai mật khẩu quá số lần",
  };
  return map[code] ?? `Thất bại (mã lỗi ${code})`;
}
