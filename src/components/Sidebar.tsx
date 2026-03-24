import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { cn } from "../lib/utils";
import {
  LayoutDashboard, LogIn, LogOut, FileText, Calendar,
  Car, Users, ParkingSquare, TrendingUp, UserCog,
  DollarSign, History, CreditCard, Receipt
} from "lucide-react";

const managerLinks = [
  { to: "/manager/dashboard",    label: "Dashboard",        icon: LayoutDashboard },
  { to: "/manager/revenue",      label: "Doanh thu",        icon: TrendingUp      },
  { to: "/manager/transactions", label: "Giao dịch",        icon: Receipt         },
  { to: "/manager/reports",      label: "Duyệt report",     icon: FileText        },
  { to: "/manager/users",        label: "Người dùng",       icon: Users           },
  { to: "/manager/staff",        label: "Nhân viên",        icon: UserCog         },
  { to: "/manager/lots",         label: "Bãi đỗ xe",        icon: ParkingSquare   },
  { to: "/manager/pricing",      label: "Cấu hình giá",     icon: DollarSign      },
];

const staffLinks = [
  { to: "/staff/checkin",  label: "Check-in",       icon: LogIn    },
  { to: "/staff/checkout", label: "Check-out",      icon: LogOut   },
  { to: "/staff/vehicles", label: "Thông tin xe",   icon: History  },
  { to: "/staff/schedule", label: "Lịch làm việc",  icon: Calendar },
  { to: "/staff/reports",  label: "Tạo report",     icon: FileText },
];

const customerLinks = [
  { to: "/customer/vehicles",     label: "Xe của tôi",     icon: Car        },
  { to: "/customer/membership",   label: "Membership",     icon: CreditCard },
  { to: "/customer/transactions", label: "Lịch sử TT",     icon: Receipt    },
  { to: "/customer/reports",      label: "Báo cáo",        icon: FileText   },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const links =
    user?.role === "manager" ? managerLinks :
    user?.role === "staff"   ? staffLinks   : customerLinks;

  return (
    <aside className="w-60 min-h-screen bg-zinc-950 text-zinc-100 flex flex-col border-r border-zinc-800 flex-shrink-0">
      <div className="px-6 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <ParkingSquare className="text-amber-400" size={20}/>
          <span className="font-bold text-base tracking-tight">VPT Parking</span>
        </div>
        <p className="text-xs text-zinc-500 mt-1 capitalize">{user?.role} · {user?.fullName}</p>
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              isActive
                ? "bg-amber-400 text-zinc-950 font-semibold"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            )}>
            <Icon size={15}/> {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-500 truncate mb-2">{user?.fullName}</p>
        <button onClick={logout}
          className="w-full flex items-center gap-2 text-xs text-zinc-500 hover:text-red-400 transition-colors py-1.5">
          <LogOut size={13}/> Đăng xuất
        </button>
      </div>
    </aside>
  );
}
