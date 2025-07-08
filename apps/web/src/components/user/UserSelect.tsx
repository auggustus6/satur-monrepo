import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { X, Search } from 'lucide-react';
import { paymentsApi } from '@/services/api';
import { Button, Input } from '@satur/ui';

interface UserOption {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface UserSelectProps {
  selectedUser: UserOption | null;
  onUserSelect: (user: UserOption | null) => void;
  placeholder?: string;
}

export function UserSelect({ selectedUser, onUserSelect, placeholder = "Selecionar usuário..." }: UserSelectProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users-search', search],
    queryFn: () => paymentsApi.searchUsers(search || undefined, 20),
    enabled: isOpen,
  });

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleUserSelect = (user: UserOption) => {
    onUserSelect(user);
    setIsOpen(false);
    setSearch('');
  };

  const handleClearUser = () => {
    onUserSelect(null);
    setSearch('');
  };

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Usuário (opcional)</label>

      {selectedUser ? (
        <div className="flex items-center justify-between p-3 border border-gray-300 rounded-md bg-gray-50">
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{selectedUser.name}</span>
            <span className="text-sm text-gray-500">{selectedUser.email}</span>
            <span className="text-xs text-blue-500 capitalize">{selectedUser.role.toLowerCase()}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearUser}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar usuário..."
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
                  Carregando usuários...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-3 text-center text-gray-500">
                  Nenhum usuário encontrado
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleUserSelect(user)}
                    className="w-full p-3 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{user.name}</span>
                      <span className="text-sm text-gray-500">{user.email}</span>
                      <span className="text-xs text-blue-500 capitalize">{user.role.toLowerCase()}</span>
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
