import api from "../api/api";

export const sessionService = {
  getAll: (params?: { status?: string; lotId?: number; plate?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.lotId)  qs.set("lotId",  String(params.lotId));
    if (params?.plate)  qs.set("plate",  params.plate);
    return api.get("/staff/sessions?" + qs.toString());
  },
};
