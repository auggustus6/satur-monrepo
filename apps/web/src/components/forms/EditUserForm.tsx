import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import {
  isCPF,
  isCNPJ,
  isPhone,
  formatToCPF,
  formatToCNPJ,
  formatToPhone
} from 'brazilian-values';
import { useLocations } from '../../hooks/useLocations';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@satur/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@satur/ui';
import type { User, UpdateUserDto } from '../../types/api';

const updateUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email deve ter um formato válido'),
  phone: z.string().min(1, 'Telefone é obrigatório').refine((value) => {
    const cleanPhone = value.replace(/\D/g, '');
    return isPhone(cleanPhone);
  }, 'Telefone inválido'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  document: z.string().min(1, 'Documento é obrigatório'),
  documentType: z.enum(['CPF', 'CNPJ'], {
    required_error: 'Tipo de documento é obrigatório',
  }),
  role: z.enum(['SUPPLIER', 'CUSTOMER', 'AGENCY', 'ADMIN'], {
    required_error: 'Tipo de usuário é obrigatório',
  }),
  locationId: z.number().optional(),
}).refine((data) => {
  if (data.documentType === 'CPF' && data.document && data.document.trim() !== '') {
    const cleanDocument = data.document.replace(/\D/g, '');
    if (cleanDocument.length !== 11) {
      return false;
    }
    return isCPF(cleanDocument);
  }
  return true;
}, {
  message: "CPF deve ter 11 dígitos e ser válido",
  path: ["document"],
}).refine((data) => {
  if (data.documentType === 'CNPJ' && data.document && data.document.trim() !== '') {
    const cleanDocument = data.document.replace(/\D/g, '');
    if (cleanDocument.length !== 14) {
      return false;
    }
    return isCNPJ(cleanDocument);
  }
  return true;
}, {
  message: "CNPJ deve ter 14 dígitos e ser válido",
  path: ["document"],
});

type UpdateUserFormData = z.infer<typeof updateUserSchema>;

