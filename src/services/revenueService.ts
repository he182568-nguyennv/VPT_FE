import api from "../api/api";

export const revenueService = {
  get: (range: "7d" | "30d" | "90d" = "7d") =>
    api.get(`/manager/revenue?range=${range}`),
};
