import { ApiProperty } from '@nestjs/swagger';
import { UserRole, DocumentType } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  phone?: string | null;

  @ApiProperty({ required: false })
  photoUrl?: string | null;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  isApproved: boolean;

  @ApiProperty({ required: false })
  address?: string | null;

  @ApiProperty({ required: false })
  city?: string | null;

  @ApiProperty({ required: false })
  document?: string | null;

  @ApiProperty({ enum: DocumentType, required: false })
  documentType?: DocumentType | null;

  @ApiProperty({ required: false })
  locationId?: number | null;

  @Exclude()
  password: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
