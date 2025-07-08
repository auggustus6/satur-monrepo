import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const createPaymentSchema = z.object({
  amount: z
    .number()
    .int('Valor deve ser um número inteiro em centavos')
    .positive('Valor deve ser positivo')
    .max(99999999, 'Valor deve ser menor que R$ 999.999,99'),
  description: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  paymentMethod: z
    .string()
    .max(100, 'Método de pagamento deve ter no máximo 100 caracteres')
    .optional(),
  userId: z
    .number()
    .int('ID do usuário deve ser um número inteiro')
    .positive('ID do usuário deve ser positivo')
    .optional(),
});

export class CreatePaymentDto extends createZodDto(createPaymentSchema) {}
