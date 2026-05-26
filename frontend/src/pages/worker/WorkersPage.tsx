import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workerService } from '@/lib/services/worker/worker.service'
import { roleService } from '@/lib/services/worker/role.service'
import { UserPlus, Trash2, X, Eye, EyeOff } from 'lucide-react'

type Worker = {
  id: string; firstName: string; lastName: string
  email: string; roleIds: string[]; status: string; createdAt: string
}
type Role = { id: string; name: string }

function InitialsAvatar({ name }: { name: string }) {
  const parts = name.split(' ')
  const initials = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2)
  return (
    <div className="flex h-8 w-8 items-center justify-center border border-[#3c4b35] bg-[#232d1e] font-mono text-[11px] text-[#42ff00]">
      {initials.toUpperCase()}
    </div>
  )
}

function CreateWorkerModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [showPw, setShowPw] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })

  const create = useMutation({
    mutationFn: (data: object) => workerService.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workers'] }); onClose() },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const valid = form.firstName && form.lastName && form.email && form.password.length >= 8

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md border border-[#3c4b35] bg-[#0c1609]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#3c4b35] px-6 py-4">
          <h2 className="font-mono text-[13px] uppercase tracking-wider text-[#f0ffe4]">
            Nuevo_<span className="text-[#42ff00]">Trabajador</span>
          </h2>
          <button onClick={onClose} className="text-[#baccaf] hover:text-[#f0ffe4]"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-[#baccaf] mb-1">Nombre</span>
              <input name="firstName" value={form.firstName} onChange={handleChange}
                placeholder="Carlos"
                className="w-full border border-[#3c4b35] bg-[#182214] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]" />
            </label>
            <label>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-[#baccaf] mb-1">Apellido</span>
              <input name="lastName" value={form.lastName} onChange={handleChange}
                placeholder="Mendez"
                className="w-full border border-[#3c4b35] bg-[#182214] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]" />
            </label>
          </div>
          <label>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-[#baccaf] mb-1">Email</span>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="trabajador@northpay.com"
              className="w-full border border-[#3c4b35] bg-[#182214] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]" />
          </label>
          <label>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-[#baccaf] mb-1">
              Contraseña <span className="text-[#3c4b35]">(min. 8 chars)</span>
            </span>
            <div className="relative">
              <input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handleChange}
                placeholder="Min. 8 caracteres"
                className="w-full border border-[#3c4b35] bg-[#182214] px-3 py-2 pr-10 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]" />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#3c4b35] hover:text-[#baccaf]">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </label>
          <button onClick={() => valid && create.mutate(form)}
            disabled={!valid || create.isPending}
            className="w-full border border-[#42ff00] bg-[#42ff00] py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-[#083900] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed">
            {create.isPending ? 'Creando...' : 'Crear Trabajador'}
          </button>
          {create.isError && (
            <p className="font-mono text-[10px] text-[#ffb4ab]">Error al crear el trabajador.</p>
          )}
        </div>
        <div className="border-t border-[#3c4b35] px-6 py-3 text-right">
          <button onClick={onClose} className="font-mono text-[10px] uppercase tracking-wider text-[#baccaf] hover:text-[#42ff00]">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function WorkersPage() {
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)

  const { data: workers = [], isLoading } = useQuery<Worker[]>({
    queryKey: ['workers'],
    queryFn: () => workerService.list().then(r => r.data),
  })

  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: () => roleService.list().then(r => r.data),
  })

  const deactivate = useMutation({
    mutationFn: (id: string) => workerService.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workers'] }),
  })

  const rolesMap = Object.fromEntries(roles.map(r => [r.id, r.name]))
  const activeCount = workers.filter(w => w.status === 'active').length

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-[#f0ffe4]">Trabajadores_Internos</h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
            <span className="text-[#42ff00]">{activeCount}</span> activos · {workers.length} total
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 border border-[#42ff00] bg-[#42ff00]/10 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#42ff00] hover:bg-[#42ff00] hover:text-[#083900]"
        >
          <UserPlus size={14} />
          Nuevo Trabajador
        </button>
      </header>

      <div className="overflow-hidden border border-[#3c4b35] bg-[#182214]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#141e10]">
                {['Trabajador', 'Email', 'Roles', 'Estado', 'Creado', 'Acciones'].map(h => (
                  <th key={h} className="border-b border-[#3c4b35] px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3c4b35]">
              {isLoading ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">Cargando...</td></tr>
              ) : workers.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">Sin trabajadores registrados</td></tr>
              ) : workers.map(w => (
                <tr key={w.id} className="transition-colors hover:bg-[#42ff00]/5">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <InitialsAvatar name={`${w.firstName} ${w.lastName}`} />
                      <div>
                        <p className="font-mono text-[12px] font-bold text-[#dae6d0]">{w.firstName} {w.lastName}</p>
                        <p className="font-mono text-[10px] text-[#3c4b35]">ID: {w.id.slice(-8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-[11px] text-[#baccaf]">{w.email}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {w.roleIds.length === 0
                        ? <span className="font-mono text-[10px] text-[#3c4b35]">Sin roles</span>
                        : w.roleIds.map(rid => (
                          <span key={rid} className="border border-[#3c4b35] px-2 py-0.5 font-mono text-[9px] uppercase text-[#baccaf]">
                            {rolesMap[rid] ?? rid.slice(-6)}
                          </span>
                        ))
                      }
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider ${w.status === 'active' ? 'text-[#42ff00]' : 'text-[#ffb4ab]'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${w.status === 'active' ? 'bg-[#42ff00]' : 'bg-[#ffb4ab]'}`} />
                      {w.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-[10px] text-[#baccaf]">
                    {new Date(w.createdAt).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {w.status === 'active' && (
                      <button
                        onClick={() => deactivate.mutate(w.id)}
                        disabled={deactivate.isPending}
                        className="border border-[#ffb4ab]/40 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#ffb4ab] hover:bg-[#ffb4ab]/10 disabled:opacity-50"
                      >
                        <Trash2 className="mr-1 inline" size={12} />
                        Desactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && <CreateWorkerModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}
