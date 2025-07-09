export class ProductEntity {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  stripeProductId?: string | null;
  stripePriceId?: string | null;
  serviceId: number;
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
  isActive: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { serviceUsers, ...serviceWithoutServiceUsers } =
        transformedService;
      this.service = serviceWithoutServiceUsers;
    }
  }
}
