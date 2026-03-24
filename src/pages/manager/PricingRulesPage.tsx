import { useEffect, useState } from "react";
import { pricingService } from "../../services/pricingService";
import { lotService }     from "../../services/lotService";
import { DollarSign, Plus, Edit2, X, Car, Moon, Zap, Clock, Loader2 } from "lucide-react";

interface PricingRule { ruleId:number; lotId:number; typeId:number; feeType:string; pricePerBlock:number; blockMinutes:number; maxDailyFee:number; isNightFee:boolean; isActive:boolean; }
interface Lot         { lotId:number; lotName:string; }

const FEE_CFG: Record<string, { label:string; color:string; icon:React.ElementType }> = {
  normal:    { label:"Giờ thường",    color:"text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon:Clock },
  peak:      { label:"Giờ cao điểm",  color:"text-amber-400   bg-amber-400/10   border-amber-400/20",   icon:Zap   },
  overnight: { label:"Qua đêm",       color:"text-blue-400    bg-blue-400/10    border-blue-400/20",    icon:Moon  },
};
const VEHICLE_TYPES = [
  { typeId:1, label:"Ô tô",    value:"car",       color:"text-blue-400"   },
  { typeId:2, label:"Xe máy",  value:"motorbike", color:"text-amber-400"  },
  { typeId:3, label:"Xe tải",  value:"truck",     color:"text-purple-400" },
];
const fmt = (n: number) => n.toLocaleString("vi-VN") + "₫";

export default function PricingRulesPage() {
  const [rules,    setRules]    = useState<PricingRule[]>([]);
  const [lots,     setLots]     = useState<Lot[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState<number | null>(null);
  const [saving,   setSaving]   = useState(false);
  const [lotFilter,setLotFilter]= useState("all");
  const [form, setForm] = useState({ lotId:"", typeId:"1", feeType:"normal", pricePerBlock:"5000", blockMinutes:"60", maxDailyFee:"50000", isNightFee:"false" });

  const fetchAll = () => {
    setLoading(true);
    Promise.all([pricingService.getAll(), lotService.getAll()])
      .then(([prRes, lotRes]) => {
        setRules(prRes.data.data ?? []);
        setLots(lotRes.data.data ?? []);
      }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = lotFilter === "all" ? rules : rules.filter(r => String(r.lotId) === lotFilter);

  const getLotName = (lotId: number) => lots.find(l => l.lotId === lotId)?.lotName ?? `Bãi #${lotId}`;
  const getVehicleLabel = (typeId: number) => VEHICLE_TYPES.find(v => v.typeId === typeId)?.label ?? `Loại #${typeId}`;
  const getVehicleColor = (typeId: number) => VEHICLE_TYPES.find(v => v.typeId === typeId)?.color ?? "text-zinc-400";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { lotId:+form.lotId, typeId:+form.typeId, feeType:form.feeType,
      pricePerBlock:form.pricePerBlock, blockMinutes:+form.blockMinutes,
      maxDailyFee:form.maxDailyFee, isNightFee:form.isNightFee === "true" };
    try {
      if (editing !== null) { await pricingService.update({ ...payload, ruleId: editing }); setEditing(null); }
      else                  { await pricingService.create(payload); }
      setShowForm(false);
      setForm({ lotId:"", typeId:"1", feeType:"normal", pricePerBlock:"5000", blockMinutes:"60", maxDailyFee:"50000", isNightFee:"false" });
      fetchAll();
    } catch (err: any) { alert(err.response?.data?.message ?? "Lỗi lưu quy tắc"); }
    finally { setSaving(false); }
  };

  const startEdit = (r: PricingRule) => {
    setForm({ lotId:String(r.lotId), typeId:String(r.typeId), feeType:r.feeType,
      pricePerBlock:String(r.pricePerBlock), blockMinutes:String(r.blockMinutes),
      maxDailyFee:String(r.maxDailyFee), isNightFee:String(r.isNightFee) });
    setEditing(r.ruleId); setShowForm(true);
  };

  const toggleActive = async (ruleId: number) => {
    await pricingService.toggle(ruleId); fetchAll();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Cấu hình giá</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Biểu giá gửi xe theo bãi và loại xe</p>
        </div>
        <button onClick={() => { setShowForm(s => !s); setEditing(null); }}
          className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus size={15}/> Thêm quy tắc
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">{editing ? "Chỉnh sửa quy tắc" : "Thêm quy tắc giá"}</p>
            <button type="button" onClick={() => setShowForm(false)}><X size={15} className="text-zinc-500 hover:text-white"/></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500">Bãi xe</label>
              <select value={form.lotId} onChange={e => setForm(f => ({ ...f, lotId: e.target.value }))} required
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400">
                <option value="">-- Chọn bãi --</option>
                {lots.map(l => <option key={l.lotId} value={l.lotId}>{l.lotName}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500">Loại xe</label>
              <select value={form.typeId} onChange={e => setForm(f => ({ ...f, typeId: e.target.value }))}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400">
                {VEHICLE_TYPES.map(v => <option key={v.typeId} value={v.typeId}>{v.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500">Loại giờ</label>
              <select value={form.feeType} onChange={e => setForm(f => ({ ...f, feeType: e.target.value }))}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400">
                <option value="normal">Giờ thường</option>
                <option value="peak">Giờ cao điểm</option>
                <option value="overnight">Qua đêm</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500">Block (phút)</label>
              <input type="number" value={form.blockMinutes} onChange={e => setForm(f => ({ ...f, blockMinutes: e.target.value }))}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"/>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500">Giá / block (₫)</label>
              <input type="number" value={form.pricePerBlock} onChange={e => setForm(f => ({ ...f, pricePerBlock: e.target.value }))}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"/>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500">Tối đa / ngày (₫)</label>
              <input type="number" value={form.maxDailyFee} onChange={e => setForm(f => ({ ...f, maxDailyFee: e.target.value }))}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"/>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isNightFee === "true"}
              onChange={e => setForm(f => ({ ...f, isNightFee: String(e.target.checked) }))} className="rounded"/>
            <span className="text-xs text-zinc-400">Áp dụng giá đêm (22:00–06:00)</span>
          </label>
          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 rounded-lg transition-colors">
              {saving && <Loader2 size={12} className="animate-spin"/>}
              {editing ? "Cập nhật" : "Thêm quy tắc"}
            </button>
          </div>
        </form>
      )}

      <div className="flex gap-1">
        <button onClick={() => setLotFilter("all")}
          className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${lotFilter === "all" ? "bg-amber-400 text-zinc-950" : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"}`}>
          Tất cả
        </button>
        {lots.map(l => (
          <button key={l.lotId} onClick={() => setLotFilter(String(l.lotId))}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${lotFilter === String(l.lotId) ? "bg-amber-400 text-zinc-950" : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"}`}>
            {l.lotName}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-amber-400" size={24}/></div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                {["Bãi xe","Loại xe","Loại giờ","Block","Giá/block","Tối đa/ngày","Trạng thái",""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const fee = FEE_CFG[r.feeType] ?? FEE_CFG.normal;
                return (
                  <tr key={r.ruleId} className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${!r.isActive ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3 text-xs font-medium text-white">{getLotName(r.lotId)}</td>
                    <td className="px-4 py-3"><span className={`flex items-center gap-1 text-xs font-medium ${getVehicleColor(r.typeId)}`}><Car size={11}/>{getVehicleLabel(r.typeId)}</span></td>
                    <td className="px-4 py-3"><span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${fee.color}`}><fee.icon size={10}/>{fee.label}</span></td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{r.blockMinutes} phút</td>
                    <td className="px-4 py-3 text-xs font-semibold text-amber-400">{fmt(r.pricePerBlock)}</td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{fmt(r.maxDailyFee)}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full border ${r.isActive ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-zinc-500 bg-zinc-700/30 border-zinc-700"}`}>{r.isActive ? "Bật" : "Tắt"}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(r)} className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"><Edit2 size={12}/></button>
                        <button onClick={() => toggleActive(r.ruleId)} className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors"><X size={12}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
