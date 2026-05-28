import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchContractors, updateContractorStatus, type Contractor } from "@/lib/api/contractors"
import { useState } from "react"
import { CheckCircle, Clock, Eye, XCircle } from "lucide-react"

const stepLabels: Record<string, string> = {
  KYC_VERIF: "Verificación KYC",
  TAX_FORMS: "Formularios Fiscales",
  PAYMENT_SETUP: "Config. Pago",
  FINAL_SIGN: "Firma Final",
  DOC_UPLOAD: "Carga Docs",
}

function initials(name: string) {
  const parts = name.split(" ")
  return parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)
}

export default function PendingPage() {
  const { data = [] } = useQuery({ queryKey: ["contractors"], queryFn: fetchContractors })
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Contractor | null>(null)

  const pending = data.filter((c) => c.status === "pending")

  const approve = useMutation({
    mutationFn: (id: string | number) => updateContractorStatus(id, "approved"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contractors"] }),
  })
  const reject = useMutation({
    mutationFn: (id: string | number) => updateContractorStatus(id, "rejected"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contractors"] }),
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-[28px] font-bold text-[#f0ffe4] md:text-heading-lg">Aprobaciones Pendientes</h2>
        <p className="mt-1 font-mono text-caption-mono uppercase tracking-wider text-[#baccaf]">
          {pending.length} contratistas esperando revisión
        </p>
      </div>

      <div className="overflow-hidden border border-[#3c4b35] bg-[#182214]">
        <div className="custom-scrollbar overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#141e10]">
                {["Nombre", "País", "Paso", "Documentos", "Tiempo", "Acción"].map((h) => (
                  <th key={h} className="border-b border-[#3c4b35] px-6 py-4 font-mono text-caption-mono uppercase tracking-wider text-[#baccaf]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3c4b35]">
              {pending.map((c) => {
                const ok = c.documents.filter((d) => d.uploaded).length
                const total = c.documents.length
                return (
                  <tr key={c.id} className="transition-colors hover:bg-[#42ff00]/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center border border-[#3c4b35] bg-[#232d1e] font-mono text-caption-mono text-[#42ff00]">
                          {initials(c.fullName)}
                        </div>
                        <div>
                          <p className="text-body-sm font-bold text-[#dae6d0]">{c.fullName}</p>
                          <p className="font-mono text-[10px] text-[#baccaf]">ID: NP_{String(c.id).padStart(5, "0")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-caption-mono text-[#baccaf]">{c.countryCode}</td>
                    <td className="px-6 py-4">
                      <span className="border border-[#3c4b35] px-2 py-0.5 font-mono text-caption-mono text-[#dae6d0]">
                        {stepLabels[c.step] || c.step}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${ok === total ? "bg-[#42ff00]" : "bg-[#ffb4ab]"}`} />
                        <span className={`font-mono text-caption-monon-mono ${ok === total ? "text-[#dae6d0]" : "text-[#ffb4ab]"}`}>
                          {ok}/{total}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-caption-mono text-[#baccaf]">{c.timeInQueue}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelected(c)}
                          className="border border-[#42ff00] bg-[#42ff00]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#42ff00] transition-all hover:bg-[#42ff00] hover:text-[#083900]"
                        >
                          <Eye className="mr-1 inline size-3" />
                          Revisar
                        </button>
                        <button
                          onClick={() => approve.mutate(c.id)}
                          className="border border-[#42ff00] bg-[#42ff00] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#083900] transition-all hover:brightness-110"
                        >
                          <CheckCircle className="mr-1 inline size-3" />
                          Aprobar
                        </button>
                        <button
                          onClick={() => reject.mutate(c.id)}
                          className="border border-[#ffb4ab] bg-[#ffb4ab]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#ffb4ab] transition-all hover:bg-[#ffb4ab]/20"
                        >
                          <XCircle className="mr-1 inline size-3" />
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg border border-[#3c4b35] bg-[#0c1609] p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-heading-sm font-bold text-[#f0ffe4]">{selected.fullName}</h3>
            <div className="space-y-3 text-[13px]">
              {selected.documents.map((doc) => (
                <div key={doc.name} className="flex items-center justify-between border border-[#3c4b35] px-4 py-2">
                  <span className="text-[#dae6d0]">{doc.name}</span>
                  {doc.uploaded ? (
                    <span className="flex items-center gap-1 text-[#42ff00]">
                      <CheckCircle size={14} /> {doc.fileName}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[#ffb4ab]">
                      <Clock size={14} /> Pendiente
                    </span>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => setSelected(null)} className="mt-4 w-full border border-[#3c4b35] py-2 font-mono text-caption-mono uppercase tracking-wider text-[#baccaf] transition-colors hover:border-[#42ff00]">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
