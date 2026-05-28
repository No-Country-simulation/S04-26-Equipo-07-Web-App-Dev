import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { companyService } from '@/lib/services/user/company.service'
import { Plus, X, Upload, ChevronRight, ChevronLeft, Building2, FileText, Loader2 } from 'lucide-react'

type Company = {
  id: string; name: string; taxId: string; country: string
  industry: string; status: string; tradeName?: string; website?: string
  address?: { street?: string; city?: string; state?: string; postalCode?: string }
  contact?: { email?: string; phone?: string }
}
type FormState = { name: string; tradeName: string; taxId: string; country: string; industry: string; website: string; street: string; city: string; contactEmail: string; contactPhone: string }

// modal para ver detalles de una empresa
function CompanyDetailModal({ company, onClose }: { company: Company; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg border border-[#3c4b35] bg-[#0c1609] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#3c4b35] px-6 py-4">
          <div className="flex items-center gap-3">
            <Building2 size={16} className="text-[#42ff00]" />
            <h3 className="font-mono text-[13px] font-bold uppercase tracking-wider text-[#f0ffe4]">
              {company.name}
            </h3>
          </div>
          <button onClick={onClose} className="text-[#baccaf] hover:text-[#f0ffe4]"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-4">
          {[
            { label: 'Nombre comercial', value: company.tradeName },
            { label: 'Tax ID / RUC', value: company.taxId },
            { label: 'País', value: company.country },
            { label: 'Industria', value: company.industry },
            { label: 'Sitio web', value: company.website },
            { label: 'Dirección', value: company.address ? `${company.address.street ?? ''} ${company.address.city ?? ''}`.trim() : undefined },
            { label: 'Email contacto', value: company.contact?.email },
            { label: 'Teléfono', value: company.contact?.phone },
          ].filter(f => f.value).map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#3c4b35] shrink-0">{label}</span>
              <span className="font-mono text-[11px] text-[#dae6d0] text-right">{value}</span>
            </div>
          ))}
          <div className="flex justify-between gap-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#3c4b35]">Estado</span>
            <span className={`flex items-center gap-1.5 font-mono text-[10px] uppercase ${company.status === 'active' ? 'text-[#42ff00]' : 'text-[#ffb4ab]'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${company.status === 'active' ? 'bg-[#42ff00]' : 'bg-[#ffb4ab]'}`} />
              {company.status ?? 'active'}
            </span>
          </div>
          <p className="font-mono text-[9px] text-[#3c4b35] pt-1">ID: {company.id}</p>
        </div>
      </div>
    </div>
  )
}

