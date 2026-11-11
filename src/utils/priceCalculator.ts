export const DEFAULT_HOURLY_RATE = '250';

export interface PriceCalculatorInputs {
  materials: string;
  hours: string;
  hourlyRate: string;
  otherCosts: string;
  marginPercent: string;
}

export type PriceFieldKey = keyof PriceCalculatorInputs;
export type PriceValidationErrorType = 'empty' | 'negative' | 'invalid';

export interface PriceValidationResult {
  isValid: boolean;
  errors: Partial<Record<PriceFieldKey, PriceValidationErrorType>>;
}

export interface PriceBreakdown {
  materialCost: number;
  hours: number;
  hourlyRate: number;
  laborCost: number;
  otherCosts: number;
  baseCost: number;
  marginPercent: number;
  profitAmount: number;
  finalPrice: number;
}

export const INITIAL_PRICE_INPUTS: PriceCalculatorInputs = {
  materials: '',
  hours: '',
  hourlyRate: DEFAULT_HOURLY_RATE,
  otherCosts: '',
  marginPercent: '',
};

const ALL_FIELDS: PriceFieldKey[] = [
  'materials',
  'hours',
  'hourlyRate',
  'otherCosts',
  'marginPercent',
];

export function validatePriceField(
  rawValue: string
): PriceValidationErrorType | null {
  const trimmed = typeof rawValue === 'string' ? rawValue.trim() : '';
  if (trimmed.length === 0) {
    return 'empty';
  }
  const num = Number(trimmed);
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return 'invalid';
  }
  if (num < 0) {
    return 'negative';
  }
  return null;
}

export function validatePriceInputs(
  inputs: PriceCalculatorInputs
): PriceValidationResult {
  const errors: Partial<Record<PriceFieldKey, PriceValidationErrorType>> = {};
  let isValid = true;

  for (const key of ALL_FIELDS) {
    const fieldError = validatePriceField(inputs[key]);
    if (fieldError) {
      errors[key] = fieldError;
      isValid = false;
    }
  }

  return { isValid, errors };
}

export function calculateProductPrice(
  inputs: PriceCalculatorInputs
): PriceBreakdown | null {
  const validation = validatePriceInputs(inputs);
  if (!validation.isValid) {
    return null;
  }

  const materialCost = Number(inputs.materials.trim());
  const hours = Number(inputs.hours.trim());
  const hourlyRate = Number(inputs.hourlyRate.trim());
  const otherCosts = Number(inputs.otherCosts.trim());
  const marginPercent = Number(inputs.marginPercent.trim());

  const laborCost = hours * hourlyRate;
  const baseCost = materialCost + laborCost + otherCosts;
  const finalPrice =
    (materialCost + hours * hourlyRate + otherCosts) *
    (1 + marginPercent / 100);
  const profitAmount = finalPrice - baseCost;

  return {
    materialCost: roundCurrency(materialCost),
    hours: roundCurrency(hours),
    hourlyRate: roundCurrency(hourlyRate),
    laborCost: roundCurrency(laborCost),
    otherCosts: roundCurrency(otherCosts),
    baseCost: roundCurrency(baseCost),
    marginPercent: roundCurrency(marginPercent),
    profitAmount: roundCurrency(profitAmount),
    finalPrice: roundCurrency(finalPrice),
  };
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatPkr(amount: number): string {
  const rounded = roundCurrency(amount);
  const isWhole = Number.isInteger(rounded);
  return `PKR ${rounded.toLocaleString('en-PK', {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}
