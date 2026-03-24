import type { AuthUser } from "../types";

export type { AuthUser };

export const authStore = {
  getToken: () => localStorage.getItem("token"),
  getUser: (): AuthUser | null => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  },
  setAuth: (token: string, user: AuthUser) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  },
  getRole: (): AuthUser["role"] | null => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u).role : null;
  },
  isLoggedIn: () => !!localStorage.getItem("token"),
};
