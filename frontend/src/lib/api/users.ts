import { z } from 'zod'

import { apiClient } from '@/lib/api/client'
import type { User } from '@/types/user'

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  phone: z.string(),
  website: z.string(),
  company: z.object({
    name: z.string(),
  }),
})

const usersSchema = z.array(userSchema)

export async function fetchUsers(): Promise<User[]> {
  const { data } = await apiClient.get('/users')
  return usersSchema.parse(data)
}
