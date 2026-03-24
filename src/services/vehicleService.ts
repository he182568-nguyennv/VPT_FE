import api from "../api/api";

export const vehicleService = {
  getMine: ()                  => api.get("/customer/vehicles"),
  add: (data: { plateNumber: string; typeId: number }) =>
    api.post("/customer/vehicles", data),
  toggle: (vehicleId: number)  =>
    api.post("/customer/vehicles", { action: "toggle", vehicleId }),
  remove: (vehicleId: number)  =>
    api.post("/customer/vehicles", { action: "delete", vehicleId }),
};
