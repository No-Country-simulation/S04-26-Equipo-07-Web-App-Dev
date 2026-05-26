import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import React from "react"
import { useNavigate } from "react-router-dom"
import { useUserAuth } from "@/contexts/UserAuthContext"

export const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useUserAuth()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(email, password)
      navigate("/dashboard")
    } catch {
      setError("Credenciales invalidas. Intenta nuevamente.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-secondary p-8 shadow-sm">

        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Bienvenido de nuevo
          </h1>

          <p className="text-sm text-muted-foreground">
            Inicia sesión para acceder al panel de control de NorthPay
          </p>
        </div>

        <form className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              Email
            </label>

            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>

            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <Button className="w-full"
            onClick={handleSubmit}
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
          <a href="register" className="text-sm text-muted-foreground">¿No tienes una cuenta? <span className="underline hover:text-primary">Registrate</span></a>
        </form>
      </div>
    </div>
  )
}