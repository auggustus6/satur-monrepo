import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must have at least 2 characters')
    .max(100, 'Name must have at most 100 characters'),
  email: z.string().email('Email must have a valid format').toLowerCase(),
  password: z
    .string()
    .min(6, 'Password must have at least 6 characters')
    .max(100, 'Password must have at most 100 characters'),
  phone: z
    .string()
    .regex(/^\+?[\d\s()+-]{10,20}$/, 'Phone must have a valid format')
    .optional(),
  photoUrl: z.string().url('Photo URL must be valid').optional(),
  role: z
    .enum(['AGENCY', 'SUPPLIER', 'ADMIN', 'CUSTOMER'])
    .optional()
    .default('CUSTOMER'),
  address: z
    .string()
    .max(255, 'Address must have at most 255 characters')
    .optional(),
  city: z.string().max(100, 'City must have at most 100 characters').optional(),
  document: z
    .string()
    .max(20, 'Document must have at most 20 characters')
    .optional(),
  documentType: z.enum(['CPF', 'CNPJ']).optional(),
  locationId: z.number().int().positive().optional(),
});

export class CreateUserDto extends createZodDto(createUserSchema) {}
