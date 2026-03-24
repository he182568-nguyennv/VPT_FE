import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authStore } from "../store/authStore";
import type { AuthUser } from "../types";
import api from "../api/api";

interface LoginPayload {
  username: string;
  password: string;
}
interface LoginResponse {
  success: boolean;
  token: string;
  message?: string;
  userId: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  roleId: number;
  role: AuthUser["role"];
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(authStore.getUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorage = () => setUser(authStore.getUser());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post<LoginResponse>("/login", payload);
      if (!data.success) {
        setError(data.message ?? "Đăng nhập thất bại");
        return;
      }

      console.log(data);
      const authUser: AuthUser = {
        userId: data.userId,
        username: data.username,
        fullName: data.fullName,
        email: data.email ?? "",
        phone: data.phone ?? "",
        roleId: data.roleId,
        role: (data.role as string).toLowerCase() as AuthUser["role"],
      };
      authStore.setAuth(data.token, authUser);
      setUser(authUser);

      switch (authUser.role) {
        case "manager":
          navigate("/manager/dashboard");
          break;
        case "staff":
          navigate("/staff/checkin");
          break;
        case "customer":
          navigate("/customer/vehicles");
          break;
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch {
      /* ignore */
    } finally {
      authStore.clear();
      setUser(null);
      navigate("/login");
    }
  };

  const isRole = (...roles: AuthUser["role"][]) =>
    user ? roles.includes(user.role) : false;

  return {
    user,
    loading,
    error,
    isLoggedIn: !!user,
    isManager: isRole("manager"),
    isStaff: isRole("staff"),
    isCustomer: isRole("customer"),
    login,
    logout,
  };
}
