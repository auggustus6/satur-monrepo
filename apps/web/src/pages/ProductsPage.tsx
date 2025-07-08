import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreateProductModal } from '../components/modals/CreateProductModal';
import { DeleteProductModal } from '../components/modals/DeleteProductModal';
import { PaginationControls } from '../components/common/PaginationControls';
import { ServiceSelect } from '../components/common/ServiceSelect';
import { useProducts } from '../hooks/useProducts';
import { useLocations } from '../hooks/useLocations';
import { formatToBRL } from 'brazilian-values';
import type { Product } from '../types/api';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from '@satur/ui';

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
import {
  Package,
  Search,
  Plus,
  Loader2,
  MapPin,
  Eye,
  Edit,
  DollarSign,
  Trash2,
  Filter,
} from 'lucide-react';

export function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>("active"); // Default to active
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedService, selectedLocationId, statusFilter]);

  // Convert status filter to boolean for API
  const isActiveFilter = statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined;

  const { data: locationsData } = useLocations();
  const locations = locationsData || [];

  const { data: productsData, isLoading, error } = useProducts(
    currentPage,
    pageSize,
    debouncedSearchTerm || undefined,
    selectedService?.id,
    isActiveFilter,
    selectedLocationId
  );

  const products = productsData?.products || [];
  const total = productsData?.total || 0;
  const totalPages = productsData?.totalPages || 0;

  const handleCreateProduct = () => {
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'BRL') {
      return formatToBRL(price / 100); // Converte de centavos para reais
    }
    return `${currency} ${(price / 100).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando produtos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Erro ao carregar produtos. Tente novamente.
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
            <Package className="h-8 w-8" />
            Gestão de Produtos
          </h1>
          <p className="mt-2 text-gray-600">
            Gerencie os produtos disponíveis na plataforma.
          </p>
        </div>
        <Button onClick={handleCreateProduct} className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white">
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-end">
              {/* Service Filter */}
              <div className="flex-1 min-w-[200px] space-y-2">
                <ServiceSelect
                  selectedService={selectedService}
                  onServiceSelect={setSelectedService}
                  placeholder="Todos os serviços"
                  locationId={selectedLocationId}
                  compact={true}
                />
              </div>

              {/* Location Filter */}
              <div className="flex-1 min-w-[200px] space-y-2">
                <Label className="text-sm font-medium text-gray-700">Localidade</Label>
                <Select
                  value={selectedLocationId?.toString() ?? "all"}
                  onValueChange={(value) => setSelectedLocationId(value && value !== "all" ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as localidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as localidades</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.city} - {location.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="min-w-[150px] space-y-2">
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Apenas Ativos</SelectItem>
                    <SelectItem value="inactive">Apenas Inativos</SelectItem>
                    <SelectItem value="all">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-transparent">.</Label>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedService(null);
                    setSelectedLocationId(undefined);
                    setStatusFilter("active");
                    setSearchTerm('');
                  }}
                  className="h-10"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {products.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {debouncedSearchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
            </h3>
            <p className="text-gray-600 mb-4">
              {debouncedSearchTerm
                ? 'Tente ajustar os termos de busca ou criar um novo produto.'
                : 'Comece criando seu primeiro produto para a plataforma.'
              }
            </p>
            <Button onClick={handleCreateProduct} className="bg-blue-700 hover:bg-blue-800 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Produto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: Product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <Link to={`/products/${product.id}`}>
                      <Button size="icon" variant="outline">
                        <Eye className="size-4" />
                      </Button>
                    </Link>
                    <Link to={`/products/${product.id}/edit`}>
                      <Button size="icon" variant="outline">
                        <Edit className="size-4" />
                      </Button>
                    </Link>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleDeleteProduct(product)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Preço:</span>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        {formatPrice(product.price, product.currency)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge
                      className={product.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      }
                    >
                      {product.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>

                  {product.service && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Serviço:</span>
                      <Badge variant="outline" className="text-xs">
                        {product.service.name}
                      </Badge>
                    </div>
                  )}

                  {product.service?.location && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Localização:</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">
                          {product.service.location.city}, {product.service.location.state}
                        </span>
                      </div>
                    </div>
                  )}

                  {(product.stripeProductId || product.stripePriceId) && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Stripe:</span>
                      <Badge variant="secondary" className="text-xs">
                        Integrado
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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

      {/* Modals */}
      <CreateProductModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />

      <DeleteProductModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        product={productToDelete}
      />
    </div>
  );
}
