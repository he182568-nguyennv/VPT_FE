import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { ParkingSquare, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(form);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center mb-3">
            <ParkingSquare size={28} className="text-zinc-950"/>
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">VPT Parking</h1>
          <p className="text-zinc-500 text-sm mt-1">Vehicle Plate Tracking System</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">Tên đăng nhập</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="manager01"
              required
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">Mật khẩu</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 pr-10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {show ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 font-semibold text-sm rounded-lg py-2.5 transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={15} className="animate-spin"/>}
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-600 mt-4">
          VPT © 2026 — Group 5
        </p>
      </div>
    </div>
  );
}
