import { ApiProperty } from '@nestjs/swagger';

export class ServiceEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  locationId: number;

  @ApiProperty({ required: false })
  location?: {
    id: number;
    city: string;
    state: string;
  };

  @ApiProperty({ required: false, type: 'array', items: { type: 'object' } })
  users?: Array<{
    id: number;
    name: string;
    role: string;
  }>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<ServiceEntity>) {
    Object.assign(this, partial);
  }
}
