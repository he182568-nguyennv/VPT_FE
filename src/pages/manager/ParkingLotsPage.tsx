import { useEffect, useState } from "react";
import { lotService } from "../../services/lotService";
import { ParkingSquare, MapPin, Plus, Car, Edit2, X, CheckCircle2, Loader2 } from "lucide-react";

interface Lot { lotId:number; lotName:string; address:string; capacity:number; currentCount:number; isActive?:boolean; }

export default function ParkingLotsPage() {
  const [lots,     setLots]     = useState<Lot[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState<number | null>(null);
  const [saving,   setSaving]   = useState(false);
  const [form, setForm] = useState({ lotName:"", address:"", capacity:"" });

  const fetchLots = () => {
    setLoading(true);
    lotService.getAll()
      .then(res => setLots(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLots(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing !== null) {
        await lotService.update({ action:"update", lotId: editing, lotName: form.lotName, address: form.address, capacity: +form.capacity });
        setEditing(null);
      } else {
        await lotService.create({ lotName: form.lotName, address: form.address, capacity: +form.capacity });
      }
      setForm({ lotName:"", address:"", capacity:"" });
      setShowForm(false);
      fetchLots();
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Lỗi lưu bãi xe");
    } finally { setSaving(false); }
  };

  const startEdit = (l: Lot) => {
    setForm({ lotName: l.lotName, address: l.address, capacity: String(l.capacity) });
    setEditing(l.lotId);
    setShowForm(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Bãi đỗ xe</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{lots.length} bãi trong hệ thống</p>
        </div>
        <button onClick={() => { setShowForm(s => !s); setEditing(null); setForm({ lotName:"", address:"", capacity:"" }); }}
          className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus size={15}/> Thêm bãi
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">{editing ? "Chỉnh sửa bãi xe" : "Thêm bãi xe mới"}</p>
            <button type="button" onClick={() => setShowForm(false)}><X size={15} className="text-zinc-500 hover:text-white"/></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500">Tên bãi xe</label>
              <input value={form.lotName} onChange={e => setForm(f => ({ ...f, lotName: e.target.value }))}
                placeholder="Bãi xe C" required
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"/>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500">Sức chứa (xe)</label>
              <input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                placeholder="100" required min="1"
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"/>
            </div>
            <div className="flex flex-col gap-1 col-span-2">
              <label className="text-xs text-zinc-500">Địa chỉ</label>
              <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="123 Đường ABC, Hà Nội" required
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"/>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 rounded-lg transition-colors">
              {saving && <Loader2 size={12} className="animate-spin"/>}
              {editing ? "Cập nhật" : "Thêm bãi"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-amber-400" size={24}/></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {lots.map(l => {
            const pct      = l.capacity > 0 ? Math.round((l.currentCount / l.capacity) * 100) : 0;
            const barColor = pct > 85 ? "bg-red-400" : pct > 60 ? "bg-amber-400" : "bg-emerald-400";
            return (
              <div key={l.lotId} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-amber-400/10 rounded-xl flex items-center justify-center">
                      <ParkingSquare size={18} className="text-amber-400"/>
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{l.lotName}</p>
                      <span className="text-xs text-emerald-400">● Hoạt động</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(l)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-amber-400 hover:bg-amber-400/10 transition-colors">
                      <Edit2 size={13}/>
                    </button>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors">
                      <CheckCircle2 size={13}/>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-zinc-500 mb-4">
                  <MapPin size={11}/>{l.address}
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-zinc-400">Lấp đầy</span>
                  <span className="text-xs font-semibold text-white">{l.currentCount} / {l.capacity}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }}/>
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="flex items-center gap-1 text-xs text-zinc-500"><Car size={10}/>{l.currentCount} xe đang gửi</span>
                  <span className="text-xs text-zinc-600">{l.capacity - l.currentCount} chỗ trống</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
