import api from "../api/api";

export const reportService = {
  getAll:        ()                        => api.get("/reports"),
  getMyReports:  ()                        => api.get("/reports?mine=1"),
  create: (data: {
    vehicleId:   number;
    sessionId:   number;
    reportType:  string;
    reporterName:  string;
    reporterPhone: string;
    description: string;
    imgUrl?:     string;
    action:      "create";
  }) => api.post("/reports", data),
  createLostCard: (data: {
    sessionId:    number;
    guestName:    string;
    guestPhone:   string;
    guestCccd:    string;
    incidentType: string;
    internalNote?: string;
    action:       "create";
  }) => api.post("/reports", data),
  approve: (data: {
    reportId:  number;
    decision:  string;
    note:      string;
    action:    "approve";
  }) => api.post("/reports", data),
};
