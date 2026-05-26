import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { companyService } from '@/lib/services/user/company.service'
import { Plus, X } from 'lucide-react'

type Company = { id: string; name: string; taxId: string; country: string; industry: string; status: string }
type FormState = { name: string; taxId: string; country: string; industry: string }

export default function EmpresasPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>({ name: '', taxId: '', country: '', industry: '' })

  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: () => companyService.list().then(r => r.data),
  })

  const create = useMutation({
    mutationFn: (data: object) => companyService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies'] })
      setForm({ name: '', taxId: '', country: '', industry: '' })
      setShowForm(false)
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const valid = form.name && form.taxId && form.country

  return (
    <div className="p-8">
      {/* header */}
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-[#f0ffe4]">Empresas</h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
            <span className="text-[#42ff00]">{companies.length}</span> empresa{companies.length !== 1 ? 's' : ''} registrada{companies.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 border border-[#42ff00] bg-[#42ff00]/10 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#42ff00] hover:bg-[#42ff00] hover:text-[#083900] transition-colors"
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? 'Cancelar' : 'Nueva Empresa'}
        </button>
      </header>

      {/* inline create form */}
      {showForm && (
        <div className="mb-6 border border-[#3c4b35] bg-[#182214] p-6">
          <p className="mb-4 font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">
            — Nueva Empresa
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { name: 'name',     placeholder: 'Nombre de la empresa', span: 2 },
              { name: 'taxId',    placeholder: 'RUC / NIT / Tax ID' },
              { name: 'country',  placeholder: 'País' },
              { name: 'industry', placeholder: 'Industria / Sector' },
            ].map(({ name, placeholder, span }) => (
              <input
                key={name}
                name={name}
                value={form[name as keyof FormState]}
                onChange={handleChange}
                placeholder={placeholder}
                className={`border border-[#3c4b35] bg-[#232d1e] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00] ${span === 2 ? 'sm:col-span-2' : ''}`}
              />
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => valid && create.mutate(form)}
              disabled={!valid || create.isPending}
              className="border border-[#42ff00] bg-[#42ff00] px-6 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-[#083900] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {create.isPending ? 'Creando...' : 'Agregar Empresa'}
            </button>
            {create.isError && (
              <p className="font-mono text-[10px] text-[#ffb4ab]">Error al crear la empresa.</p>
            )}
          </div>
        </div>
      )}

      {/* company list */}
      <div className="overflow-hidden border border-[#3c4b35] bg-[#182214]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#141e10]">
                {['Empresa', 'Tax ID', 'País', 'Industria', 'Estado'].map(h => (
                  <th key={h} className="border-b border-[#3c4b35] px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3c4b35]">
              {isLoading ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">Cargando...</td></tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center">
                    <p className="font-mono text-[10px] text-[#baccaf]">Sin empresas registradas</p>
                    <p className="mt-1 font-mono text-[9px] text-[#3c4b35]">Usa el botón "Nueva Empresa" para agregar una.</p>
                  </td>
                </tr>
              ) : companies.map(c => (
                <tr key={c.id} className="transition-colors hover:bg-[#42ff00]/5">
                  <td className="px-5 py-4">
                    <p className="font-mono text-[12px] font-bold text-[#dae6d0]">{c.name}</p>
                    <p className="font-mono text-[10px] text-[#3c4b35]">ID: {c.id.slice(-8)}</p>
                  </td>
                  <td className="px-5 py-4 font-mono text-[11px] text-[#baccaf]">{c.taxId}</td>
                  <td className="px-5 py-4 font-mono text-[11px] text-[#baccaf]">{c.country}</td>
                  <td className="px-5 py-4 font-mono text-[11px] text-[#baccaf]">{c.industry ?? '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider ${c.status === 'active' ? 'text-[#42ff00]' : 'text-[#ffb4ab]'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${c.status === 'active' ? 'bg-[#42ff00]' : 'bg-[#ffb4ab]'}`} />
                      {c.status ?? 'active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
