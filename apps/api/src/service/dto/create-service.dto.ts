import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const createServiceSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome do serviço deve ter pelo menos 2 caracteres')
    .max(100, 'Nome do serviço deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  locationId: z
    .number()
    .int()
    .positive('ID da localização deve ser um número positivo'),
  isActive: z.boolean().optional().default(true),
  userIds: z.array(z.number().int().positive()).optional().default([]),
});

export class CreateServiceDto extends createZodDto(createServiceSchema) {}
