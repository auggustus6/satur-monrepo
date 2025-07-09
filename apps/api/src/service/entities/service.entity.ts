export class ServiceEntity {
  id: number;
  name: string;
  description?: string | null;
  isActive: boolean;
  locationId: number;
  location?: {
    id: number;
    city: string;
    state: string;
  };
  users?: Array<{
    id: number;
    name: string;
    role: string;
  }>;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ServiceEntity>) {
    Object.assign(this, partial);
  }
}
