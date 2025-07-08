import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { Badge, ErrorAlert, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button, LoadingButton, Input, Textarea } from '@satur/ui';
import {
  ArrowLeft,
  Edit,
  Check,
  X,
  Truck,
  Calendar,
  MapPin,
  Users,
} from 'lucide-react';
import { servicesApi } from '../services/api';
import type { UpdateServiceDto } from '../types/api';
import { updateServiceSchema, type UpdateServiceFormData } from '../schemas';
import { DeleteServiceDialog } from '../components/dialogs/DeleteServiceDialog';
import { useLocations } from '../hooks/useLocations';
import { useErrorHandler } from '../hooks/useErrorHandler';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@satur/ui';
import { Switch } from '@satur/ui';
import { UserMultiSelect } from '../components/user/UserMultiSelect';
import { validateUsersLocation } from '../utils/userValidation';

interface UserOption {
  id: number;
  name: string;
  email: string;
  role: string;
  locationId?: number | null;
  location?: { id: number; city: string; state: string } | null;
}

export default function ServiceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<UserOption[]>([]);
  const { error: formError, handleError, clearError, isSupplierLocationError } = useErrorHandler();

  const form = useForm<UpdateServiceFormData>({
    resolver: zodResolver(updateServiceSchema),
    defaultValues: {
      name: '',
      description: '',
      locationId: 0,
      isActive: true,
      userIds: [],
    },
  });

  const { data: service, isLoading, error } = useQuery({
    queryKey: ['service', id],
    queryFn: () => servicesApi.getById(Number(id)),
    enabled: !!id,
  });

  // // Buscar estatísticas reais do serviço
  // const { data: serviceStats } = useQuery<ServiceStats>({
  //   queryKey: ['service', id, 'stats'],
  //   queryFn: () => servicesApi.getStats(Number(id)),
  //   enabled: !!id,
  // });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateServiceDto }) => servicesApi.update(id, data),
    onSuccess: () => {
      toast.success('Serviço atualizado com sucesso!');
      setIsEditing(false);
      clearError();
      queryClient.invalidateQueries({ queryKey: ['service', id] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error) => {
      handleError(error, false); // Don't show toast, we'll show custom error
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => servicesApi.delete(id),
    onSuccess: () => {
      toast.success('Serviço deletado com sucesso!');
      navigate('/services');
    },
    onError: () => {
      toast.error('Erro ao deletar serviço');
    },
  });

  // Get locations for dropdowns
  const { data: locations = [] } = useLocations();

  const handleUsersChange = (users: UserOption[]) => {
    setSelectedUsers(users);
    form.setValue('userIds', users.map(u => u.id));
  };

  useEffect(() => {
    if (service && service.id) {
      form.reset({
        name: service.name,
        description: service.description || '',
        locationId: service.locationId,
        isActive: service.isActive,
        userIds: service.users?.map(u => u.id) || [],
      });

      // Initialize selected users for MultiUserSelect
      if (service.users && service.users.length > 0) {
        const initialUsers: UserOption[] = service.users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email || '',
          role: user.role,
          locationId: user.locationId,
          location: user.location,
        }));
        setSelectedUsers(initialUsers);
      } else {
        setSelectedUsers([]);
      }
    }
  }, [service?.id]); // Usar apenas service.id como dependência

  const handleSave = form.handleSubmit((data) => {
    if (!service) return;

    // Validate users location before submitting
    if (data.locationId) {
      const locationError = validateUsersLocation(selectedUsers, data.locationId);
      if (locationError) {
        toast.error(locationError);
        return;
      }
    }

    updateMutation.mutate({ id: service.id, data });
  });

  const handleDelete = () => {
    if (!service) return;
    deleteMutation.mutate(service.id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Serviço não encontrado</h1>
        <button
          onClick={() => navigate('/services')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para serviços
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/services')}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Detalhes do Serviço</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            {isEditing ? 'Cancelar' : 'Editar'}
          </button>

          <DeleteServiceDialog
            service={service}
            onConfirm={handleDelete}
            isDeleting={deleteMutation.isPending}
          />
        </div>
      </div>

      {/* Service Details Card */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-start gap-6">
          {/* Icon */}
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <Truck className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>

          {/* Service Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <h2 className="text-xl font-semibold text-foreground">{service.name}</h2>
              <Badge
                className={service.isActive
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                }
              >
                {service.isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>

            <p className="text-muted-foreground">{service.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {service.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <span className="text-foreground">
                    {service.location.city}, {service.location.state}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground">
                  Criado em {new Date(service.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            {/* Associated Users */}
            {service.users && service.users.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium text-foreground">
                    Usuários Associados ({service.users.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {service.users.map(user => (
                    <Badge key={user.id} variant="outline" className="text-xs">
                      {user.name} ({user.role})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total de Solicitações</p>
              <p className="text-2xl font-bold text-gray-900">
                {serviceStats?.totalRequests || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Receita Gerada</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {(serviceStats?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Preço Médio</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {(serviceStats?.averagePrice || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Edit Form */}
      {isEditing && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Editar Serviço</h3>

          {formError && (
            <ErrorAlert
              title={isSupplierLocationError(updateMutation.error) ? 'Erro de Validação de Localização' : 'Erro'}
              message={formError.message}
              variant={formError.type === 'validation' ? 'warning' : 'error'}
              onClose={clearError}
              className="mb-4"
            />
          )}

          <Form {...form}>
            <form onSubmit={handleSave} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Serviço *</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="locationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização *</FormLabel>
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma localização" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id.toString()}>
                            {location.city}, {location.state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Status do Serviço</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Ativar ou desativar este serviço
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* User Management Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  <h4 className="text-lg font-medium">Usuários Associados</h4>
                </div>

                <FormField
                  control={form.control}
                  name="userIds"
                  render={() => (
                    <FormItem>
                      <FormLabel>Selecionar Usuários *</FormLabel>
                      <FormControl>
                        {service && (
                          <UserMultiSelect
                            selectedUsers={selectedUsers}
                            onUsersChange={handleUsersChange}
                            locationId={form.watch('locationId')}
                            placeholder="Selecionar usuários para este serviço..."
                            error={form.formState.errors.userIds?.message}
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <LoadingButton
                  type="submit"
                  loading={updateMutation.isPending}
                  loadingText="Salvando..."
                  className="flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Salvar
                </LoadingButton>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
