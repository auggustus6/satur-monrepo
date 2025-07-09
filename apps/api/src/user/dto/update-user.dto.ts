import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const updateUserSchema = z.object({
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
  photoUrl: z.string().url('URL da foto deve ser válida').optional(),
  role: z.enum(['AGENCY', 'SUPPLIER', 'ADMIN', 'CUSTOMER']).optional(),
  address: z
    .string()
    .max(255, 'Endereço deve ter no máximo 255 caracteres')
    .optional(),
  city: z
    .string()
    .max(100, 'Cidade deve ter no máximo 100 caracteres')
    .optional(),
  document: z
    .string()
    .max(20, 'Documento deve ter no máximo 20 caracteres')
    .optional(),
  documentType: z.enum(['CPF', 'CNPJ']).optional(),
  locationId: z.number().int().positive().optional(),
});

export class UpdateUserDto extends createZodDto(updateUserSchema) {
  name?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  role?: 'AGENCY' | 'SUPPLIER' | 'ADMIN' | 'CUSTOMER';
  address?: string;
  city?: string;
  document?: string;
  documentType?: 'CPF' | 'CNPJ';
  locationId?: number;
}
