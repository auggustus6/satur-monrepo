import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

const approveSupplierSchema = z.object({
  isApproved: z.boolean(),
  reason: z.string().optional(),
});

export class ApproveSupplierDto extends createZodDto(approveSupplierSchema) {
  @ApiProperty({
    description: 'Status de aprovação do fornecedor',
    example: true,
  })
  isApproved: boolean;

  @ApiProperty({
    description: 'Motivo da aprovação/reprovação',
    example: 'Documentação aprovada',
    required: false,
  })
  reason?: string;
}
