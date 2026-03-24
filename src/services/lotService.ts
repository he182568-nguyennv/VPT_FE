import api from "../api/api";

export const lotService = {
  getAll: () => api.get("/manager/lots"),
  create: (data: { lotName: string; address: string; capacity: number }) =>
    api.post("/manager/lots", data),
  update: (data: { action: "update"; lotId: number; lotName?: string; address?: string; capacity?: number }) =>
    api.post("/manager/lots", data),
};
