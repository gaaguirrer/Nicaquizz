/**
 * Validador de Trueques
 */

import type { ValidationResult } from './email.validator';
import { INGREDIENTES, type Ingrediente } from '../constants/ingredients';

const VALID_INGREDIENTES = Object.values(INGREDIENTES);
const MIN_AMOUNT = 1;
const MAX_AMOUNT = 100;

export interface TradeData {
  offeredIngredient: string;
  requestedIngredient: string;
  offeredAmount: number;
  requestedAmount: number;
}

export function validateTrade(tradeData: Partial<TradeData>): ValidationResult {
  const errors: string[] = [];

  if (!tradeData.offeredIngredient || !VALID_INGREDIENTES.includes(tradeData.offeredIngredient as Ingrediente)) {
    errors.push('Ingrediente ofrecido no válido');
  }

  if (!tradeData.requestedIngredient || !VALID_INGREDIENTES.includes(tradeData.requestedIngredient as Ingrediente)) {
    errors.push('Ingrediente solicitado no válido');
  }

  if (tradeData.offeredIngredient === tradeData.requestedIngredient) {
    errors.push('No se puede intercambiar el mismo ingrediente');
  }

  if (
    !tradeData.offeredAmount ||
    tradeData.offeredAmount < MIN_AMOUNT ||
    tradeData.offeredAmount > MAX_AMOUNT
  ) {
    errors.push(`Cantidad ofrecida debe estar entre ${MIN_AMOUNT} y ${MAX_AMOUNT}`);
  }

  if (
    !tradeData.requestedAmount ||
    tradeData.requestedAmount < MIN_AMOUNT ||
    tradeData.requestedAmount > MAX_AMOUNT
  ) {
    errors.push(`Cantidad solicitada debe estar entre ${MIN_AMOUNT} y ${MAX_AMOUNT}`);
  }

  if (errors.length > 0) {
    return { valid: false, message: errors.join('; ') };
  }

  return { valid: true };
}
