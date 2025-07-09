import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const updateProfileSchema = z.object({
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
    .optional()
    .or(z.literal('')), // Permite string vazia
  photoUrl: z
    .string()
    .url('URL da foto deve ser válida')
    .optional()
    .or(z.literal('')), // Permite string vazia
  address: z
    .string()
    .max(255, 'Endereço deve ter no máximo 255 caracteres')
    .optional()
    .or(z.literal('')), // Permite string vazia
  city: z
    .string()
    .max(100, 'Cidade deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')), // Permite string vazia
  document: z
    .string()
    .max(20, 'Documento deve ter no máximo 20 caracteres')
    .optional()
    .or(z.literal('')), // Permite string vazia
  documentType: z.enum(['CPF', 'CNPJ']).optional(),
});

export class UpdateProfileDto extends createZodDto(updateProfileSchema) {
  name?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  address?: string;
  city?: string;
  document?: string;
  documentType?: 'CPF' | 'CNPJ';
}
