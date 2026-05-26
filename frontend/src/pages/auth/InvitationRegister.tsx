import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authService } from '@/lib/services/user/auth.service'
import { invitationService } from '@/lib/services/worker/invitation.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(1),
  birthDate: z.string().min(1),
  documentType: z.string().min(1),
  documentNumber: z.string().min(1),
  country: z.string().min(1),
  city: z.string().min(1),
  street: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

export default function InvitationRegister() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''
  const [invitationEmail, setInvitationEmail] = useState('')
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!token) { setError('token de invitacion requerido'); return }
    invitationService.validate(token)
      .then(({ data }) => setInvitationEmail(data.email))
      .catch(() => setError('invitacion invalida o expirada'))
  }, [token])

  const onSubmit = async (values: FormValues) => {
    try {
      await authService.register({
        invitationToken: token,
        email: invitationEmail,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        birthDate: values.birthDate,
        document: { type: values.documentType, number: values.documentNumber },
        address: { country: values.country, city: values.city, street: values.street },
      })
      navigate('/register/success')
    } catch {
      setError('error al registrarse, intente nuevamente')
    }
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold">Crear cuenta</h1>
        {invitationEmail && <p className="text-sm text-muted-foreground">Cuenta para: {invitationEmail}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Nombre" {...register('firstName')} />
            <Input placeholder="Apellido" {...register('lastName')} />
          </div>
          <Input placeholder="Telefono" {...register('phone')} />
          <Input placeholder="Fecha de nacimiento" type="date" {...register('birthDate')} />
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Tipo documento (DNI/CE...)" {...register('documentType')} />
            <Input placeholder="Numero documento" {...register('documentNumber')} />
          </div>
          <Input placeholder="Pais" {...register('country')} />
          <Input placeholder="Ciudad" {...register('city')} />
          <Input placeholder="Direccion" {...register('street')} />

          {Object.keys(errors).length > 0 && (
            <p className="text-sm text-red-500">Completa todos los campos requeridos</p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
          </Button>
        </form>
      </div>
    </div>
  )
}
