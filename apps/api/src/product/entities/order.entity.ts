import { ApiProperty } from '@nestjs/swagger';

export class OrderEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  customerId: number;

  @ApiProperty({ required: false })
  customer?: {
    id: number;
    name: string;
    email: string;
  };

  @ApiProperty()
  productId: number;

  @ApiProperty({ required: false })
  product?: {
    id: number;
    name: string;
    price: number;
    currency: string;
  };

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
  };

  @ApiProperty()
  quantity: number;

  @ApiProperty({ description: 'Total amount in centavos (e.g., R$ 12.34 × qty → 2468)' })
  totalAmount: number;

  @ApiProperty({ enum: ['PENDING', 'PAID', 'CANCELLED'] })
  status: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<OrderEntity>) {
    Object.assign(this, partial);
  }
}
