import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const approveSupplierSchema = z.object({
  isApproved: z.boolean(),
  reason: z.string().optional(),
});

export class ApproveSupplierDto extends createZodDto(approveSupplierSchema) {
  isApproved: boolean;
  reason?: string;
}
