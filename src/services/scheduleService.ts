import api from "../api/api";

export const scheduleService = {
  getMySchedule: ()               => api.get("/staff/schedule"),
  getAll: (staffId?: number)      => api.get("/staff/schedule" + (staffId ? `?staffId=${staffId}` : "")),
  create: (data: { staffId: number; lotId: number; workDate: string; shiftStart: string; shiftEnd: string }) =>
    api.post("/staff/schedule", data),
  updateStatus: (scheduleId: number, status: string) =>
    api.post("/staff/schedule", { action: "updateStatus", scheduleId, status }),
};
