import { useQuery } from '@tanstack/react-query'

import { columns } from '@/components/users/columns'
import { DataTable } from '@/components/users/data-table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchUsers } from '@/lib/api/users'
import Header from '@/components/common/Header'

function AdminDashboard() {
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })

  return (
    <main className="min-h-screen bg-linear-to-b from-zinc-50 to-white p-4 md:p-10">
      <Header />
      <div className="mx-auto max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle>Primera vista test</CardTitle>
            <CardDescription>
              Esta vista usa datos de jsonplaceholder y componentes de shadcn + tailwind.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full md:w-72" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : isError ? (
              <p className="text-sm text-destructive">
                No se pudo cargar la data. Revisa tu conexion o el endpoint.
              </p>
            ) : (
              <DataTable columns={columns} data={data} />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default AdminDashboard
