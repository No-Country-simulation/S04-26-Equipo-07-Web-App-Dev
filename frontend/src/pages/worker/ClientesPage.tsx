import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { invitationService } from '@/lib/services/worker/invitation.service'
import { personaService } from '@/lib/services/worker/persona.service'

type Persona = {
  id: string
  firstName: string
  lastName: string
  email: string
  status: string
  credits: number
  createdAt?: string
}

export default function ClientesPage() {
  const qc = useQueryClient()
  const [email, setEmail] = useState('')
  const [search, setSearch] = useState('')

  const { data: personas = [], isLoading } = useQuery<Persona[]>({
    queryKey: ['personas'],
    queryFn: () => personaService.list().then((r) => r.data),
  })

  const invite = useMutation({
    mutationFn: (targetEmail: string) => invitationService.send(targetEmail),
    onSuccess: () => {
      setEmail('')
      qc.invalidateQueries({ queryKey: ['personas'] })
    },
  })

  const filtered = useMemo(() => {
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
          <h2 className="text-[28px] font-bold text-[#f0ffe4]">Clientes_Invitaciones</h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
            Gestiona clientes y envia invitaciones de acceso
          </p>
        </div>
      </header>

      <div className="mb-6 border border-[#3c4b35] bg-[#182214] p-6">
        <p className="mb-4 font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">— Invitar cliente</p>
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="cliente@correo.com"
            className="flex-1 border border-[#3c4b35] bg-[#232d1e] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
          />
          <button
            onClick={() => invite.mutate(email)}
            disabled={!email || invite.isPending}
            className="border border-[#42ff00] bg-[#42ff00] px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-[#083900] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {invite.isPending ? 'Enviando...' : 'Enviar invitacion'}
          </button>
        </div>
        {invite.isError && (
          <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-[#ffb4ab]">
            No se pudo enviar la invitacion.
          </p>
        )}
        {invite.isSuccess && (
          <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-[#42ff00]">
            Invitacion enviada correctamente.
          </p>
        )}
      </div>

      <div className="mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente por nombre o email"
          className="w-full md:w-96 border border-[#3c4b35] bg-[#182214] px-3 py-2 font-mono text-[11px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
        />
      </div>

      <div className="overflow-hidden border border-[#3c4b35] bg-[#182214]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#141e10]">
                {['Cliente', 'Email', 'Estado', 'Creditos', 'Registro'].map((h) => (
                  <th key={h} className="border-b border-[#3c4b35] px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3c4b35]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">Cargando clientes...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">Sin clientes para mostrar</td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-[#42ff00]/5">
                    <td className="px-5 py-4 font-mono text-[11px] text-[#dae6d0]">{p.firstName} {p.lastName}</td>
                    <td className="px-5 py-4 font-mono text-[11px] text-[#baccaf]">{p.email}</td>
                    <td className="px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-[#42ff00]">{p.status}</td>
                    <td className="px-5 py-4 font-mono text-[11px] text-[#dae6d0]">{p.credits.toFixed(2)} USD</td>
                    <td className="px-5 py-4 font-mono text-[10px] text-[#baccaf]">{p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-AR') : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
