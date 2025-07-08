
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, Button, Input, Label } from '@satur/ui';
import { useCreateUser, useUpdateUser } from '../../hooks/useUsers';
import type { User, CreateUserDto, UpdateUserDto } from '../../types/api';
import { createUserSchema, updateUserSchema, type CreateUserFormData, type UpdateUserFormData } from '../../schemas';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
}

export function UserModal({ isOpen, onClose, user }: UserModalProps) {
  const isEditing = !!user;
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
    defaultValues: user ? {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      photoUrl: user.photoUrl || '',
      role: user.role,
    } : {
      role: 'AGENCY',
    },
  });

  const onSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
    try {
      if (isEditing) {
        const updateData: UpdateUserDto = {
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          photoUrl: data.photoUrl || undefined,
          role: data.role,
        };
        await updateUser.mutateAsync({ id: user.id, data: updateData });
      } else {
        const createData: CreateUserDto = {
          name: data.name!,
          email: data.email!,
          password: (data as CreateUserFormData).password,
          phone: data.phone || undefined,
          photoUrl: data.photoUrl || undefined,
          role: data.role,
        };
        await createUser.mutateAsync(createData);
      }
      reset();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Editar Usuário' : 'Novo Usuário'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            {...register('name')}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {!isEditing && (
          <div>
            <Label htmlFor="password">Senha *</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              className={(errors as any).password ? 'border-red-500' : ''}
            />
            {(errors as any).password && (
              <p className="text-sm text-red-500 mt-1">{(errors as any).password.message}</p>
            )}
          </div>
        )}

        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="+5511999999999"
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="photoUrl">URL da Foto</Label>
          <Input
            id="photoUrl"
            {...register('photoUrl')}
            placeholder="https://exemplo.com/foto.jpg"
            className={errors.photoUrl ? 'border-red-500' : ''}
          />
          {errors.photoUrl && (
            <p className="text-sm text-red-500 mt-1">{errors.photoUrl.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="role">Função *</Label>
          <select
            id="role"
            {...register('role')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="AGENCY">Agência</option>
            <option value="SUPPLIER">Fornecedor</option>
            <option value="ADMIN">Administrador</option>
          </select>
          {errors.role && (
            <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-700 hover:bg-blue-800"
          >
            {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
