import { useEffect, useState } from "react";
import { scheduleService } from "../../services/scheduleService";
import { userService }     from "../../services/userService";
import { lotService }      from "../../services/lotService";
import { Search, Plus, Calendar, MapPin, Clock, X, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface Schedule { scheduleId:number; staffId:number; staffName:string; lotId:number; lotName:string; workDate:string; shiftStart:string; shiftEnd:string; status:string; }
interface StaffUser { userId:number; fullName:string; username:string; }
interface Lot       { lotId:number; lotName:string; }

const STATUS_CFG: Record<string, { label:string; color:string }> = {
  scheduled: { label:"Lịch làm",  color:"text-blue-400    bg-blue-400/10    border-blue-400/20"    },
  completed: { label:"Đã xong",   color:"text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  absent:    { label:"Vắng mặt",  color:"text-red-400     bg-red-400/10     border-red-400/20"     },
};

export default function StaffPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [lots,      setLots]      = useState<Lot[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [showForm,  setShowForm]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [form, setForm] = useState({ staffId:"", lotId:"", workDate:"", shiftStart:"", shiftEnd:"" });

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      scheduleService.getAll(),
      userService.getAll(),
      lotService.getAll(),
    ]).then(([schRes, userRes, lotRes]) => {
      setSchedules(schRes.data.data ?? []);
      setStaffList((userRes.data.data ?? []).filter((u: any) => u.role === "staff"));
      setLots(lotRes.data.data ?? []);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = schedules.filter(s =>
    s.staffName.toLowerCase().includes(search.toLowerCase()) ||
    s.lotName.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await scheduleService.create({
        staffId:    +form.staffId,
        lotId:      +form.lotId,
        workDate:   form.workDate,
        shiftStart: form.shiftStart,
        shiftEnd:   form.shiftEnd,
      });
      setForm({ staffId:"", lotId:"", workDate:"", shiftStart:"", shiftEnd:"" });
      setShowForm(false);
      fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Lỗi lưu lịch");
    } finally { setSaving(false); }
  };

  const updateStatus = async (scheduleId: number, status: string) => {
    await scheduleService.updateStatus(scheduleId, status);
    fetchAll();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Quản lý nhân viên</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Lịch làm việc và trạng thái nhân viên</p>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus size={15}/> Phân ca
        </button>
      </div>

      {/* Staff overview */}
      <div className={`grid gap-3 ${staffList.length > 0 ? `grid-cols-${Math.min(staffList.length, 3)}` : ""}`}
        style={{ gridTemplateColumns: `repeat(${Math.min(staffList.length, 3)}, 1fr)` }}>
        {staffList.map(s => (
          <div key={s.userId} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-zinc-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-white">{s.fullName[0]}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{s.fullName}</p>
              <p className="text-xs text-zinc-500">{s.username}</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"/>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Phân ca làm việc</p>
            <button type="button" onClick={() => setShowForm(false)}><X size={15} className="text-zinc-500 hover:text-white"/></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500">Nhân viên</label>
              <select value={form.staffId} onChange={e => setForm(f => ({ ...f, staffId: e.target.value }))} required
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400">
                <option value="">-- Chọn nhân viên --</option>
                {staffList.map(s => <option key={s.userId} value={s.userId}>{s.fullName}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500">Bãi xe</label>
              <select value={form.lotId} onChange={e => setForm(f => ({ ...f, lotId: e.target.value }))} required
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400">
                <option value="">-- Chọn bãi --</option>
                {lots.map(l => <option key={l.lotId} value={l.lotId}>{l.lotName}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500">Ngày làm</label>
              <input type="date" value={form.workDate} onChange={e => setForm(f => ({ ...f, workDate: e.target.value }))} required
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"/>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["shiftStart","shiftEnd"] as const).map(k => (
                <div key={k} className="flex flex-col gap-1">
                  <label className="text-xs text-zinc-500">{k === "shiftStart" ? "Bắt đầu" : "Kết thúc"}</label>
                  <input type="time" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} required
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"/>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 rounded-lg transition-colors">
              {saving && <Loader2 size={12} className="animate-spin"/>} Lưu lịch
            </button>
          </div>
        </form>
      )}

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"/>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm nhân viên, bãi xe..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"/>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-amber-400" size={24}/></div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(s => {
            const cfg = STATUS_CFG[s.status] ?? STATUS_CFG.scheduled;
            return (
              <div key={s.scheduleId} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                <div className="w-9 h-9 bg-zinc-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-white">{s.staffName?.[0] ?? "?"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white">{s.staffName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-zinc-500"><Calendar size={10}/>{s.workDate}</span>
                    <span className="flex items-center gap-1 text-xs text-zinc-500"><Clock size={10}/>{s.shiftStart}–{s.shiftEnd}</span>
                    <span className="flex items-center gap-1 text-xs text-zinc-500"><MapPin size={10}/>{s.lotName}</span>
                  </div>
                </div>
                {s.status === "scheduled" && (
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => updateStatus(s.scheduleId, "completed")}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-emerald-400/10 text-zinc-500 hover:text-emerald-400 transition-colors" title="Hoàn thành">
                      <CheckCircle2 size={15}/>
                    </button>
                    <button onClick={() => updateStatus(s.scheduleId, "absent")}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-400/10 text-zinc-500 hover:text-red-400 transition-colors" title="Vắng mặt">
                      <XCircle size={15}/>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && <div className="text-center py-10 text-zinc-600 text-sm">Không có lịch làm việc</div>}
        </div>
      )}
    </div>
  );
}
