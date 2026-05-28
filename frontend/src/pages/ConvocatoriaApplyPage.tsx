import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { MapPin, Briefcase, Calendar, CheckCircle, Upload, X } from 'lucide-react'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'

type Convocatoria = {
  id: string; title: string; companyId: string
  description: string; location: string; modality: string; contractType: string
  salaryMin?: number; salaryMax?: number
  startDate?: string; endDate?: string
  technicalRequirements: string[]; questions: string[]
}

export default function ConvocatoriaApplyPage() {
  const { id } = useParams<{ id: string }>()

  const { data: conv, isLoading } = useQuery<Convocatoria>({
    queryKey: ['convocatoria-public', id],
    queryFn: () => axios.get(`${BASE}/convocatorias/${id}`).then(r => r.data),
    enabled: !!id,
  })

  const [form, setForm] = useState({
    applicantName: '',
    applicantEmail: '',
    applicantPhone: '',
    applicantLinkedIn: '',
  })
  const [answers, setAnswers] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const setAnswer = (i: number, v: string) => {
    setAnswers(prev => { const copy = [...prev]; copy[i] = v; return copy })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setSubmitting(true)
    setError('')

    const fd = new FormData()
    fd.append('applicantName', form.applicantName)
    fd.append('applicantEmail', form.applicantEmail)
    if (form.applicantPhone) fd.append('applicantPhone', form.applicantPhone)
    if (form.applicantLinkedIn) fd.append('applicantLinkedIn', form.applicantLinkedIn)
    ;(conv?.questions ?? []).forEach((_, i) => {
      fd.append('answers', answers[i] ?? '')
    })
    if (file) fd.append('file', file)

    try {
      await axios.post(`${BASE}/convocatorias/${id}/apply`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSuccess(true)
    } catch {
      setError('No fue posible enviar la postulación. Por favor intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c1609]">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#3c4b35]">Cargando...</p>
      </div>
    )
  }
  if (!conv) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c1609]">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#ffb4ab]">Convocatoria no encontrada</p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c1609] p-4">
        <div className="w-full max-w-md border border-[#42ff00]/40 bg-[#182214] p-8 text-center">
          <CheckCircle size={40} className="mx-auto mb-4 text-[#42ff00]" />
          <h2 className="mb-2 font-mono text-[20px] font-bold text-[#f0ffe4]">¡Postulación enviada!</h2>
          <p className="mb-6 font-mono text-[12px] text-[#baccaf]">
            Tu postulación para <span className="text-[#42ff00]">{conv.title}</span> fue recibida correctamente.
          </p>
          <Link
            to="/"
            className="inline-block border border-[#3c4b35] px-6 py-2 font-mono text-[10px] uppercase tracking-wider text-[#baccaf] hover:border-[#42ff00] hover:text-[#42ff00]"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0c1609] py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Job summary */}
        <div className="mb-6 border border-[#3c4b35] bg-[#182214] p-5">
          <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">Postulando a</p>
          <h1 className="mb-2 font-mono text-[20px] font-bold text-[#f0ffe4]">{conv.title}</h1>
          <div className="flex flex-wrap gap-3 font-mono text-[10px] text-[#baccaf]">
            {conv.location && (
              <span className="flex items-center gap-1"><MapPin size={10} className="text-[#42ff00]" />{conv.location}</span>
            )}
            {conv.modality && (
              <span className="flex items-center gap-1"><Briefcase size={10} className="text-[#42ff00]" />{conv.modality}</span>
            )}
            {conv.endDate && (
              <span className="flex items-center gap-1"><Calendar size={10} className="text-[#42ff00]" />Cierra: {conv.endDate.slice(0, 10)}</span>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="border border-[#3c4b35] bg-[#182214] p-6 space-y-5">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-[#3c4b35] mb-2">Tus datos</h2>

          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Nombre completo *</label>
            <input
              required
              value={form.applicantName}
              onChange={e => set('applicantName', e.target.value)}
              placeholder="Tu nombre"
              className="w-full border border-[#3c4b35] bg-[#0c1609] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
            />
          </div>

          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Email *</label>
            <input
              type="email"
              required
              value={form.applicantEmail}
              onChange={e => set('applicantEmail', e.target.value)}
              placeholder="tu@email.com"
              className="w-full border border-[#3c4b35] bg-[#0c1609] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Teléfono</label>
              <input
                value={form.applicantPhone}
                onChange={e => set('applicantPhone', e.target.value)}
                placeholder="+54 11..."
                className="w-full border border-[#3c4b35] bg-[#0c1609] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">LinkedIn</label>
              <input
                value={form.applicantLinkedIn}
                onChange={e => set('applicantLinkedIn', e.target.value)}
                placeholder="linkedin.com/in/..."
                className="w-full border border-[#3c4b35] bg-[#0c1609] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
              />
            </div>
          </div>

          {/* Dynamic questions */}
          {conv.questions?.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-mono text-[11px] uppercase tracking-widest text-[#3c4b35]">Preguntas</h2>
              {conv.questions.map((q, i) => (
                <div key={i}>
                  <label className="mb-1 block font-mono text-[11px] text-[#dae6d0]">
                    {i + 1}. {q}
                  </label>
                  <textarea
                    value={answers[i] ?? ''}
                    onChange={e => setAnswer(i, e.target.value)}
                    rows={2}
                    className="w-full border border-[#3c4b35] bg-[#0c1609] px-3 py-2 font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00] resize-none"
                  />
                </div>
              ))}
            </div>
          )}

          {/* CV Upload */}
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
              CV / Portfolio (PDF, imagen — opcional)
            </label>
            {file ? (
              <div className="flex items-center gap-3 border border-[#42ff00]/40 bg-[#42ff00]/5 px-3 py-2">
                <Upload size={13} className="text-[#42ff00]" />
                <span className="flex-1 font-mono text-[11px] text-[#42ff00]">{file.name}</span>
                <button type="button" onClick={() => setFile(null)} className="text-[#3c4b35] hover:text-[#ffb4ab]">
                  <X size={13} />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center gap-3 border border-dashed border-[#3c4b35] px-4 py-4 hover:border-[#42ff00] transition-colors">
                <Upload size={16} className="text-[#3c4b35]" />
                <span className="font-mono text-[11px] text-[#3c4b35]">Haz clic para subir tu CV o portfolio</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  className="sr-only"
                  onChange={e => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            )}
          </div>

          {error && (
            <p className="font-mono text-[10px] text-[#ffb4ab]">{error}</p>
          )}

          <div className="pt-2 flex justify-between items-center">
            <Link
              to={`/convocatoria/${id}/preview`}
              className="font-mono text-[10px] uppercase tracking-wider text-[#3c4b35] hover:text-[#baccaf]"
            >
              ← Ver convocatoria
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="border border-[#42ff00] bg-[#42ff00] px-8 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#083900] hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? 'Enviando...' : 'Enviar Postulación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
