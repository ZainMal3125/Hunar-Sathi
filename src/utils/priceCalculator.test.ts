import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateProductPrice,
  DEFAULT_HOURLY_RATE,
  formatPkr,
  INITIAL_PRICE_INPUTS,
  validatePriceInputs,
} from './priceCalculator';

test('INITIAL_PRICE_INPUTS has a modest default hourly rate and requires other fields to be filled', () => {
  assert.equal(DEFAULT_HOURLY_RATE, '250');
  assert.equal(INITIAL_PRICE_INPUTS.hourlyRate, '250');
  const initialValidation = validatePriceInputs(INITIAL_PRICE_INPUTS);
  assert.equal(initialValidation.isValid, false);
  assert.equal(initialValidation.errors.materials, 'empty');
  assert.equal(initialValidation.errors.hours, 'empty');
  assert.equal(initialValidation.errors.otherCosts, 'empty');
  assert.equal(initialValidation.errors.marginPercent, 'empty');
  assert.equal(initialValidation.errors.hourlyRate, undefined);
});

test('validatePriceInputs rejects negative numbers and empty fields', () => {
  const negativeCheck = validatePriceInputs({
    materials: '-100',
    hours: '2',
    hourlyRate: '250',
    otherCosts: '50',
    marginPercent: '-10',
  });
  assert.equal(negativeCheck.isValid, false);
  assert.equal(negativeCheck.errors.materials, 'negative');
  assert.equal(negativeCheck.errors.marginPercent, 'negative');
  assert.equal(calculateProductPrice({
    materials: '-100',
    hours: '2',
    hourlyRate: '250',
    otherCosts: '50',
    marginPercent: '20',
  }), null);
});

test('calculateProductPrice computes exact formula: (materials + hours * rate + other) * (1 + margin / 100)', () => {
  // (500 + 3 * 250 + 50) * (1 + 20 / 100) = (500 + 750 + 50) * 1.2 = 1300 * 1.2 = 1560
  const result = calculateProductPrice({
    materials: '500',
    hours: '3',
    hourlyRate: '250',
    otherCosts: '50',
    marginPercent: '20',
  });

  assert.notEqual(result, null);
  assert.equal(result?.materialCost, 500);
  assert.equal(result?.laborCost, 750);
  assert.equal(result?.otherCosts, 50);
  assert.equal(result?.baseCost, 1300);
  assert.equal(result?.profitAmount, 260);
  assert.equal(result?.finalPrice, 1560);
  assert.equal(formatPkr(result!.finalPrice), 'PKR 1,560');
});
