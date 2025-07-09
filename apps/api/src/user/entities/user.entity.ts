import { UserRole, DocumentType } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  photoUrl?: string | null;
  role: UserRole;
  isApproved: boolean;
  address?: string | null;
  city?: string | null;
  document?: string | null;
  documentType?: DocumentType | null;
  locationId?: number | null;
  @Exclude()
  password: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