interface EditUserFormProps {
  user: User;
  onSave: (data: UpdateUserDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EditUserForm({ user, onSave, onCancel, isLoading = false }: EditUserFormProps) {
  const { user: currentUser } = useAuth();
  const { data: locations = [] } = useLocations();

  const [documentValues, setDocumentValues] = useState<{
    CPF: string;
    CNPJ: string;
  }>({
    CPF: '',
    CNPJ: '',
  });

  const form = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      document: user.document || '',
      documentType: user.documentType || 'CPF',
      role: user.role,
      locationId: user.locationId || undefined,
    },
  });

  const selectedRole = form.watch('role');
  const selectedDocumentType = form.watch('documentType');
  const documentValue = form.watch('document');
  const phoneValue = form.watch('phone');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = formatToPhone(value);
    form.setValue('phone', formatted);
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const documentType = form.getValues('documentType');
    let formatted = value;

    if (documentType === 'CPF') {
      formatted = formatToCPF(value);
    } else if (documentType === 'CNPJ') {
      formatted = formatToCNPJ(value);
    }

    if (value.length > 0) {
      form.clearErrors('document');
    }

    form.setValue('document', formatted);

    if (documentType) {
      setDocumentValues(prev => ({
        ...prev,
        [documentType]: formatted
      }));
    }
  };

  const handleDocumentTypeChange = (value: 'CPF' | 'CNPJ') => {
    const currentDocumentType = form.getValues('documentType');
    const currentDocument = form.getValues('document');

    if (currentDocumentType && currentDocument) {
      setDocumentValues(prev => ({
        ...prev,
        [currentDocumentType]: currentDocument
      }));
    }

    form.clearErrors('document');

    form.setValue('documentType', value);

    const savedValue = documentValues[value];
    form.setValue('document', savedValue || '');

    if (!savedValue) {
      form.clearErrors('document');
    }
  };

  useEffect(() => {
    if (user) {
      const formattedDocument = user.document ? (
        user.documentType === 'CPF' ? formatToCPF(user.document) :
          user.documentType === 'CNPJ' ? formatToCNPJ(user.document) :
            user.document
      ) : '';

      const formattedPhone = user.phone ? formatToPhone(user.phone) : '';

      form.reset({
        name: user.name,
        email: user.email,
        phone: formattedPhone,
        address: user.address || '',
        city: user.city || '',
        document: formattedDocument,
        documentType: user.documentType || 'CPF',
        role: user.role,
        locationId: user.locationId || undefined,
      });

      if (user.documentType && formattedDocument) {
        setDocumentValues(prev => ({
          ...prev,
          [user.documentType!]: formattedDocument
        }));
      }
    }
  }, [user, form]);

  const handleSubmit = form.handleSubmit((data) => {
    const cleanData = {
      ...data,
      document: data.document.replace(/\D/g, ''),
      phone: data.phone.replace(/\D/g, ''),
    };

    onSave(cleanData);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Usuário</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div>
              <Label htmlFor="name">
                Nome completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...form.register('name')}
                className="mt-1"
                placeholder="Digite o nome completo"
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                className="mt-1"
                placeholder="Digite o email"
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <Label htmlFor="phone">
                Telefone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                value={phoneValue || ''}
                onChange={handlePhoneChange}
                className="mt-1"
                placeholder="(11) 99999-9999"
              />
              {form.formState.errors.phone && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
              )}
            </div>

            {/* Endereço */}
            <div>
              <Label htmlFor="address">
                Endereço <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                {...form.register('address')}
                className="mt-1"
                placeholder="Digite o endereço completo"
              />
              {form.formState.errors.address && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.address.message}</p>
              )}
            </div>

            {/* Cidade */}
            <div>
              <Label htmlFor="city">
                Cidade <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                {...form.register('city')}
                className="mt-1"
                placeholder="Digite a cidade"
              />
              {form.formState.errors.city && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.city.message}</p>
              )}
            </div>

            {/* Tipo de usuário (apenas para ADMIN) */}
            {currentUser?.role === 'ADMIN' && (
              <div>
                <Label htmlFor="role">
                  Tipo de usuário <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => form.setValue('role', value as 'SUPPLIER' | 'CUSTOMER' | 'AGENCY' | 'ADMIN')}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o tipo de usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOMER">Cliente</SelectItem>
                    <SelectItem value="SUPPLIER">Fornecedor</SelectItem>
                    <SelectItem value="AGENCY">Agência</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.role && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.role.message}</p>
                )}
              </div>
            )}

            {/* Tipo de documento */}
            <div>
              <Label htmlFor="documentType">
                Tipo de documento <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedDocumentType}
                onValueChange={handleDocumentTypeChange}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CPF">CPF</SelectItem>
                  <SelectItem value="CNPJ">CNPJ</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.documentType && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.documentType.message}</p>
              )}
            </div>

            {/* Documento */}
            <div>
              <Label htmlFor="document">
                {selectedDocumentType === 'CPF' ? 'CPF' : selectedDocumentType === 'CNPJ' ? 'CNPJ' : 'Documento'} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="document"
                value={documentValue || ''}
                onChange={handleDocumentChange}
                className="mt-1"
                placeholder={selectedDocumentType === 'CPF' ? '000.000.000-00' : selectedDocumentType === 'CNPJ' ? '00.000.000/0000-00' : 'Selecione o tipo de documento primeiro'}
              />
              {form.formState.errors.document && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.document.message}</p>
              )}
            </div>

            {/* Localização (apenas para fornecedores) */}
            {selectedRole === 'SUPPLIER' && (
              <div className="md:col-span-2">
                <Label htmlFor="locationId">Localização</Label>
                <Select
                  value={form.watch('locationId')?.toString()}
                  onValueChange={(value) => form.setValue('locationId', parseInt(value))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione a localização" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.city} - {location.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-700 hover:bg-blue-800 text-white"
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
