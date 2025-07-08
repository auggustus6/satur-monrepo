
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useMoneyInput } from '../../utils/currency';
import { paymentsApi } from '../../services/api';
import { createPaymentSchema, type CreatePaymentFormData } from '../../schemas';
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


import { Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@satur/ui';
import { UserSelect } from '../user/UserSelect';

interface CreatePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserOption {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function CreatePaymentModal({ open, onOpenChange }: CreatePaymentModalProps) {
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [displayAmount, setDisplayAmount] = useState('');
  const queryClient = useQueryClient();
  const { formatAsUserTypes, parseInputValue } = useMoneyInput();

  const form = useForm<CreatePaymentFormData>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      amount: 0,
      description: '',
      paymentMethod: '',
      userId: undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePaymentFormData) => {
      const payload = {
        ...data,
        amount: parseInputValue(displayAmount), // Converte para centavos
        userId: selectedUser?.id,
      };
      return paymentsApi.create(payload);
    },
    onSuccess: () => {
      toast.success('Pagamento criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      onOpenChange(false);
      form.reset();
      setSelectedUser(null);
      setDisplayAmount('');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Erro ao criar pagamento. Tente novamente.';
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: CreatePaymentFormData) => {
    createMutation.mutate(data);
  };

  const handleAmountChange = (value: string) => {
    const formatted = formatAsUserTypes(value);
    setDisplayAmount(formatted);
    const cents = parseInputValue(formatted);
    form.setValue('amount', cents);
  };

  useEffect(() => {
    if (!open) {
      form.reset();
      setSelectedUser(null);
      setDisplayAmount('');
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Pagamento</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição do pagamento..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={() => (
                <FormItem>
                  <FormLabel>Valor *</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="R$ 0,00"
                      value={displayAmount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pagamento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o método" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                      <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                      <SelectItem value="Transferência Bancária">Transferência Bancária</SelectItem>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="Boleto">Boleto</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* User Selection */}
            <UserSelect
              selectedUser={selectedUser}
              onUserSelect={setSelectedUser}
              placeholder="Selecionar usuário..."
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
                {createMutation.isPending ? 'Criando...' : 'Criar Pagamento'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
