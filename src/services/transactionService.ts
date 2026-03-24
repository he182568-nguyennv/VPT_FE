import api from "../api/api";

export const transactionService = {
  getMine:  () => api.get("/transactions"),
  getAll:   (params?: { lotId?: number; from?: string; to?: string }) => {
    const qs = new URLSearchParams();
    if (params?.lotId) qs.set("lotId", String(params.lotId));
    if (params?.from)  qs.set("from", params.from);
    if (params?.to)    qs.set("to",   params.to);
    return api.get("/transactions?" + qs.toString());
  },
  previewFee: (plate: string) => api.get(`/staff/checkout?plate=${encodeURIComponent(plate)}`),
};
