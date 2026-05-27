import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { convocatoriaService } from '@/lib/services/user/convocatoria.service'
import { companyService } from '@/lib/services/user/company.service'
import { useUserAuth } from '@/contexts/UserAuthContext'
import { Plus, X, Eye, ChevronRight, ChevronLeft, BarChart2, Users } from 'lucide-react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

// ─── Types ───────────────────────────────────────────────────────────────────
type Convocatoria = {
  id: string; title: string; status: string; companyId: string
  description: string; location: string; modality: string; contractType: string
  salaryMin?: number; salaryMax?: number
  startDate?: string; endDate?: string
  technicalRequirements: string[]; questions: string[]
  views: number; applicationCount: number; creditCost: number
}
type Company = { id: string; name: string }

// ─── Constants ───────────────────────────────────────────────────────────────
const MODALITIES = ['REMOTE', 'HYBRID', 'ON-SITE']
const CONTRACT_TYPES = ['FULL-TIME', 'PART-TIME', 'FREELANCE']
const TECH_SUGGESTIONS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'Spring Boot',
  'MongoDB', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'Git', 'REST API',
  'GraphQL', 'Vue.js', 'Angular', 'Next.js', 'Figma', 'SQL',
]
const TOTAL_STEPS = 4

function statusColor(status: string) {
  if (status === 'ACTIVE') return 'text-[#42ff00]'
  if (status === 'CLOSED' || status === 'CANCELLED') return 'text-[#ffb4ab]'
  return 'text-[#ffe066]'
}
function statusBorder(status: string) {
  if (status === 'ACTIVE') return 'border-[#42ff00]/40 text-[#42ff00]'
  if (status === 'CLOSED' || status === 'CANCELLED') return 'border-[#ffb4ab]/40 text-[#ffb4ab]'
  return 'border-[#ffe066]/40 text-[#ffe066]'
}

