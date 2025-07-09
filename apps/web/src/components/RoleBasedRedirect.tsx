import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function RoleBasedRedirect() {
  const { user, isLoadingProfile } = useAuth();

  // Se ainda está carregando o perfil, mostra loading
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Redirecionar baseado no role do usuário
  if (user) {
    switch (user.role) {
      case 'ADMIN':
        return <Navigate to="/reports" replace />;
      case 'CUSTOMER':
        return <Navigate to="/orders" replace />;
      case 'AGENCY':
      case 'SUPPLIER':
        return <Navigate to="/settings" replace />;
      default:
        return <Navigate to="/settings" replace />;
    }
  }

  // Fallback para settings se não conseguir determinar o role
  return <Navigate to="/settings" replace />;
}
