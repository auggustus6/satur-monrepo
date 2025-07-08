import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

const updateUserSchema = z.object({
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
  photoUrl: z.string().url('URL da foto deve ser válida').optional(),
  role: z.enum(['AGENCY', 'SUPPLIER', 'ADMIN', 'CUSTOMER']).optional(),
  address: z
    .string()
    .max(255, 'Endereço deve ter no máximo 255 caracteres')
    .optional(),
  city: z
    .string()
    .max(100, 'Cidade deve ter no máximo 100 caracteres')
    .optional(),
  document: z
    .string()
    .max(20, 'Documento deve ter no máximo 20 caracteres')
    .optional(),
  documentType: z.enum(['CPF', 'CNPJ']).optional(),
  locationId: z.number().int().positive().optional(),
});

export class UpdateUserDto extends createZodDto(updateUserSchema) {
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
    description: 'URL da foto do usuário',
    example: 'https://exemplo.com/foto.jpg',
    required: false,
  })
  photoUrl?: string;

  @ApiProperty({
    description: 'Tipo de usuário',
    enum: ['AGENCY', 'SUPPLIER', 'ADMIN', 'CUSTOMER'],
    required: false,
  })
  role?: 'AGENCY' | 'SUPPLIER' | 'ADMIN' | 'CUSTOMER';

  @ApiProperty({
    description: 'Endereço do usuário',
    example: 'Rua das Flores, 123',
    maxLength: 255,
    required: false,
  })
  address?: string;

  @ApiProperty({
    description: 'Cidade do usuário',
    example: 'São Paulo',
    maxLength: 100,
    required: false,
  })
  city?: string;

  @ApiProperty({
    description: 'Documento do usuário (CPF ou CNPJ)',
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

  @ApiProperty({
    description: 'ID da localização',
    example: 1,
    required: false,
  })
  locationId?: number;
}