// formulario multi-paso para registrar empresa con documentos
function NewCompanyWizard({ onClose, onCreate }: { onClose: () => void; onCreate: (data: object) => void }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>({
    name: '', tradeName: '', taxId: '', country: '', industry: '',
    website: '', street: '', city: '', contactEmail: '', contactPhone: '',
  })
  const [docs, setDocs] = useState<{ [key: string]: File | null }>({
    ruc: null, constitutionAct: null, representativeId: null,
  })
  const [uploading, setUploading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleFile = (key: string, file: File | null) =>
    setDocs(d => ({ ...d, [key]: file }))

  const step1Valid = form.name && form.taxId && form.country

  const handleSubmit = async () => {
    setUploading(true)
    // construye el payload sin los archivos (se manejan por separado via upload si aplica)
    onCreate({
      name: form.name,
      tradeName: form.tradeName,
      taxId: form.taxId,
      country: form.country,
      industry: form.industry,
      website: form.website,
      address: { street: form.street, city: form.city },
      contact: { email: form.contactEmail, phone: form.contactPhone },
    })
    setUploading(false)
  }

  const DOC_LABELS: Record<string, string> = {
    ruc: 'RUC / Registro tributario',
    constitutionAct: 'Acta de constitución',
    representativeId: 'Identificación del representante',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg border border-[#3c4b35] bg-[#0c1609] shadow-2xl">
        {/* header con pasos */}
        <div className="flex items-center justify-between border-b border-[#3c4b35] px-6 py-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">Paso {step} de 2</p>
            <h3 className="font-mono text-[13px] font-bold uppercase tracking-wider text-[#f0ffe4]">
              {step === 1 ? 'Datos de la empresa' : 'Documentación'}
            </h3>
          </div>
          <button onClick={onClose} className="text-[#baccaf] hover:text-[#f0ffe4]"><X size={16} /></button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-3">
              {[
                { name: 'name', placeholder: 'Nombre legal de la empresa', required: true },
                { name: 'tradeName', placeholder: 'Nombre comercial (opcional)' },
                { name: 'taxId', placeholder: 'RUC / NIT / Tax ID', required: true },
                { name: 'country', placeholder: 'País de constitución', required: true },
                { name: 'industry', placeholder: 'Industria / Sector' },
                { name: 'website', placeholder: 'Sitio web (opcional)' },
                { name: 'street', placeholder: 'Dirección' },
                { name: 'city', placeholder: 'Ciudad' },
                { name: 'contactEmail', placeholder: 'Email de contacto' },
                { name: 'contactPhone', placeholder: 'Teléfono de contacto' },
              ].map(({ name, placeholder }) => (
                <input
                  key={name}
                  name={name}
                  value={form[name as keyof FormState]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="w-full border border-[#3c4b35] bg-[#182214] px-3 py-2.5 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
                />
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="font-mono text-[10px] text-[#baccaf] leading-relaxed">
                Sube los documentos de la empresa. Los archivos deben estar en formato PDF o imagen.
              </p>
              {Object.keys(DOC_LABELS).map(key => (
                <div key={key}>
                  <label className="block font-mono text-[9px] uppercase tracking-widest text-[#3c4b35] mb-1.5">
                    {DOC_LABELS[key]}
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex flex-1 cursor-pointer items-center gap-2 border border-[#3c4b35] bg-[#182214] px-3 py-2.5 hover:border-[#42ff00]/50 transition-colors">
                      <Upload size={12} className="text-[#3c4b35]" />
                      <span className="font-mono text-[11px] text-[#baccaf] truncate">
                        {docs[key] ? docs[key]!.name : 'Seleccionar archivo...'}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => handleFile(key, e.target.files?.[0] ?? null)}
                      />
                    </label>
                    {docs[key] && (
                      <button onClick={() => handleFile(key, null)} className="text-[#3c4b35] hover:text-[#ffb4ab]">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  {docs[key] && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <FileText size={10} className="text-[#42ff00]" />
                      <span className="font-mono text-[9px] text-[#42ff00]">
                        {(docs[key]!.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  )}
                </div>
              ))}
              <p className="font-mono text-[9px] text-[#3c4b35] mt-2">
                Los documentos son opcionales en este paso y pueden adjuntarse después.
              </p>
            </div>
          )}
        </div>

        {/* navegacion */}
        <div className="flex gap-3 border-t border-[#3c4b35] px-6 py-4">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 border border-[#3c4b35] px-4 py-2.5 font-mono text-[11px] uppercase tracking-wider text-[#baccaf] hover:border-[#f0ffe4] hover:text-[#f0ffe4]"
            >
              <ChevronLeft size={14} /> Anterior
            </button>
          )}
          <div className="flex-1" />
          {step < 2 ? (
            <button
              onClick={() => setStep(2)}
              disabled={!step1Valid}
              className="flex items-center gap-2 border border-[#42ff00] bg-[#42ff00]/10 px-5 py-2.5 font-mono text-[11px] uppercase tracking-wider text-[#42ff00] hover:bg-[#42ff00] hover:text-[#083900] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!step1Valid || uploading}
              className="flex items-center gap-2 border border-[#42ff00] bg-[#42ff00] px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#083900] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {uploading ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : 'Registrar empresa'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function EmpresasPage() {
  const qc = useQueryClient()
  const [showWizard, setShowWizard] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: () => companyService.list().then(r => r.data),
  })

  const create = useMutation({
    mutationFn: (data: object) => companyService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies'] })
      setShowWizard(false)
    },
  })

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
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-2 border border-[#42ff00] bg-[#42ff00]/10 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#42ff00] hover:bg-[#42ff00] hover:text-[#083900] transition-colors"
        >
          <Plus size={14} />
          Nueva Empresa
        </button>
      </header>

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
                <tr
                  key={c.id}
                  onClick={() => setSelectedCompany(c)}
                  className="cursor-pointer transition-colors hover:bg-[#42ff00]/5"
                >
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

      {/* modals */}
      {showWizard && (
        <NewCompanyWizard
          onClose={() => setShowWizard(false)}
          onCreate={(data) => create.mutate(data)}
        />
      )}
      {selectedCompany && (
        <CompanyDetailModal
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </div>
  )
}

