import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@satur/ui';
import { usersApi, locationsApi } from '../services/api';
import { useAuthStore } from '../stores/auth.store';
import { authService } from '../services/auth.service';
import { ApiError } from '../lib/api';

import {
  isCPF,
  isCNPJ,
  formatToCPF,
  formatToCNPJ,
  formatToPhone
} from 'brazilian-values';

// Schema de validação
const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email deve ter um formato válido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  document: z.string().min(11, 'Documento é obrigatório'),
  documentType: z.enum(['CPF', 'CNPJ'], {
    required_error: 'Tipo de documento é obrigatório',
  }),
  address: z.string().min(5, 'Endereço é obrigatório'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  phone: z.string().min(10, 'Telefone é obrigatório'),
  role: z.enum(['SUPPLIER', 'CUSTOMER'], {
    required_error: 'Tipo de usuário é obrigatório',
  }),
  locationId: z.number().optional(),
}).refine((data) => {
  // Validar CPF/CNPJ baseado no tipo de documento
  if (data.documentType === 'CPF') {
    return isCPF(data.document);
  } else {
    return isCNPJ(data.document);
  }
}, {
  message: 'Documento inválido para o tipo selecionado',
  path: ['document'],
}).refine((data) => {
  // LocationId é obrigatório para SUPPLIER
  if (data.role === 'SUPPLIER') {
    return data.locationId !== undefined;
  }
  return true;
}, {
  message: 'Localidade é obrigatória para fornecedores',
  path: ['locationId'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'CUSTOMER',
    },
  });

  const selectedRole = watch('role');
  const selectedDocumentType = watch('documentType');
  const documentValue = watch('document');
  const phoneValue = watch('phone');

  // Buscar localizações
  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationsApi.getAll(),
  });

  // Mutation para registro
  const { mutate: registerUser, isPending: isRegistering } = useMutation({
    mutationFn: usersApi.create,
    onSuccess: async (user) => {
      // Fazer login automático após registro
      try {
        const loginResponse = await authService.login({
          email: user.email,
          password: watch('password'),
        });

        login(loginResponse.access_token, loginResponse.user);
        navigate('/reports');
      } catch {
        navigate('/login');
      }
    },
    onError: (error: ApiError) => {
      setError(error.message || 'Erro ao criar conta');
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    setError('');

    const cleanData = {
      ...data,
      document: data.document.replace(/\D/g, ''), // Remove tudo que não é dígito
      phone: data.phone.replace(/\D/g, ''), // Remove tudo que não é dígito
    };

    registerUser(cleanData);
  };

  // Formatação automática de campos
  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    let formatted = value;

    if (selectedDocumentType === 'CPF') {
      formatted = formatToCPF(value);
    } else if (selectedDocumentType === 'CNPJ') {
      formatted = formatToCNPJ(value);
    }

    setValue('document', formatted);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = formatToPhone(value);
    setValue('phone', formatted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Criar Conta
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Preencha os dados para criar sua conta
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Nome */}
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                {...register('name')}
                className="mt-1"
                placeholder="Seu nome completo"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className="mt-1"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className="mt-1"
                placeholder="Mínimo 6 caracteres"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Tipo de usuário */}
            <div>
              <Label htmlFor="role">Tipo de usuário</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setValue('role', value as 'SUPPLIER' | 'CUSTOMER')}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o tipo de usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">Cliente</SelectItem>
                  <SelectItem value="SUPPLIER">Fornecedor</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
              )}
            </div>

            {/* Tipo de documento */}
            <div>
              <Label htmlFor="documentType">Tipo de documento</Label>
              <Select
                value={selectedDocumentType}
                onValueChange={(value) => {
                  setValue('documentType', value as 'CPF' | 'CNPJ');
                  // Resetar o campo documento quando o tipo mudar
                  setValue('document', '');
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CPF">CPF</SelectItem>
                  <SelectItem value="CNPJ">CNPJ</SelectItem>
                </SelectContent>
              </Select>
              {errors.documentType && (
                <p className="text-red-500 text-sm mt-1">{errors.documentType.message}</p>
              )}
            </div>

            {/* Documento */}
            <div>
              <Label htmlFor="document">
                {selectedDocumentType === 'CPF' ? 'CPF' : selectedDocumentType === 'CNPJ' ? 'CNPJ' : 'Documento'}
              </Label>
              <Input
                id="document"
                value={documentValue || ''}
                onChange={handleDocumentChange}
                className="mt-1"
                placeholder={selectedDocumentType === 'CPF' ? '000.000.000-00' : selectedDocumentType === 'CNPJ' ? '00.000.000/0000-00' : 'Selecione o tipo de documento primeiro'}
              />
              {errors.document && (
                <p className="text-red-500 text-sm mt-1">{errors.document.message}</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={phoneValue || ''}
                onChange={handlePhoneChange}
                className="mt-1"
                placeholder="(11) 99999-9999"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Endereço */}
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                {...register('address')}
                className="mt-1"
                placeholder="Rua, número, bairro"
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
              )}
            </div>

            {/* Cidade */}
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                {...register('city')}
                className="mt-1"
                placeholder="Sua cidade"
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
              )}
            </div>

            {/* Localidade (apenas para SUPPLIER) */}
            {selectedRole === 'SUPPLIER' && (
              <div>
                <Label htmlFor="locationId">Localidade de Atuação</Label>
                <Select onValueChange={(value) => setValue('locationId', parseInt(value))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione uma localidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.city} - {location.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.locationId && (
                  <p className="text-red-500 text-sm mt-1">{errors.locationId.message}</p>
                )}
              </div>
            )}

            {/* Botões */}
            <div className="space-y-3 pt-4">
              <Button
                type="submit"
                disabled={isRegistering}
                className="w-full h-12 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRegistering ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Criando conta...
                  </div>
                ) : (
                  'Criar Conta'
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Já tem uma conta?{' '}
                  <Link
                    to="/login"
                    className="text-blue-700 hover:text-blue-800 font-medium hover:underline transition-colors"
                  >
                    Fazer Login
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
