import api from "../api/api";

export const pricingService = {
  getAll: () => api.get("/manager/pricing"),
  create: (data: object) => api.post("/manager/pricing", data),
  update: (data: object) => api.post("/manager/pricing", { ...data, action: "update" }),
  toggle: (ruleId: number) => api.post("/manager/pricing", { action: "toggle", ruleId }),
};
