import { z } from 'zod';

// User schemas
export const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  phone: z.string().optional(),
  photoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  role: z.enum(['AGENCY', 'SUPPLIER', 'ADMIN', 'CUSTOMER']).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  photoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  role: z.enum(['AGENCY', 'SUPPLIER', 'ADMIN', 'CUSTOMER']).optional(),
});

// Service schemas
export const createServiceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional().or(z.literal('')),
  locationId: z.number().min(1, 'Localização é obrigatória'),
  isActive: z.boolean().optional(),
  userIds: z
    .array(z.number())
    .min(1, 'Pelo menos um usuário deve ser associado ao serviço'),
});

export const updateServiceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  description: z.string().optional(),
  locationId: z.number().min(1, 'Localização é obrigatória').optional(),
  isActive: z.boolean().optional(),
  userIds: z
    .array(z.number())
    .min(1, 'Pelo menos um usuário deve ser associado ao serviço'),
});

// Payment schemas
export const createPaymentSchema = z.object({
  amount: z.number().min(0, 'Valor deve ser maior que zero'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  paymentMethod: z.string().optional(),
  userId: z.number().optional(),
});

export const updatePaymentSchema = z.object({
  amount: z.number().min(0, 'Valor deve ser maior que zero').optional(),
  description: z.string().min(1, 'Descrição é obrigatória').optional(),
  paymentMethod: z.string().optional(),
  status: z.enum(['PENDING', 'PAID', 'CANCELLED']).optional(),
  userId: z.number().optional(),
});

export const markPaymentAsPaidSchema = z.object({
  paymentMethod: z.string().min(1, 'Método de pagamento é obrigatório'),
});

// Product schemas
export const createProductSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  price: z
    .number()
    .min(1, 'Preço deve ser maior que zero')
    .max(99999999, 'Preço deve ser menor que R$ 999.999,99'),
  currency: z.enum(['BRL', 'USD', 'EUR']),
  serviceId: z.number().min(1, 'Serviço é obrigatório'),
  stripeProductId: z.string().optional(),
  stripePriceId: z.string().optional(),
  isActive: z.boolean(),
});

export const updateProductSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  description: z.string().optional(),
  price: z
    .number()
    .min(1, 'Preço deve ser maior que zero')
    .max(99999999, 'Preço deve ser menor que R$ 999.999,99')
    .optional(),
  currency: z.enum(['BRL', 'USD', 'EUR']).optional(),
  serviceId: z.number().min(1, 'Serviço é obrigatório').optional(),
  stripeProductId: z.string().optional(),
  stripePriceId: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// Filter schemas
export const paymentFiltersSchema = z.object({
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
});

export const userFiltersSchema = z.object({
  role: z.string().optional(),
  search: z.string().optional(),
  isApproved: z.boolean().optional(),
});

// Type exports
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type CreateServiceFormData = z.infer<typeof createServiceSchema>;
export type UpdateServiceFormData = z.infer<typeof updateServiceSchema>;
export type CreatePaymentFormData = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentFormData = z.infer<typeof updatePaymentSchema>;
export type MarkPaymentAsPaidFormData = z.infer<typeof markPaymentAsPaidSchema>;
export type CreateProductFormData = z.infer<typeof createProductSchema>;
export type UpdateProductFormData = z.infer<typeof updateProductSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type PaymentFiltersFormData = z.infer<typeof paymentFiltersSchema>;
export type UserFiltersFormData = z.infer<typeof userFiltersSchema>;
