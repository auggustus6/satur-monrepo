import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Search, MapPin } from 'lucide-react';
import { servicesApi } from '@/services/api';
import { Button, Input, Badge } from '@satur/ui';

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

interface ServiceSelectProps {
  selectedService: ServiceOption | null;
  onServiceSelect: (service: ServiceOption | null) => void;
  placeholder?: string;
  required?: boolean;
  locationId?: number;
  compact?: boolean; // New prop for compact mode
}

export function ServiceSelect({
  selectedService,
  onServiceSelect,
  placeholder = "Selecionar serviço...",
  required = false,
  locationId,
  compact = false
}: ServiceSelectProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { data: servicesData = { services: [] }, isLoading } = useQuery({
    queryKey: ['services', search, locationId],
    queryFn: () => servicesApi.getAll(1, 50, search || undefined, locationId),
    enabled: isOpen,
  });

  const services = servicesData.services || [];

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(search.toLowerCase()) ||
    (service.description && service.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleServiceSelect = (service: ServiceOption) => {
    onServiceSelect(service);
    setIsOpen(false);
    setSearch('');
  };

  const handleClearService = () => {
    onServiceSelect(null);
    setSearch('');
  };

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (isOpen && !target.closest('[data-service-select]')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={compact ? "" : "space-y-2"} data-service-select>
      {!compact && (
        <label className="text-sm font-medium">
          Serviço {required && '*'}
        </label>
      )}

      {selectedService ? (
        compact ? (
          // Compact mode - single line display
          <div className="flex items-center justify-between p-2 border border-gray-300 rounded-md bg-white">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="font-medium text-gray-900 truncate">{selectedService.name}</span>
              {selectedService.location && (
                <Badge variant="outline" className="text-xs">
                  {selectedService.location.city}
                </Badge>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearService}
              className="text-gray-400 hover:text-gray-600 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          // Full mode - detailed display
          <div className="flex items-center justify-between p-3 border border-gray-300 rounded-md bg-gray-50">
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{selectedService.name}</span>
              {selectedService.description && (
                <span className="text-sm text-gray-500">{selectedService.description}</span>
              )}
              {selectedService.location && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 text-blue-600" />
                  <span className="text-xs text-blue-600">
                    {selectedService.location.city}, {selectedService.location.state}
                  </span>
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearService}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="w-full justify-between text-gray-500"
        >
          {placeholder}
          <Search className="h-4 w-4" />
        </Button>
      )}

      {isOpen && (
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 z-50 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-hidden">
            <div className="p-3 border-b">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Selecionar Serviço</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar serviço..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto">
              {isLoading ? (
                <div className="p-3 text-center text-gray-500">
                  Carregando serviços...
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="p-3 text-center text-gray-500">
                  Nenhum serviço encontrado
                </div>
              ) : (
                filteredServices.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleServiceSelect(service)}
                    className="w-full p-3 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{service.name}</span>
                      {service.description && (
                        <span className="text-sm text-gray-500">{service.description}</span>
                      )}
                      {service.location && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-blue-600" />
                          <span className="text-xs text-blue-600">
                            {service.location.city}, {service.location.state}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="p-2 border-t bg-gray-50">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="w-full"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
