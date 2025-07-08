import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, Checkbox, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@satur/ui';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useMoneyInput } from '../utils/currency';
import { productsApi } from '../services/api';
import { useProduct } from '../hooks/useProducts';
import { updateProductSchema, type UpdateProductFormData } from '../schemas';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@satur/ui';
import { ServiceSelect } from '../components/common/ServiceSelect';
import {
  Package,
  ArrowLeft,
  Save,
  Loader2,
} from 'lucide-react';

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

export function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = parseInt(id || '0', 10);
  const queryClient = useQueryClient();
  const { formatAsUserTypes, parseInputValue } = useMoneyInput();

  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);
  const [displayPrice, setDisplayPrice] = useState('');
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  const { data: product, isLoading, error } = useProduct(productId);

  const form = useForm<UpdateProductFormData>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      currency: 'BRL',
      serviceId: 0,
      stripeProductId: '',
      stripePriceId: '',
      isActive: true,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProductFormData) => {
      const payload = {
        ...data,
        price: parseInputValue(displayPrice),
        serviceId: selectedService?.id,
        description: data.description || undefined,
        stripeProductId: data.stripeProductId || undefined,
        stripePriceId: data.stripePriceId || undefined,
      };
      return productsApi.update(productId, payload);
    },
    onSuccess: () => {
      toast.success('Produto atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      navigate('/products');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Erro ao atualizar produto. Tente novamente.';
      toast.error(errorMessage);
    },
  });

  useEffect(() => {
    if (product && !isFormInitialized) {
      form.reset({
        name: product.name,
        description: product.description || '',
        price: product.price,
        currency: product.currency,
        serviceId: product.serviceId,
        stripeProductId: product.stripeProductId || '',
        stripePriceId: product.stripePriceId || '',
        isActive: product.isActive,
      });

      // Set display price
      const priceInReais = (product.price / 100).toFixed(2);
      setDisplayPrice(formatAsUserTypes(priceInReais));

      // Set selected service
      if (product.service) {
        setSelectedService({
          id: product.service.id,
          name: product.service.name,
          location: product.service.location,
        });
      }

      setIsFormInitialized(true);
    }
  }, [product, isFormInitialized]); // Removido form e formatAsUserTypes

  const onSubmit = (data: UpdateProductFormData) => {
    updateMutation.mutate(data);
  };

  const handlePriceChange = (value: string) => {
    const formatted = formatAsUserTypes(value);
    setDisplayPrice(formatted);
    const cents = parseInputValue(formatted);
    form.setValue('price', cents);
  };

  const handleCancel = () => {
    navigate('/products');
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando produto...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Produto não encontrado.
        </div>
        <Button
          onClick={() => navigate('/products')}
          className="mt-4"
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Produtos
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={handleCancel}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-8 w-8" />
              Editar Produto
            </h1>
            <p className="mt-2 text-gray-600">
              Atualize as informações do produto
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                onServiceSelect={setSelectedService}
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
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
