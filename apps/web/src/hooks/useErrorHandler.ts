import { useState, useCallback } from 'react';
import { ApiError } from '../lib/api';
import { showErrorToast } from '../utils/toast-helpers';

interface ErrorState {
  message: string;
  type: 'validation' | 'network' | 'server' | 'unknown';
  details?: Record<string, unknown>;
}

export function useErrorHandler() {
  const [error, setError] = useState<ErrorState | null>(null);

  const handleError = useCallback(
    (error: unknown, showToast: boolean = true) => {
      let errorState: ErrorState;

      if (error instanceof ApiError) {
        // Handle specific API errors
        if (error.status === 400) {
          // Validation errors
          errorState = {
            message: error.message,
            type: 'validation',
            details: error.data,
          };
        } else if (error.status >= 500) {
          // Server errors
          errorState = {
            message: 'Erro interno do servidor. Tente novamente mais tarde.',
            type: 'server',
            details: error.data,
          };
        } else if (error.status === 401) {
          // Unauthorized
          errorState = {
            message: 'Sessão expirada. Faça login novamente.',
            type: 'validation',
            details: error.data,
          };
        } else if (error.status === 403) {
          // Forbidden
          errorState = {
            message: 'Você não tem permissão para realizar esta ação.',
            type: 'validation',
            details: error.data,
          };
        } else if (error.status === 404) {
          // Not found
          errorState = {
            message: 'Recurso não encontrado.',
            type: 'validation',
            details: error.data,
          };
        } else {
          // Other API errors
          errorState = {
            message: error.message || 'Erro inesperado. Tente novamente.',
            type: 'unknown',
            details: error.data,
          };
        }
      } else if (error instanceof Error) {
        // Network or other errors
        errorState = {
          message: 'Erro de conexão. Verifique sua internet e tente novamente.',
          type: 'network',
        };
      } else {
        // Unknown errors
        errorState = {
          message: 'Erro inesperado. Tente novamente.',
          type: 'unknown',
        };
      }

      setError(errorState);

      if (showToast) {
        showErrorToast(error, errorState.message);
      }

      return errorState;
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isSupplierLocationError = useCallback((error: unknown): boolean => {
    if (error instanceof ApiError && error.status === 400) {
      return (
        error.message.includes('localidade diferente da do serviço') ||
        error.message.includes('location mismatch') ||
        error.message.includes('não pode ser associado ao serviço')
      );
    }
    return false;
  }, []);

  const getSupplierLocationErrorMessage = useCallback(
    (error: unknown): string => {
      if (error instanceof ApiError && error.status === 400) {
        return error.message;
      }
      return 'Erro de validação de localização do fornecedor.';
    },
    []
  );

  return {
    error,
    handleError,
    clearError,
    isSupplierLocationError,
    getSupplierLocationErrorMessage,
  };
}
