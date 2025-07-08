import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { usersApi } from '../services/api';
import { UserDetailsHeader } from '../components/user/UserDetailsHeader';
import { UserDetailsCard } from '../components/user/UserDetailsCard';
import { EditUserForm } from '../components/forms/EditUserForm';
import type { UpdateUserDto } from '../types/api';

export default function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getById(Number(id)),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserDto }) => usersApi.update(id, data),
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      navigate('/users');
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, isApproved }: { id: number; isApproved: boolean }) =>
      usersApi.approve(id, isApproved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleSave = (data: UpdateUserDto) => {
    if (!user) return;
    updateMutation.mutate({ id: user.id, data });
  };

  const handleDelete = () => {
    if (!user) return;
    deleteMutation.mutate(user.id);
  };

  const handleApprovalToggle = (id: number, isApproved: boolean) => {
    approveMutation.mutate({ id, isApproved });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando usuário...</span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Usuário não encontrado.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <UserDetailsHeader
        user={user}
        isEditing={isEditing}
        onBack={() => navigate('/users')}
        onEdit={() => setIsEditing(!isEditing)}
        onDelete={handleDelete}
        onApprovalToggle={handleApprovalToggle}
        isDeleting={deleteMutation.isPending}
        isTogglingApproval={approveMutation.isPending}
      />

      <UserDetailsCard user={user} />

      {isEditing && (
        <EditUserForm
          user={user}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
}
