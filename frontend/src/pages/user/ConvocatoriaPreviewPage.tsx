import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { convocatoriaService } from '@/lib/services/user/convocatoria.service'
import { MapPin, Calendar, DollarSign, Briefcase, Users, Eye, X } from 'lucide-react'

type Convocatoria = {
  id: string; title: string; status: string; companyId: string
  description: string; location: string; modality: string; contractType: string
  salaryMin?: number; salaryMax?: number
  startDate?: string; endDate?: string
  technicalRequirements: string[]; questions: string[]
  views: number; applicationCount: number; creditCost: number
}

export default function ConvocatoriaPreviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: conv, isLoading } = useQuery<Convocatoria>({
    queryKey: ['convocatoria', id],
    queryFn: () => convocatoriaService.get(id!).then(r => r.data),
    enabled: !!id,
  })

  // register view
  useEffect(() => {
    if (id) convocatoriaService.incrementView(id).catch(() => null)
  }, [id])

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

  return (
    <div className="min-h-screen bg-[#0c1609] py-12 px-4">
      {/* Close button (back to dashboard) */}
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#3c4b35]">
            PREVIEW — Vista del postulante
          </p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[#baccaf] hover:text-[#ffb4ab]"
          >
            <X size={14} />
            Cerrar
          </button>
        </div>

        {/* Job Card */}
        <div className="border border-[#3c4b35] bg-[#182214] p-8">
          {/* Header */}
          <div className="mb-8 border-b border-[#3c4b35] pb-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {conv.modality && (
                <span className="border border-[#3c4b35] px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#baccaf]">
                  {conv.modality}
                </span>
              )}
              {conv.contractType && (
                <span className="border border-[#3c4b35] px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#baccaf]">
                  {conv.contractType}
                </span>
              )}
            </div>
            <h1 className="mb-2 font-mono text-[28px] font-bold text-[#f0ffe4]">{conv.title}</h1>

            <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-[#baccaf]">
              {conv.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-[#42ff00]" />
                  {conv.location}
                </span>
              )}
              {(conv.salaryMin || conv.salaryMax) && (
                <span className="flex items-center gap-1.5 text-[#42ff00]">
                  <DollarSign size={12} />
                  {conv.salaryMin ? `$${conv.salaryMin.toLocaleString()}` : ''}
                  {conv.salaryMin && conv.salaryMax ? ' – ' : ''}
                  {conv.salaryMax ? `$${conv.salaryMax.toLocaleString()} USD` : 'USD'}
                </span>
              )}
              {conv.startDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-[#42ff00]" />
                  {conv.startDate.slice(0, 10)} → {conv.endDate?.slice(0, 10)}
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="mt-4 flex gap-4 font-mono text-[10px] text-[#3c4b35]">
              <span className="flex items-center gap-1"><Eye size={11} /> {conv.views} vistas</span>
              <span className="flex items-center gap-1"><Users size={11} /> {conv.applicationCount} postulantes</span>
            </div>
          </div>

          {/* Description */}
          {conv.description && (
            <div className="mb-8">
              <h2 className="mb-3 font-mono text-[11px] uppercase tracking-widest text-[#3c4b35]">Descripción</h2>
              <div
                className="prose prose-sm max-w-none font-mono text-[13px] leading-relaxed text-[#dae6d0]"
                dangerouslySetInnerHTML={{ __html: conv.description }}
              />
            </div>
          )}

          {/* Tech requirements */}
          {conv.technicalRequirements?.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-3 font-mono text-[11px] uppercase tracking-widest text-[#3c4b35]">Requisitos Técnicos</h2>
              <div className="flex flex-wrap gap-2">
                {conv.technicalRequirements.map(t => (
                  <span key={t} className="border border-[#42ff00]/40 bg-[#42ff00]/5 px-3 py-1 font-mono text-[11px] text-[#42ff00]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Questions preview */}
          {conv.questions?.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-3 font-mono text-[11px] uppercase tracking-widest text-[#3c4b35]">
                Preguntas al Postulante
              </h2>
              <div className="space-y-2">
                {conv.questions.map((q, i) => (
                  <div key={i} className="flex gap-2 border-l-2 border-[#42ff00]/30 pl-3">
                    <span className="font-mono text-[10px] text-[#3c4b35]">{i + 1}.</span>
                    <p className="font-mono text-[12px] text-[#dae6d0]">{q}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="border-t border-[#3c4b35] pt-6">
            <Link
              to={`/convocatoria/${conv.id}/apply`}
              className="inline-flex items-center gap-2 border border-[#42ff00] bg-[#42ff00] px-8 py-3 font-mono text-[12px] font-bold uppercase tracking-wider text-[#083900] hover:brightness-110 transition-all"
            >
              <Briefcase size={15} />
              Postularme
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
