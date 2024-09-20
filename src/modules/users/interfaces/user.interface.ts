import { User as UserDb } from '@prisma/client'

export interface UserRoleDb extends UserDb {
  role: {
    id: number,
    name: string
  }
} 