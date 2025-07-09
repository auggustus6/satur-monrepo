import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const updateUserAdminSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional(),
  email: z
    .string()
    .email('Email deve ter um formato válido')
    .toLowerCase()
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s()+-]{10,20}$/, 'Telefone deve ter um formato válido')
    .optional(),
  isApproved: z.boolean().optional(),
});

export class UpdateUserAdminDto extends createZodDto(updateUserAdminSchema) {
  name?: string;
  email?: string;
  phone?: string;
  isApproved?: boolean;
}
