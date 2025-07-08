import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const getServicesQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val >= 1, { message: 'Page must be at least 1' }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .refine((val) => val >= 1 && val <= 100, {
      message: 'Limit must be between 1 and 100',
    }),
  search: z.string().optional(),
  locationId: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine(
      (val) => val === undefined || val > 0,
      'Location ID must be a positive number',
    ),
});

export class GetServicesQueryDto extends createZodDto(getServicesQuerySchema) {}
