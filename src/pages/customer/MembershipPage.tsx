import { useEffect, useState } from "react";
import { membershipService } from "../../services/membershipService";
import {
  CheckCircle2,
  Crown,
  Zap,
  Star,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface MembershipPlan {
  planId: number;
  name: string;
  durationDays: number;
  price: number;
  discountPct: number;
}
interface ActiveMembership {
  membershipId: number;
  planId: number;
  startDate: string;
  endDate: string;
  status: string;
}

const PLAN_ICONS = [Zap, Star, Crown];
const PLAN_HIGHLIGHTS = [false, true, false];

export default function MembershipPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [active, setActive] = useState<ActiveMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    membershipService
      .get()
      .then((res) => {
        setPlans(res.data.plans ?? []);
        setActive(res.data.active ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegister = async () => {
    if (!selected) return;
    setSaving(true);
    setApiError(null);
    try {
      await membershipService.register(selected);
      setSuccess(true);
      setSelected(null);
      fetchData();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setApiError(err.response?.data?.message ?? "Đăng ký thất bại");
    } finally {
      setSaving(false);
    }
  };

  // Tính số ngày còn lại từ endDate
  const daysLeft = (endDate: string) => {
    const diff = Math.floor(
      (new Date(endDate).getTime() - Date.now()) / 86400000,
    );
    return Math.max(0, diff);
  };

  // Tổng thời hạn plan hiện tại
  const activePlan = plans.find((p) => p.planId === active?.planId);
  const totalDays = activePlan?.durationDays ?? 30;
  const remaining = active ? daysLeft(active.endDate) : 0;

  if (loading)
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-amber-400" size={24} />
      </div>
    );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-white">Membership</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Đăng ký gói thành viên để nhận ưu đãi
        </p>
      </div>

      {/* Gói hiện tại */}
      {active ? (
        <div className="bg-gradient-to-r from-amber-400/10 to-amber-400/5 border border-amber-400/20 rounded-2xl p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-amber-400/70 font-medium mb-1">
                Gói hiện tại
              </p>
              <p className="font-bold text-white text-base">
                {activePlan?.name ?? "Membership"}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {active.startDate} → {active.endDate}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-amber-400">{remaining}</p>
              <p className="text-xs text-zinc-500">ngày còn lại</p>
            </div>
          </div>
          <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all"
              style={{ width: `${Math.round((remaining / totalDays) * 100)}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center">
          <p className="text-sm text-zinc-500">
            Bạn chưa có gói membership nào đang hoạt động.
          </p>
        </div>
      )}

      {/* Danh sách gói */}
      <div>
        <p className="text-sm font-semibold text-white mb-4">
          {active ? "Gia hạn hoặc nâng cấp gói" : "Chọn gói đăng ký"}
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan, idx) => {
            const Icon = PLAN_ICONS[idx % PLAN_ICONS.length];
            const highlight = PLAN_HIGHLIGHTS[idx % PLAN_HIGHLIGHTS.length];
            const isSelected = selected === plan.planId;
            return (
              <div
                key={plan.planId}
                onClick={() => setSelected(isSelected ? null : plan.planId)}
                className={`relative bg-zinc-900 border-2 rounded-2xl p-5 cursor-pointer transition-all ${
                  isSelected
                    ? "border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.15)]"
                    : highlight
                      ? "border-amber-400/40 hover:border-amber-400/70"
                      : "border-zinc-700 hover:border-zinc-500"
                }`}
              >
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-zinc-950 text-xs font-bold px-3 py-0.5 rounded-full">
                    Phổ biến nhất
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <Icon
                    size={20}
                    className={isSelected ? "text-amber-400" : "text-zinc-500"}
                  />
                  {isSelected && (
                    <CheckCircle2 size={18} className="text-amber-400" />
                  )}
                </div>
                <p className="font-bold text-white text-sm">{plan.name}</p>
                <p className="text-xs text-zinc-500 mb-3">
                  {plan.durationDays} ngày
                </p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-xl font-black text-white">
                    {plan.price.toLocaleString("vi-VN")}₫
                  </span>
                  <span className="text-xs text-emerald-400 font-medium">
                    −{plan.discountPct}%
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  Giảm {plan.discountPct}% phí gửi xe
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      {selected && (
        <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <div>
            <p className="text-sm font-semibold text-white">
              {plans.find((p) => p.planId === selected)?.name}
            </p>
            <p className="text-xs text-zinc-500">
              {plans
                .find((p) => p.planId === selected)
                ?.price.toLocaleString("vi-VN")}
              ₫ · {plans.find((p) => p.planId === selected)?.durationDays} ngày
            </p>
          </div>
          <button
            onClick={handleRegister}
            disabled={saving}
            className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 font-bold text-sm px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Đang đăng ký..." : "Đăng ký ngay"}
          </button>
        </div>
      )}

      {apiError && (
        <div className="flex items-center gap-2 bg-red-400/10 border border-red-400/20 text-red-400 text-sm px-4 py-3 rounded-xl">
          <AlertCircle size={15} />
          {apiError}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-sm px-4 py-3 rounded-xl">
          <CheckCircle2 size={15} /> Đăng ký thành công! Gói của bạn đã được
          kích hoạt.
        </div>
      )}
    </div>
  );
}
