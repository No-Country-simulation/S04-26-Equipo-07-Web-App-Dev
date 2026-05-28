import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchContractors, updateContractorStatus, type Contractor } from "@/lib/api/contractors"
import { useState, useEffect, useRef } from "react"
import {
  Search, Filter, TrendingUp, Timer, ShieldCheck, RefreshCw,
  Download, ChevronLeft, ChevronRight, CheckCircle, Clock, Eye,
  Link, Copy, X, Loader2,
} from "lucide-react"
import { createInvitation } from "@/lib/api/invitations"

const steps: Record<string, string> = {
  KYC_VERIF: "Verificación KYC",
  TAX_FORMS: "Formularios Fiscales",
  PAYMENT_SETUP: "Config. Pago",
  FINAL_SIGN: "Firma Final",
  DOC_UPLOAD: "Carga de Documentos",
}

function InitialsAvatar({ name }: { name: string }) {
  const parts = name.split(" ")
  const initials = parts.length > 1
    ? parts[0][0] + parts[1][0]
    : parts[0].slice(0, 2)
  return (
    <div className="flex h-8 w-8 items-center justify-center border border-[#3c4b35] bg-[#232d1e] font-mono text-caption-mono text-[#42ff00]">
      {initials.toUpperCase()}
    </div>
  )
}

