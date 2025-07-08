import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Check,
  X,
  CreditCard,
  DollarSign,
  Calendar,
  User,
  Clock,
  CheckCircle
} from 'lucide-react';
import { paymentsApi } from '../services/api';
import { formatCentsToDisplay } from '../utils/currency';
import { markPaymentAsPaidSchema, type MarkPaymentAsPaidFormData } from '../schemas';
import { DeletePaymentDialog } from '../components/dialogs/DeletePaymentDialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@satur/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@satur/ui";
import { Button } from "@satur/ui";

export default function PaymentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  const form = useForm<MarkPaymentAsPaidFormData>({
    resolver: zodResolver(markPaymentAsPaidSchema),
    defaultValues: {
      paymentMethod: '',
    },
  });

  const { data: payment, isLoading, error } = useQuery({
    queryKey: ['payment', id],
    queryFn: () => paymentsApi.getById(Number(id)),
    enabled: !!id,
  });

  const markAsPaidMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: MarkPaymentAsPaidFormData }) => paymentsApi.markAsPaid(id, data),
    onSuccess: () => {
      toast.success('Pagamento marcado como pago!');
      setIsMarkingPaid(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['payment', id] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
    onError: () => {
      toast.error('Erro ao marcar pagamento como pago');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => paymentsApi.delete(id),
    onSuccess: () => {
      toast.success('Pagamento deletado com sucesso!');
      navigate('/payments');
    },
    onError: () => {
      toast.error('Erro ao deletar pagamento');
    },
  });

  const handleMarkAsPaid = form.handleSubmit((data) => {
    if (!payment) return;
    markAsPaidMutation.mutate({
      id: payment.id,
      data
    });
  });

  const handleDelete = () => {
    if (!payment) return;
    deleteMutation.mutate(payment.id);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800',
      PAID: 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800',
      CANCELLED: 'bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800',
    };

    const labels = {
      PENDING: 'Pendente',
      PAID: 'Pago',
      CANCELLED: 'Cancelado',
    };

    const getIcon = () => {
      if (status === 'PAID') return <CheckCircle className="w-4 h-4" />;
      if (status === 'CANCELLED') return <X className="w-4 h-4" />;
      return <Clock className="w-4 h-4" />;
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium cursor-default ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {getIcon()}
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Pagamento não encontrado</h1>
        <button
          onClick={() => navigate('/payments')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para pagamentos
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
            onClick={() => navigate('/payments')}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Detalhes do Pagamento</h1>
        </div>

        <div className="flex items-center gap-2">
          {payment.status === 'PENDING' && (
            <button
              onClick={() => setIsMarkingPaid(!isMarkingPaid)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
            >
              <Check className="w-4 h-4" />
              {isMarkingPaid ? 'Cancelar' : 'Marcar como Pago'}
            </button>
          )}

          <DeletePaymentDialog
            payment={payment}
            onConfirm={handleDelete}
            isDeleting={deleteMutation.isPending}
          />
        </div>
      </div>

      {/* Payment Details Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-6">
          {/* Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CreditCard className="w-10 h-10 text-green-600" />
          </div>

          {/* Payment Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Pagamento #{payment.id}
              </h2>
              {getStatusBadge(payment.status)}
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                <DollarSign className="w-4 h-4" />
                {formatCentsToDisplay(payment.amount)}
              </span>
            </div>

            <p className="text-gray-600">{payment.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="text-sm text-gray-500">Criado em:</span>
                  <p className="text-gray-900">
                    {new Date(payment.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {payment.paidAt && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-500">Pago em:</span>
                    <p className="text-gray-900">
                      {new Date(payment.paidAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}

              {payment.paymentMethod && (
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-500">Método:</span>
                    <p className="text-gray-900">{payment.paymentMethod}</p>
                  </div>
                </div>
              )}

              {payment.user && (
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-500">Usuário:</span>
                    <p className="text-gray-900">{payment.user.name}</p>
                    <p className="text-xs text-gray-500">{payment.user.email}</p>
                  </div>
                </div>
              )}

              {payment.processedById && (
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-500">Processado por:</span>
                    <p className="text-gray-900">
                      {payment.processedBy ? payment.processedBy.name : `Admin #${payment.processedById}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mark as Paid Form */}
      {isMarkingPaid && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Marcar como Pago</h3>

          <Form {...form}>
            <form onSubmit={handleMarkAsPaid} className="space-y-4">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pagamento *</FormLabel>
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

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={markAsPaidMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Confirmar Pagamento
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsMarkingPaid(false)}
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
