import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';
import { UserEntity } from '../../user/entities/user.entity';

export class PaymentEntity {
  @ApiProperty()
  id: number;

  @ApiProperty({ description: 'Amount in cents (e.g., 1000 = R$ 10.00)' })
  amount: number;

  @ApiProperty({ enum: PaymentStatus })
  status: PaymentStatus;

  @ApiProperty({ required: false })
  description?: string | null;

  @ApiProperty({ required: false })
  paymentMethod?: string | null;

  @ApiProperty({ required: false })
  paidAt?: Date | null;

  @ApiProperty({ required: false })
  processedById?: number | null;

  @ApiProperty({ required: false })
  userId?: number | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: () => UserEntity, required: false })
  processedBy?: UserEntity | null;

  @ApiProperty({ type: () => UserEntity, required: false })
  user?: UserEntity | null;

  constructor(partial: Partial<PaymentEntity>) {
    Object.assign(this, partial);
  }
}
