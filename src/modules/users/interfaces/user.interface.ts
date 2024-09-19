import { User as UserDb } from '@prisma/client'

export interface User {
  id: string;
  name: string | null;
  lastName: string | null;
  username: string | null;
  password: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  phone: string | null;
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  role: string;
}

export interface UserRoleDb extends UserDb {
  role: {
    id: number,
    name: string
  }
} 