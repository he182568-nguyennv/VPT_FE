import api from "../api/api";
export const managerService = {
  getDashboard: () => api.get("/manager/dashboard"),
};
