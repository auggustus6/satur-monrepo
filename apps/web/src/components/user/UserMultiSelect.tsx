import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Shield, Building } from 'lucide-react';
import { paymentsApi } from '@/services/api';
import { MultiSelect } from '@satur/ui';

interface UserOption {
  id: number;
  name: string;
  email: string;
  role: string;
  locationId?: number | null;
  location?: { id: number; city: string; state: string } | null;
}

interface UserMultiSelectProps {
  selectedUsers: UserOption[];
  onUsersChange: (users: UserOption[]) => void;
  placeholder?: string;
  locationId?: number;
  disabled?: boolean;
  error?: string;
  className?: string;
}



// Map user roles to icons
const getRoleIcon = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return Shield;
    case 'AGENCY':
      return Building;
    case 'SUPPLIER':
      return User;
    default:
      return User;
  }
};

// Map user roles to Portuguese labels
const getRoleLabel = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return 'Administrador';
    case 'AGENCY':
      return 'Agência';
    case 'SUPPLIER':
      return 'Fornecedor';
    case 'CUSTOMER':
      return 'Cliente';
    default:
      return role;
  }
};

export function UserMultiSelect({
  selectedUsers,
  onUsersChange,
  placeholder = "Selecionar usuários...",
  locationId,
  disabled = false,
  error,
  className
}: UserMultiSelectProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch eligible users for services (excluding CUSTOMER users)
  const { data: eligibleUsers = [], isLoading } = useQuery({
    queryKey: ['payments', 'search-users', debouncedSearch],
    queryFn: () => paymentsApi.searchUsers(debouncedSearch || undefined, 50, 'CUSTOMER'),
    enabled: true,
  });



  // Convert users to MultiSelect options format
  // Include both eligible users and already selected users
  const allUsers = [
    ...eligibleUsers,
    ...selectedUsers.filter(selected =>
      !eligibleUsers.some(eligible => eligible.id === selected.id)
    )
  ];

  const userOptions = allUsers.map(user => {
    const locationName = user.location
      ? `${user.location.city}, ${user.location.state}`
      : 'Sem localização';

    return {
      label: `${user.name} - ${getRoleLabel(user.role)} (${locationName})`,
      value: user.id.toString(),
      icon: getRoleIcon(user.role),
      userData: user
    };
  });

  // Convert selected user IDs to string array for MultiSelect
  const selectedValues = selectedUsers.map(user => user.id.toString());

  const handleValueChange = (values: string[]) => {
    // Convert selected values back to user objects
    const newSelectedUsers = values.map(value => {
      const userId = parseInt(value);

      // First check if user is already in selectedUsers
      const existingUser = selectedUsers.find(user => user.id === userId);
      if (existingUser) {
        return existingUser;
      }

      // Otherwise find in eligible users
      const userOption = userOptions.find(option => option.value === value);
      return userOption?.userData || { id: userId, name: '', email: '', role: '', locationId: null, location: null };
    }).filter(user => user.name !== ''); // Filter out invalid users

    onUsersChange(newSelectedUsers);
  };

  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
  };

  return (
    <div className="space-y-2">
      <MultiSelect
        options={userOptions}
        onValueChange={handleValueChange}
        defaultValue={selectedValues}
        placeholder={placeholder}
        variant="default"
        maxCount={3}
        modalPopover={true}
        disabled={disabled}
        className={className}
        onSearchChange={handleSearchChange}
      />

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <p className="text-sm text-muted-foreground">Carregando usuários...</p>
      )}

      {/* Location Note */}
      {locationId && (
        <p className="text-xs text-muted-foreground">
          Nota: Usuários SUPPLIER só podem ser associados se estiverem na mesma localização do serviço.
        </p>
      )}
    </div>
  );
}
