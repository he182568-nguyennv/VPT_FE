import api from "../api/api";
import type { AuthUser } from "../types";

export interface LoginPayload { username: string; password: string; }
export interface LoginResponse {
  success: boolean; token: string; message?: string;
  userId: number; username: string; fullName: string;
  email: string; phone: string; roleId: number;
  role: AuthUser["role"];
}

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>("/login", payload),
  logout: () => api.post("/logout"),
};
