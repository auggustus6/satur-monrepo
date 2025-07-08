import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

const updateUserAdminSchema = z.object({
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
    .optional(),
  isApproved: z.boolean().optional(),
});

export class UpdateUserAdminDto extends createZodDto(updateUserAdminSchema) {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
    minLength: 2,
    maxLength: 100,
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao@exemplo.com',
    format: 'email',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'Telefone do usuário',
    example: '+55 11 99999-9999',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: 'Status de aprovação do usuário',
    example: true,
    required: false,
  })
  isApproved?: boolean;
}
