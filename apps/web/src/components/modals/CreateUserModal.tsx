import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { isCPF, isCNPJ, formatToCPF, formatToCNPJ } from 'brazilian-values';
import { useCreateUser } from '../../hooks/useUsers';
import { useAuth } from '../../hooks/useAuth';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@satur/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@satur/ui';
import { useLocations } from '@/hooks/useLocations';


const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email deve ter um formato válido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  phone: z.string().min(10, 'Telefone é obrigatório'),
  document: z.string().min(11, 'Documento é obrigatório'),
  documentType: z.enum(['CPF', 'CNPJ'], {
    required_error: 'Tipo de documento é obrigatório',
  }),
  address: z.string().min(5, 'Endereço é obrigatório'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  role: z.enum(['SUPPLIER', 'CUSTOMER', 'AGENCY', 'ADMIN'], {
    required_error: 'Tipo de usuário é obrigatório',
  }),
  locationId: z.number().optional(),
}).refine((data) => {
  if (data.documentType === 'CPF') {
    return isCPF(data.document);
  } else {
    return isCNPJ(data.document);
  }
}, {
  message: 'Documento inválido para o tipo selecionado',
  path: ['document'],
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateUserModal({ isOpen, onClose }: CreateUserModalProps) {
  const { user: currentUser } = useAuth();
  const { data: locations = [] } = useLocations();
  const createUser = useCreateUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
  });

  const selectedRole = watch('role');
  const selectedDocumentType = watch('documentType');
  const documentValue = watch('document');
  const phoneValue = watch('phone');

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
    let formatted = value;

    if (value.length <= 11) {
      formatted = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }

    setValue('phone', formatted);
  };

  const onSubmit = (data: CreateUserFormData) => {
    const cleanData = {
      ...data,
      document: data.document.replace(/\D/g, ''),
      phone: data.phone.replace(/\D/g, ''),
    };

    createUser.mutate(cleanData, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div>
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                {...register('name')}
                className="mt-1"
                placeholder="Digite o nome completo"
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
                placeholder="Digite o email"
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
                placeholder="Digite a senha"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
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
                placeholder="(00) 00000-0000"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Tipo de usuário */}
            {currentUser?.role === 'ADMIN' && (
              <div>
                <Label htmlFor="role">Tipo de usuário</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => setValue('role', value as 'SUPPLIER' | 'CUSTOMER' | 'AGENCY' | 'ADMIN')}
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
                {errors.role && (
                  <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
                )}
              </div>
            )}

            {/* Tipo de documento */}
            <div>
              <Label htmlFor="documentType">Tipo de documento</Label>
              <Select
                value={selectedDocumentType}
                onValueChange={(value) => {
                  setValue('documentType', value as 'CPF' | 'CNPJ');
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

            {selectedDocumentType && (
              <div>
                <Label htmlFor="document">
                  {selectedDocumentType === 'CPF' ? 'CPF' : 'CNPJ'}
                </Label>
                <Input
                  id="document"
                  value={documentValue || ''}
                  onChange={handleDocumentChange}
                  className="mt-1"
                  placeholder={selectedDocumentType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
                />
                {errors.document && (
                  <p className="text-red-500 text-sm mt-1">{errors.document.message}</p>
                )}
              </div>
            )}

            {/* Endereço */}
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                {...register('address')}
                className="mt-1"
                placeholder="Digite o endereço completo"
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
                placeholder="Digite a cidade"
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
              )}
            </div>

            {/* Localização (apenas para fornecedores) */}
            {selectedRole === 'SUPPLIER' && (
              <div className="md:col-span-2">
                <Label htmlFor="locationId">Localização</Label>
                <Select
                  value={watch('locationId')?.toString()}
                  onValueChange={(value) => setValue('locationId', parseInt(value))}
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
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createUser.isPending}
              className="bg-blue-700 hover:bg-blue-800 text-white"
            >
              {createUser.isPending ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
