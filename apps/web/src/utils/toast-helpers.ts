import { toast } from 'react-hot-toast';
import { ApiError } from '../lib/api';

export function showErrorToast(error: unknown, defaultMessage: string = 'Erro inesperado') {
  if (error instanceof ApiError) {
    // Handle specific API errors with custom messages
    if (error.status === 400) {
      // Validation errors - show specific message
      if (error.message.includes('localidade diferente da do serviço')) {
        toast.error('❌ Erro de Localização: ' + error.message, {
          duration: 6000,
          style: {
            background: '#FEF2F2',
            color: '#DC2626',
            border: '1px solid #FECACA',
          },
        });
      } else if (error.message.includes('não pode ser associado ao serviço')) {
        toast.error('❌ Erro de Validação: ' + error.message, {
          duration: 6000,
          style: {
            background: '#FEF2F2',
            color: '#DC2626',
            border: '1px solid #FECACA',
          },
        });
      } else {
        toast.error(error.message);
      }
    } else if (error.status === 401) {
      toast.error('🔒 Sessão expirada. Faça login novamente.');
    } else if (error.status === 403) {
      toast.error('🚫 Você não tem permissão para realizar esta ação.');
    } else if (error.status === 404) {
      toast.error('🔍 Recurso não encontrado.');
    } else if (error.status >= 500) {
      toast.error('🔧 Erro interno do servidor. Tente novamente mais tarde.');
    } else {
      toast.error(error.message || defaultMessage);
    }
  } else if (error instanceof Error) {
    toast.error('🌐 Erro de conexão. Verifique sua internet.');
  } else {
    toast.error(defaultMessage);
  }
}

export function showSuccessToast(message: string) {
  toast.success(message, {
    style: {
      background: '#F0FDF4',
      color: '#166534',
      border: '1px solid #BBF7D0',
    },
  });
}

export function showWarningToast(message: string) {
  toast(message, {
    icon: '⚠️',
    style: {
      background: '#FFFBEB',
      color: '#92400E',
      border: '1px solid #FDE68A',
    },
  });
}

export function showInfoToast(message: string) {
  toast(message, {
    icon: 'ℹ️',
    style: {
      background: '#EFF6FF',
      color: '#1E40AF',
      border: '1px solid #DBEAFE',
    },
  });
}
