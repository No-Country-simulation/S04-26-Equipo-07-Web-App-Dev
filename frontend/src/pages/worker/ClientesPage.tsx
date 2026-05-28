import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { invitationService } from '@/lib/services/worker/invitation.service'
import { personaService } from '@/lib/services/worker/persona.service'
import type { AxiosError } from 'axios'

type Persona = {
  id: string
  firstName: string
  lastName: string
  email: string
  status: string
  credits: number
  createdAt?: string
}

type Invitation = {
  id: string
  email: string
  status: 'pending' | 'used' | 'expired' | 'cancelled' | 'completed' | 'resend'
  token: string
  invitedBy: string
  expiresAt: string
  createdAt: string
}

export default function ClientesPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [email, setEmail] = useState('')
  const [search, setSearch] = useState('')
  const [inviteError, setInviteError] = useState('')

  const { data: personas = [], isLoading: personasLoading } = useQuery<Persona[]>({
    queryKey: ['personas'],
    queryFn: () => personaService.list().then((r) => r.data),
  })

  const { data: invitations = [], isLoading: invitationsLoading } = useQuery<Invitation[]>({
    queryKey: ['invitations'],
    queryFn: () => invitationService.list().then((r) => r.data),
  })

  const invite = useMutation({
    mutationFn: (targetEmail: string) => invitationService.send(targetEmail.trim()),
    onSuccess: () => {
      setEmail('')
      setInviteError('')
      qc.invalidateQueries({ queryKey: ['invitations'] })
      qc.invalidateQueries({ queryKey: ['personas'] })
    },
    onError: (err: AxiosError<{ error?: string }>) => {
      const msg = err.response?.data?.error ?? 'No se pudo enviar la invitacion.'
      setInviteError(msg)
    },
  })

  const cancelInvitation = useMutation({
    mutationFn: (id: string) => invitationService.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invitations'] })
    },
  })

  const resendInvitation = useMutation({
    mutationFn: (id: string) => invitationService.resend(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invitations'] })
    },
  })

  const filteredPersonas = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return personas
    return personas.filter((p) => {
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase()
      return fullName.includes(q) || p.email.toLowerCase().includes(q)
    })
  }, [personas, search])

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-[#f0ffe4]">Gestión de Clientes</h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
            Invitaciones y gestión de usuarios
          </p>
        </div>
      </header>

      {/* Enviar nueva invitación */}
      <div className="mb-8 border border-[#3c4b35] bg-[#182214] p-6">
        <p className="mb-4 font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">— Enviar nueva invitación</p>
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="cliente@correo.com"
            className="flex-1 border border-[#3c4b35] bg-[#232d1e] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
          />
          <button
            onClick={() => invite.mutate(email)}
            disabled={!email.trim() || invite.isPending}
            className="border border-[#42ff00] bg-[#42ff00] px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-[#083900] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {invite.isPending ? 'Enviando...' : 'Enviar invitacion'}
          </button>
        </div>

        {inviteError && (
          <p className="mt-3 font-mono text-[10px] text-[#ffb4ab]">
            {inviteError}
          </p>
        )}
        {invite.isSuccess && (
          <p className="mt-3 font-mono text-[10px] text-[#42ff00]">
            Invitación enviada correctamente.
          </p>
        )}
      </div>

      {/* Invitaciones enviadas */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">— Invitaciones enviadas</p>
          <button
            onClick={() => qc.invalidateQueries({ queryKey: ['invitations'] })}
            className="text-[10px] font-mono text-[#42ff00] hover:text-[#f0ffe4] transition-colors"
          >
            Actualizar
          </button>
        </div>

        <div className="overflow-hidden border border-[#3c4b35] bg-[#182214]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#141e10]">
                  {['Email', 'Estado', 'Enviado', 'Acciones'].map((h) => (
                    <th key={h} className="border-b border-[#3c4b35] px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3c4b35]">
                {invitationsLoading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">Cargando invitaciones...</td>
                  </tr>
                ) : invitations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">No hay invitaciones enviadas</td>
                  </tr>
                ) : (
                  invitations.map((inv) => (
                    <tr key={inv.id} className="transition-colors hover:bg-[#42ff00]/5">
                      <td className="px-5 py-4 font-mono text-[11px] text-[#dae6d0]">{inv.email}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${
                            inv.status === 'pending'
                              ? 'bg-[#42ff00]/10 text-[#42ff00]'
                              : inv.status === 'completed'
                              ? 'bg-[#baccaf]/10 text-[#baccaf]'
                              : inv.status === 'resend'
                              ? 'bg-[#42ff00]/10 text-[#42ff00]'
                              : inv.status === 'used'
                              ? 'bg-[#3c4b35]/50 text-[#baccaf]'
                              : inv.status === 'cancelled'
                              ? 'bg-[#ffb4ab]/10 text-[#ffb4ab]'
                              : 'bg-[#3c4b35] text-[#baccaf]'
                          }`}
                        >
                          {inv.status === 'completed' ? 'completado' : inv.status === 'resend' ? 'reenviar' : inv.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-[11px] text-[#baccaf]">
                        {new Date(inv.createdAt).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          {inv.status === 'pending' && (
                            <>
                              <button
                                onClick={() => cancelInvitation.mutate(inv.id)}
                                disabled={cancelInvitation.isPending}
                                className="rounded border border-[#ffb4ab] px-3 py-1 text-[10px] font-mono text-[#ffb4ab] hover:bg-[#ffb4ab]/10 transition-colors disabled:opacity-50"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => resendInvitation.mutate(inv.id)}
                                disabled={resendInvitation.isPending}
                                className="rounded border border-[#42ff00] px-3 py-1 text-[10px] font-mono text-[#42ff00] hover:bg-[#42ff00]/10 transition-colors disabled:opacity-50"
                              >
                                Reenviar
                              </button>
                            </>
                          )}
                          {inv.status === 'completed' && (
                            <button
                              onClick={() => navigate('/worker/requests')}
                              className="rounded border border-[#baccaf] px-3 py-1 text-[10px] font-mono text-[#baccaf] hover:bg-[#baccaf]/10 transition-colors"
                            >
                              Revisar solicitud
                            </button>
                          )}
                          {inv.status === 'resend' && (
                            <button
                              onClick={() => resendInvitation.mutate(inv.id)}
                              disabled={resendInvitation.isPending}
                              className="rounded border border-[#42ff00] px-3 py-1 text-[10px] font-mono text-[#42ff00] hover:bg-[#42ff00]/10 transition-colors disabled:opacity-50"
                            >
                              Volver a enviar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Lista de clientes */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">— Clientes registrados</p>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-80 border border-[#3c4b35] bg-[#182214] px-3 py-2 font-mono text-[11px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
          />
        </div>

        <div className="overflow-hidden border border-[#3c4b35] bg-[#182214]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#141e10]">
                  {['Cliente', 'Email', 'Estado', 'Créditos', 'Registro'].map((h) => (
                    <th key={h} className="border-b border-[#3c4b35] px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3c4b35]">
                {personasLoading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">Cargando clientes...</td>
                  </tr>
                ) : filteredPersonas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">Sin clientes para mostrar</td>
                  </tr>
                ) : (
                  filteredPersonas.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-[#42ff00]/5">
                      <td className="px-5 py-4 font-mono text-[11px] text-[#dae6d0]">{p.firstName} {p.lastName}</td>
                      <td className="px-5 py-4 font-mono text-[11px] text-[#baccaf]">{p.email}</td>
                      <td className="px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-[#42ff00]">{p.status}</td>
                      <td className="px-5 py-4 font-mono text-[11px] text-[#dae6d0]">{p.credits.toFixed(2)} USD</td>
                      <td className="px-5 py-4 font-mono text-[10px] text-[#baccaf]">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-AR') : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
