import { useEffect, useState } from "react";
import { scheduleService } from "../../services/scheduleService";
import { Calendar, Loader2, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

interface Schedule { scheduleId:number; staffId:number; lotId:number; lotName:string; workDate:string; shiftStart:string; shiftEnd:string; status:string; }

const STATUS_CFG: Record<string, { label:string; color:string }> = {
  scheduled: { label:"Lịch làm",  color:"text-blue-400    bg-blue-400/10    border-blue-400/20"    },
  completed: { label:"Đã xong",   color:"text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  absent:    { label:"Vắng mặt",  color:"text-red-400     bg-red-400/10     border-red-400/20"     },
};
const MONTHS = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear,  setViewYear]  = useState(new Date().getFullYear());

  useEffect(() => {
    scheduleService.getMySchedule()
      .then(res => setSchedules(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const datesWithSchedule = new Set(schedules.map(s => s.workDate));
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const days        = Array.from({ length: firstDay }, () => null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  const today       = new Date().getDate();
  const isCurrentMonth = viewMonth === new Date().getMonth() && viewYear === new Date().getFullYear();
  const padDate     = (d: number) => `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

  const schedulesThisMonth = schedules.filter(s => s.workDate.startsWith(`${viewYear}-${String(viewMonth+1).padStart(2,"0")}`));

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-amber-400" size={24}/></div>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Lịch làm việc</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Ca làm việc của bạn</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label:"Ca tháng này",   value: schedulesThisMonth.length,                               color:"text-white"        },
          { label:"Đã hoàn thành",  value: schedulesThisMonth.filter(s=>s.status==="completed").length, color:"text-emerald-400" },
          { label:"Sắp tới",        value: schedulesThisMonth.filter(s=>s.status==="scheduled").length, color:"text-blue-400"    },
        ].map(s => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => { if (viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            <ChevronLeft size={16}/>
          </button>
          <p className="text-sm font-semibold text-white">{MONTHS[viewMonth]} {viewYear}</p>
          <button onClick={() => { if (viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            <ChevronRight size={16}/>
          </button>
        </div>
        <div className="grid grid-cols-7 mb-2">
          {["CN","T2","T3","T4","T5","T6","T7"].map(d => (
            <div key={d} className="text-center text-xs text-zinc-600 py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            if (!d) return <div key={`e${i}`}/>;
            const dateStr  = padDate(d);
            const hasShift = datesWithSchedule.has(dateStr);
            const isToday  = isCurrentMonth && d === today;
            return (
              <div key={d} className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-colors ${
                isToday  ? "bg-amber-400 text-zinc-950 font-bold" :
                hasShift ? "bg-blue-400/15 text-blue-300 border border-blue-400/20" : "text-zinc-500 hover:bg-zinc-800"
              }`}>
                {d}
                {hasShift && !isToday && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-400"/>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Ca tháng này</p>
        {schedulesThisMonth.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-zinc-600">
            <Calendar size={28} className="mb-2"/><p className="text-xs">Không có ca làm việc</p>
          </div>
        ) : schedulesThisMonth.map(s => {
          const cfg = STATUS_CFG[s.status] ?? STATUS_CFG.scheduled;
          return (
            <div key={s.scheduleId} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar size={16} className="text-zinc-400"/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-white">{s.workDate}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-zinc-500"><Clock size={11}/>{s.shiftStart} – {s.shiftEnd}</span>
                  <span className="flex items-center gap-1 text-xs text-zinc-500"><MapPin size={11}/>{s.lotName}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
