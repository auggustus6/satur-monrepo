import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal, Button, LoadingButton, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from '@satur/ui';
import { useCreateService, useUpdateService } from '../../hooks/useServices';
import { useLocations } from '../../hooks/useLocations';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { ErrorAlert } from '@satur/ui';
import { UserMultiSelect } from '../user/UserMultiSelect';
import { validateUsersLocation } from '../../utils/userValidation';
import type { Service, CreateServiceDto, UpdateServiceDto } from '../../types/api';
import { createServiceSchema, updateServiceSchema, type CreateServiceFormData, type UpdateServiceFormData } from '../../schemas';
import { toast } from 'react-hot-toast';

interface UserOption {
  id: number;
  name: string;
  email: string;
  role: string;
  locationId?: number | null;
  location?: { id: number; city: string; state: string } | null;
}

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Service;
}

export function ServiceModal({ isOpen, onClose, service }: ServiceModalProps) {
  const isEditing = !!service;
  const createService = useCreateService();
  const updateService = useUpdateService();
  const { data: locations = [] } = useLocations();
  const { error: formError, handleError, clearError, isSupplierLocationError } = useErrorHandler();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<CreateServiceFormData | UpdateServiceFormData>({
    resolver: zodResolver(isEditing ? updateServiceSchema : createServiceSchema),
    defaultValues: service ? {
      name: service.name,
      description: service.description || '',
      locationId: service.locationId,
      isActive: service.isActive,
      userIds: service.users?.map(u => u.id) || [],
    } : {
      isActive: true,
      userIds: [],
    },
  });

  // State for managing selected users
  const [selectedUsers, setSelectedUsers] = useState<UserOption[]>([]);

  const handleUsersChange = (users: UserOption[]) => {
    setSelectedUsers(users);
    setValue('userIds', users.map(u => u.id));
  };

  // Initialize selected users when service data is available
  useEffect(() => {
    if (service?.users) {
      // For editing, we need to convert the basic user info to UserOption format
      // We'll use placeholder values for missing fields since we only have id, name, role
      const initialUsers: UserOption[] = service.users.map(user => ({
        id: user.id,
        name: user.name,
        email: '', // Will be populated when user searches/selects
        role: user.role,
        locationId: user?.locationId,
        location: user.location,
      }));
      setSelectedUsers(initialUsers);
      setValue('userIds', initialUsers.map(u => u.id)); // Ensure form has the user IDs
    } else {
      setSelectedUsers([]);
      setValue('userIds', []); // Clear user IDs for new service
    }
  }, [service, setValue]);

  const onSubmit = async (data: CreateServiceFormData | UpdateServiceFormData) => {
    try {
      clearError(); // Clear any previous errors

      // Validate users location before submitting
      if (data.locationId && selectedUsers.length > 0) {
        const locationError = validateUsersLocation(selectedUsers, data.locationId);
        if (locationError) {
          toast.error(locationError);
          return;
        }
      }
      if (isEditing) {
        const updateData: UpdateServiceDto = {
          name: data.name,
          description: data.description || undefined,
          locationId: data.locationId,
          isActive: data.isActive,
          userIds: data.userIds,
        };
        await updateService.mutateAsync({ id: service.id, data: updateData });
      } else {
        const createData: CreateServiceDto = {
          name: data.name!,
          description: data.description || undefined,
          locationId: data.locationId!,
          isActive: data.isActive ?? true,
          userIds: data.userIds || [],
        };

        await createService.mutateAsync(createData);
      }
      reset();
      onClose();
    } catch (error) {
      handleError(error, false); // Handle error without toast
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
      title={isEditing ? 'Editar Serviço' : 'Novo Serviço'}
      size="md"
    >
      {formError && (
        <ErrorAlert
          title={isSupplierLocationError(createService.error || updateService.error) ? 'Erro de Validação de Localização' : 'Erro'}
          message={formError.message}
          variant={formError.type === 'validation' ? 'warning' : 'error'}
          onClose={clearError}
          className="mb-4"
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" onClick={(e) => e.stopPropagation()}>
        <div>
          <Label htmlFor="name">Nome do Serviço *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Digite o nome do serviço"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <textarea
            id="description"
            {...register('description')}
            placeholder="Descreva o serviço oferecido"
            rows={4}
            className={`w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.description ? 'border-red-500' : ''
              }`}
          />
          {errors.description && (
            <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="locationId">Localização *</Label>
          <Select onValueChange={(value) => setValue('locationId', Number(value))} value={watch('locationId')?.toString()}>
            <SelectTrigger 
              className={errors.locationId ? 'border-red-500' : ''}
              onClick={(e) => e.stopPropagation()}
            >
              <SelectValue placeholder="Selecione uma localização" />
            </SelectTrigger>
            <SelectContent onClick={(e) => e.stopPropagation()}>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id.toString()}>
                  {location.city}, {location.state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.locationId && (
            <p className="text-sm text-red-500 mt-1">{errors.locationId.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="isActive">Status do Serviço</Label>
            <p className="text-sm text-gray-500">Ativar ou desativar este serviço</p>
          </div>
          <Switch
            checked={watch('isActive')}
            onCheckedChange={(checked) => setValue('isActive', checked)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* User Management Section */}
        <div>
          <Label>Usuários Associados *</Label>
          <UserMultiSelect
            selectedUsers={selectedUsers}
            onUsersChange={handleUsersChange}
            locationId={watch('locationId')}
            placeholder="Selecionar usuários para este serviço..."
            error={errors.userIds?.message}
          />
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
          <LoadingButton
            type="submit"
            loading={isSubmitting}
            loadingText="Salvando..."
            className="bg-blue-700 hover:bg-blue-800"
          >
            {isEditing ? 'Atualizar' : 'Criar'}
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
}
