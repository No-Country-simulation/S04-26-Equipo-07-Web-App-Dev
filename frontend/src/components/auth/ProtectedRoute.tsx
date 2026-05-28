import { Navigate } from "react-router-dom"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const userToken = localStorage.getItem("user_token")
  const workerToken = localStorage.getItem("worker_token")
  if (!userToken && !workerToken) return <Navigate to="/login" replace />
  return <>{children}</>
}
