import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const manageServiceUsersSchema = z.object({
  userIds: z
    .array(z.number().int().positive())
    .min(1, 'Pelo menos um usuário deve ser fornecido'),
});

export class ManageServiceUsersDto extends createZodDto(manageServiceUsersSchema) {}
