import api from "../api/api";

export const parkingService = {
  checkIn: (data: {
    plateNumber: string;
    lotId: number;
    cardId: number;
    vehicleImgIn?: string;
  }) => api.post("/staff/checkin", data),

  checkOut: (data: {
    plateNumber: string;
    vehicleImgOut?: string;
    paymentMethod: string;
  }) => api.post("/staff/checkout", data),

  /** Lấy danh sách thẻ — dùng cho dropdown trong CheckInPage */
  getCards: (lotId?: number) =>
    api.get("/staff/cards" + (lotId ? `?lotId=${lotId}` : "")),

  getLots: () => api.get("/staff/lots"),
};
