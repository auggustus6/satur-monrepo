import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CreateUserModal } from '../components/modals/CreateUserModal';
import { DeleteUserDialog } from '../components/dialogs/DeleteUserDialog';
import { ApproveUserDialog } from '../components/dialogs/ApproveUserDialog';
import { PaginationControls } from '../components/common/PaginationControls';
import { useUsers, useDeleteUser, useApproveUser } from '../hooks/useUsers';
import type { User } from '../types/api';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from '@satur/ui';
import {
  Users,
  Search,
  Plus,
  Filter,
  Loader2,
  Eye
} from 'lucide-react';
import dayjs from 'dayjs';
import { formatToPhone } from 'brazilian-values';

export function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter]);

  const { data: usersData, isLoading, error } = useUsers(
    currentPage,
    pageSize,
    debouncedSearchTerm || undefined,
    roleFilter !== 'ALL' ? roleFilter : undefined
  );
  const users = usersData?.users || [];
  const total = usersData?.total || 0;
  const totalPages = usersData?.totalPages || 0;
  const deleteUser = useDeleteUser();
  const approveUser = useApproveUser();

  const handleCreateUser = () => {
    setIsModalOpen(true);
  };

  const handleDeleteUser = (id: number) => {
    deleteUser.mutate(id);
  };

  const handleApproveUser = async (id: number, isApproved: boolean) => {
    try {
      await approveUser.mutateAsync({ id, isApproved });
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando usuários...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Erro ao carregar usuários. Tente novamente.
        </div>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    const variants = {
      ADMIN: 'bg-red-100 text-red-800',
      AGENCY: 'bg-blue-100 text-blue-800',
      SUPPLIER: 'bg-green-100 text-green-800',
      CUSTOMER: 'bg-yellow-100 text-yellow-800'
    };

    const labels = {
      ADMIN: 'Admin',
      AGENCY: 'Agência',
      SUPPLIER: 'Fornecedor',
      CUSTOMER: 'Cliente'
    };

    return (
      <Badge
        className={`${variants[role as keyof typeof variants]} hover:bg-inherit hover:text-inherit cursor-default pointer-events-none`}
      >
        {labels[role as keyof typeof labels]}
      </Badge>
    );
  };

  const getStatusBadge = (isApproved: boolean) => {
    const baseClasses = 'hover:bg-inherit hover:text-inherit cursor-default pointer-events-none';
    return isApproved ? (
      <Badge className={`bg-green-100 text-green-800 ${baseClasses}`}>Aprovado</Badge>
    ) : (
      <Badge className={`bg-yellow-100 text-yellow-800 ${baseClasses}`}>Pendente</Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8" />
            Gestão de Usuários
          </h1>
          <p className="mt-2 text-gray-600">
            Gerencie usuários, aprovações e permissões da plataforma.
          </p>
        </div>
        <Button
          onClick={handleCreateUser}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white"
        >
          <Plus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="ALL">Todas as funções</option>
                <option value="ADMIN">Admin</option>
                <option value="AGENCY">Agência</option>
                <option value="SUPPLIER">Fornecedor</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Total Usuários ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Nome</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Função</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: User) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">
                          {user.phone ? formatToPhone(user.phone) : `Criado em ${dayjs(user.createdAt).format('DD/MM/YYYY')}`}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{user.email}</td>
                    <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                    <td className="py-3 px-4">{getStatusBadge(user.isApproved)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Link to={`/users/${user.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {user.role === 'SUPPLIER' && (
                          <ApproveUserDialog
                            user={user}
                            onConfirm={handleApproveUser}
                            isApproving={approveUser.isPending}
                            variant="icon-only"
                          />
                        )}
                        <DeleteUserDialog
                          user={user}
                          onConfirm={() => handleDeleteUser(user.id)}
                          isDeleting={deleteUser.isPending}
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

      {/* Paginação */}
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
      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
