
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';




import type { Payment } from '@/types/api';
import { formatCentsToDisplay, useMoneyInput } from '@/utils/currency';
import { updatePaymentSchema, type UpdatePaymentFormData } from '@/schemas';
import { paymentsApi } from '@/services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@satur/ui';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@satur/ui';
import { Textarea, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button } from '@satur/ui';
import { UserSelect } from '../user/UserSelect';

interface EditPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment | null;
}

interface UserOption {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function EditPaymentModal({ open, onOpenChange, payment }: EditPaymentModalProps) {
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [displayAmount, setDisplayAmount] = useState('');
  const queryClient = useQueryClient();
  const { formatAsUserTypes, parseInputValue } = useMoneyInput();

  const form = useForm<UpdatePaymentFormData>({
    resolver: zodResolver(updatePaymentSchema),
    defaultValues: {
      amount: 0,
      description: '',
      paymentMethod: '',
      status: 'PENDING',
      userId: undefined,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdatePaymentFormData) => {
      if (!payment) throw new Error('Payment not found');
      const payload = {
        ...data,
        amount: parseInputValue(displayAmount),
        userId: selectedUser?.id,
      };
      return paymentsApi.update(payment.id, payload);
    },
    onSuccess: () => {
      toast.success('Pagamento atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['payment', payment?.id] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Erro ao atualizar pagamento. Tente novamente.';
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: UpdatePaymentFormData) => {
    updateMutation.mutate(data);
  };

  const handleAmountChange = (value: string) => {
    const formatted = formatAsUserTypes(value);
    setDisplayAmount(formatted);
    const cents = parseInputValue(formatted);
    form.setValue('amount', cents);
  };

  useEffect(() => {
    if (payment && open) {
      form.reset({
        amount: payment.amount,
        description: payment.description || '',
        paymentMethod: payment.paymentMethod || '',
        status: payment.status,
        userId: payment.userId,
      });

      setDisplayAmount(formatCentsToDisplay(payment.amount));

      if (payment.user) {
        setSelectedUser({
          id: payment.user.id,
          name: payment.user.name,
          email: payment.user.email,
          role: payment.user.role,
        });
      } else {
        setSelectedUser(null);
      }
    }
  }, [payment, open, form]);

  useEffect(() => {
    if (!open) {
      form.reset();
      setSelectedUser(null);
      setDisplayAmount('');
    }
  }, [open, form]);

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Pagamento #{payment.id}</DialogTitle>
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PENDING">Pendente</SelectItem>
                      <SelectItem value="PAID">Pago</SelectItem>
                      <SelectItem value="CANCELLED">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
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
                disabled={updateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
