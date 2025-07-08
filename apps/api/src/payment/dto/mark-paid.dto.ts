import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const markPaidSchema = z.object({
  paymentMethod: z
    .string()
    .min(2, 'Método de pagamento deve ter pelo menos 2 caracteres')
    .max(50, 'Método de pagamento deve ter no máximo 50 caracteres')
    .optional(),
});

export class MarkPaidDto extends createZodDto(markPaidSchema) {}
