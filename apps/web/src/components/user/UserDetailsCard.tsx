import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Shield,
  Building2,
  Truck,
  Check,
  X
} from 'lucide-react';
import type { User } from '../../types/api';
import { formatToCNPJ, formatToCPF, formatToPhone } from 'brazilian-values';
import type { JSX } from 'react';
import { Badge } from '@satur/ui';

interface UserDetailsCardProps {
  user: User;
}

export function UserDetailsCard({ user }: UserDetailsCardProps) {
  const roleIcons: Record<string, JSX.Element> = {
    ADMIN: <Shield className="w-5 h-5" />,
    AGENCY: <Building2 className="w-5 h-5" />,
    SUPPLIER: <Truck className="w-5 h-5" />,
  };

  const getRoleIcon = (role: string) => {
    return roleIcons[role] || <UserIcon className="w-5 h-5" />;
  };

  const badgeColors: Record<string, string> = {
    CPF: 'bg-blue-100 text-blue-800',
    CNPJ: 'bg-green-100 text-green-800',
  };

  const getDocumentBadgeClass = (type: string) => {
    return badgeColors[type as keyof typeof badgeColors] || 'bg-gray-100 text-gray-800';
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      ADMIN: 'bg-red-100 text-red-800',
      AGENCY: 'bg-blue-100 text-blue-800',
      SUPPLIER: 'bg-green-100 text-green-800',
      CUSTOMER: 'bg-yellow-100 text-yellow-800',
    };

    const labels = {
      ADMIN: 'Administrador',
      AGENCY: 'Agência',
      SUPPLIER: 'Fornecedor',
      CUSTOMER: 'Cliente',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {getRoleIcon(role)}
        {labels[role as keyof typeof labels] || role}
      </span>
    );
  };

  const getStatusBadge = (isApproved: boolean) => {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
        {isApproved ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
        {isApproved ? 'Aprovado' : 'Pendente'}
      </span>
    );
  };

  const getFormattedDocument = () => {
    if (user.documentType === 'CPF') return user.document ? formatToCPF(user.document) : '';
    if (user.documentType === 'CNPJ') return user.document ? formatToCNPJ(user.document) : '';
    return user.document;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
          <UserIcon className="w-10 h-10 text-blue-600" />
        </div>

        {/* User Info */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
            {getRoleBadge(user.role)}
            {getStatusBadge(user.isApproved)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">{user.email}</span>
            </div>

            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{formatToPhone(user.phone)}</span>
              </div>
            )}

            {user.document && (
              <div className="flex items-center gap-3">
                <UserIcon className="w-5 h-5 text-gray-400" />
                <div className="flex gap-2">
                  <span className="text-gray-900">
                    {getFormattedDocument()}
                  </span>
                  <Badge
                    className={`text-xs px-2 py-0.5 rounded ${getDocumentBadgeClass(user.documentType || '')} hover:bg-inherit hover:text-inherit cursor-default pointer-events-none`}
                  >
                    {user.documentType}
                  </Badge>

                </div>
              </div>
            )}

            {user.address && (
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{user.address}</span>
              </div>
            )}

            {user.city && (
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{user.city}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">
                Cadastrado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
