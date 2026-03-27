import { useEffect, useState } from "react";
import { vehicleService } from "../../services/vehicleService";
import {
  Car,
  Plus,
  CheckCircle,
  XCircle,
  Search,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";

interface Vehicle {
  vehicleId: number;
  typeId: number;
  plateNumber: string;
  isActive: boolean;
}

const TYPE_LABEL: Record<number, string> = {
  1: "Ô tô",
  2: "Xe máy",
  3: "Xe tải",
};
const TYPE_COLOR: Record<number, string> = {
  1: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  2: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  3: "bg-purple-400/10 text-purple-400 border-purple-400/20",
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [form, setForm] = useState({ plateNumber: "", typeId: 1 });

  const fetchVehicles = () => {
    setLoading(true);
    vehicleService
      .getMine()
      .then((res) => setVehicles(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const filtered = vehicles.filter((v) =>
    v.plateNumber.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setApiError(null);
    try {
      await vehicleService.add({
        plateNumber: form.plateNumber,
        typeId: form.typeId,
      });
      setForm({ plateNumber: "", typeId: 1 });
      setShowForm(false);
      fetchVehicles();
    } catch (err: any) {
      setApiError(err.response?.data?.message ?? "Không thể thêm xe");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (vehicleId: number) => {
    try {
      await vehicleService.toggle(vehicleId);
      setVehicles((vs) =>
        vs.map((v) =>
          v.vehicleId === vehicleId ? { ...v, isActive: !v.isActive } : v,
        ),
      );
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Lỗi");
    }
  };

  const handleDelete = async (vehicleId: number) => {
    if (!window.confirm("Xác nhận xóa xe này?")) return;
    try {
      await vehicleService.remove(vehicleId);
      setVehicles((vs) => vs.filter((v) => v.vehicleId !== vehicleId));
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Lỗi xóa xe");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Xe của tôi</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {vehicles.length} xe đã đăng ký
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm((s) => !s);
            setApiError(null);
          }}
          className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}{" "}
          {showForm ? "Đóng" : "Thêm xe"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4"
        >
          <p className="text-sm font-semibold text-white">Thêm xe mới</p>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-500">
              Biển số xe <span className="text-red-400">*</span>
            </label>
            <input
              value={form.plateNumber}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  plateNumber: e.target.value.toUpperCase(),
                }))
              }
              placeholder="30A-12345"
              required
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 font-mono tracking-widest"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-500">Loại xe</label>
            <div className="flex gap-2">
              {Object.entries(TYPE_LABEL).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, typeId: +id }))}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                    form.typeId === +id
                      ? "bg-amber-400 border-amber-400 text-zinc-950"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {apiError && (
            <div className="flex items-center gap-2 bg-red-400/10 border border-red-400/20 text-red-400 text-xs px-3 py-2.5 rounded-lg">
              <AlertCircle size={13} />
              {apiError}
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-xs text-zinc-400 hover:text-white bg-zinc-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 transition-colors flex items-center gap-1.5"
            >
              {saving && <Loader2 size={12} className="animate-spin" />}
              {saving ? "Đang lưu..." : "Lưu xe"}
            </button>
          </div>
        </form>
      )}

      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo biển số..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-amber-400" size={24} />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((v) => (
            <div
              key={v.vehicleId}
              className={`bg-zinc-900 border rounded-2xl p-4 flex items-center gap-4 transition-colors ${v.isActive ? "border-zinc-800" : "border-zinc-800/50 opacity-60"}`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_COLOR[v.typeId] ?? "bg-zinc-800 text-zinc-400"}`}
              >
                <Car size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-white text-sm">
                    {v.plateNumber}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border ${TYPE_COLOR[v.typeId] ?? ""}`}
                  >
                    {TYPE_LABEL[v.typeId] ?? "Xe"}
                  </span>
                  {!v.isActive && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-400 border border-zinc-600">
                      Ngưng
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleToggle(v.vehicleId)}
                  title={v.isActive ? "Ngưng" : "Kích hoạt"}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-800 transition-colors"
                >
                  {v.isActive ? (
                    <CheckCircle size={15} className="text-emerald-400" />
                  ) : (
                    <XCircle size={15} className="text-zinc-500" />
                  )}
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-12 text-zinc-600">
              <Car size={32} className="mb-2" />
              <p className="text-sm">Chưa có xe nào</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
