import api from "../api/api";

export const membershipService = {
  get: ()                  => api.get("/customer/membership"),
  register: (planId: number) => api.post("/customer/membership", { planId }),
};
