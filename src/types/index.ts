export interface AuthUser {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  roleId: number;
  role: "manager" | "staff" | "customer";
}

export interface ParkingSession {
  sessionId: number;
  vehicleId: number;
  lotId: number;
  cardId: number;
  plateNumber: string;
  checkinTime: string;
  checkoutTime?: string;
  status: "active" | "completed" | "reported";
}

export interface Report {
  reportId: number;
  reporterId: number;
  vehicleId: number;
  sessionId: number;
  reporterName: string;
  reporterPhone: string;
  reportType: "lost_vehicle" | "lost_card";
  notes: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface StaffSchedule {
  scheduleId: number;
  staffId: number;
  lotId: number;
  workDate: string;
  shiftStart: string;
  shiftEnd: string;
  status: "scheduled" | "completed" | "absent";
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}
