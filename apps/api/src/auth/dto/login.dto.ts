import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

const loginSchema = z.object({
  email: z.string().email('Email deve ter um formato válido').toLowerCase(),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export class LoginDto extends createZodDto(loginSchema) {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'admin@exemplo.com',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'admin123',
    minLength: 1,
  })
  password: string;
}
