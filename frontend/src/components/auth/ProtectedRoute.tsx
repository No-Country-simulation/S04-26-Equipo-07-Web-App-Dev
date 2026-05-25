import { Navigate } from "react-router-dom"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const auth = localStorage.getItem("auth")
  if (auth !== "true") return <Navigate to="/login" replace />
  return <>{children}</>
}
