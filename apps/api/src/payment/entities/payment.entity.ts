import { PaymentStatus } from '@prisma/client';
import { UserEntity } from '../../user/entities/user.entity';

export class PaymentEntity {
  id: number;
  amount: number;
  status: PaymentStatus;
  description?: string | null;
  paymentMethod?: string | null;
  paidAt?: Date | null;
  processedById?: number | null;
  userId?: number | null;
  createdAt: Date;
  updatedAt: Date;
  processedBy?: UserEntity | null;
  user?: UserEntity | null;

  constructor(partial: Partial<PaymentEntity>) {
    Object.assign(this, partial);
  }
}
