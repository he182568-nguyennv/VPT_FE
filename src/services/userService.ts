import api from "../api/api";

export const userService = {
  getAll: (role?: string, search?: string) => {
    const qs = new URLSearchParams();
    if (role && role !== "all") qs.set("role", role);
    if (search && search.trim()) qs.set("search", search.trim());
    const query = qs.toString();
    return api.get("/manager/users" + (query ? "?" + query : ""));
  },
  create: (data: {
    username: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    password?: string;
  }) => api.post("/manager/users", data),

  update: (
    userId: number,
    data: { fullName?: string; email?: string; phone?: string },
  ) => api.put("/manager/users", { userId, ...data }),

  toggleActive: (userId: number) =>
    api.post("/manager/users", { action: "toggleActive", userId }),
};
