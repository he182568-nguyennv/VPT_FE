import { Navigate } from "react-router-dom";
import { authStore } from "../store/authStore";
import type { AuthUser } from "../types";

interface Props {
  children: React.ReactNode;
  allowedRoles?: AuthUser["role"][];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const user = authStore.getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (
    allowedRoles &&
    !allowedRoles.includes(
      (user.role as string).toLowerCase() as AuthUser["role"],
    )
  )
    return <Navigate to="/login" replace />;
  return <>{children}</>;
}
