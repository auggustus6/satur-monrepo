
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useMoneyInput } from '../../utils/currency';
import { productsApi } from '../../services/api';
import { createProductSchema, type CreateProductFormData } from '../../schemas';
import type { CreateProductDto } from '../../types/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@satur/ui';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@satur/ui';

import { Button, Input, Textarea, Checkbox, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@satur/ui';
import { ServiceSelect } from '../common/ServiceSelect';

interface CreateProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ServiceOption {
  id: number;
  name: string;
  description?: string;
  location?: {
    id: number;
    city: string;
    state: string;
  };
}

export function CreateProductModal({ open, onOpenChange }: CreateProductModalProps) {

  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);
  const [displayPrice, setDisplayPrice] = useState('');

  const queryClient = useQueryClient();
  const { formatAsUserTypes, parseInputValue } = useMoneyInput();

  const form = useForm<CreateProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      currency: 'BRL',
      stripeProductId: '',
      stripePriceId: '',
      isActive: true,
    },
  });

  const handleServiceSelect = (service: ServiceOption | null) => {
    setSelectedService(service);
    // Update form serviceId when service changes
    if (service) {
      form.setValue('serviceId', service.id, { shouldValidate: true, shouldDirty: true });
    } else {
      form.setValue('serviceId', undefined);
    }
  };

  const createMutation = useMutation({
    mutationFn: (finalData: CreateProductFormData & { serviceId: number }) => {
      const payload: CreateProductDto = {
        name: finalData.name,
        description: finalData.description || undefined,
        price: parseInputValue(displayPrice), // Converte para centavos
        currency: finalData.currency,
        serviceId: finalData.serviceId,
        stripeProductId: finalData.stripeProductId || undefined,
        stripePriceId: finalData.stripePriceId || undefined,
        isActive: finalData.isActive,
      };

      return productsApi.create(payload);
    },
    onSuccess: () => {
      toast.success('Produto criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onOpenChange(false);
      form.reset();
      setSelectedService(null);
      setDisplayPrice('');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Erro ao criar produto. Tente novamente.';
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: CreateProductFormData) => {
    if (!selectedService) {
      toast.error('Selecione um serviço');
      return;
    }
    if (parseInputValue(displayPrice) <= 0) {
      toast.error('Preço deve ser maior que zero');
      return;
    }

    // Ensure serviceId is set properly
    const finalData = {
      ...data,
      serviceId: selectedService.id, // Always use the selected service ID
    };

    createMutation.mutate(finalData);
  };

  const handlePriceChange = (value: string) => {
    const formatted = formatAsUserTypes(value);
    setDisplayPrice(formatted);
    const cents = parseInputValue(formatted);
    form.setValue('price', cents);
  };

  useEffect(() => {
    if (!open) {
      form.reset();
      setSelectedService(null);
      setDisplayPrice('');
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Produto</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          {Object.keys(form.formState.errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 p-3 rounded">
              <h4 className="text-red-800 font-medium">Erros de validação:</h4>
              <ul className="text-red-700 text-sm mt-1">
                {Object.entries(form.formState.errors).map(([field, error]) => (
                  <li key={field}>• {field}: {error?.message}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <input type="hidden" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome do produto..."
                      {...field}
                    />
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
                    <Textarea
                      placeholder="Descrição do produto..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={() => (
                  <FormItem>
                    <FormLabel>Preço *</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="R$ 0,00"
                        value={displayPrice}
                        onChange={(e) => handlePriceChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moeda</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a moeda" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BRL">BRL (Real)</SelectItem>
                        <SelectItem value="USD">USD (Dólar)</SelectItem>
                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Service Selection */}
            <ServiceSelect
              selectedService={selectedService}
              onServiceSelect={handleServiceSelect}
              placeholder="Selecionar serviço..."
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stripeProductId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stripe Product ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="prod_..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stripePriceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stripe Price ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="price_..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Produto ativo
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createMutation.isPending ? 'Criando...' : 'Criar Produto'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
