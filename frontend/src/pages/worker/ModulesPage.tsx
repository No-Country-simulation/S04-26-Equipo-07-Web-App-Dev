import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { moduleService } from '@/lib/services/worker/module.service'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

type AppModule = {
  id: string; title: string; description: string; path: string
  icon: string; group: string; order: number; active: boolean
}

function ModuleModal({ module: mod, onClose }: { module?: AppModule; onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    title: mod?.title ?? '',
    description: mod?.description ?? '',
    path: mod?.path ?? '',
    icon: mod?.icon ?? '',
    group: mod?.group ?? 'gestion',
    order: mod?.order ?? 0,
  })

  const set = (key: string, val: string | number) => setForm(f => ({ ...f, [key]: val }))

  const create = useMutation({
    mutationFn: () => moduleService.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['modules'] }); onClose() },
  })
  const update = useMutation({
    mutationFn: () => moduleService.update(mod!.id, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['modules'] }); onClose() },
  })

  const isPending = create.isPending || update.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg border border-[#3c4b35] bg-[#0c1609]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#3c4b35] px-6 py-4">
          <h2 className="font-mono text-[13px] uppercase tracking-wider text-[#f0ffe4]">
            {mod ? 'Editar_' : 'Nuevo_'}<span className="text-[#42ff00]">Módulo</span>
          </h2>
          <button onClick={onClose} className="text-[#baccaf] hover:text-[#f0ffe4]"><X size={18} /></button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          {([
            { key: 'title', label: 'Título', placeholder: 'Solicitudes' },
            { key: 'icon', label: 'Icono (Lucide)', placeholder: 'ClipboardList' },
            { key: 'path', label: 'Ruta', placeholder: '/worker/requests' },
            { key: 'group', label: 'Grupo', placeholder: 'gestion' },
            { key: 'order', label: 'Orden', placeholder: '1', type: 'number' },
          ] as { key: string; label: string; placeholder: string; type?: string }[]).map(({ key, label, placeholder, type }) => (
            <label key={key} className="block">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">{label}</span>
              <input
                type={type ?? 'text'}
                value={(form as Record<string, string | number>)[key]}
                onChange={e => set(key, type === 'number' ? Number(e.target.value) : e.target.value)}
                placeholder={placeholder}
                className="mt-1 w-full border border-[#3c4b35] bg-[#182214] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
              />
            </label>
          ))}
          <label className="col-span-2 block">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Descripción</span>
            <input
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Descripción del módulo"
              className="mt-1 w-full border border-[#3c4b35] bg-[#182214] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
            />
          </label>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#3c4b35] px-6 py-4">
          <button onClick={onClose} className="border border-[#3c4b35] px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#baccaf] hover:border-[#42ff00] hover:text-[#42ff00]">
            Cancelar
          </button>
          <button
            onClick={() => mod ? update.mutate() : create.mutate()}
            disabled={!form.title || isPending}
            className="border border-[#42ff00] bg-[#42ff00] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[#083900] hover:brightness-110 disabled:opacity-50"
          >
            {isPending ? 'Guardando...' : mod ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ModulesPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<'create' | AppModule | null>(null)
  const [groupFilter, setGroupFilter] = useState('')

  const { data: modules = [], isLoading } = useQuery<AppModule[]>({
    queryKey: ['modules', groupFilter],
    queryFn: () => moduleService.list(groupFilter || undefined).then(r => r.data),
  })

  const remove = useMutation({
    mutationFn: (id: string) => moduleService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['modules'] }),
  })

  const groups = [...new Set(modules.map(m => m.group))]

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-[#f0ffe4]">Módulos_Sistema</h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
            <span className="text-[#dae6d0]">{modules.filter(m => m.active).length}</span> activos · {modules.length} total
          </p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 border border-[#42ff00] bg-[#42ff00]/10 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#42ff00] hover:bg-[#42ff00] hover:text-[#083900]"
        >
          <Plus size={14} />
          Nuevo Módulo
        </button>
      </header>

      {/* filtro por grupo */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setGroupFilter('')}
          className={`px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider ${!groupFilter ? 'bg-[#42ff00] text-[#083900] font-bold' : 'border border-[#3c4b35] text-[#baccaf] hover:border-[#42ff00] hover:text-[#42ff00]'}`}
        >
          Todos
        </button>
        {groups.map(g => (
          <button
            key={g}
            onClick={() => setGroupFilter(g)}
            className={`px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider ${groupFilter === g ? 'bg-[#42ff00] text-[#083900] font-bold' : 'border border-[#3c4b35] text-[#baccaf] hover:border-[#42ff00] hover:text-[#42ff00]'}`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="overflow-hidden border border-[#3c4b35] bg-[#182214]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#141e10]">
                {['Título', 'Ruta', 'Grupo', 'Icono', 'Orden', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="border-b border-[#3c4b35] px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3c4b35]">
              {isLoading ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">Cargando...</td></tr>
              ) : modules.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">Sin módulos</td></tr>
              ) : modules.map(m => (
                <tr key={m.id} className="transition-colors hover:bg-[#42ff00]/5">
                  <td className="px-5 py-4">
                    <p className="font-mono text-[12px] font-bold text-[#dae6d0]">{m.title}</p>
                    <p className="font-mono text-[10px] text-[#3c4b35]">{m.description}</p>
                  </td>
                  <td className="px-5 py-4 font-mono text-[10px] text-[#baccaf]">{m.path}</td>
                  <td className="px-5 py-4">
                    <span className="border border-[#3c4b35] px-2 py-0.5 font-mono text-[9px] uppercase text-[#baccaf]">{m.group}</span>
                  </td>
                  <td className="px-5 py-4 font-mono text-[11px] text-[#baccaf]">{m.icon}</td>
                  <td className="px-5 py-4 font-mono text-[11px] text-[#dae6d0]">{m.order}</td>
                  <td className="px-5 py-4">
                    <span className={`font-mono text-[10px] uppercase tracking-wider ${m.active ? 'text-[#42ff00]' : 'text-[#ffb4ab]'}`}>
                      {m.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setModal(m)}
                        className="border border-[#3c4b35] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#baccaf] hover:border-[#42ff00] hover:text-[#42ff00]"
                      >
                        <Pencil className="mr-1 inline" size={11} />
                        Editar
                      </button>
                      <button
                        onClick={() => remove.mutate(m.id)}
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

      {modal === 'create' && <ModuleModal onClose={() => setModal(null)} />}
      {modal && modal !== 'create' && <ModuleModal module={modal as AppModule} onClose={() => setModal(null)} />}
    </div>
  )
}