// ─── Wizard Step indicator ────────────────────────────────────────────────────
function StepBar({ step }: { step: number }) {
  const labels = ['Datos Básicos', 'Modalidad', 'Requisitos', 'Preguntas']
  return (
    <div className="mb-8 flex items-center gap-0">
      {labels.map((label, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div className={`flex h-7 w-7 items-center justify-center font-mono text-[10px] font-bold
            ${i + 1 <= step ? 'bg-[#42ff00] text-[#083900]' : 'border border-[#3c4b35] text-[#3c4b35]'}`}>
            {i + 1}
          </div>
          <span className={`font-mono text-[9px] uppercase tracking-wider
            ${i + 1 <= step ? 'text-[#42ff00]' : 'text-[#3c4b35]'}`}>
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Credit cost badge ────────────────────────────────────────────────────────
function CostBadge({ start, end }: { start: string; end: string }) {
  const { data } = useQuery({
    queryKey: ['cost-estimate', start, end],
    queryFn: () => convocatoriaService.costEstimate(start, end).then(r => r.data),
    enabled: !!start && !!end && start < end,
  })
  if (!data) return null
  return (
    <div className="mt-3 border border-[#42ff00]/30 bg-[#42ff00]/5 p-3">
      <p className="font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
        Costo estimado
      </p>
      <p className="font-mono text-[22px] font-bold text-[#42ff00]">
        ${data.cost.toFixed(0)}
        <span className="ml-1 text-[11px] text-[#3c4b35]">USD ({data.days} días × $1/día)</span>
      </p>
    </div>
  )
}

// ─── Draft Wizard ─────────────────────────────────────────────────────────────
function DraftWizard({
  conv, companies, onClose, onSaved,
}: {
  conv: Convocatoria | null
  companies: Company[]
  onClose: () => void
  onSaved: () => void
}) {
  const qc = useQueryClient()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    companyId: conv?.companyId ?? '',
    title: conv?.title ?? '',
    description: conv?.description ?? '',
    location: conv?.location ?? '',
    salaryMin: conv?.salaryMin?.toString() ?? '',
    salaryMax: conv?.salaryMax?.toString() ?? '',
    startDate: conv?.startDate?.slice(0, 10) ?? '',
    endDate: conv?.endDate?.slice(0, 10) ?? '',
    modality: conv?.modality ?? '',
    contractType: conv?.contractType ?? '',
    technicalRequirements: conv?.technicalRequirements ?? ([] as string[]),
    questions: conv?.questions ?? ([] as string[]),
  })
  const [techInput, setTechInput] = useState('')
  const [questionInput, setQuestionInput] = useState('')

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const saveMutation = useMutation({
    mutationFn: (data: object) =>
      conv
        ? convocatoriaService.update(conv.id, data)
        : convocatoriaService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['convocatorias', 'mine'] })
      onSaved()
    },
  })

  const publishMutation = useMutation({
    mutationFn: (id: string) => convocatoriaService.publish(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['convocatorias', 'mine'] })
      onSaved()
    },
  })

  const buildPayload = () => ({
    companyId: form.companyId,
    title: form.title,
    description: form.description,
    location: form.location,
    salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
    salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
    startDate: form.startDate || null,
    endDate: form.endDate || null,
    modality: form.modality,
    contractType: form.contractType,
    technicalRequirements: form.technicalRequirements,
    questions: form.questions,
  })

  const handleSaveAndPublish = async () => {
    const payload = buildPayload()
    const res = conv
      ? await convocatoriaService.update(conv.id, payload)
      : await convocatoriaService.create(payload)
    await publishMutation.mutateAsync((res.data as Convocatoria).id)
  }

  const addTech = (tech: string) => {
    const t = tech.trim()
    if (t && !form.technicalRequirements.includes(t)) {
      set('technicalRequirements', [...form.technicalRequirements, t])
    }
    setTechInput('')
  }
  const removeTech = (t: string) =>
    set('technicalRequirements', form.technicalRequirements.filter(x => x !== t))

  const addQuestion = () => {
    const q = questionInput.trim()
    if (q) { set('questions', [...form.questions, q]); setQuestionInput('') }
  }
  const removeQuestion = (i: number) =>
    set('questions', form.questions.filter((_, idx) => idx !== i))

  const isNextDisabled = () => {
    if (step === 1) return !form.companyId || !form.title || !form.startDate || !form.endDate
    if (step === 2) return !form.modality || !form.contractType
    return false
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl border border-[#3c4b35] bg-[#0c1609] shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-[#3c4b35] px-6 py-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#baccaf]">
            {conv ? 'Editar Convocatoria' : 'Nueva Convocatoria'}
          </p>
          <button onClick={onClose} className="text-[#3c4b35] hover:text-[#ffb4ab]">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          <StepBar step={step} />

          {/* STEP 1: Datos Básicos */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Empresa *</label>
                <select
                  value={form.companyId}
                  onChange={e => set('companyId', e.target.value)}
                  className="w-full border border-[#3c4b35] bg-[#182214] px-3 py-2 font-mono text-[12px] text-[#dae6d0] outline-none focus:border-[#42ff00]"
                >
                  <option value="">Selecciona una empresa</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Título *</label>
                <input
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="Ej: Desarrollador Full Stack Senior"
                  className="w-full border border-[#3c4b35] bg-[#182214] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Descripción</label>
                <div className="quill-dark">
                  <ReactQuill
                    theme="snow"
                    value={form.description}
                    onChange={v => set('description', v)}
                    style={{ minHeight: '120px' }}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Ubicación</label>
                <input
                  value={form.location}
                  onChange={e => set('location', e.target.value)}
                  placeholder="Ej: Buenos Aires, Argentina"
                  className="w-full border border-[#3c4b35] bg-[#182214] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Salario mín. (USD)</label>
                  <input
                    type="number" min={0}
                    value={form.salaryMin}
                    onChange={e => set('salaryMin', e.target.value)}
                    placeholder="Opcional"
                    className="w-full border border-[#3c4b35] bg-[#182214] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Salario máx. (USD)</label>
                  <input
                    type="number" min={0}
                    value={form.salaryMax}
                    onChange={e => set('salaryMax', e.target.value)}
                    placeholder="Opcional"
                    className="w-full border border-[#3c4b35] bg-[#182214] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Fecha inicio *</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e => set('startDate', e.target.value)}
                    className="w-full border border-[#3c4b35] bg-[#182214] px-3 py-2 font-mono text-[12px] text-[#dae6d0] outline-none focus:border-[#42ff00]"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Fecha fin *</label>
                  <input
                    type="date"
                    value={form.endDate}
                    min={form.startDate}
                    onChange={e => set('endDate', e.target.value)}
                    className="w-full border border-[#3c4b35] bg-[#182214] px-3 py-2 font-mono text-[12px] text-[#dae6d0] outline-none focus:border-[#42ff00]"
                  />
                </div>
              </div>
              {form.startDate && form.endDate && form.startDate < form.endDate && (
                <CostBadge start={form.startDate} end={form.endDate} />
              )}
            </div>
          )}

          {/* STEP 2: Modalidad y Contrato */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Modalidad *</p>
                <div className="flex flex-wrap gap-2">
                  {MODALITIES.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => set('modality', m)}
                      className={`px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                        form.modality === m
                          ? 'bg-[#42ff00] text-[#083900] font-bold'
                          : 'border border-[#3c4b35] text-[#baccaf] hover:border-[#42ff00] hover:text-[#42ff00]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Tipo de Contrato *</p>
                <div className="flex flex-wrap gap-2">
                  {CONTRACT_TYPES.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => set('contractType', c)}
                      className={`px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                        form.contractType === c
                          ? 'bg-[#42ff00] text-[#083900] font-bold'
                          : 'border border-[#3c4b35] text-[#baccaf] hover:border-[#42ff00] hover:text-[#42ff00]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Requisitos Técnicos */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
                Añade tecnologías y habilidades requeridas
              </p>
              <div className="flex gap-2">
                <input
                  value={techInput}
                  onChange={e => setTechInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech(techInput) } }}
                  placeholder="Escribe o selecciona una tecnología..."
                  className="flex-1 border border-[#3c4b35] bg-[#182214] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
                />
                <button
                  type="button"
                  onClick={() => addTech(techInput)}
                  className="border border-[#42ff00] px-4 py-2 font-mono text-[10px] uppercase text-[#42ff00] hover:bg-[#42ff00] hover:text-[#083900]"
                >
                  Añadir
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {TECH_SUGGESTIONS.filter(t => !form.technicalRequirements.includes(t)).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => addTech(t)}
                    className="border border-[#3c4b35] px-2 py-1 font-mono text-[9px] text-[#3c4b35] hover:border-[#42ff00] hover:text-[#42ff00] transition-colors"
                  >
                    + {t}
                  </button>
                ))}
              </div>
              {form.technicalRequirements.length > 0 && (
                <div>
                  <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-[#3c4b35]">Seleccionados:</p>
                  <div className="flex flex-wrap gap-2">
                    {form.technicalRequirements.map(t => (
                      <span
                        key={t}
                        className="flex items-center gap-1.5 border border-[#42ff00]/40 bg-[#42ff00]/10 px-2 py-1 font-mono text-[10px] text-[#42ff00]"
                      >
                        {t}
                        <button type="button" onClick={() => removeTech(t)} className="opacity-60 hover:opacity-100">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Preguntas */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
                Define preguntas para los postulantes (opcional)
              </p>
              <div className="flex gap-2">
                <input
                  value={questionInput}
                  onChange={e => setQuestionInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addQuestion() } }}
                  placeholder="Ej: ¿Cuántos años de experiencia tienes?"
                  className="flex-1 border border-[#3c4b35] bg-[#182214] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
                />
                <button
                  type="button"
                  onClick={addQuestion}
                  className="border border-[#42ff00] px-4 py-2 font-mono text-[10px] uppercase text-[#42ff00] hover:bg-[#42ff00] hover:text-[#083900]"
                >
                  Añadir
                </button>
              </div>
              {form.questions.length > 0 ? (
                <div className="space-y-2">
                  {form.questions.map((q, i) => (
                    <div key={i} className="flex items-start gap-2 border border-[#3c4b35] bg-[#182214] p-3">
                      <span className="mt-0.5 font-mono text-[10px] text-[#3c4b35]">{i + 1}.</span>
                      <p className="flex-1 font-mono text-[12px] text-[#dae6d0]">{q}</p>
                      <button type="button" onClick={() => removeQuestion(i)} className="text-[#3c4b35] hover:text-[#ffb4ab]">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-mono text-[10px] text-[#3c4b35]">
                  Sin preguntas — los postulantes solo enviarán sus datos de contacto.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer de navegación */}
        <div className="flex items-center justify-between border-t border-[#3c4b35] px-6 py-4">
          <button
            type="button"
            onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
            className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[#baccaf] hover:text-[#dae6d0]"
          >
            <ChevronLeft size={14} />
            {step > 1 ? 'Anterior' : 'Cancelar'}
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => saveMutation.mutate(buildPayload())}
              disabled={saveMutation.isPending}
              className="border border-[#3c4b35] px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#baccaf] hover:border-[#42ff00] hover:text-[#42ff00] disabled:opacity-50"
            >
              {saveMutation.isPending ? '...' : 'Guardar Borrador'}
            </button>

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                disabled={isNextDisabled()}
                className="flex items-center gap-1 border border-[#42ff00] bg-[#42ff00]/10 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#42ff00] hover:bg-[#42ff00] hover:text-[#083900] disabled:opacity-40"
              >
                Siguiente <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveAndPublish}
                disabled={publishMutation.isPending || saveMutation.isPending}
                className="border border-[#42ff00] bg-[#42ff00] px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-[#083900] hover:brightness-110 disabled:opacity-50"
              >
                {publishMutation.isPending ? 'Publicando...' : 'Publicar Convocatoria'}
              </button>
            )}
          </div>
        </div>

        {(saveMutation.isError || publishMutation.isError) && (
          <p className="px-6 pb-4 font-mono text-[10px] text-[#ffb4ab]">
            Error: créditos insuficientes o datos incompletos.
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Finalize Modal ───────────────────────────────────────────────────────────
function FinalizeModal({
  conv, onClose, onFinalized,
}: { conv: Convocatoria; onClose: () => void; onFinalized: (cr: number) => void }) {
  const qc = useQueryClient()
  const { refreshCredits } = useUserAuth()
  const today = new Date()
  const start = conv.startDate ? new Date(conv.startDate) : today
  const end = conv.endDate ? new Date(conv.endDate) : today
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000))
  const daysUsed = Math.min(Math.max(0, Math.round((today.getTime() - start.getTime()) / 86400000)), totalDays)
  const costPerDay = conv.creditCost / totalDays
  const creditsUsed = costPerDay * daysUsed
  const creditsToReturn = Math.max(0, Math.round((conv.creditCost - creditsUsed) * 100) / 100)

  const finalizeMutation = useMutation({
    mutationFn: () => convocatoriaService.finalize(conv.id),
    onSuccess: async () => {
      await refreshCredits()
      qc.invalidateQueries({ queryKey: ['convocatorias', 'mine'] })
      onFinalized(creditsToReturn)
    },
  })

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md border border-[#3c4b35] bg-[#0c1609] p-6">
        <h3 className="mb-2 font-mono text-[14px] font-bold text-[#f0ffe4]">
          ¿Finalizar convocatoria?
        </h3>
        <p className="mb-4 font-mono text-[11px] text-[#baccaf]">
          Esta acción cerrará la convocatoria y devolverá los créditos correspondientes al tiempo no consumido.
        </p>
        <div className="mb-6 border border-[#3c4b35] bg-[#182214] p-4 space-y-2">
          <div className="flex justify-between font-mono text-[11px]">
            <span className="text-[#3c4b35]">Créditos pagados:</span>
            <span className="text-[#dae6d0]">${conv.creditCost}</span>
          </div>
          <div className="flex justify-between font-mono text-[11px]">
            <span className="text-[#3c4b35]">Días transcurridos:</span>
            <span className="text-[#dae6d0]">{daysUsed} / {totalDays}</span>
          </div>
          <div className="flex justify-between font-mono text-[11px]">
            <span className="text-[#3c4b35]">Créditos consumidos:</span>
            <span className="text-[#ffb4ab]">-${creditsUsed.toFixed(2)}</span>
          </div>
          <div className="border-t border-[#3c4b35] pt-2 flex justify-between font-mono text-[13px] font-bold">
            <span className="text-[#baccaf]">Créditos devueltos:</span>
            <span className="text-[#42ff00]">+${creditsToReturn.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-[#3c4b35] py-2 font-mono text-[10px] uppercase text-[#baccaf] hover:border-[#42ff00] hover:text-[#42ff00]"
          >
            Cancelar
          </button>
          <button
            onClick={() => finalizeMutation.mutate()}
            disabled={finalizeMutation.isPending}
            className="flex-1 border border-[#ffb4ab] bg-[#ffb4ab]/10 py-2 font-mono text-[10px] uppercase font-bold text-[#ffb4ab] hover:bg-[#ffb4ab] hover:text-[#3d0000] disabled:opacity-50"
          >
            {finalizeMutation.isPending ? 'Finalizando...' : 'Sí, Finalizar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Active Stats Panel ────────────────────────────────────────────────────────
function ActivePanel({ conv, onFinalize }: { conv: Convocatoria; onFinalize: () => void }) {
  const navigate = useNavigate()
  const { data: apps = [] } = useQuery<{ id: string; applicantName: string; applicantEmail: string; appliedAt: string }[]>({
    queryKey: ['applications', conv.id],
    queryFn: () => convocatoriaService.getApplications(conv.id).then(r => r.data),
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-[#3c4b35] bg-[#182214] p-4 flex items-center gap-4">
          <Eye size={20} className="text-[#42ff00]" />
          <div>
            <p className="font-mono text-[9px] uppercase tracking-wider text-[#3c4b35]">Vistas</p>
            <p className="font-mono text-[24px] font-bold text-[#f0ffe4]">{conv.views}</p>
          </div>
        </div>
        <div className="border border-[#3c4b35] bg-[#182214] p-4 flex items-center gap-4">
          <Users size={20} className="text-[#42ff00]" />
          <div>
            <p className="font-mono text-[9px] uppercase tracking-wider text-[#3c4b35]">Postulantes</p>
            <p className="font-mono text-[24px] font-bold text-[#f0ffe4]">{conv.applicationCount}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/dashboard/convocatorias/${conv.id}/preview`)}
          className="flex items-center gap-2 border border-[#42ff00] bg-[#42ff00]/10 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#42ff00] hover:bg-[#42ff00] hover:text-[#083900] transition-colors"
        >
          <Eye size={13} />
          Preview
        </button>
        <button
          onClick={onFinalize}
          className="flex items-center gap-2 border border-[#ffb4ab]/40 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#ffb4ab] hover:bg-[#ffb4ab]/10 transition-colors"
        >
          Finalizar Convocatoria
        </button>
      </div>

      <div>
        <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">— Postulantes</p>
        {apps.length === 0 ? (
          <p className="font-mono text-[11px] text-[#3c4b35]">Aún no hay postulantes.</p>
        ) : (
          <div className="border border-[#3c4b35] divide-y divide-[#3c4b35]">
            {apps.map(a => (
              <div key={a.id} className="flex items-center justify-between px-4 py-3 hover:bg-[#42ff00]/5">
                <div>
                  <p className="font-mono text-[12px] font-bold text-[#dae6d0]">{a.applicantName}</p>
                  <p className="font-mono text-[10px] text-[#baccaf]">{a.applicantEmail}</p>
                </div>
                <p className="font-mono text-[10px] text-[#3c4b35]">
                  {new Date(a.appliedAt).toLocaleDateString('es-AR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Detail Drawer ─────────────────────────────────────────────────────────────
function DetailDrawer({ conv, companies, onClose }: { conv: Convocatoria; companies: Company[]; onClose: () => void }) {
  const [showWizard, setShowWizard] = useState(false)
  const [showFinalize, setShowFinalize] = useState(false)
  const [finalizeMsg, setFinalizeMsg] = useState('')
  const qc = useQueryClient()

  const company = companies.find(c => c.id === conv.companyId)

  return (
    <>
      <div className="fixed inset-0 z-40 flex justify-end bg-black/40" onClick={onClose}>
        <div
          className="h-full w-full max-w-xl overflow-y-auto border-l border-[#3c4b35] bg-[#0c1609] p-6"
          onClick={e => e.stopPropagation()}
        >
          <div className="mb-6 flex items-start justify-between">
            <div>
              <span className={`inline-block border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${statusBorder(conv.status)}`}>
                {conv.status}
              </span>
              <h3 className="mt-2 font-mono text-[18px] font-bold text-[#f0ffe4]">{conv.title}</h3>
              <p className="font-mono text-[11px] text-[#baccaf]">{company?.name ?? conv.companyId.slice(-8)}</p>
            </div>
            <button onClick={onClose} className="text-[#3c4b35] hover:text-[#ffb4ab]"><X size={18} /></button>
          </div>

          {finalizeMsg && (
            <div className="mb-4 border border-[#42ff00]/40 bg-[#42ff00]/5 p-3 font-mono text-[11px] text-[#42ff00]">
              {finalizeMsg}
            </div>
          )}

          {conv.status === 'DRAFT' && (
            <div className="mb-6">
              <button
                onClick={() => setShowWizard(true)}
                className="flex items-center gap-2 border border-[#42ff00] bg-[#42ff00]/10 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#42ff00] hover:bg-[#42ff00] hover:text-[#083900]"
              >
                Editar y Publicar
              </button>
            </div>
          )}

          {conv.status === 'ACTIVE' && (
            <ActivePanel
              conv={conv}
              onFinalize={() => setShowFinalize(true)}
            />
          )}

          <div className="mt-6 space-y-4">
            {conv.location && (
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider text-[#3c4b35]">Ubicación</p>
                <p className="font-mono text-[12px] text-[#dae6d0]">{conv.location}</p>
              </div>
            )}
            {conv.modality && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-[#3c4b35]">Modalidad</p>
                  <p className="font-mono text-[12px] text-[#dae6d0]">{conv.modality}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-[#3c4b35]">Contrato</p>
                  <p className="font-mono text-[12px] text-[#dae6d0]">{conv.contractType}</p>
                </div>
              </div>
            )}
            {(conv.salaryMin || conv.salaryMax) && (
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider text-[#3c4b35]">Rango Salarial</p>
                <p className="font-mono text-[12px] text-[#42ff00]">
                  ${conv.salaryMin?.toLocaleString()} – ${conv.salaryMax?.toLocaleString()} USD
                </p>
              </div>
            )}
            {conv.startDate && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-[#3c4b35]">Fecha Inicio</p>
                  <p className="font-mono text-[12px] text-[#dae6d0]">{conv.startDate.slice(0, 10)}</p>
                </div>
                {conv.endDate && (
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-[#3c4b35]">Fecha Fin</p>
                    <p className="font-mono text-[12px] text-[#dae6d0]">{conv.endDate.slice(0, 10)}</p>
                  </div>
                )}
              </div>
            )}
            {conv.technicalRequirements?.length > 0 && (
              <div>
                <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-[#3c4b35]">Requisitos Técnicos</p>
                <div className="flex flex-wrap gap-2">
                  {conv.technicalRequirements.map(t => (
                    <span key={t} className="border border-[#42ff00]/30 px-2 py-0.5 font-mono text-[10px] text-[#42ff00]">{t}</span>
                  ))}
                </div>
              </div>
            )}
            {conv.creditCost > 0 && (
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider text-[#3c4b35]">Costo en Créditos</p>
                <p className="font-mono text-[12px] text-[#42ff00]">${conv.creditCost} USD</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showWizard && (
        <DraftWizard
          conv={conv}
          companies={companies}
          onClose={() => setShowWizard(false)}
          onSaved={() => { setShowWizard(false); qc.invalidateQueries({ queryKey: ['convocatorias', 'mine'] }); onClose() }}
        />
      )}

      {showFinalize && (
        <FinalizeModal
          conv={conv}
          onClose={() => setShowFinalize(false)}
          onFinalized={(cr) => {
            setShowFinalize(false)
            setFinalizeMsg(`Convocatoria finalizada. Créditos devueltos: $${cr.toFixed(2)}`)
          }}
        />
      )}
    </>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ConvocatoriasPage() {
  const qc = useQueryClient()
  const [showWizard, setShowWizard] = useState(false)
  const [selected, setSelected] = useState<Convocatoria | null>(null)

  const { data: convocatorias = [], isLoading } = useQuery<Convocatoria[]>({
    queryKey: ['convocatorias', 'mine'],
    queryFn: () => convocatoriaService.listMine().then(r => r.data),
  })

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: () => companyService.list().then(r => r.data),
  })

  const active = convocatorias.filter(c => c.status === 'ACTIVE').length
  const draft = convocatorias.filter(c => c.status === 'DRAFT').length

  const handleRowClick = useCallback((c: Convocatoria) => setSelected(c), [])

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-[#f0ffe4]">Convocatorias</h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
            <span className="text-[#42ff00]">{active}</span> activas ·{' '}
            <span className="text-[#ffe066]">{draft}</span> borradores ·{' '}
            <span>{convocatorias.length}</span> total
          </p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-2 border border-[#42ff00] bg-[#42ff00]/10 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#42ff00] hover:bg-[#42ff00] hover:text-[#083900] transition-colors"
        >
          <Plus size={14} />
          Nueva Convocatoria
        </button>
      </header>

      <div className="overflow-hidden border border-[#3c4b35] bg-[#182214]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#141e10]">
                {['Título', 'Empresa', 'Fechas', 'Costo', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="border-b border-[#3c4b35] px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3c4b35]">
              {isLoading ? (
                <tr><td colSpan={6} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">Cargando...</td></tr>
              ) : convocatorias.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center">
                    <p className="font-mono text-[10px] text-[#baccaf]">Sin convocatorias publicadas</p>
                    <p className="mt-1 font-mono text-[9px] text-[#3c4b35]">Usa el botón "Nueva Convocatoria" para publicar una.</p>
                  </td>
                </tr>
              ) : convocatorias.map(c => {
                const company = companies.find(co => co.id === c.companyId)
                return (
                  <tr key={c.id} className="transition-colors hover:bg-[#42ff00]/5">
                    <td className="px-5 py-4">
                      <p className="font-mono text-[12px] font-bold text-[#dae6d0]">{c.title}</p>
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-[#baccaf]">
                      {company?.name ?? c.companyId.slice(-8)}
                    </td>
                    <td className="px-5 py-4 font-mono text-[10px] text-[#baccaf]">
                      {c.startDate ? <>{c.startDate.slice(0, 10)} → {c.endDate?.slice(0, 10)}</> : '—'}
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-[#42ff00]">
                      {c.creditCost > 0 ? `$${c.creditCost}` : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider ${statusColor(c.status)}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleRowClick(c)}
                        className="flex items-center gap-1.5 border border-[#3c4b35] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[#baccaf] hover:border-[#42ff00] hover:text-[#42ff00] transition-colors"
                      >
                        <Eye size={12} />
                        Ver
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showWizard && (
        <DraftWizard
          conv={null}
          companies={companies}
          onClose={() => setShowWizard(false)}
          onSaved={() => {
            setShowWizard(false)
            qc.invalidateQueries({ queryKey: ['convocatorias', 'mine'] })
          }}
        />
      )}

      {selected && (
        <DetailDrawer
          conv={selected}
          companies={companies}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
  const [paymentAmount, setPaymentAmount] = useState(10)

  const { data: convocatorias = [], isLoading } = useQuery<Convocatoria[]>({
    queryKey: ['convocatorias', 'mine'],
    queryFn: () => convocatoriaService.listMine().then(r => r.data),
  })

  const { data: companies = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ['companies'],
    queryFn: () => companyService.list().then(r => r.data),
  })

  const { register, handleSubmit, reset } = useForm<ConvocatoriaForm>()

  const create = useMutation({
    mutationFn: (data: object) => convocatoriaService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['convocatorias'] })
      reset()
      setShowForm(false)
    },
  })

  // stripe payment: create intent then confirm
  const payMutation = useMutation({
    mutationFn: (amount: number) => paymentService.createPaymentIntent(amount).then(r => r.data),
    onSuccess: async (data) => {
      const stripe = await stripePromise
      if (stripe) {
        await stripe.confirmCardPayment(data.clientSecret)
        qc.invalidateQueries({ queryKey: ['balance'] })
        setShowPayment(false)
      }
    },
  })

  const active = convocatorias.filter(c => c.status === 'ACTIVE').length

  return (
    <div className="p-8">
      {/* header */}
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-[#f0ffe4]">Convocatorias</h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
            <span className="text-[#42ff00]">{active}</span> activas · {convocatorias.length} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPayment(v => !v)}
            className="flex items-center gap-2 border border-[#3c4b35] bg-[#182214] px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#baccaf] hover:border-[#42ff00] hover:text-[#42ff00] transition-colors"
          >
            <CreditCard size={14} />
            Agregar Créditos
          </button>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 border border-[#42ff00] bg-[#42ff00]/10 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#42ff00] hover:bg-[#42ff00] hover:text-[#083900] transition-colors"
          >
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? 'Cancelar' : 'Nueva Convocatoria'}
          </button>
        </div>
      </header>

      {/* stripe payment panel */}
      {showPayment && (
        <div className="mb-6 border border-[#3c4b35] bg-[#182214] p-6">
          <p className="mb-4 font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">
            — Agregar Créditos (USD)
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              value={paymentAmount}
              onChange={e => setPaymentAmount(Number(e.target.value))}
              className="w-32 border border-[#3c4b35] bg-[#232d1e] px-3 py-2 font-mono text-[12px] text-[#dae6d0] outline-none focus:border-[#42ff00]"
            />
            <button
              onClick={() => payMutation.mutate(paymentAmount)}
              disabled={payMutation.isPending}
              className="border border-[#42ff00] bg-[#42ff00] px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-[#083900] hover:brightness-110 disabled:opacity-50"
            >
              {payMutation.isPending ? 'Procesando...' : `Pagar $${paymentAmount}`}
            </button>
            <button
              onClick={() => setShowPayment(false)}
              className="font-mono text-[10px] uppercase tracking-wider text-[#baccaf] hover:text-[#42ff00]"
            >
              Cancelar
            </button>
          </div>
          {payMutation.isError && (
            <p className="mt-2 font-mono text-[10px] text-[#ffb4ab]">Error al procesar el pago.</p>
          )}
        </div>
      )}

      {/* create form */}
      {showForm && (
        <div className="mb-6 border border-[#3c4b35] bg-[#182214] p-6">
          <p className="mb-4 font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">
            — Nueva Convocatoria
          </p>
          <form onSubmit={handleSubmit(d => create.mutate(d))} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select
              {...register('companyId')}
              className="sm:col-span-2 border border-[#3c4b35] bg-[#232d1e] px-3 py-2 font-mono text-[12px] text-[#dae6d0] outline-none focus:border-[#42ff00]"
            >
              <option value="">Selecciona una empresa</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input
              {...register('title')}
              placeholder="Título de la convocatoria"
              className="sm:col-span-2 border border-[#3c4b35] bg-[#232d1e] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
            />
            <input
              {...register('description')}
              placeholder="Descripción"
              className="sm:col-span-2 border border-[#3c4b35] bg-[#232d1e] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
            />
            <input
              {...register('location')}
              placeholder="Ubicación"
              className="border border-[#3c4b35] bg-[#232d1e] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
            />
            <button
              type="submit"
              disabled={create.isPending}
              className="border border-[#42ff00] bg-[#42ff00] py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-[#083900] hover:brightness-110 disabled:opacity-50"
            >
              {create.isPending ? 'Creando...' : 'Publicar'}
            </button>
          </form>
          {create.isError && (
            <p className="mt-2 font-mono text-[10px] text-[#ffb4ab]">Error al crear la convocatoria.</p>
          )}
        </div>
      )}

      {/* list */}
      <div className="overflow-hidden border border-[#3c4b35] bg-[#182214]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#141e10]">
                {['Título', 'Empresa', 'Estado', 'ID'].map(h => (
                  <th key={h} className="border-b border-[#3c4b35] px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3c4b35]">
              {isLoading ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">Cargando...</td></tr>
              ) : convocatorias.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center">
                    <p className="font-mono text-[10px] text-[#baccaf]">Sin convocatorias publicadas</p>
                    <p className="mt-1 font-mono text-[9px] text-[#3c4b35]">Usa el botón "Nueva Convocatoria" para publicar una.</p>
                  </td>
                </tr>
              ) : convocatorias.map(c => (
                <tr key={c.id} className="transition-colors hover:bg-[#42ff00]/5">
                  <td className="px-5 py-4">
                    <p className="font-mono text-[12px] font-bold text-[#dae6d0]">{c.title}</p>
                  </td>
                  <td className="px-5 py-4 font-mono text-[11px] text-[#baccaf]">{c.companyId.slice(-8)}</td>
                  <td className="px-5 py-4">
                    <span className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider ${statusColor(c.status)}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-[10px] text-[#3c4b35]">{c.id.slice(-8)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
