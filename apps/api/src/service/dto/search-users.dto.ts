import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const searchUsersSchema = z.object({
  search: z.string().optional(),
  limit: z.string().optional(),
});

export class SearchUsersDto extends createZodDto(searchUsersSchema) {}
