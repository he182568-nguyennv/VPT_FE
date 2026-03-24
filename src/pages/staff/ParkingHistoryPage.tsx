import { useEffect, useState } from "react";
import { sessionService } from "../../services/sessionService";
import { Search, Car, Clock, MapPin, ScanLine, CheckCircle, Loader2 } from "lucide-react";

interface Session { sessionId:number; vehicleId:number; lotId:number; plateNumber:string; checkinTime:string; checkoutTime:string|null; status:string; }

export default function ParkingHistoryPage() {
  const [sessions,  setSessions]  = useState<Session[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState<"all"|"active"|"completed">("all");

  const fetchSessions = (f: typeof filter, s: string) => {
    setLoading(true);
    sessionService.getAll({ status: f === "all" ? undefined : f, plate: s || undefined })
      .then(res => setSessions(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSessions("all", ""); }, []);

  const handleSearch = () => fetchSessions(filter, search);

  const activeCount    = sessions.filter(s => s.status === "active").length;
  const completedCount = sessions.filter(s => s.status === "completed").length;

  const filtered = sessions.filter(s => {
    const matchSearch = !search || s.plateNumber.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || s.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Thông tin xe</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Tra cứu xe đang gửi và lịch sử</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-400/10 border border-blue-400/20 rounded-xl p-4">
          <p className="text-2xl font-black text-blue-400">{activeCount}</p>
          <p className="text-xs text-zinc-400 mt-0.5">Xe đang trong bãi</p>
        </div>
        <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-xl p-4">
          <p className="text-2xl font-black text-emerald-400">{completedCount}</p>
          <p className="text-xs text-zinc-400 mt-0.5">Đã check-out hôm nay</p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <ScanLine size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Tìm biển số xe..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 font-mono"/>
        </div>
        <div className="flex gap-1">
          {(["all","active","completed"] as const).map(f => (
            <button key={f} onClick={() => { setFilter(f); fetchSessions(f, search); }}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                filter === f ? "bg-amber-400 text-zinc-950" : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              }`}>{f === "all" ? "Tất cả" : f === "active" ? "Đang gửi" : "Đã ra"}</button>
          ))}
        </div>
        <button onClick={handleSearch}
          className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-xl transition-colors">
          <Search size={13}/> Tìm
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-amber-400" size={24}/></div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(s => (
            <div key={s.sessionId} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${s.status === "active" ? "bg-blue-400/10 text-blue-400" : "bg-zinc-800 text-zinc-400"}`}>
                <Car size={18}/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-white text-sm">{s.plateNumber}</span>
                  {s.status === "active"
                    ? <span className="flex items-center gap-1 text-xs text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"/> Đang gửi</span>
                    : <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full"><CheckCircle size={10}/> Đã ra</span>
                  }
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-zinc-500"><MapPin size={10}/> Bãi #{s.lotId}</span>
                  <span className="flex items-center gap-1 text-xs text-zinc-500"><Clock size={10}/>{s.checkinTime}{s.checkoutTime ? ` → ${s.checkoutTime}` : ""}</span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-12 text-zinc-600">
              <Search size={28} className="mb-2"/><p className="text-sm">Không tìm thấy kết quả</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
