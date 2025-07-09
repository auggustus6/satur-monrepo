import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z
    .string()
    .min(6, 'Nova senha deve ter pelo menos 6 caracteres')
    .max(100, 'Nova senha deve ter no máximo 100 caracteres'),
});

export class ChangePasswordDto extends createZodDto(changePasswordSchema) {
  currentPassword: string;
  newPassword: string;
}
