import { CurrencyRates } from '../types';

export function formatGs(amountGs: number): string {
  const rounded = Math.round(amountGs);
  return `₲ ${rounded.toLocaleString('es-PY')}`;
}

export function formatReal(amountGs: number, rateRealToGs: number): string {
  if (!rateRealToGs || rateRealToGs <= 0) return 'R$ 0,00';
  const val = amountGs / rateRealToGs;
  return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDolar(amountGs: number, rateDolarToGs: number): string {
  if (!rateDolarToGs || rateDolarToGs <= 0) return 'US$ 0.00';
  const val = amountGs / rateDolarToGs;
  return `US$ ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export interface ConvertedAmounts {
  gs: string;
  real: string;
  dolar: string;
}

export function getAllCurrencies(amountGs: number, rates: CurrencyRates): ConvertedAmounts {
  return {
    gs: formatGs(amountGs),
    real: formatReal(amountGs, rates.realToGs),
    dolar: formatDolar(amountGs, rates.dolarToGs)
  };
}
