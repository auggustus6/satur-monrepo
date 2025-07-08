import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Modal, Button, Input, Label } from '@satur/ui';
import { locationsApi } from '../../services/api';
import type { Location, UpdateLocationDto } from '../../types/api';

const updateLocationSchema = z.object({
  city: z.string().min(2, 'Cidade deve ter pelo menos 2 caracteres'),
  state: z.string().length(2, 'Estado deve ter exatamente 2 caracteres').toUpperCase(),
});

type UpdateLocationFormData = z.infer<typeof updateLocationSchema>;

interface EditLocationModalProps {
  location: Location;
  isOpen: boolean;
  onClose: () => void;
}

export function EditLocationModal({ location, isOpen, onClose }: EditLocationModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateLocationFormData>({
    resolver: zodResolver(updateLocationSchema),
    defaultValues: {
      city: location.city,
      state: location.state,
    },
  });

  const { mutate: updateLocation, isPending } = useMutation({
    mutationFn: (data: UpdateLocationDto) => locationsApi.update(location.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      onClose();
    },
  });

  const onSubmit = (data: UpdateLocationFormData) => {
    updateLocation(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Editar Localização" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            {...register('city')}
            placeholder="Ex: São Paulo"
            className="mt-1"
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="state">Estado (UF)</Label>
          <Input
            id="state"
            {...register('state')}
            placeholder="Ex: SP"
            maxLength={2}
            className="mt-1 uppercase"
            style={{ textTransform: 'uppercase' }}
          />
          {errors.state && (
            <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-blue-700 hover:bg-blue-800 text-white"
          >
            {isPending ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </div>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
