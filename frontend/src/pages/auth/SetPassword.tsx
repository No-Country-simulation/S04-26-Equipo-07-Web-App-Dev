import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authService } from '@/lib/services/user/auth.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle } from 'lucide-react'

const schema = z.object({
  password: z
    .string()
    .min(8, 'minimo 8 caracteres')
    .regex(/[A-Z]/, 'debe tener una mayuscula')
    .regex(/[0-9]/, 'debe tener un numero')
    .regex(/[^A-Za-z0-9]/, 'debe tener un caracter especial'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'las contrasenas no coinciden',
  path: ['confirmPassword'],
})

type FormValues = z.infer<typeof schema>

export default function SetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await authService.setPassword({ token, ...values })
      setSuccess(true)
    } catch {
      setError('token invalido o expirado')
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="w-full max-w-sm border border-[#3c4b35] bg-[#0c1609] p-8 shadow-2xl text-center space-y-6">
          <CheckCircle size={48} className="mx-auto text-[#42ff00]" />
          <div>
            <h2 className="text-xl font-bold text-[#f0ffe4]">Contrasena cambiada</h2>
            <p className="text-sm text-[#baccaf] mt-1">Tu contrasena se ha configurado exitosamente.</p>
          </div>
          <Button
            onClick={() => navigate('/login')}
            className="w-full bg-[#42ff00] text-[#083900] font-bold hover:brightness-110"
          >
            Ir a login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Configura tu contrasena</h1>
          <p className="text-sm text-muted-foreground mt-1">Tu cuenta ha sido aprobada. Crea una contrasena segura para continuar.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input type="password" placeholder="Contrasena" {...register('password')} />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <Input type="password" placeholder="Confirmar contrasena" {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Establecer contrasena'}
          </Button>
        </form>
      </div>
    </div>
  )
}
