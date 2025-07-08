import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ServiceModal } from '../components/modals/ServiceModal';
import { PaginationControls } from '../components/common/PaginationControls';
import { useServices } from '../hooks/useServices';
import { useLocations } from '../hooks/useLocations';
import type { Service } from '../types/api';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@satur/ui';
import {
  Truck,
  Search,
  Plus,
  Loader2,
  MapPin,
  Users,
  Eye,
  Filter,
} from 'lucide-react';

export function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<number | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when location filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLocationId]);

  const { data: locationsData } = useLocations();
  const locations = locationsData || [];

  const { data: servicesData, isLoading, error } = useServices(
    currentPage,
    pageSize,
    debouncedSearchTerm || undefined,
    selectedLocationId
  );

  const services = servicesData?.services || [];
  const total = servicesData?.total || 0;
  const totalPages = servicesData?.totalPages || 0;



  const handleCreateService = () => {
    setSelectedService(undefined);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando serviços...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Erro ao carregar serviços. Tente novamente.
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
            <Truck className="h-8 w-8" />
            Gestão de Serviços
          </h1>
          <p className="mt-2 text-gray-600">
            Gerencie os tipos de serviços disponíveis na plataforma.
          </p>
        </div>
        <Button onClick={handleCreateService} className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white">
          <Plus className="h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar serviços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Location Filter */}
            <div className="flex items-center gap-2 min-w-[200px]">
              <Filter className="h-4 w-4 text-gray-400" />
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
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      {services.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {debouncedSearchTerm ? 'Nenhum serviço encontrado' : 'Nenhum serviço cadastrado'}
            </h3>
            <p className="text-gray-600 mb-4">
              {debouncedSearchTerm
                ? 'Tente ajustar os termos de busca ou criar um novo serviço.'
                : 'Comece criando seu primeiro serviço para a plataforma.'
              }
            </p>
            <Button onClick={handleCreateService} className="bg-blue-700 hover:bg-blue-800 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Serviço
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service: Service) => (
            <Link key={service.id} to={`/services/${service.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                    >
                      <Eye className="size-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge
                        className={service.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }
                      >
                        {service.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    {service.location && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Localização:</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">
                            {service.location.city}, {service.location.state}
                          </span>
                        </div>
                      </div>
                    )}
                    {service.users && service.users.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Usuários:</span>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium">
                            {service.users.length} associado{service.users.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
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



      {/* Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={selectedService}
      />
    </div>
  );
}
