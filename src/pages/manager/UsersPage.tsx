import { useEffect, useState, useRef } from "react";
import { userService } from "../../services/userService";
import {
  Search, UserCheck, UserX, Shield, Users, Plus,
  X, Edit2, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff
} from "lucide-react";

interface User {
  userId: number; username: string; fullName: string;
  email: string; phone: string; roleId: number;
  role: string; isActive: boolean; createdAt: string;
}
interface Counts { all: number; manager: number; staff: number; customer: number }

const ROLE_CFG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  manager:  { label: "Manager",  color: "text-purple-400 bg-purple-400/10 border-purple-400/20", icon: Shield    },
  staff:    { label: "Staff",    color: "text-blue-400   bg-blue-400/10   border-blue-400/20",   icon: UserCheck },
  customer: { label: "Customer", color: "text-amber-400  bg-amber-400/10  border-amber-400/20",  icon: Users     },
};

type FormMode = "create" | "edit" | null;

const EMPTY_FORM = { fullName:"", username:"", email:"", phone:"", role:"customer", password:"123456" };

export default function UsersPage() {
  const [users,      setUsers]      = useState<User[]>([]);
  const [counts,     setCounts]     = useState<Counts>({ all:0, manager:0, staff:0, customer:0 });
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [formMode,   setFormMode]   = useState<FormMode>(null);
  const [editUser,   setEditUser]   = useState<User | null>(null);
  const [form,       setForm]       = useState({ ...EMPTY_FORM });
  const [saving,     setSaving]     = useState(false);
  const [showPw,     setShowPw]     = useState(false);
  const [formError,  setFormError]  = useState<string | null>(null);
  const [formOk,     setFormOk]     = useState<string | null>(null);
  const searchRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchUsers = (role = roleFilter, q = search) => {
    setLoading(true);
    userService.getAll(role !== "all" ? role : undefined, q)
      .then(res => {
        setUsers(res.data.data ?? []);
        setCounts(res.data.counts ?? { all:0, manager:0, staff:0, customer:0 });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  // Debounce search
  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => fetchUsers(roleFilter, search), 350);
    return () => { if (searchRef.current) clearTimeout(searchRef.current); };
  }, [search]);

  const handleRoleFilter = (r: string) => {
    setRoleFilter(r);
    fetchUsers(r, search);
  };

  const openCreate = () => {
    setEditUser(null);
    setForm({ ...EMPTY_FORM });
    setFormError(null); setFormOk(null);
    setFormMode("create");
  };

  const openEdit = (u: User) => {
    setEditUser(u);
    setForm({ fullName: u.fullName, username: u.username, email: u.email, phone: u.phone, role: u.role, password: "" });
    setFormError(null); setFormOk(null);
    setFormMode("edit");
  };

  const closeForm = () => { setFormMode(null); setFormError(null); setFormOk(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null); setFormOk(null); setSaving(true);
    try {
      if (formMode === "create") {
        await userService.create(form);
        setFormOk("Tạo tài khoản thành công!");
        setForm({ ...EMPTY_FORM });
      } else if (formMode === "edit" && editUser) {
        await userService.update(editUser.userId, { fullName: form.fullName, email: form.email, phone: form.phone });
        setFormOk("Cập nhật thành công!");
      }
      fetchUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? "Lỗi khi lưu");
    } finally { setSaving(false); }
  };

  const handleToggle = async (userId: number) => {
    try {
      await userService.toggleActive(userId);
      setUsers(us => us.map(u => u.userId === userId ? { ...u, isActive: !u.isActive } : u));
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Lỗi");
    }
  };

  const f = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Quản lý người dùng</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{counts.all} tài khoản</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus size={15}/> Thêm người dùng
        </button>
      </div>

      {/* Form create/edit */}
      {formMode && (
        <form onSubmit={handleSave}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-white">
              {formMode === "create" ? "Thêm tài khoản mới" : `Chỉnh sửa — ${editUser?.username}`}
            </p>
            <button type="button" onClick={closeForm}>
              <X size={15} className="text-zinc-500 hover:text-white transition-colors"/>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Tên đầy đủ */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500">Họ tên <span className="text-red-400">*</span></label>
              <input value={form.fullName} onChange={e => f("fullName", e.target.value)}
                placeholder="Nguyễn Văn A" required
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"/>
            </div>
            {/* Username (chỉ tạo mới) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500">Tên đăng nhập {formMode === "create" && <span className="text-red-400">*</span>}</label>
              <input value={form.username} onChange={e => f("username", e.target.value)}
                placeholder="user01" required={formMode === "create"}
                disabled={formMode === "edit"}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 disabled:opacity-40"
              />
            </div>
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500">Email <span className="text-red-400">*</span></label>
              <input type="email" value={form.email} onChange={e => f("email", e.target.value)}
                placeholder="user@vpt.vn" required
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"/>
            </div>
            {/* Phone */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-zinc-500">Số điện thoại</label>
              <input value={form.phone} onChange={e => f("phone", e.target.value)}
                placeholder="0901xxxxxx"
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"/>
            </div>
          </div>

          {/* Role (chỉ tạo mới) + Password (chỉ tạo mới) */}
          {formMode === "create" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500">Role</label>
                <div className="flex gap-1.5">
                  {["manager","staff","customer"].map(r => (
                    <button key={r} type="button" onClick={() => f("role", r)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border capitalize transition-colors ${
                        form.role === r
                          ? "bg-amber-400 border-amber-400 text-zinc-950"
                          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                      }`}>{r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500">Mật khẩu ban đầu</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={form.password}
                    onChange={e => f("password", e.target.value)}
                    placeholder="123456"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 pr-9 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"/>
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                    {showPw ? <EyeOff size={13}/> : <Eye size={13}/>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Feedback */}
          {formError && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-2 rounded-lg">
              <AlertCircle size={12}/>{formError}
            </div>
          )}
          {formOk && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-2 rounded-lg">
              <CheckCircle2 size={12}/>{formOk}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={closeForm}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
              Hủy
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 rounded-lg transition-colors">
              {saving && <Loader2 size={12} className="animate-spin"/>}
              {saving ? "Đang lưu..." : formMode === "create" ? "Tạo tài khoản" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      )}

      {/* Search + filter */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm tên, username, email..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"/>
        </div>
        <div className="flex gap-1">
          {(["all","manager","staff","customer"] as const).map(r => (
            <button key={r} onClick={() => handleRoleFilter(r)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors capitalize ${
                roleFilter === r
                  ? "bg-amber-400 text-zinc-950"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
              }`}>
              {r === "all" ? `Tất cả (${counts.all})` : `${r} (${counts[r]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-amber-400" size={24}/></div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                {["Người dùng","Username","Role","SĐT","Ngày tạo","Trạng thái",""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const cfg = ROLE_CFG[u.role] ?? ROLE_CFG.customer;
                return (
                  <tr key={u.userId} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-white">{u.fullName}</p>
                      <p className="text-xs text-zinc-500">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">{u.username}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border w-fit ${cfg.color}`}>
                        <cfg.icon size={10}/>{cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{u.phone || "—"}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{u.createdAt?.split(" ")[0] ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        u.isActive
                          ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                          : "text-zinc-500 bg-zinc-700/30 border-zinc-700"
                      }`}>{u.isActive ? "Hoạt động" : "Ngưng"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(u)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-amber-400 hover:bg-amber-400/10 transition-colors"
                          title="Chỉnh sửa">
                          <Edit2 size={13}/>
                        </button>
                        <button onClick={() => handleToggle(u.userId)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                            u.isActive
                              ? "text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
                              : "text-zinc-500 hover:text-emerald-400 hover:bg-emerald-400/10"
                          }`}
                          title={u.isActive ? "Vô hiệu hóa" : "Kích hoạt"}>
                          {u.isActive ? <UserX size={13}/> : <UserCheck size={13}/>}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-600 text-sm">
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
