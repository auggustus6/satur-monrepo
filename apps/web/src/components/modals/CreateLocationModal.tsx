import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Modal, Button, Input, Label } from '@satur/ui';
import { locationsApi } from '../../services/api';
import type { CreateLocationDto } from '../../types/api';

const createLocationSchema = z.object({
  city: z.string().min(2, 'Cidade deve ter pelo menos 2 caracteres'),
  state: z.string().length(2, 'Estado deve ter exatamente 2 caracteres').toUpperCase(),
});

type CreateLocationFormData = z.infer<typeof createLocationSchema>;

interface CreateLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateLocationModal({ isOpen, onClose }: CreateLocationModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLocationFormData>({
    resolver: zodResolver(createLocationSchema),
  });

  const { mutate: createLocation, isPending } = useMutation({
    mutationFn: (data: CreateLocationDto) => locationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      reset();
      onClose();
    },
  });

  const onSubmit = (data: CreateLocationFormData) => {
    createLocation(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nova Localização" size="sm">
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
                Criando...
              </div>
            ) : (
              'Criar Localização'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
