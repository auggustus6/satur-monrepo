import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z
    .string()
    .min(6, 'Nova senha deve ter pelo menos 6 caracteres')
    .max(100, 'Nova senha deve ter no máximo 100 caracteres'),
});

export class ChangePasswordDto extends createZodDto(changePasswordSchema) {
  @ApiProperty({
    description: 'Senha atual do usuário',
    example: 'minhasenhaatual123',
    minLength: 1,
  })
  currentPassword: string;

  @ApiProperty({
    description: 'Nova senha do usuário',
    example: 'minhannovasenha456',
    minLength: 6,
    maxLength: 100,
  })
  newPassword: string;
}
