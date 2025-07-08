import { useCallback } from 'react';
import { formatToBRL } from 'brazilian-values';

/**
 * Converte valor em centavos para reais (formato decimal)
 * @param cents - Valor em centavos (ex: 1000)
 * @returns Valor em reais (ex: 10.00)
 */
export function centsToReais(cents: number): number {
  return cents / 100;
}

/**
 * Converte valor em reais para centavos
 * @param reais - Valor em reais (ex: 10.50)
 * @returns Valor em centavos (ex: 1050)
 */
export function reaisToCents(reais: number): number {
  return Math.round(reais * 100);
}

/**
 * Formata valor em centavos para exibição em formato brasileiro
 * @param cents - Valor em centavos (ex: 1000)
 * @returns String formatada (ex: "R$ 10,00")
 */
export function formatCentsToDisplay(cents: number): string {
  const reais = centsToReais(cents);
  return formatToBRL(reais);
}

/**
 * Converte string de valor formatado para centavos
 * @param formattedValue - Valor formatado (ex: "R$ 10,50" ou "10,50")
 * @returns Valor em centavos (ex: 1050)
 */
export function parseFormattedValueToCents(formattedValue: string): number {
  // Remove símbolos de moeda e espaços
  const cleanValue = formattedValue
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '') // Remove pontos de milhares
    .replace(',', '.'); // Substitui vírgula decimal por ponto

  const reais = parseFloat(cleanValue) || 0;
  return reaisToCents(reais);
}

/**
 * Formata valor enquanto o usuário digita
 * @param value - Valor digitado
 * @returns Valor formatado para exibição
 */
export function formatValueAsUserTypes(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');

  if (!numbers) return '';

  // Converte para centavos e depois para reais
  const cents = parseInt(numbers, 10);
  const reais = centsToReais(cents);

  return formatToBRL(reais);
}

/**
 * Hook personalizado para input de valor monetário
 */
export function useMoneyInput() {
  const formatDisplayValue = useCallback((cents: number): string => {
    return formatCentsToDisplay(cents);
  }, []);

  const parseInputValue = useCallback((displayValue: string): number => {
    return parseFormattedValueToCents(displayValue);
  }, []);

  const formatAsUserTypes = useCallback((inputValue: string): string => {
    return formatValueAsUserTypes(inputValue);
  }, []);

  return {
    formatDisplayValue,
    parseInputValue,
    formatAsUserTypes,
  };
}
