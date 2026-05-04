import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { User } from '@/types/user'

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nombre
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <a className="text-primary hover:underline" href={`mailto:${row.original.email}`}>
        {row.original.email}
      </a>
    ),
  },
  {
    accessorKey: 'company.name',
    header: 'Empresa',
    cell: ({ row }) => <Badge variant="secondary">{row.original.company.name}</Badge>,
  },
  {
    accessorKey: 'website',
    header: 'Website',
    cell: ({ row }) => (
      <a
        className="text-primary hover:underline"
        href={`https://${row.original.website}`}
        rel="noreferrer"
        target="_blank"
      >
        {row.original.website}
      </a>
    ),
  },
]
