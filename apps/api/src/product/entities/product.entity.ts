import { ApiProperty } from '@nestjs/swagger';

export class ProductEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string | null;

  @ApiProperty({ description: 'Price in centavos (e.g., R$ 12.34 → 1234)' })
  price: number;

  @ApiProperty({ enum: ['BRL', 'USD', 'EUR'], default: 'BRL' })
  currency: string;

  @ApiProperty({ required: false })
  stripeProductId?: string | null;

  @ApiProperty({ required: false })
  stripePriceId?: string | null;

  @ApiProperty()
  serviceId: number;

  @ApiProperty({ required: false })
  service?: {
    id: number;
    name: string;
    location?: {
      id: number;
      city: string;
      state: string;
    };
    users?: Array<{
      id: number;
      name: string;
      role: string;
      email: string;
      locationId: number | null;
      location?: {
        id: number;
        city: string;
        state: string;
      } | null;
    }>;
  };

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ required: false })
  deletedAt?: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: any) {
    Object.assign(this, partial);

    // Transform serviceUsers to users and remove password
    if (partial.service?.serviceUsers) {
      const transformedService = {
        ...partial.service,
        users: partial.service.serviceUsers.map((serviceUser: any) => ({
          id: serviceUser.user.id,
          name: serviceUser.user.name,
          role: serviceUser.user.role,
          email: serviceUser.user.email,
          locationId: serviceUser.user.locationId,
          location: serviceUser.user.location,
          // Explicitly exclude password and other sensitive fields
        })),
      };

      // Remove serviceUsers from the transformed service
      const { serviceUsers, ...serviceWithoutServiceUsers } =
        transformedService;
      this.service = serviceWithoutServiceUsers;
    }
  }
}
