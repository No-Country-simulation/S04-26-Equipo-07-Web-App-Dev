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
    <div className="min-h-screen flex items-center justify-center bg-[#0c1609] px-4">
      <div className="w-full max-w-md border border-[#3c4b35] bg-[#182214] p-8">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="font-mono text-3xl font-bold uppercase tracking-widest text-[#f0ffe4]">
            Acceso Usuario
          </h1>

          <p className="font-mono text-[11px] uppercase tracking-wider text-[#baccaf]">
            Inicia sesion para acceder al panel NorthPay
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-[#baccaf]"
            >
              Email
            </label>

            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="border-[#3c4b35] bg-[#232d1e] font-mono text-[#dae6d0] placeholder:text-[#3c4b35] focus-visible:ring-0 focus-visible:border-[#42ff00]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-[#baccaf]"
            >
              Password
            </label>

            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-[#3c4b35] bg-[#232d1e] font-mono text-[#dae6d0] placeholder:text-[#3c4b35] focus-visible:ring-0 focus-visible:border-[#42ff00]"
            />
          </div>
          {error && (
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#ffb4ab]">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full border border-[#42ff00] bg-[#42ff00] font-mono text-[11px] uppercase tracking-wider text-[#083900] hover:brightness-110">
            {loading ? "Iniciando sesion..." : "Iniciar Sesion"}
          </Button>
          <a href="/register" className="block text-center font-mono text-[10px] uppercase tracking-wider text-[#baccaf] hover:text-[#42ff00]">
            No tienes cuenta? <span className="underline">Registrate</span>
          </a>
        </form>
      </div>
    </div>
  )
}