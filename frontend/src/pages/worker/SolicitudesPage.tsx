import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { requestService } from '@/lib/services/worker/request.service'
import { createSocketClient } from '@/lib/websocket/socket'
import { Client } from '@stomp/stompjs'
import { RefreshCw, Eye, CheckCircle, Clock, X, ExternalLink, ChevronDown, Bookmark } from 'lucide-react'

type DocReview = { documentKey: string; name?: string; url?: string; fileName?: string; status: string; observation?: string }
type InfoReview = { field: string; value: string; status: string; observation?: string }
type ActionEntry = { workerId: string; action: string; notes: string; timestamp: string }
type PaymentSummary = { bankName?: string; accountType?: string; currency?: string }
type ContractSummary = { signature?: string; signedAt?: string; accepted?: boolean }
type Request = {
  informationReviews: InfoReview[]
  id: string
  userId: string
  assignedWorkerId?: string
  status: string
  fullName?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  documentReviews: DocReview[]
  actionHistory: ActionEntry[]
  createdAt: string
  updatedAt: string
  documentUrls?: Record<string, string>
  paymentSummary?: PaymentSummary
  contractSummary?: ContractSummary
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'PENDIENTE', IN_REVIEW: 'EN REVISIÓN', APPROVED: 'APROBADO', REJECTED: 'RECHAZADO',
}
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'border-[#baccaf] text-[#baccaf]',
  IN_REVIEW: 'border-blue-400 text-blue-400',
  APPROVED: 'border-[#42ff00] text-[#42ff00]',
  REJECTED: 'border-[#ffb4ab] text-[#ffb4ab]',
}

const FIELD_LABELS: Record<string, string> = {
  fullName: 'Nombre completo',
  email: 'Correo electrónico',
  phone: 'Teléfono',
  dateOfBirth: 'Fecha de nacimiento',
  address: 'Dirección',
  city: 'Ciudad',
  state: 'Estado',
  zipCode: 'Código postal',
  country: 'País',
}

