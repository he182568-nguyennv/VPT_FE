import { useState, useEffect } from "react";
import { parkingService } from "../../services/parkingService";
import { ScanLine, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface Lot {
  lotId: number;
  lotName: string;
  capacity: number;
  currentCount: number;
}
interface Card {
  cardId: number;
  cardCode: string;
  lotId: number;
}

export default function CheckInPage() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [form, setForm] = useState({ plateNumber: "", lotId: 0, cardId: 0 });
  const [loading, setLoading] = useState(false);
  const [initLoad, setInitLoad] = useState(true);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    sessionId?: number;
  } | null>(null);

  useEffect(() => {
    Promise.all([parkingService.getLots(), parkingService.getCards()])
      .then(([lotsRes, cardsRes]) => {
        const lotList = lotsRes.data.data ?? [];
        const cardList = cardsRes.data.data ?? [];
        setLots(lotList);
        setCards(cardList);
        if (lotList.length > 0)
          setForm((f) => ({ ...f, lotId: lotList[0].lotId }));
        if (cardList.length > 0)
          setForm((f) => ({ ...f, cardId: cardList[0].cardId }));
      })
      .catch(console.error)
      .finally(() => setInitLoad(false));
  }, []);

  const availableCards = cards.filter(
    (c) => !form.lotId || c.lotId === form.lotId,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await parkingService.checkIn({
        plateNumber: form.plateNumber,
        lotId: form.lotId,
        cardId: form.cardId,
      });
      setResult({ success: true, sessionId: res.data.sessionId });
      setForm((f) => ({ ...f, plateNumber: "" }));
    } catch (err: any) {
      setResult({
        success: false,
        message: err.response?.data?.message ?? "Lỗi server",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initLoad)
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-amber-400" size={24} />
      </div>
    );

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <div>
        <h1 className="text-xl font-bold text-white">Check-in xe</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Nhập thông tin xe vào bãi
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-400">
            Biển số xe
          </label>
          <div className="relative">
            <ScanLine
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
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
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 font-mono tracking-widest transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">Bãi xe</label>
            <select
              value={form.lotId}
              onChange={(e) => {
                const lid = +e.target.value;
                setForm((f) => ({ ...f, lotId: lid, cardId: 0 }));
              }}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
            >
              {lots.map((l) => (
                <option key={l.lotId} value={l.lotId}>
                  {l.lotName} ({l.currentCount}/{l.capacity})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">Mã thẻ</label>
            <select
              value={form.cardId}
              onChange={(e) =>
                setForm((f) => ({ ...f, cardId: +e.target.value }))
              }
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
            >
              {availableCards.length === 0 ? (
                <option value={0}>-- Không có thẻ --</option>
              ) : (
                availableCards.map((c) => (
                  <option key={c.cardId} value={c.cardId}>
                    {c.cardCode}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {result && (
          <div
            className={`flex items-start gap-2 px-3 py-2.5 rounded-lg border text-xs ${
              result.success
                ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400"
                : "bg-red-400/10 border-red-400/20 text-red-400"
            }`}
          >
            {result.success ? (
              <>
                <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0" />
                Check-in thành công! Session #{result.sessionId}
              </>
            ) : (
              <>
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                {result.message}
              </>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !form.plateNumber || !form.lotId || !form.cardId}
          className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 font-semibold text-sm rounded-lg py-2.5 flex items-center justify-center gap-2 transition-colors"
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          {loading ? "Đang xử lý..." : "Check-in"}
        </button>
      </form>
    </div>
  );
}
