import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DeleteProductModal } from '../components/modals/DeleteProductModal';
import { useProduct, useProductStats } from '../hooks/useProducts';
import { formatToBRL } from 'brazilian-values';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@satur/ui';
import {
  Package,
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  DollarSign,
  Calendar,
  User,
  TrendingUp,
  ShoppingCart,
  Clock,
  Loader2,
} from 'lucide-react';

export function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = parseInt(id || '0', 10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: product, isLoading, error } = useProduct(productId);
  const { data: statsData, isLoading: isLoadingStats } = useProductStats(productId);

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'BRL') {
      return formatToBRL(price / 100);
    }
    return `${currency} ${(price / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).locale('pt-br').format("DD [de] MMMM [de] YYYY [às] HH:mm");
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
            onClick={() => navigate('/products')}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-8 w-8" />
              {product.name}
            </h1>
            <p className="mt-2 text-gray-600">
              Detalhes completos do produto
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/products/${product.id}/edit`}>
            <Button className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white">
              <Edit className="h-4 w-4" />
              Editar Produto
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <Trash2 className="h-4 w-4" />
            Excluir Produto
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Produto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nome</label>
                <p className="text-lg font-medium">{product.name}</p>
              </div>

              {product.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Descrição</label>
                  <p className="text-gray-900">{product.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Preço</label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-lg font-medium text-green-600">
                      {formatPrice(product.price, product.currency)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge
                      className={product.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                      }
                    >
                      {product.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </div>

              {product.service && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Serviço</label>
                  <div className="space-y-2 mt-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{product.service.name}</Badge>
                      {product.service.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-blue-600">
                            {product.service.location.city}, {product.service.location.state}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                        Prestadores Associados
                        {product.service.users && ` (${product.service.users.length})`}
                      </label>
                      {product.service.users && product.service.users.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          {product.service.users.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200"
                            >
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="h-5 w-5 text-blue-600" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900 truncate">{user.name}</span>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs flex-shrink-0"
                                  >
                                    {user.role}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                {user.location && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <MapPin className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs text-gray-400">
                                      {user.location.city}, {user.location.state}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-2 text-gray-500">
                            <User className="h-4 w-4" />
                            <span className="text-sm">Nenhum prestador associado a este serviço</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {(product.stripeProductId || product.stripePriceId) && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Integração Stripe</label>
                  <div className="space-y-2 mt-1">
                    {product.stripeProductId && (
                      <div>
                        <span className="text-xs text-gray-500">Product ID:</span>
                        <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                          {product.stripeProductId}
                        </p>
                      </div>
                    )}
                    {product.stripePriceId && (
                      <div>
                        <span className="text-xs text-gray-500">Price ID:</span>
                        <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                          {product.stripePriceId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-gray-500">Criado em</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{formatDate(product.createdAt)}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Atualizado em</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{formatDate(product.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="space-y-6">
          {isLoadingStats ? (
            <Card>
              <CardContent className="p-6 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Carregando estatísticas...</span>
              </CardContent>
            </Card>
          ) : statsData && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Estatísticas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Total de Pedidos</span>
                    </div>
                    <span className="font-medium">{statsData.stats.totalOrders}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Receita Total</span>
                    </div>
                    <span className="font-medium text-green-600">
                      {formatToBRL(statsData.stats.totalRevenue / 100)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-sm">Pedidos Pendentes</span>
                    </div>
                    <span className="font-medium">{statsData.stats.activeOrders}</span>
                  </div>
                </CardContent>
              </Card>

              {statsData.recentOrders && statsData.recentOrders.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Pedidos Recentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {statsData.recentOrders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium">{order.customer.name}</p>
                            <p className="text-xs text-gray-500">
                              {dayjs(order.createdAt).format('DD/MM/YYYY')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {formatToBRL(order.totalAmount / 100)}
                            </p>
                            <Badge
                              className={
                                order.status === 'PAID'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'PENDING'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }
                            >
                              {order.status === 'PAID' ? 'Pago' :
                                order.status === 'PENDING' ? 'Pendente' : 'Cancelado'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteProductModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        product={product || null}
        onDeleteSuccess={() => navigate('/products')}
      />
    </div>
  );
}