function DetailPanel({ req, onClose }: { req: Request; onClose: () => void }) {
  const qc = useQueryClient()

  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(['personal', 'documentos', 'pago_contrato', 'historial'])
  )
  const [infoReviews, setInfoReviews] = useState<InfoReview[]>(req.informationReviews ?? [])
  const [docReviews, setDocReviews] = useState<DocReview[]>(req.documentReviews ?? [])
  const [flaggedInfo, setFlaggedInfo] = useState<Set<string>>(new Set())
  const [flaggedDocs, setFlaggedDocs] = useState<Set<string>>(new Set())
  const [rejectTarget, setRejectTarget] = useState<{ type: 'info' | 'doc' | 'overall'; key: string } | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [mutError, setMutError] = useState<string | null>(null)

  const toggleSection = (key: string) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const reviewDocMut = useMutation({
    mutationFn: ({ key, status, observation }: { key: string; status: string; observation?: string }) =>
      requestService.reviewDocument(req.id, key, { status, observation }),
    onSuccess: (_, vars) => {
      setMutError(null)
      qc.invalidateQueries({ queryKey: ['requests'] })
      setDocReviews(prev => prev.map(d => d.documentKey === vars.key ? { ...d, status: vars.status } : d))
      setFlaggedDocs(prev => { const n = new Set(prev); n.delete(vars.key); return n })
    },
    onError: (e: unknown) => setMutError(e instanceof Error ? e.message : 'Error al actualizar documento'),
  })

  const reviewInfoMut = useMutation({
    mutationFn: ({ field, status, observation }: { field: string; status: string; observation?: string }) =>
      requestService.reviewInformation(req.id, field, { status, observation }),
    onSuccess: (_, vars) => {
      setMutError(null)
      qc.invalidateQueries({ queryKey: ['requests'] })
      setInfoReviews(prev => prev.map(r => r.field === vars.field ? { ...r, status: vars.status } : r))
      setFlaggedInfo(prev => { const n = new Set(prev); n.delete(vars.field); return n })
    },
    onError: (e: unknown) => setMutError(e instanceof Error ? e.message : 'Error al actualizar campo'),
  })

  const approveMut = useMutation({
    mutationFn: () => requestService.updateStatus(req.id, { status: 'APPROVED', notes: 'Información verificada' }),
    onSuccess: async () => { await qc.refetchQueries({ queryKey: ['requests'] }); onClose() },
  })
  const rejectMut = useMutation({
    mutationFn: (notes: string) => requestService.updateStatus(req.id, { status: 'REJECTED', notes }),
    onSuccess: async () => { await qc.refetchQueries({ queryKey: ['requests'] }); onClose() },
  })
  const deleteMut = useMutation({
    mutationFn: () => requestService.deleteRejected(req.id),
    onSuccess: async () => { await qc.refetchQueries({ queryKey: ['requests'] }); onClose() },
  })

  const confirmReject = () => {
    if (!rejectTarget) return
    if (rejectTarget.type === 'info') {
      reviewInfoMut.mutate({ field: rejectTarget.key, status: 'REJECTED', observation: rejectNote })
    } else if (rejectTarget.type === 'doc') {
      reviewDocMut.mutate({ key: rejectTarget.key, status: 'REJECTED', observation: rejectNote })
    } else {
      rejectMut.mutate(rejectNote || 'Solicitud rechazada')
    }
    setRejectTarget(null)
    setRejectNote('')
  }

  const infoApproved = infoReviews.filter(r => r.status === 'APPROVED').length
  const docsApproved = docReviews.filter(d => d.status === 'APPROVED').length
  const allInfoDone = infoReviews.length > 0 && infoReviews.every(r => r.status !== 'PENDING')
  const allDocsDone = docReviews.length > 0 && docReviews.every(d => d.status !== 'PENDING')
  const hasPayment = req.paymentSummary && (req.paymentSummary.bankName || req.paymentSummary.accountType)
  const hasContract = req.contractSummary && req.contractSummary.signature
  const extraDocUrls = req.documentUrls
    ? Object.entries(req.documentUrls).filter(([key]) => !docReviews.some(d => d.documentKey === key))
    : []

  const statusBadge = (status: string, flagged?: boolean) => {
    if (flagged) return (
      <span className="flex items-center gap-1 font-mono text-[10px] text-yellow-400">
        <Bookmark size={11} /> Ver después
      </span>
    )
    switch (status) {
      case 'APPROVED': return <span className="flex items-center gap-1 font-mono text-[10px] text-[#42ff00]"><CheckCircle size={11} /> Aprobado</span>
      case 'REJECTED': return <span className="flex items-center gap-1 font-mono text-[10px] text-[#ffb4ab]"><X size={11} /> Rechazado</span>
      default: return <span className="flex items-center gap-1 font-mono text-[10px] text-[#baccaf]"><Clock size={11} /> Pendiente</span>
    }
  }

  const pendingBusy = reviewDocMut.isPending || reviewInfoMut.isPending

  const itemActions = (type: 'info' | 'doc', key: string, status: string, flagged: boolean) => {
    const onApprove = () => type === 'info'
      ? reviewInfoMut.mutate({ field: key, status: 'APPROVED' })
      : reviewDocMut.mutate({ key, status: 'APPROVED' })
    const onReject = () => { setRejectTarget({ type, key }); setRejectNote('') }
    const onFlag = () => type === 'info'
      ? setFlaggedInfo(prev => { const n = new Set(prev); if (n.has(key)) n.delete(key); else n.add(key); return n })
      : setFlaggedDocs(prev => { const n = new Set(prev); if (n.has(key)) n.delete(key); else n.add(key); return n })

    return (
      <div className="flex items-center flex-wrap gap-1.5 mt-2">
        {status !== 'APPROVED' && (
          <button
            onClick={onApprove}
            disabled={pendingBusy}
            className="border border-[#42ff00] px-2 py-0.5 font-mono text-[10px] text-[#42ff00] hover:bg-[#42ff00] hover:text-[#083900] disabled:opacity-50 transition-colors"
          >
            ✓ Aprobar
          </button>
        )}
        {status !== 'REJECTED' && (
          <button
            onClick={onReject}
            disabled={pendingBusy}
            className="border border-[#ffb4ab] px-2 py-0.5 font-mono text-[10px] text-[#ffb4ab] hover:bg-[#ffb4ab]/20 disabled:opacity-50 transition-colors"
          >
            ✗ Rechazar
          </button>
        )}
        {status === 'PENDING' && (
          <button
            onClick={onFlag}
            disabled={pendingBusy}
            className={`border px-2 py-0.5 font-mono text-[10px] transition-colors disabled:opacity-50 ${
              flagged
                ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10'
                : 'border-[#3c4b35] text-[#baccaf] hover:border-yellow-400 hover:text-yellow-400'
            }`}
          >
            🔖 {flagged ? 'Quitar' : 'Ver después'}
          </button>
        )}
      </div>
    )
  }

  const AccordionHeader = ({
    sectionKey, label, badge, done,
  }: { sectionKey: string; label: string; badge?: string; done?: boolean }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between px-6 py-3 bg-[#141e10] hover:bg-[#1a2614] transition-colors"
    >
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#f0ffe4]">{label}</span>
        {badge !== undefined && (
          <span className="border border-[#3c4b35] px-1.5 py-0.5 font-mono text-[9px] text-[#baccaf]">{badge}</span>
        )}
        {done && <CheckCircle size={12} className="text-[#42ff00]" />}
      </div>
      <ChevronDown
        size={14}
        className={`text-[#baccaf] transition-transform duration-200 ${openSections.has(sectionKey) ? 'rotate-180' : ''}`}
      />
    </button>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col border border-[#3c4b35] bg-[#0c1609] shadow-2xl" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-[#3c4b35] px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="font-mono text-[13px] uppercase tracking-wider text-[#f0ffe4]">
              Solicitud_<span className="text-[#42ff00]">#{req.id.slice(-8).toUpperCase()}</span>
            </h2>
            <span className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${STATUS_COLORS[req.status] ?? 'border-[#3c4b35] text-[#baccaf]'}`}>
              {STATUS_LABELS[req.status] ?? req.status}
            </span>
          </div>
          <button onClick={onClose} className="text-[#baccaf] hover:text-[#f0ffe4]"><X size={18} /></button>
        </div>

        {/* Meta strip */}
        <div className="shrink-0 grid grid-cols-3 border-b border-[#3c4b35] bg-[#141e10]">
          {([
            ['Usuario', req.userId.slice(-12)],
            ['Trabajador', req.assignedWorkerId?.slice(-12) ?? '—'],
            ['Actualizado', new Date(req.updatedAt).toLocaleDateString('es-AR')],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} className="px-6 py-3 border-r border-[#3c4b35] last:border-r-0">
              <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">{label}</p>
              <p className="font-mono text-[11px] text-[#dae6d0] mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#3c4b35]">

          {/* Global mutation error */}
          {mutError && (
            <div className="flex items-center justify-between gap-3 border-b border-[#ffb4ab]/30 bg-[#1a0d0d] px-6 py-2">
              <p className="font-mono text-[10px] text-[#ffb4ab]">{mutError}</p>
              <button onClick={() => setMutError(null)} className="text-[#ffb4ab] hover:text-white"><X size={12} /></button>
            </div>
          )}

          {/* Inline rejection panel */}
          {rejectTarget && (
            <div className="border-b border-[#ffb4ab]/40 bg-[#1a0d0d] px-6 py-4">
              <p className="font-mono text-[11px] text-[#ffb4ab] mb-3">
                Motivo de rechazo
                {rejectTarget.type === 'info' && ` — ${FIELD_LABELS[rejectTarget.key] ?? rejectTarget.key}`}
                {rejectTarget.type === 'doc' && ` — ${rejectTarget.key}`}
                {rejectTarget.type === 'overall' && ' (solicitud completa)'}
              </p>
              <textarea
                value={rejectNote}
                onChange={e => setRejectNote(e.target.value)}
                placeholder="Motivo (opcional)"
                rows={2}
                className="w-full bg-[#141e10] border border-[#3c4b35] px-3 py-2 font-mono text-[11px] text-[#dae6d0] placeholder:text-[#3c4b35] resize-none focus:outline-none focus:border-[#ffb4ab]"
              />
              <div className="flex gap-2 mt-2 justify-end">
                <button
                  onClick={() => { setRejectTarget(null); setRejectNote('') }}
                  className="border border-[#3c4b35] px-3 py-1 font-mono text-[10px] text-[#baccaf] hover:border-[#42ff00]"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmReject}
                  className="border border-[#ffb4ab] bg-[#ffb4ab] px-3 py-1 font-mono text-[10px] font-bold text-[#1a0d0d] hover:brightness-110"
                >
                  Confirmar rechazo
                </button>
              </div>
            </div>
          )}

          {/* ─── PASO 1: Información Personal ─── */}
          {infoReviews.length > 0 && (
            <div className="border-b border-[#3c4b35]">
              <AccordionHeader
                sectionKey="personal"
                label="Información Personal"
                badge={`${infoApproved}/${infoReviews.length}`}
                done={allInfoDone}
              />
              {openSections.has('personal') && (
                <div className="divide-y divide-[#3c4b35] bg-[#0c1609]">
                  {infoReviews.map(info => {
                    const isFlagged = flaggedInfo.has(info.field)
                    return (
                      <div key={info.field} className="px-6 py-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">
                              {FIELD_LABELS[info.field] ?? info.field}
                            </p>
                            <p className="font-mono text-[12px] text-[#dae6d0] mt-0.5 break-words">{info.value}</p>
                            {info.observation && (
                              <p className="font-mono text-[9px] text-[#ffb4ab] mt-0.5 italic">{info.observation}</p>
                            )}
                          </div>
                          <div className="shrink-0">{statusBadge(info.status, isFlagged)}</div>
                        </div>
                        {itemActions('info', info.field, info.status, isFlagged)}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ─── PASO 2: Documentos ─── */}
          {(docReviews.length > 0 || extraDocUrls.length > 0) && (
            <div className="border-b border-[#3c4b35]">
              <AccordionHeader
                sectionKey="documentos"
                label="Documentos"
                badge={`${docsApproved}/${docReviews.length}`}
                done={allDocsDone && docReviews.length > 0}
              />
              {openSections.has('documentos') && (
                <div className="divide-y divide-[#3c4b35] bg-[#0c1609]">
                  {docReviews.map(doc => {
                    const isFlagged = flaggedDocs.has(doc.documentKey)
                    const url = doc.url ?? req.documentUrls?.[doc.documentKey]
                    const isImage = url ? /\.(png|jpe?g|gif|webp|svg)$/i.test(url) || url.includes('/image/upload/') : false
                    return (
                      <div key={doc.documentKey} className="px-6 py-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">
                              {doc.name ?? doc.documentKey}
                            </p>
                            {doc.fileName && (
                              <p className="font-mono text-[9px] text-[#3c4b35] mt-0.5 truncate">{doc.fileName}</p>
                            )}
                            {url && (
                              <div className="mt-2 space-y-2">
                                {isImage && (
                                  <a href={url} target="_blank" rel="noopener noreferrer">
                                    <img
                                      src={url}
                                      alt={doc.name ?? doc.documentKey}
                                      className="h-20 w-28 object-cover border border-[#3c4b35] hover:border-[#42ff00] transition-colors"
                                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                                    />
                                  </a>
                                )}
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 font-mono text-[10px] text-[#42ff00] hover:text-[#a0ff80] transition-colors"
                                >
                                  <ExternalLink size={10} /> Ver documento
                                </a>
                              </div>
                            )}
                            {doc.observation && (
                              <p className="font-mono text-[9px] text-[#ffb4ab] mt-1 italic">{doc.observation}</p>
                            )}
                          </div>
                          <div className="shrink-0">{statusBadge(doc.status, isFlagged)}</div>
                        </div>
                        {itemActions('doc', doc.documentKey, doc.status, isFlagged)}
                      </div>
                    )
                  })}
                  {extraDocUrls.map(([key, url]) => {
                    const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(url) || url.includes('/image/upload/')
                    return (
                      <div key={key} className="px-6 py-3">
                        <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35] capitalize">{key}</p>
                        <div className="mt-2 space-y-2">
                          {isImage && (
                            <a href={url} target="_blank" rel="noopener noreferrer">
                              <img
                                src={url}
                                alt={key}
                                className="h-20 w-28 object-cover border border-[#3c4b35] hover:border-[#42ff00] transition-colors"
                                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                              />
                            </a>
                          )}
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-[10px] text-[#42ff00] hover:text-[#a0ff80] transition-colors"
                          >
                            <ExternalLink size={10} /> Ver documento
                          </a>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ─── PASO 3: Pago & Contrato ─── */}
          {(hasPayment || hasContract) && (
            <div className="border-b border-[#3c4b35]">
              <AccordionHeader sectionKey="pago_contrato" label="Pago & Contrato" />
              {openSections.has('pago_contrato') && (
                <div className="px-6 py-4 space-y-5 bg-[#0c1609]">
                  {hasPayment && (
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35] mb-2">Método de Pago</p>
                      <div className="border border-[#3c4b35] bg-[#141e10] p-4 grid grid-cols-3 gap-4">
                        {req.paymentSummary!.bankName && (
                          <div>
                            <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">Banco</p>
                            <p className="font-mono text-[11px] text-[#dae6d0]">{req.paymentSummary!.bankName}</p>
                          </div>
                        )}
                        {req.paymentSummary!.accountType && (
                          <div>
                            <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">Tipo</p>
                            <p className="font-mono text-[11px] text-[#dae6d0] capitalize">{req.paymentSummary!.accountType}</p>
                          </div>
                        )}
                        {req.paymentSummary!.currency && (
                          <div>
                            <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">Moneda</p>
                            <p className="font-mono text-[11px] text-[#dae6d0]">{req.paymentSummary!.currency}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {hasContract && (
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35] mb-2">Contrato</p>
                      <div className="border border-[#3c4b35] bg-[#141e10] p-4 space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">Firma</p>
                            <p className="font-mono text-[11px] text-[#dae6d0] break-words">{req.contractSummary!.signature}</p>
                          </div>
                          <span className={`shrink-0 border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${
                            req.contractSummary!.accepted ? 'border-[#42ff00] text-[#42ff00]' : 'border-[#ffb4ab] text-[#ffb4ab]'
                          }`}>
                            {req.contractSummary!.accepted ? 'Aceptado' : 'Pendiente'}
                          </span>
                        </div>
                        {req.contractSummary!.signedAt && (
                          <div>
                            <p className="font-mono text-[9px] uppercase tracking-widest text-[#3c4b35]">Firmado</p>
                            <p className="font-mono text-[11px] text-[#dae6d0]">
                              {new Date(req.contractSummary!.signedAt).toLocaleString('es-AR')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ─── PASO 4: Historial de Acciones ─── */}
          {req.actionHistory.length > 0 && (
            <div>
              <AccordionHeader
                sectionKey="historial"
                label="Historial de Acciones"
                badge={String(req.actionHistory.length)}
              />
              {openSections.has('historial') && (
                <div className="divide-y divide-[#3c4b35] bg-[#0c1609] max-h-48 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#3c4b35]">
                  {[...req.actionHistory].reverse().map((a, i) => (
                    <div key={i} className="px-6 py-2.5 flex items-start gap-3">
                      <span className="shrink-0 border border-[#42ff00]/30 bg-[#42ff00]/5 px-2 py-0.5 font-mono text-[9px] text-[#42ff00] uppercase">
                        {a.action}
                      </span>
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] text-[#dae6d0] break-words">{a.notes}</p>
                        <p className="font-mono text-[9px] text-[#3c4b35] mt-0.5">
                          {a.workerId?.slice(-8)} · {new Date(a.timestamp).toLocaleString('es-AR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex justify-end gap-3 border-t border-[#3c4b35] px-6 py-4 bg-[#0c1609]">
          <button
            onClick={onClose}
            className="border border-[#3c4b35] px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#baccaf] hover:border-[#42ff00] hover:text-[#42ff00]"
          >
            Cerrar
          </button>
          {req.status === 'IN_REVIEW' && !rejectTarget && (
            <>
              <button
                onClick={() => { setRejectTarget({ type: 'overall', key: req.id }); setRejectNote('') }}
                disabled={rejectMut.isPending}
                className="border border-[#ffb4ab] bg-[#ffb4ab]/10 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#ffb4ab] hover:bg-[#ffb4ab]/20 disabled:opacity-50"
              >
                Rechazar Solicitud
              </button>
              <button
                onClick={() => approveMut.mutate()}
                disabled={approveMut.isPending}
                className="border border-[#42ff00] bg-[#42ff00] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[#083900] hover:brightness-110 disabled:opacity-50"
              >
                {approveMut.isPending ? 'Aprobando...' : 'Aprobar Solicitud'}
              </button>
            </>
          )}
          {req.status === 'REJECTED' && (
            <button
              onClick={() => deleteMut.mutate()}
              disabled={deleteMut.isPending}
              className="border border-[#ffb4ab] px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#ffb4ab] hover:bg-[#ffb4ab]/20 disabled:opacity-50"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const FILTERS = [
  { key: '', label: 'TODOS' },
  { key: 'PENDING', label: 'PENDIENTE' },
  { key: 'IN_REVIEW', label: 'EN REVISIÓN' },
  { key: 'APPROVED', label: 'APROBADO' },
  { key: 'REJECTED', label: 'RECHAZADO' },
]

export default function SolicitudesPage() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data: requests = [], isLoading } = useQuery<Request[]>({
    queryKey: ['requests', filter],
    queryFn: () => requestService.list(filter || undefined).then(r => r.data),
  })

  const assign = useMutation({
    mutationFn: (id: string) => requestService.assign(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requests'] }),
  })

  const selected = selectedId ? (requests.find(r => r.id === selectedId) ?? null) : null

  useEffect(() => {
    let client: Client
    const setup = () => {
      client = createSocketClient(() => {
        client.subscribe('/topic/worker/requests', () => {
          qc.invalidateQueries({ queryKey: ['requests'] })
        })
      })
      client.activate()
    }
    setup()
    return () => { client?.deactivate() }
  }, [qc])

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-[#f0ffe4]">Solicitudes Onboarding</h2>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
            TOTAL: <span className="text-[#dae6d0]">{requests.length}</span> registros
          </p>
        </div>
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ['requests'] })}
          className="flex items-center gap-2 border border-[#3c4b35] bg-[#232d1e] px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-[#dae6d0] hover:border-[#42ff00]"
        >
          <RefreshCw size={14} />
          Actualizar
        </button>
      </header>

      {/* filtros */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
              filter === key
                ? 'bg-[#42ff00] font-bold text-[#083900] shadow-[0_0_8px_rgba(66,255,0,0.3)]'
                : 'border border-[#3c4b35] text-[#baccaf] hover:border-[#42ff00] hover:text-[#42ff00]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden border border-[#3c4b35] bg-[#182214]">
        <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-[#3c4b35] [&::-webkit-scrollbar-track]:bg-[#141e10]">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#141e10]">
                {['ID Solicitud', 'Usuario', 'Estado', 'Docs OK', 'Asignado a', 'Creado', 'Acciones'].map(h => (
                  <th key={h} className="border-b border-[#3c4b35] px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3c4b35]">
              {isLoading ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">Cargando...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center font-mono text-[10px] text-[#baccaf]">Sin registros</td></tr>
              ) : requests.map(r => {
                const docsOk = r.documentReviews.filter(d => d.status === 'APPROVED').length
                const docsTotal = r.documentReviews.length
                return (
                  <tr key={r.id} className="transition-colors hover:bg-[#42ff00]/5">
                    <td className="px-5 py-4">
                      <p className="font-mono text-[11px] font-bold text-[#dae6d0]">#{r.id.slice(-8).toUpperCase()}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-mono text-[11px] text-[#dae6d0]">{r.fullName ?? '—'}</p>
                      <p className="font-mono text-[9px] text-[#3c4b35] mt-0.5 truncate max-w-[160px]">{r.email ?? r.userId.slice(-12)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${STATUS_COLORS[r.status] ?? 'border-[#3c4b35] text-[#baccaf]'}`}>
                        {STATUS_LABELS[r.status] ?? r.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-mono text-[11px] ${docsTotal > 0 && docsOk === docsTotal ? 'text-[#42ff00]' : 'text-[#baccaf]'}`}>
                        {docsOk}/{docsTotal}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {r.assignedWorkerId
                        ? <p className="font-mono text-[10px] text-[#baccaf]" title={r.assignedWorkerId}>{r.assignedWorkerId.slice(-10)}</p>
                        : <span className="font-mono text-[10px] text-[#3c4b35]">—</span>}
                    </td>
                    <td className="px-5 py-4 font-mono text-[10px] text-[#baccaf]">
                      {new Date(r.createdAt).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {r.status === 'PENDING' && !r.assignedWorkerId ? (
                        <button
                          onClick={() => assign.mutate(r.id)}
                          disabled={assign.isPending}
                          className="border border-[#42ff00] bg-[#42ff00]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#42ff00] hover:bg-[#42ff00] hover:text-[#083900] disabled:opacity-50"
                        >
                          Tomar
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedId(r.id)}
                          className="border border-[#3c4b35] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#baccaf] hover:border-[#42ff00] hover:text-[#42ff00]"
                        >
                          <Eye className="mr-1 inline" size={12} />
                          Ver
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <DetailPanel req={selected} onClose={() => setSelectedId(null)} />}
    </div>
  )
}
