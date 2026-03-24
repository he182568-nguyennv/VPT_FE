import { useState } from "react";
import { sessionService } from "../../services/sessionService";
import { reportService }  from "../../services/reportService";
import {
  CreditCard, Car, User, Phone, IdCard,
  StickyNote, Info, CheckCircle2, AlertCircle, Loader2, Search, X
} from "lucide-react";

interface ActiveSession {
  sessionId: number; plateNumber: string; lotId: number;
  checkinTime: string; status: string;
}

interface ReportEntry {
  reportId: number; incidentType: string; plateNumber: string;
  guestName: string; guestPhone: string; createdAt: string;
}

const TYPE_LABEL: Record<number, string> = { 1:"Ô tô", 2:"Xe máy", 3:"Xe tải" };

const INCIDENT_TYPES = [
  { value: "lost_card",    label: "Mất thẻ xe", icon: CreditCard },
  { value: "lost_vehicle", label: "Mất xe",     icon: Car        },
];

export default function CreateReportPage() {
  // Step 1 — tìm xe
  const [plateInput,   setPlateInput]   = useState("");
  const [searching,    setSearching]    = useState(false);
  const [foundSession, setFoundSession] = useState<ActiveSession | null>(null);
  const [searchError,  setSearchError]  = useState<string | null>(null);

  // Step 2 — form
  const [incidentType,  setIncidentType]  = useState("lost_card");
  const [guestName,     setGuestName]     = useState("");
  const [guestPhone,    setGuestPhone]    = useState("");
  const [guestCccd,     setGuestCccd]     = useState("");
  const [internalNote,  setInternalNote]  = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [result,     setResult]     = useState<{ success: boolean; message: string } | null>(null);
  const [reports,    setReports]    = useState<ReportEntry[]>([]);

  // Tìm xe theo biển số → GET /staff/sessions?plate=xxx&status=active
  const handleSearch = async () => {
    const plate = plateInput.trim().toUpperCase();
    if (!plate) return;
    setSearching(true); setSearchError(null); setFoundSession(null); setResult(null);
    try {
      const res = await sessionService.getAll({ plate, status: "active" });
      const list: ActiveSession[] = res.data.data ?? [];
      if (list.length === 0) {
        setSearchError(`Không tìm thấy xe "${plate}" đang gửi trong bãi.`);
      } else {
        setFoundSession(list[0]);
      }
    } catch (err: any) {
      setSearchError(err.response?.data?.message ?? "Lỗi kết nối server");
    } finally { setSearching(false); }
  };

  const handleClear = () => {
    setPlateInput(""); setFoundSession(null); setSearchError(null);
    setGuestName(""); setGuestPhone(""); setGuestCccd(""); setInternalNote(""); setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundSession) return;
    setSubmitting(true); setResult(null);
    try {
      await reportService.create({
        vehicleId:  0,
        sessionId:  foundSession.sessionId,
        reportType: incidentType,
        notes:      internalNote || `${incidentType === "lost_card" ? "Mất thẻ" : "Mất xe"} - ${guestName} - ${guestPhone} - CCCD: ${guestCccd}`,
        action:     "create",
      });
      setReports(prev => [...prev, {
        reportId:     Date.now(),
        incidentType,
        plateNumber:  foundSession.plateNumber,
        guestName,
        guestPhone,
        createdAt:    new Date().toLocaleString("vi-VN"),
      }]);
      setResult({ success: true, message: `Đã tạo báo cáo ${incidentType === "lost_card" ? "mất thẻ" : "mất xe"} cho xe ${foundSession.plateNumber}` });
      handleClear();
    } catch (err: any) {
      setResult({ success: false, message: err.response?.data?.message ?? "Lỗi server" });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div>
        <h1 className="text-xl font-bold text-white">Tạo báo cáo sự cố</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Nhập thông tin hộ khách khi có sự cố</p>
      </div>

      <div className="flex items-start gap-3 bg-blue-400/10 border border-blue-400/20 rounded-xl p-3.5">
        <Info size={14} className="text-blue-400 mt-0.5 flex-shrink-0"/>
        <p className="text-xs text-blue-300 leading-relaxed">
          Nhập biển số xe để tìm phiên gửi đang active.
          Yêu cầu khách cung cấp <strong>CCCD</strong> để xác thực danh tính trước khi tạo báo cáo.
        </p>
      </div>

      {/* Step 1 — Tìm xe */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide flex items-center gap-1.5">
          <Search size={12}/> Bước 1 — Tìm xe đang gửi
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Car size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"/>
            <input
              value={plateInput}
              onChange={e => setPlateInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleSearch())}
              placeholder="30A-12345"
              disabled={!!foundSession}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 font-mono tracking-wider disabled:opacity-50 transition-colors"
            />
          </div>
          {foundSession ? (
            <button type="button" onClick={handleClear}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm rounded-lg transition-colors flex-shrink-0">
              <X size={14}/> Đổi xe
            </button>
          ) : (
            <button type="button" onClick={handleSearch} disabled={!plateInput.trim() || searching}
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

        {foundSession && (
          <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={14} className="text-emerald-400"/>
              <span className="text-xs font-semibold text-emerald-400">Tìm thấy — xe đang trong bãi</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {[
                ["Biển số",  foundSession.plateNumber],
                ["Bãi xe",   `#${foundSession.lotId}`],
                ["Check-in", foundSession.checkinTime],
                ["Session",  `#${foundSession.sessionId}`],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs text-zinc-500">{label}</p>
                  <p className="text-xs font-mono font-medium text-white mt-0.5">{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Steps 2 & 3 */}
      {foundSession && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Loại sự cố */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Bước 2 — Loại sự cố</p>
            <div className="grid grid-cols-2 gap-2">
              {INCIDENT_TYPES.map(({ value, label, icon: Icon }) => (
                <button key={value} type="button" onClick={() => setIncidentType(value)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    incidentType === value
                      ? "bg-amber-400 border-amber-400 text-zinc-950"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}>
                  <Icon size={14}/>{label}
                </button>
              ))}
            </div>
          </div>

          {/* Thông tin người mất */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide flex items-center gap-1.5">
              <User size={12}/> Bước 3 — Thông tin người mất
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400 flex items-center gap-1">
                  <User size={10}/> Họ và tên <span className="text-red-400">*</span>
                </label>
                <input value={guestName} onChange={e => setGuestName(e.target.value)}
                  placeholder="Nguyễn Văn A" required
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400 flex items-center gap-1">
                  <Phone size={10}/> Số điện thoại <span className="text-red-400">*</span>
                </label>
                <input value={guestPhone} onChange={e => setGuestPhone(e.target.value)}
                  placeholder="0901xxxxxx" required
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"/>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-zinc-400 flex items-center gap-1">
                  <IdCard size={10}/> Số CCCD / CMND <span className="text-red-400">*</span>
                </label>
                <input value={guestCccd} onChange={e => setGuestCccd(e.target.value)}
                  placeholder="012345678901" required
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 font-mono tracking-widest"/>
              </div>
            </div>
          </div>

          {/* Ghi chú nội bộ */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide flex items-center gap-1.5">
              <StickyNote size={12}/> Ghi chú nội bộ (tùy chọn)
            </p>
            <textarea value={internalNote} onChange={e => setInternalNote(e.target.value)}
              rows={2} placeholder="Ghi chú thêm cho manager..."
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 resize-none"/>
          </div>

          {result && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm ${
              result.success
                ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400"
                : "bg-red-400/10 border-red-400/20 text-red-400"
            }`}>
              {result.success ? <CheckCircle2 size={15}/> : <AlertCircle size={15}/>}
              {result.message}
            </div>
          )}

          <button type="submit" disabled={submitting}
            className="bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-zinc-950 font-bold text-sm rounded-xl py-3 flex items-center justify-center gap-2 transition-colors">
            {submitting && <Loader2 size={15} className="animate-spin"/>}
            {submitting ? "Đang gửi..." : "Tạo báo cáo"}
          </button>
        </form>
      )}

      {/* Recent in shift */}
      {reports.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Đã tạo trong ca này</p>
          {reports.map(r => (
            <div key={r.reportId} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                r.incidentType === "lost_card" ? "bg-amber-400/10 text-amber-400" : "bg-red-400/10 text-red-400"
              }`}>
                {r.incidentType === "lost_card" ? <CreditCard size={15}/> : <Car size={15}/>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white text-sm">{r.plateNumber}</span>
                  <span className="text-xs text-zinc-500">{r.incidentType === "lost_card" ? "Mất thẻ" : "Mất xe"}</span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{r.guestName} · {r.guestPhone}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{r.createdAt}</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20 flex-shrink-0">Chờ duyệt</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
