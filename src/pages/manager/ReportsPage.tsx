import { useEffect, useState } from "react";
import { reportService } from "../../services/reportService";
import type { Report } from "../../types";
import { CheckCircle, XCircle, Loader2, FileWarning } from "lucide-react";

export default function ManagerReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  const fetchReports = () => {
    setLoading(true);
    reportService.getAll()
      .then(res => setReports(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, []);

  const handleApprove = async (reportId: number, decision: "approved" | "rejected") => {
    setProcessing(reportId);
    try {
      await reportService.approve({ reportId, decision, note: "", action: "approve" });
      fetchReports();
    } finally { setProcessing(null); }
  };

  const badge = (status: string) => {
    const map: Record<string, string> = {
      pending:  "bg-amber-400/10 text-amber-400 border-amber-400/20",
      approved: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
      rejected: "bg-red-400/10 text-red-400 border-red-400/20",
    };
    return map[status] ?? "";
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Duyệt report</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Các báo cáo đang chờ xử lý</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-amber-400" size={24}/></div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-zinc-600">
          <FileWarning size={36} className="mb-2"/>
          <p className="text-sm">Không có report nào</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map(r => (
            <div key={r.reportId} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badge(r.status)}`}>
                      {r.status}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {r.reportType === "lost_vehicle" ? "Mất xe" : "Mất thẻ"}
                    </span>
                  </div>
                  <p className="text-sm text-white font-medium mt-1">{r.reporterName}</p>
                  <p className="text-xs text-zinc-500">{r.notes}</p>
                  <p className="text-xs text-zinc-600 mt-1">{r.createdAt}</p>
                </div>

                {r.status === "pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(r.reportId, "approved")}
                      disabled={processing === r.reportId}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-400 text-xs rounded-lg border border-emerald-400/20 transition-colors"
                    >
                      <CheckCircle size={13}/> Duyệt
                    </button>
                    <button
                      onClick={() => handleApprove(r.reportId, "rejected")}
                      disabled={processing === r.reportId}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-400/10 hover:bg-red-400/20 text-red-400 text-xs rounded-lg border border-red-400/20 transition-colors"
                    >
                      <XCircle size={13}/> Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
