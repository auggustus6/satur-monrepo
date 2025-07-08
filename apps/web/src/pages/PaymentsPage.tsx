import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@satur/ui';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Search,
  CheckCircle,
  Clock,

  Eye,
  Edit,
  Loader2,
  X
} from 'lucide-react';
import dayjs from 'dayjs';
import { CreatePaymentModal } from '../components/modals/CreatePaymentModal';
import { formatCentsToDisplay } from '../utils/currency';
import type { Payment } from '../types/api';
import { EditPaymentModal } from '@/components/modals/EditPaymentModal';
import { usePayments } from '../hooks/usePayments';
import { PaginationControls } from '../components/common/PaginationControls';
import { DeletePaymentDialog } from '../components/dialogs/DeletePaymentDialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../services/api';
import { toast } from 'react-hot-toast';

export function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateFrom, dateTo]);

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowEditModal(true);
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => paymentsApi.delete(id),
    onSuccess: () => {
      toast.success('Pagamento deletado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Erro ao deletar pagamento. Tente novamente.';
      toast.error(errorMessage);
    },
  });

  const handleDeletePayment = (paymentId: number) => {
    deleteMutation.mutate(paymentId);
  };

  const { data: paymentsData, isLoading, error } = usePayments(
    currentPage,
    pageSize,
    {
      status: statusFilter || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }
  );

  const payments = paymentsData?.payments || [];
  const total = paymentsData?.total || 0;
  const totalPages = paymentsData?.totalPages || 0;

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ?? false;
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    if (status === 'PAID') {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800 cursor-default">
          <CheckCircle className="h-3 w-3 mr-1" />
          Pago
        </Badge>
      );
    } else if (status === 'CANCELLED') {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800 cursor-default">
          <X className="h-3 w-3 mr-1" />
          Cancelado
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800 cursor-default">
          <Clock className="h-3 w-3 mr-1" />
          Pendente
        </Badge>
      );
    }
  };

  const totalPaidCents = filteredPayments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPendingCents = filteredPayments
    .filter(p => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amount, 0);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Carregando pagamentos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar pagamentos</h2>
          <p className="text-gray-600">Tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="h-8 w-8" />
            Gestão de Pagamentos
          </h1>
          <p className="mt-2 text-gray-600">
            Gerencie os pagamentos e transações da plataforma.
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setShowCreateModal(true)}
        >
          Novo Pagamento
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Pago
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCentsToDisplay(totalPaidCents)}
            </div>
            <div className="text-sm text-gray-500">
              {filteredPayments.filter(p => p.status === 'PAID').length} transações
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pendente
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCentsToDisplay(totalPendingCents)}
            </div>
            <div className="text-sm text-gray-500">
              {filteredPayments.filter(p => p.status === 'PENDING').length} transações
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">Todos os status</option>
                <option value="PAID">Pago</option>
                <option value="PENDING">Pendente</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>

            <div>
              <Input
                type="date"
                placeholder="Data inicial"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <Input
                type="date"
                placeholder="Data final"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transações ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Descrição</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Valor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Usuário</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Método</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Data</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">#{payment.id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{payment.description}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">
                        {formatCentsToDisplay(payment.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {payment.user ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{payment.user.name}</span>
                          <span className="text-xs text-gray-500">{payment.user.email}</span>
                          <span className="text-xs text-blue-500 capitalize">{payment.user.role.toLowerCase()}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Sem usuário</span>
                      )}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(payment.status)}</td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {payment.paymentMethod || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="text-sm text-gray-900">
                          {payment.paidAt ? "Pago: " + dayjs(payment.paidAt).format('DD/MM/YYYY') : 'Pendente'}
                        </div>
                        <p className="text-xs text-gray-500">
                          Criado: {dayjs(payment.createdAt).format('DD/MM/YYYY')}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link to={`/payments/${payment.id}`}>
                          <Button size="sm" variant="outline" className="text-blue-600 hover:text-blue-700">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleEditPayment(payment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DeletePaymentDialog
                          payment={payment}
                          onConfirm={() => handleDeletePayment(payment.id)}
                          isDeleting={deleteMutation.isPending}
                          variant="icon-only"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          total={total}
          limit={pageSize}
        />
      )}

      {/* Create Payment Modal */}
      <CreatePaymentModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />

      {/* Edit Payment Modal */}
      <EditPaymentModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        payment={selectedPayment}
      />
    </div>
  );
}
