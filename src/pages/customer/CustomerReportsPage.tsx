import { useState, useEffect } from "react";
import { vehicleService } from "../../services/vehicleService";
import { sessionService } from "../../services/sessionService";
import { reportService } from "../../services/reportService";
import { useAuth } from "../../hooks/useAuth";
import {
  Car,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Image,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

interface Vehicle {
  vehicleId: number;
  plateNumber: string;
  typeId: number;
  isActive: boolean;
}
interface Session {
  sessionId: number;
  plateNumber: string;
  lotId: number;
  checkinTime: string;
}
interface Report {
  reportId: number;
  plateNumber: string;
  vehicleType: string;
  lotName: string;
  checkinTime: string;
  reporterName: string;
  reporterPhone: string;
  description: string;
  imgUrl: string;
  status: string;
  createdAt: string;
}

const TYPE_LABEL: Record<number, string> = {
  1: "Ô tô",
  2: "Xe máy",
  3: "Xe tải",
};
const STATUS: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  pending: {
    label: "Chờ xử lý",
    color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    icon: Clock,
  },
  approved: {
    label: "Đã duyệt",
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Từ chối",
    color: "text-red-400 bg-red-400/10 border-red-400/20",
    icon: XCircle,
  },
};

export default function CustomerReportsPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [initLoading, setInitLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [form, setForm] = useState({
    vehicleId: "",
    sessionId: "",
    reporterName: "",
    reporterPhone: "",
    description: "",
    imgUrl: "",
  });

  useEffect(() => {
    Promise.all([vehicleService.getMine(), reportService.getAll()])
      .then(([vRes, rRes]) => {
        setVehicles(vRes.data.data ?? []);
        setReports(rRes.data.data ?? []);
      })
      .catch(console.error)
      .finally(() => setInitLoading(false));

    // Pre-fill reporter info từ user
    if (user) {
      setForm((f) => ({
        ...f,
        reporterName: user.fullName,
        reporterPhone: user.phone ?? "",
      }));
    }
  }, []);

  // Khi chọn xe → load sessions của xe đó
  const handleVehicleChange = async (vehicleId: string) => {
    setForm((f) => ({ ...f, vehicleId, sessionId: "" }));
    if (!vehicleId) {
      setSessions([]);
      return;
    }
    const vehicle = vehicles.find((v) => v.vehicleId === +vehicleId);
    if (!vehicle) return;
    try {
      const res = await sessionService.getAll({ plate: vehicle.plateNumber });
      setSessions(
        (res.data.data ?? []).filter(
          (s: Session & { status: string }) => s.status !== "active",
        ),
      );
    } catch {
      setSessions([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId || !form.sessionId) return;
    setSubmitting(true);
    try {
      await reportService.create({
        vehicleId: +form.vehicleId,
        sessionId: +form.sessionId,
        reportType: "lost_vehicle",
        notes: form.description,
        action: "create",
      });
      // Reload reports
      const rRes = await reportService.getAll();
      setReports(rRes.data.data ?? []);
      setForm((f) => ({
        ...f,
        vehicleId: "",
        sessionId: "",
        description: "",
        imgUrl: "",
      }));
      setShowForm(false);
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Lỗi khi tạo báo cáo");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedVehicle = vehicles.find((v) => v.vehicleId === +form.vehicleId);

  if (initLoading)
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-amber-400" size={24} />
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Báo cáo mất xe</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Gửi báo cáo khi xe bị mất trong bãi
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} /> Báo mất xe
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-red-500/30 rounded-2xl p-5 flex flex-col gap-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <Car size={16} className="text-red-400" />
            <p className="text-sm font-semibold text-white">
              Thông tin báo cáo mất xe
            </p>
          </div>

          {/* Xe */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">
              Xe bị mất <span className="text-red-400">*</span>
            </label>
            <select
              value={form.vehicleId}
              onChange={(e) => handleVehicleChange(e.target.value)}
              required
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
            >
              <option value="">-- Chọn xe --</option>
              {vehicles
                .filter((v) => v.isActive)
                .map((v) => (
                  <option key={v.vehicleId} value={v.vehicleId}>
                    {v.plateNumber} — {TYPE_LABEL[v.typeId] ?? "Xe"}
                  </option>
                ))}
            </select>
          </div>

          {/* Preview xe đã chọn */}
          {selectedVehicle && (
            <div className="bg-zinc-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-red-400/10 rounded-lg flex items-center justify-center">
                <Car size={16} className="text-red-400" />
              </div>
              <div>
                <p className="font-mono font-bold text-white text-sm">
                  {selectedVehicle.plateNumber}
                </p>
                <p className="text-xs text-zinc-500">
                  {TYPE_LABEL[selectedVehicle.typeId] ?? "Xe"}
                </p>
              </div>
            </div>
          )}

          {/* Phiên gửi */}
          {selectedVehicle && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400">
                Phiên gửi xe liên quan <span className="text-red-400">*</span>
              </label>
              {sessions.length === 0 ? (
                <p className="text-xs text-zinc-600 bg-zinc-800 rounded-lg px-3 py-2.5">
                  Không tìm thấy phiên gửi đã hoàn thành
                </p>
              ) : (
                <select
                  value={form.sessionId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sessionId: e.target.value }))
                  }
                  required
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="">-- Chọn phiên gửi --</option>
                  {sessions.map((s) => (
                    <option key={s.sessionId} value={s.sessionId}>
                      Bãi #{s.lotId} · {s.checkinTime}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Người báo cáo */}
          <div className="grid grid-cols-2 gap-3">
            {[
              ["reporterName", "Họ và tên", "Nguyễn Văn A"],
              ["reporterPhone", "Số điện thoại", "0901xxxxxx"],
            ].map(([k, label, ph]) => (
              <div key={k} className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400">
                  {label} <span className="text-red-400">*</span>
                </label>
                <input
                  value={form[k as keyof typeof form]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [k]: e.target.value }))
                  }
                  placeholder={ph}
                  required
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                />
              </div>
            ))}
          </div>

          {/* Mô tả */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">
              Mô tả chi tiết <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={4}
              required
              placeholder="Thời điểm phát hiện mất, vị trí gửi, đặc điểm nhận dạng..."
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          {/* Ảnh */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400 flex items-center gap-1">
              <Image size={11} /> Ảnh đính kèm (URL, tùy chọn)
            </label>
            <input
              value={form.imgUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, imgUrl: e.target.value }))
              }
              placeholder="https://..."
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-white bg-zinc-800 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-1.5"
            >
              {submitting && <Loader2 size={12} className="animate-spin" />}
              {submitting ? "Đang gửi..." : "Gửi báo cáo"}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {reports.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-zinc-600">
          <Car size={32} className="mb-2" />
          <p className="text-sm">Chưa có báo cáo nào</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((r: any) => {
            const cfg = STATUS[r.status] ?? STATUS.pending;
            const Icon = cfg.icon;
            const expanded = expandedId === r.reportId;
            return (
              <div
                key={r.reportId}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
              >
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                  onClick={() => setExpandedId(expanded ? null : r.reportId)}
                >
                  <div className="w-10 h-10 bg-red-400/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Car size={18} className="text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-white text-sm">
                        {r.plateNumber ?? `Report #${r.reportId}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {r.lotName && (
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <MapPin size={10} />
                          {r.lotName}
                        </span>
                      )}
                      <span className="text-xs text-zinc-600">
                        {r.createdAt}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${cfg.color}`}
                    >
                      <Icon size={10} />
                      {cfg.label}
                    </span>
                    {expanded ? (
                      <ChevronUp size={14} className="text-zinc-500" />
                    ) : (
                      <ChevronDown size={14} className="text-zinc-500" />
                    )}
                  </div>
                </div>
                {expanded && (
                  <div className="border-t border-zinc-800 p-4 bg-zinc-800/30 flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ["Người báo cáo", r.reporterName],
                        ["Số điện thoại", r.reporterPhone],
                        ["Thời gian gửi", r.checkinTime],
                        ["Mã phiên", `#${r.sessionId}`],
                      ]
                        .filter(([, v]) => v)
                        .map(([label, val]) => (
                          <div key={label as string}>
                            <p className="text-xs text-zinc-500">{label}</p>
                            <p className="text-xs font-medium text-white mt-0.5">
                              {val}
                            </p>
                          </div>
                        ))}
                    </div>
                    {r.notes && (
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Mô tả</p>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {r.notes}
                        </p>
                      </div>
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