function DonutChart({ percent }: { percent: number }) {
  const r = 40
  const circumference = 2 * Math.PI * r
  const offset = circumference - (percent / 100) * circumference
  return (
    <div className="relative mx-auto mb-4 h-24 w-24">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="transparent" stroke="#3c4b35" strokeWidth="6" />
        <circle
          cx="48" cy="48" r={r}
          fill="transparent" stroke="#42ff00"
          strokeWidth="6" strokeDasharray={circumference}
          strokeDashoffset={offset} strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-mono text-caption-mono text-[#42ff00]">
        {percent}%
      </div>
    </div>
  )
}

function LiveLogs() {
  const logsRef = useRef<HTMLDivElement>(null)
  const prefixes = [
    { label: "AUTH_SERVICE", color: "text-[#42ff00]" },
    { label: "EMAIL_ENGINE", color: "text-[#baccaf]" },
    { label: "BANK_API", color: "text-[#ffb4ab]" },
    { label: "LEDGER", color: "text-[#42ff00]" },
    { label: "SYSTEM", color: "text-[#baccaf]" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      if (!logsRef.current) return
      const now = new Date().toLocaleTimeString("en-GB", { hour12: false })
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
      const msg = `${prefix.label}: Operation ${["SUCCESS", "PENDING", "IDLE"][Math.floor(Math.random() * 3)]}`
      const p = document.createElement("p")
      p.className = "opacity-0 transition-opacity duration-500"
      p.innerHTML = `<span class="${prefix.color}">[${now}]</span> ${msg}`
      logsRef.current.prepend(p)
      requestAnimationFrame(() => p.classList.remove("opacity-0"))
      if (logsRef.current.children.length > 20) logsRef.current.lastElementChild?.remove()
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="col-span-12 border border-[#3c4b35] bg-[#182214] p-6 lg:col-span-8">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="flex items-center gap-2 font-mono text-caption-mono uppercase tracking-wider text-[#f0ffe4]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#42ff00]" />
          Registros_Sistema_En_Vivo
        </h4>
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#baccaf] opacity-50">
          NODE: US-EAST-1
        </span>
      </div>
      <div
        ref={logsRef}
        className="custom-scrollbar h-32 overflow-y-auto bg-black/40 p-3 font-mono text-[11px] leading-6 opacity-80"
      >
        <p><span className="text-[#42ff00]">[09:41:02]</span> AUTH_SERVICE: User NP_00192 completed Step KYC_VERIF</p>
        <p><span className="text-[#baccaf]">[09:40:55]</span> EMAIL_ENGINE: Nudge sent to NP_00195 re: missing_docs</p>
        <p><span className="text-[#ffb4ab]">[09:40:41]</span> CRITICAL: Delayed response from EU_BANK_API. Retrying in 5s...</p>
        <p><span className="text-[#42ff00]">[09:40:12]</span> LEDGER: New contractor entity initialized: ID_NP_00208</p>
        <p><span className="text-[#baccaf]">[09:39:58]</span> SYSTEM: Automated daily reconciliation completed. Success.</p>
      </div>
    </div>
  )
}

function ContractorDetail({
  contractor,
  onClose,
}: {
  contractor: Contractor
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (status: "approved" | "rejected") =>
      updateContractorStatus(contractor.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contractors"] })
      onClose()
    },
  })

  const docsUploaded = contractor.documents.filter((d) => d.uploaded).length
  const docsTotal = contractor.documents.length

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-3xl flex-col overflow-hidden border border-[#3c4b35] bg-[#0c1609] shadow-xl md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <InitialsAvatar name={contractor.fullName} />
              <h2 className="text-heading-sm font-bold text-[#f0ffe4]">{contractor.fullName}</h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center text-[#baccaf] transition-colors hover:text-[#dae6d0]"
            >
              &times;
            </button>
          </div>

          <div className="mb-6 border border-[#3c4b35] bg-[#141e10] p-4">
            <div className="grid grid-cols-2 gap-4 text-[13px]">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Email</p>
                <p className="font-medium text-[#dae6d0]">{contractor.email}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Teléfono</p>
                <p className="font-medium text-[#dae6d0]">{contractor.phone}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">País</p>
                <p className="font-medium text-[#dae6d0]">{contractor.country}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Step</p>
                <p className="font-medium text-[#dae6d0]">{steps[contractor.step] || contractor.step}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Contrato</p>
                <p className="font-medium text-[#dae6d0]">
                  {contractor.contractAccepted ? (
                    <span className="text-[#42ff00]">✓ Firmado</span>
                  ) : (
                    <span className="text-[#ffb4ab]">✗ Pendiente</span>
                  )}
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Banco</p>
                <p className="font-medium text-[#dae6d0]">{contractor.bankName}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 font-mono text-caption-mono uppercase tracking-wider text-[#baccaf]">
              Documentos ({docsUploaded}/{docsTotal})
            </h3>
            <div className="space-y-2">
              {contractor.documents.map((doc) => (
                <div
                  key={doc.name}
                  className="flex items-center justify-between border border-[#3c4b35] px-4 py-2.5"
                >
                  <span className="text-[13px] text-[#dae6d0]">{doc.name}</span>
                  {doc.uploaded ? (
                    <span className="flex items-center gap-1.5 text-[13px] text-[#42ff00]">
                      <CheckCircle size={14} />
                      {doc.fileName}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[13px] text-[#ffb4ab]">
                      <Clock size={14} />
                      Pendiente
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-[#3c4b35] pt-4">
            <button
              onClick={onClose}
              className="border border-[#3c4b35] px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-[#baccaf] transition-colors hover:border-[#42ff00] hover:text-[#42ff00]"
            >
              Cerrar
            </button>
            <button
              onClick={() => mutation.mutate("rejected")}
              disabled={mutation.isPending}
              className="border border-[#ffb4ab] bg-[#ffb4ab]/10 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-[#ffb4ab] transition-colors hover:bg-[#ffb4ab]/20 disabled:opacity-50"
            >
              Rechazar
            </button>
            <button
              onClick={() => mutation.mutate("approved")}
              disabled={mutation.isPending}
              className="border border-[#42ff00] bg-[#42ff00] px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-[#083900] transition-all hover:brightness-110 disabled:opacity-50"
            >
              Aprobar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function InvitationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [link, setLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!email) return
    setError('')
    setLoading(true)
    try {
      const result = await createInvitation(email)
      setLink(result.link)
    } catch {
      setError('Error al generar el enlace. Intenta de nuevo.')
    }
    setLoading(false)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setEmail('')
    setLink('')
    setCopied(false)
    setError('')
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={handleClose}>
      <div className="w-full max-w-md border border-[#3c4b35] bg-[#0c1609] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-heading-sm font-bold text-[#f0ffe4]">Generar Invitación</h3>
          <button onClick={handleClose} className="text-[#baccaf] hover:text-[#f0ffe4] transition-colors">
            <X size={18} />
          </button>
        </div>

        {!link ? (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
                Correo del contratista
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contratista@company.com"
                className="w-full border border-[#3c4b35] bg-[#182214] px-3 py-2 font-mono text-caption-mono text-[#dae6d0] placeholder:text-[#3c4b35] outline-none focus:border-[#42ff00]"
              />
            </div>
            {error && (
              <p className="font-mono text-[10px] text-[#ffb4ab]">{error}</p>
            )}
            <button
              onClick={handleGenerate}
              disabled={!email || loading}
              className="flex w-full items-center justify-center gap-2 border border-[#42ff00] bg-[#42ff00] py-3 font-mono text-caption-mono font-bold uppercase tracking-wider text-[#083900] transition-all hover:brightness-110 disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 size={14} className="animate-spin" /> Generando...</>
              ) : (
                <><Link size={14} /> Generar Enlace</>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">
              Enlace generado para <span className="text-[#42ff00]">{email}</span>
            </p>
            <div className="flex items-center gap-2 border border-[#3c4b35] bg-[#182214] px-3 py-2">
              <input
                type="text"
                readOnly
                value={link}
                className="flex-1 bg-transparent font-mono text-[11px] text-[#dae6d0] outline-none"
              />
              <button
                onClick={handleCopy}
                className="shrink-0 text-[#baccaf] hover:text-[#42ff00] transition-colors"
              >
                {copied ? (
                  <span className="font-mono text-[10px] text-[#42ff00]">✓</span>
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
            <button
              onClick={handleClose}
              className="w-full border border-[#3c4b35] py-3 font-mono text-caption-mono uppercase tracking-wider text-[#baccaf] transition-colors hover:border-[#42ff00]"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function AdminDashboard() {
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["contractors"],
    queryFn: fetchContractors,
  })
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [filter, setFilter] = useState<string>("all")

  const filtered = filter === "all" ? data : filter === "pending" ? data.filter(c => c.status === "pending") : data

  const pendingCount = data.filter(c => c.status === "pending").length
  const urgentCount = data.filter(c => c.status === "pending" && parseInt(c.timeInQueue) > 5).length

  return (
    <div className="p-8">
      <header className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-[28px] font-bold text-[#f0ffe4] md:text-heading-lg">Onboardings Activos</h2>
          <div className="mt-1 flex items-center gap-4 text-[#baccaf]">
            <span className="font-mono text-caption-mono uppercase tracking-wider">
              ESTADO_SISTEMA: <span className="text-[#42ff00]">ÓPTIMO</span>
            </span>
            <span className="h-1 w-1 rounded-full bg-[#3c4b35]" />
            <span className="font-mono text-caption-mono uppercase tracking-wider">LATENCIA: 12ms</span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center border border-[#3c4b35] bg-[#182214] px-3 py-2">
            <Search size={14} className="mr-2 text-[#baccaf]" />
            <input
              type="text"
              placeholder="FILTRAR POR ID/NOMBRE..."
              className="w-48 bg-transparent font-mono text-caption-mono uppercase tracking-wider text-[#dae6d0] placeholder:text-[#3c4b35] outline-none"
            />
          </div>
          <button className="flex items-center gap-2 border border-[#3c4b35] bg-[#232d1e] px-4 py-2 font-mono text-caption-mono uppercase tracking-wider text-[#dae6d0] transition-all hover:border-[#42ff00]">
            <Filter size={16} />
            BÚSQUEDA_AVANZADA
          </button>
          <button
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-2 border border-[#42ff00] bg-[#42ff00]/10 px-4 py-2 font-mono text-caption-mono uppercase tracking-wider text-[#42ff00] transition-all hover:bg-[#42ff00] hover:text-[#083900]"
          >
            <Link size={16} />
            INVITAR
          </button>
        </div>
      </header>

      <section className="mb-10 grid grid-cols-12 gap-6">
        <div className="group relative col-span-12 overflow-hidden border border-[#3c4b35] bg-[#182214] p-6 transition-colors hover:border-[#42ff00] md:col-span-4">
          <div className="relative z-10">
            <p className="mb-4 font-mono text-caption-mono uppercase tracking-wider text-[#baccaf]">Total Onboardings</p>
            <h3 className="text-[48px] font-bold tracking-tighter text-[#f0ffe4]">1,284</h3>
            <div className="mt-2 flex items-center gap-1 font-mono text-[10px] text-[#42ff00]">
              <TrendingUp size={12} />
              <span>+12.4% vs SEM_ANTERIOR</span>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 opacity-[0.05] transition-opacity group-hover:opacity-[0.10]">
            <svg className="h-32 w-32" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
            </svg>
          </div>
        </div>

        <div className="group relative col-span-12 overflow-hidden border border-[#3c4b35] bg-[#182214] p-6 transition-colors hover:border-[#42ff00] md:col-span-4">
          <div className="relative z-10">
            <p className="mb-4 font-mono text-caption-mono uppercase tracking-wider text-[#baccaf]">Tiempo Prom. Activación</p>
            <h3 className="text-[48px] font-bold tracking-tighter text-[#dae6d0]">
              3.2 <span className="text-heading-sm font-normal opacity-50">DÍAS</span>
            </h3>
            <div className="mt-2 flex items-center gap-1 font-mono text-[10px] text-[#42ff00]">
              <Timer size={12} />
              <span>META: 3.0_DÍAS</span>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 opacity-[0.05] transition-opacity group-hover:opacity-[0.10]">
            <svg className="h-32 w-32" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
          </div>
        </div>

        <div className="group relative col-span-12 overflow-hidden border border-[#3c4b35] bg-[#182214] p-6 transition-colors hover:border-[#42ff00] md:col-span-4" style={{ boxShadow: "0 0 12px rgba(66,255,0,0.15)" }}>
          <div className="relative z-10">
            <p className="mb-4 font-mono text-caption-mono uppercase tracking-wider text-[#42ff00]">Aprobaciones Pendientes</p>
            <h3 className="text-[48px] font-bold tracking-tighter text-[#42ff00]">{String(pendingCount).padStart(2, "0")}</h3>
            <div className="mt-2 flex items-center gap-1 font-mono text-[10px] text-[#baccaf]">
              <ShieldCheck size={12} />
              <span>COLA_URGENTE: {String(urgentCount).padStart(2, "0")}</span>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 opacity-[0.10]">
            <ShieldCheck size={128} />
          </div>
        </div>
      </section>

      <div className="mb-6 flex flex-wrap gap-3">
        {[
          { key: "all", label: "TODOS" },
          { key: "pending", label: "DOCS_PENDIENTES" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 font-mono text-caption-mono uppercase tracking-wider transition-colors ${filter === key
                ? "bg-[#42ff00] font-bold text-[#083900] shadow-[0_0_8px_rgba(66,255,0,0.3)]"
                : "border border-[#3c4b35] text-[#baccaf] hover:border-[#42ff00] hover:text-[#42ff00]"
              }`}
          >
            {label}
          </button>
        ))}
        <button className="border border-[#3c4b35] px-4 py-1.5 font-mono text-caption-mono uppercase tracking-wider text-[#baccaf] transition-colors hover:border-[#42ff00] hover:text-[#42ff00]">
          REVISIÓN_PENDIENTE
        </button>
        <button className="border border-[#ffb4ab] px-4 py-1.5 font-mono text-caption-mono uppercase tracking-wider text-[#ffb4ab] transition-colors hover:bg-[#ffb4ab]/20">
          PROBLEMAS_MARCADOS
        </button>
      </div>

      <div className="overflow-hidden border border-[#3c4b35] bg-[#182214]">
        <div className="flex items-center justify-between border-b border-[#3c4b35] bg-[#182214]/70 px-6 py-4" style={{ backdropFilter: "blur(12px)" }}>
          <span className="font-mono text-caption-mono uppercase tracking-wider text-[#baccaf] opacity-80">
            Registros_Activos (Orden: Tiempo_Cola)
          </span>
          <div className="flex gap-4">
            <button className="text-[#baccaf] transition-colors hover:text-[#42ff00]">
              <RefreshCw size={18} />
            </button>
            <button className="text-[#baccaf] transition-colors hover:text-[#42ff00]">
              <Download size={18} />
            </button>
          </div>
        </div>

        <div className="custom-scrollbar overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#141e10]">
                {["Nombre Contratista", "País", "Paso", "Estado Documentos", "Tiempo en Cola", "Acciones"].map((h) => (
                  <th key={h} className="border-b border-[#3c4b35] px-6 py-4 font-mono text-caption-mono uppercase tracking-wider text-[#baccaf]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3c4b35]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center font-mono text-caption-mono text-[#baccaf]">
                    Loading...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center font-mono text-caption-mono text-[#ffb4ab]">
                    Error al cargar datos.
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center font-mono text-caption-mono text-[#baccaf]">
                    No se encontraron registros.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const docsOk = c.documents.filter(d => d.uploaded).length
                  const total = c.documents.length
                  const allDocsOk = docsOk === total
                  const isMissing = !allDocsOk && c.status === "pending"

                  return (
                    <tr key={c.id} className="transition-colors hover:bg-[#42ff00]/5 group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <InitialsAvatar name={c.fullName} />
                          <div>
                            <p className="text-body-sm font-bold text-[#dae6d0]">{c.fullName}</p>
                            <p className="font-mono text-[10px] text-[#baccaf]">ID: NP_{String(c.id).padStart(5, "0")}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-caption-mono text-[#dae6d0]">{c.countryCode}</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-[#3c4b35]" />
                          <span className="font-mono text-[10px] text-[#baccaf]">{c.country}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="border border-[#3c4b35] px-2 py-0.5 font-mono text-caption-mono text-[#dae6d0]">
                          {c.step}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${allDocsOk ? "bg-[#42ff00]" : isMissing ? "bg-[#ffb4ab]" : "bg-[#42ff00]/50"}`} />
                          <span className={`font-mono text-caption-mono ${allDocsOk ? "text-[#dae6d0]" : "text-[#ffb4ab]"}`}>
                            {allDocsOk
                              ? `Verificado (${docsOk}/${total})`
                              : isMissing
                                ? `Falta ${c.documents.find(d => !d.uploaded)?.name?.split(" ").slice(0, 2).join("_") || "Docs"}`
                                : `Pendiente (${docsOk}/${total})`
                            }
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-mono text-caption-mono text-[#baccaf]">
                        {c.timeInQueue}
                      </td>
                      <td className="px-6 py-5 text-right">
                        {c.status === "rejected" ? (
                          <button
                            onClick={() => setSelectedContractor(c)}
                            className="border border-[#3c4b35] bg-[#232d1e] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#baccaf] transition-all hover:border-[#42ff00] hover:text-[#42ff00]"
                          >
                            <Eye className="mr-1 inline size-3" />
                            Revisar
                          </button>
                        ) : allDocsOk && c.step === "FINAL_SIGN" ? (
                          <button
                            onClick={() => setSelectedContractor(c)}
                            className="border border-[#42ff00] bg-[#42ff00] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#083900] transition-all hover:brightness-110"
                            style={{ boxShadow: "0 0 8px rgba(66,255,0,0.2)" }}
                          >
                            ACTIVAR_FORZOSAMENTE
                          </button>
                        ) : isMissing ? (
                          <button className="border border-[#3c4b35] bg-[#232d1e] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#baccaf] transition-all hover:border-[#42ff00] hover:text-[#42ff00]">
                            ENVIAR_RECORDATORIO
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedContractor(c)}
                            className="border border-[#42ff00] bg-[#42ff00]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#42ff00] transition-all hover:bg-[#42ff00] hover:text-[#083900]"
                          >
                            REVISAR_DATOS
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[#3c4b35] bg-[#141e10] px-4 py-4 font-mono text-caption-mono">
          <div className="text-[#baccaf]">
            MOSTRANDO <span className="text-[#dae6d0]">1-{filtered.length}</span> DE {data.length} REGISTROS
          </div>
          <div className="flex gap-2">
            <button className="flex h-8 w-8 items-center justify-center border border-[#3c4b35] text-[#baccaf] transition-all hover:border-[#42ff00]">
              <ChevronLeft size={14} />
            </button>
            <button className="flex h-8 w-8 items-center justify-center border border-[#42ff00] bg-[#42ff00]/10 text-[#42ff00]">
              1
            </button>
            <button className="flex h-8 w-8 items-center justify-center border border-[#3c4b35] text-[#baccaf] transition-all hover:border-[#42ff00]">
              2
            </button>
            <button className="flex h-8 w-8 items-center justify-center border border-[#3c4b35] text-[#baccaf] transition-all hover:border-[#42ff00]">
              3
            </button>
            <button className="flex h-8 w-8 items-center justify-center border border-[#3c4b35] text-[#baccaf] transition-all hover:border-[#42ff00]">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-12 gap-6">
        <LiveLogs />

        <div className="col-span-12 flex flex-col items-center justify-center border border-[#3c4b35] bg-[#182214] p-6 text-center lg:col-span-4">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">Eficiencia de Cola</p>
          <DonutChart percent={85} />
          <p className="font-mono text-[10px] uppercase tracking-wider text-[#baccaf]">TASA_AUTO_RESOLUCIÓN</p>
        </div>
      </div>

      {selectedContractor && (
        <ContractorDetail
          contractor={selectedContractor}
          onClose={() => setSelectedContractor(null)}
        />
      )}

      <InvitationModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #141e10; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3c4b35; border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #42ff00; }
      `}</style>
    </div>
  )
}

export default AdminDashboard
