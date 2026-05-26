import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { companyService } from '@/lib/services/user/company.service'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function EmpresasPage() {
  const qc = useQueryClient()
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companyService.list().then(r => r.data),
  })

  const { register, handleSubmit, reset } = useForm<{
    name: string; taxId: string; country: string; industry: string
  }>()

  const create = useMutation({
    mutationFn: (data: object) => companyService.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['companies'] }); reset() },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Empresas</h1>

      <form onSubmit={handleSubmit(d => create.mutate(d))} className="grid grid-cols-2 gap-3 max-w-lg">
        <Input placeholder="Nombre empresa" {...register('name')} />
        <Input placeholder="RUC / NIT" {...register('taxId')} />
        <Input placeholder="Pais" {...register('country')} />
        <Input placeholder="Industria" {...register('industry')} />
        <Button type="submit" className="col-span-2" disabled={create.isPending}>
          {create.isPending ? 'Creando...' : 'Agregar empresa'}
        </Button>
      </form>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Cargando...</p>
      ) : (
        <div className="space-y-2">
          {companies.map((c: { id: string; name: string; taxId: string; country: string; status: string }) => (
            <div key={c.id} className="rounded-lg border p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.taxId} · {c.country}</p>
              </div>
              <span className="text-xs text-muted-foreground">{c.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
