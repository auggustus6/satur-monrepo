import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@satur/ui';
import {
  ShoppingCart,
  Calendar,
  DollarSign,
  Package,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { formatToBRL } from 'brazilian-values';
import dayjs from 'dayjs';

// Tipos para os pedidos
interface Order {
  id: number;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  createdAt: string;
  product: {
    id: number;
    name: string;
    description: string;
  };
  service: {
    id: number;
    name: string;
  };
}

interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

// Mock da API - você pode substituir por uma chamada real
const mockOrdersApi = {
  getMyOrders: async (): Promise<OrdersResponse> => {
    // Simula delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      orders: [
        {
          id: 1,
          totalAmount: 15000, // em centavos
          status: 'PAID',
          createdAt: '2024-01-15T10:00:00Z',
          product: {
            id: 1,
            name: 'Transfer Premium',
            description: 'Serviço de transfer executivo'
          },
          service: {
            id: 1,
            name: 'Transporte Executivo'
          }
        },
        {
          id: 2,
          totalAmount: 8500,
          status: 'PENDING',
          createdAt: '2024-01-20T14:30:00Z',
          product: {
            id: 2,
            name: 'City Tour',
            description: 'Passeio pela cidade'
          },
          service: {
            id: 2,
            name: 'Turismo'
          }
        }
      ],
      total: 2,
      page: 1,
      limit: 20
    };
  }
};

export function OrdersPage() {
  const { user } = useAuth();
  const [page] = useState(1);

  const {
    data: ordersData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['orders', 'my-orders', page],
    queryFn: () => mockOrdersApi.getMyOrders(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      PAID: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };

    const labels = {
      PAID: 'Pago',
      PENDING: 'Pendente',
      CANCELLED: 'Cancelado'
    };

    return (
      <Badge className={`${variants[status as keyof typeof variants]} hover:bg-inherit hover:text-inherit cursor-default pointer-events-none`}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando seus pedidos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Erro ao carregar seus pedidos. Tente novamente.
        </div>
      </div>
    );
  }

  const orders = ordersData?.orders || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="h-8 w-8" />
          Minhas Compras
        </h1>
        <p className="mt-2 text-gray-600">
          Acompanhe seus pedidos e histórico de compras
        </p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{ordersData?.total || 0}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total Gasto</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatToBRL(orders.reduce((sum, order) => sum + order.totalAmount, 0) / 100)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pedidos Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {orders.filter(order => order.status === 'PENDING').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum pedido encontrado
              </h3>
              <p className="text-gray-600">
                Você ainda não fez nenhuma compra.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Pedido #{order.id}</h4>
                        <p className="text-sm text-gray-500">
                          {dayjs(order.createdAt).format('DD/MM/YYYY [às] HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900">
                        {formatToBRL(order.totalAmount / 100)}
                      </p>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Produto</p>
                      <p className="text-sm text-gray-900">{order.product.name}</p>
                      <p className="text-xs text-gray-500">{order.product.description}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Serviço</p>
                      <p className="text-sm text-gray-900">{order.service.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
