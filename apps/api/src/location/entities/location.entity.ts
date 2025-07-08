import { Location } from '@prisma/client';

export class LocationEntity implements Location {
  id: number;
  city: string;
  state: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(partial: Partial<LocationEntity>) {
    Object.assign(this, partial);
  }
}
