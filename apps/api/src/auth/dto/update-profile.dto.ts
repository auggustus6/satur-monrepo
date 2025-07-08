import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

const updateProfileSchema = z.object({
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
    .optional()
    .or(z.literal('')), // Permite string vazia
  photoUrl: z
    .string()
    .url('URL da foto deve ser válida')
    .optional()
    .or(z.literal('')), // Permite string vazia
  address: z
    .string()
    .max(255, 'Endereço deve ter no máximo 255 caracteres')
    .optional()
    .or(z.literal('')), // Permite string vazia
  city: z
    .string()
    .max(100, 'Cidade deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')), // Permite string vazia
  document: z
    .string()
    .max(20, 'Documento deve ter no máximo 20 caracteres')
    .optional()
    .or(z.literal('')), // Permite string vazia
  documentType: z.enum(['CPF', 'CNPJ']).optional(),
});

export class UpdateProfileDto extends createZodDto(updateProfileSchema) {
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
    description: 'Telefone do usuário (pode ser string vazia)',
    example: '+55 11 99999-9999',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: 'URL da foto do usuário (pode ser string vazia)',
    example: 'https://exemplo.com/foto.jpg',
    required: false,
  })
  photoUrl?: string;

  @ApiProperty({
    description: 'Endereço do usuário (pode ser string vazia)',
    example: 'Rua das Flores, 123',
    maxLength: 255,
    required: false,
  })
  address?: string;

  @ApiProperty({
    description: 'Cidade do usuário (pode ser string vazia)',
    example: 'São Paulo',
    maxLength: 100,
    required: false,
  })
  city?: string;

  @ApiProperty({
    description: 'Documento do usuário (pode ser string vazia)',
    example: '12345678901',
    maxLength: 20,
    required: false,
  })
  document?: string;

  @ApiProperty({
    description: 'Tipo do documento',
    enum: ['CPF', 'CNPJ'],
    required: false,
  })
  documentType?: 'CPF' | 'CNPJ';
}
