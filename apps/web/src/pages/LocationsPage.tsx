import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@satur/ui';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@satur/ui';
import { locationsApi } from '../services/api';
import type { Location } from '../types/api';
import { CreateLocationModal } from '@/components/modals/CreateLocationModal';
import { EditLocationModal } from '@/components/modals/EditLocationModal';
import { DeleteLocationModal } from '@/components/modals/DeleteLocationModal';

export default function LocationsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(null);

  const queryClient = useQueryClient();

  // Buscar localizações
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationsApi.getAll(),
  });

  // Mutation para deletar localização
  const { mutate: deleteLocation, isPending: isDeleting } = useMutation({
    mutationFn: locationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      setDeletingLocation(null);
      toast.success('Localização excluída com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao excluir localização:', error);
      toast.error(
        error?.response?.data?.message ||
        'Erro ao excluir localização. Tente novamente.'
      );
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando localizações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Localizações</h1>
          <p className="text-gray-600 mt-1">
            Gerencie as localizações disponíveis para fornecedores e serviços
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-700 hover:bg-blue-800 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Localização
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Localizações</p>
                <p className="text-2xl font-bold text-gray-900">{locations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Estados Únicos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(locations.map(l => l.state)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cidades Únicas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(locations.map(l => l.city)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Localizações */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Localizações</CardTitle>
        </CardHeader>
        <CardContent>
          {locations.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma localização encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                Comece criando sua primeira localização
              </p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-700 hover:bg-blue-800 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Localização
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {location.city}
                      </h3>
                      <Badge variant="secondary" className="mt-1">
                        {location.state}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingLocation(location)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingLocation(location)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>ID: {location.id}</p>
                    <p>Criado: {new Date(location.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateLocationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {editingLocation && (
        <EditLocationModal
          location={editingLocation}
          isOpen={!!editingLocation}
          onClose={() => setEditingLocation(null)}
        />
      )}

      {deletingLocation && (
        <DeleteLocationModal
          location={deletingLocation}
          isOpen={!!deletingLocation}
          onClose={() => setDeletingLocation(null)}
          onConfirm={() => deleteLocation(deletingLocation.id)}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
