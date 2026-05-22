import { useQuery } from "@tanstack/react-query"
import { fetchContractors } from "@/lib/api/contractors"
import { useState } from "react"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

const statusStyles: Record<string, string> = {
  pending: "border-[#ffb4ab] text-[#ffb4ab]",
  approved: "border-[#42ff00] text-[#42ff00]",
  rejected: "border-[#3c4b35] text-[#baccaf]",
}

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
}

function initials(name: string) {
  const parts = name.split(" ")
  return parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)
}

export default function ContractorsPage() {
  const { data = [] } = useQuery({ queryKey: ["contractors"], queryFn: fetchContractors })
  const [search, setSearch] = useState("")

  const filtered = data.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-[32px]">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-[#f0ffe4] md:text-[32px]">Todos los Contratistas</h2>
          <p className="mt-1 font-mono text-[12px] uppercase tracking-wider text-[#baccaf]">
            {data.length} registros en total
          </p>
        </div>
        <div className="flex items-center border border-[#3c4b35] bg-[#182214] px-3 py-2">
          <Search size={14} className="mr-2 text-[#baccaf]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email, país..."
            className="w-56 bg-transparent font-mono text-[12px] text-[#dae6d0] placeholder:text-[#3c4b35] outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden border border-[#3c4b35] bg-[#182214]">
        <div className="custom-scrollbar overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#141e10]">
                {["Nombre", "Email", "País", "Documentos", "Estado", "Banco"].map((h) => (
                  <th key={h} className="border-b border-[#3c4b35] px-6 py-4 font-mono text-[12px] uppercase tracking-wider text-[#baccaf]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3c4b35]">
              {filtered.map((c) => {
                const ok = c.documents.filter((d) => d.uploaded).length
                const total = c.documents.length
                return (
                  <tr key={c.id} className="transition-colors hover:bg-[#42ff00]/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center border border-[#3c4b35] bg-[#232d1e] font-mono text-[12px] text-[#42ff00]">
                          {initials(c.fullName)}
                        </div>
                        <span className="text-[14px] font-bold text-[#dae6d0]">{c.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-[12px] text-[#baccaf]">{c.email}</td>
                    <td className="px-6 py-4 font-mono text-[12px] text-[#dae6d0]">{c.countryCode}</td>
                    <td className="px-6 py-4">
                      <span className={ok === total ? "text-[#42ff00]" : "text-[#ffb4ab]"}>
                        {ok}/{total}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider ${statusStyles[c.status]}`}>
                        {statusLabels[c.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[12px] text-[#baccaf]">{c.bankName}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[#3c4b35] bg-[#141e10] px-4 py-4 font-mono text-[12px]">
          <span className="text-[#baccaf]">
            MOSTRANDO <span className="text-[#dae6d0]">{filtered.length}</span> DE {data.length} REGISTROS
          </span>
          <div className="flex gap-2">
            <button className="flex h-8 w-8 items-center justify-center border border-[#3c4b35] text-[#baccaf] transition-all hover:border-[#42ff00]">
              <ChevronLeft size={14} />
            </button>
            <button className="flex h-8 w-8 items-center justify-center border border-[#42ff00] bg-[#42ff00]/10 text-[#42ff00]">1</button>
            <button className="flex h-8 w-8 items-center justify-center border border-[#3c4b35] text-[#baccaf] transition-all hover:border-[#42ff00]">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
