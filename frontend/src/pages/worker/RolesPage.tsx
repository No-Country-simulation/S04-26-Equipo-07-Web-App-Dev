import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { roleService } from '@/lib/services/worker/role.service'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

type RolePermission = { moduleId: string; actions: string[] }
type Role = { id: string; name: string; description: string; permissions: RolePermission[] }

function RoleModal({
  role, onClose,
}: { role?: Role; onClose: () => void }) {
  const qc = useQueryClient()
  const [name, setName] = useState(role?.name ?? '')
  const [description, setDescription] = useState(role?.description ?? '')

  const create = useMutation({
    mutationFn: () => roleService.create({ name, description }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); onClose() },
  })
  const update = useMutation({
    mutationFn: () => roleService.update(role!.id, { name, description }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); onClose() },
  })

  const isPending = create.isPending || update.isPending
  const isError = create.isError || update.isError

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md border border-[#3c4b35] bg-[#0c1609]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#3c4b35] px-6 py-4">
          <h2 className="font-mono text-[13px] uppercase tracking-wider text-[#f0ffe4]">
            {role ? 'Editar_' : 'Nuevo_'}<span className="text-[#42ff00]">Rol</span>
          </h2>
          <button onClick={onClose} className="text-[#baccaf] hover:text-[#f0ffe4]"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Nombre del Rol</span>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="ej: REVISOR, SUPERVISOR"
              className="mt-1 w-full border border-[#3c4b35] bg-[#182214] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
            />
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Descripción</span>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Descripción breve del rol..."
              className="mt-1 w-full border border-[#3c4b35] bg-[#182214] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00] resize-none"
            />
          </label>
          {isError && <p className="font-mono text-[10px] text-[#ffb4ab]">Error al guardar el rol.</p>}
        </div>
        <div className="flex justify-end gap-3 border-t border-[#3c4b35] px-6 py-4">
          <button onClick={onClose} className="border border-[#3c4b35] px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#baccaf] hover:border-[#42ff00] hover:text-[#42ff00]">
            Cancelar
          </button>
          <button
            onClick={() => role ? update.mutate() : create.mutate()}
            disabled={!name || isPending}
            className="border border-[#42ff00] bg-[#42ff00] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[#083900] hover:brightness-110 disabled:opacity-50"
          >
            {isPending ? 'Guardando...' : role ? 'Actualizar' : 'Crear Rol'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RolesPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<'create' | Role | null>(null)

  const { data: roles = [], isLoading } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: () => roleService.list().then(r => r.data),
  })

  const remove = useMutation({
    mutationFn: (id: string) => roleService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  })

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-[#f0ffe4]">Roles_y_Permisos</h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
            <span className="text-[#dae6d0]">{roles.length}</span> roles configurados
          </p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 border border-[#42ff00] bg-[#42ff00]/10 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#42ff00] hover:bg-[#42ff00] hover:text-[#083900]"
        >
          <Plus size={14} />
          Nuevo Rol
        </button>
      </header>

      <div className="overflow-hidden border border-[#3c4b35] bg-[#182214]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#141e10]">
                {['Nombre', 'Descripción', 'Permisos', 'Acciones'].map(h => (
                  <th key={h} className="border-b border-[#3c4b35] px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3c4b35]">
              {isLoading ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">Cargando...</td></tr>
              ) : roles.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">Sin roles configurados</td></tr>
              ) : roles.map(r => (
                <tr key={r.id} className="transition-colors hover:bg-[#42ff00]/5">
                  <td className="px-5 py-4">
                    <span className="border border-[#42ff00]/30 bg-[#42ff00]/5 px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-[#42ff00]">
                      {r.name}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-[11px] text-[#baccaf] max-w-xs">
                    {r.description || '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-[11px] text-[#dae6d0]">
                      {r.permissions.length} módulos
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setModal(r)}
                        className="border border-[#3c4b35] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#baccaf] hover:border-[#42ff00] hover:text-[#42ff00]"
                      >
                        <Pencil className="mr-1 inline" size={11} />
                        Editar
                      </button>
                      <button
                        onClick={() => remove.mutate(r.id)}
                        disabled={remove.isPending}
                        className="border border-[#ffb4ab]/40 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#ffb4ab] hover:bg-[#ffb4ab]/10 disabled:opacity-50"
                      >
                        <Trash2 className="mr-1 inline" size={11} />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal === 'create' && <RoleModal onClose={() => setModal(null)} />}
      {modal && modal !== 'create' && <RoleModal role={modal as Role} onClose={() => setModal(null)} />}
    </div>
  )
}
