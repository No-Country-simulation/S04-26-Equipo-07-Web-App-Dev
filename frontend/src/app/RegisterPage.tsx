import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import registerSchema from "../stores/registerSchema"
import { register as apiRegister } from "@/lib/api/auth"
import type { z } from "zod"

type RegisterFormData = z.infer<typeof registerSchema>

export const RegisterPage = () => {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    await apiRegister({ name: data.name, email: data.email, password: data.password })
    navigate("/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-2xl border bg-secondary p-8 shadow-sm">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Crea tu cuenta
          </h1>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label htmlFor="name" className="mb-2 block text-sm font-medium">
              Nombre Completo
            </label>
            <Input id="name" type="text" placeholder="Tu nombre completo" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Correo Electrónico
            </label>
            <Input id="email" type="email" placeholder="name@company.com" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="mb-2 block text-sm font-medium">
              Contraseña
            </label>
            <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">
              Confirmar Contraseña
            </label>
            <Input id="confirmPassword" type="password" placeholder="••••••••" {...register("confirmPassword")} />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Registrando..." : "Registrarse"}
          </Button>

          <a href="/login" className="block text-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta? <span className="underline hover:text-primary">Inicia sesión</span>
          </a>
        </form>
      </div>
    </div>
  )
}