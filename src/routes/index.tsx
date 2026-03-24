import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute             from "../components/ProtectedRoute";
import AppLayout                  from "../components/AppLayout";
import LandingPage                from "../pages/landing/LandingPage";
import LoginPage                  from "../pages/auth/LoginPage";
import PaymentResultPage          from "../pages/payment/PaymentResultPage";

import DashboardPage              from "../pages/manager/DashboardPage";
import RevenuePage                from "../pages/manager/RevenuePage";
import TransactionsPage           from "../pages/manager/TransactionsPage";
import ManagerReportsPage         from "../pages/manager/ReportsPage";
import UsersPage                  from "../pages/manager/UsersPage";
import StaffPage                  from "../pages/manager/StaffPage";
import ParkingLotsPage            from "../pages/manager/ParkingLotsPage";
import PricingRulesPage           from "../pages/manager/PricingRulesPage";

import CheckInPage                from "../pages/staff/CheckInPage";
import CheckOutPage               from "../pages/staff/CheckOutPage";
import SchedulePage               from "../pages/staff/SchedulePage";
import CreateReportPage           from "../pages/staff/CreateReportPage";
import ParkingHistoryPage         from "../pages/staff/ParkingHistoryPage";

import VehiclesPage               from "../pages/customer/VehiclesPage";
import MembershipPage             from "../pages/customer/MembershipPage";
import TransactionHistoryPage     from "../pages/customer/TransactionHistoryPage";
import CustomerReportsPage        from "../pages/customer/CustomerReportsPage";

export const router = createBrowserRouter([
  { path: "/",              element: <LandingPage />        },
  { path: "/login",         element: <LoginPage />          },
  { path: "/payment/result",element: <PaymentResultPage />  },

  {
    path: "/manager",
    element: <ProtectedRoute allowedRoles={["manager"]}><AppLayout /></ProtectedRoute>,
    children: [
      { index: true,            element: <Navigate to="dashboard" replace /> },
      { path: "dashboard",      element: <DashboardPage />      },
      { path: "revenue",        element: <RevenuePage />        },
      { path: "transactions",   element: <TransactionsPage />   },
      { path: "reports",        element: <ManagerReportsPage /> },
      { path: "users",          element: <UsersPage />          },
      { path: "staff",          element: <StaffPage />          },
      { path: "lots",           element: <ParkingLotsPage />    },
      { path: "pricing",        element: <PricingRulesPage />   },
    ],
  },
  {
    path: "/staff",
    element: <ProtectedRoute allowedRoles={["staff"]}><AppLayout /></ProtectedRoute>,
    children: [
      { index: true,       element: <Navigate to="checkin" replace /> },
      { path: "checkin",   element: <CheckInPage />        },
      { path: "checkout",  element: <CheckOutPage />       },
      { path: "vehicles",  element: <ParkingHistoryPage /> },
      { path: "schedule",  element: <SchedulePage />       },
      { path: "reports",   element: <CreateReportPage />   },
    ],
  },
  {
    path: "/customer",
    element: <ProtectedRoute allowedRoles={["customer"]}><AppLayout /></ProtectedRoute>,
    children: [
      { index: true,          element: <Navigate to="vehicles" replace /> },
      { path: "vehicles",     element: <VehiclesPage />            },
      { path: "membership",   element: <MembershipPage />          },
      { path: "transactions", element: <TransactionHistoryPage />  },
      { path: "reports",      element: <CustomerReportsPage />     },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
