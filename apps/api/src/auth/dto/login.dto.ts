import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email deve ter um formato válido').toLowerCase(),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export class LoginDto extends createZodDto(loginSchema) {
  email: string;
  password: string;
}
