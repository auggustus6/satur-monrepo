import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const updateProductSchema = z.object({
  name: z
    .string()
    .min(2, 'Product name must have at least 2 characters')
    .max(100, 'Product name must have at most 100 characters')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must have at most 500 characters')
    .optional(),
  price: z
    .number()
    .int('Price must be an integer in centavos')
    .positive('Price must be positive')
    .max(99999999, 'Price must be less than R$ 999,999.99')
    .optional(),
  currency: z.enum(['BRL', 'USD', 'EUR']).optional(),
  serviceId: z
    .number()
    .int()
    .positive('Service ID must be a positive number')
    .optional(),
  stripeProductId: z.string().optional(),
  stripePriceId: z.string().optional(),
  isActive: z.boolean().optional(),
});

export class UpdateProductDto extends createZodDto(updateProductSchema) {}
