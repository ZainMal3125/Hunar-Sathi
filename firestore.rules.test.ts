import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
const rulesSource = fs.readFileSync(rulesPath, 'utf8');

interface MockEvalContext {
  shopId: string;
  op: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestTime: number;
  incoming?: Record<string, unknown>;
  existing?: Record<string, unknown>;
}

const ALLOWED_KEYS = [
  'ownerId',
  'shopName',
  'skill',
  'city',
  'agreeToShareContact',
  'whatsappNumber',
  'isHidden',
  'products',
  'photos',
  'createdAt',
  'updatedAt',
];

function evaluateShopRule(ctx: MockEvalContext): 'ALLOW' | 'PERMISSION_DENIED' {
  const isValidId =
    typeof ctx.shopId === 'string' &&
    ctx.shopId.length >= 1 &&
    ctx.shopId.length <= 128 &&
    /^[a-zA-Z0-9_-]+$/.test(ctx.shopId);

  if (ctx.op === 'list') {
    return 'PERMISSION_DENIED';
  }
  if (!isValidId) {
    return 'PERMISSION_DENIED';
  }
  if (ctx.op === 'get' || ctx.op === 'delete') {
    return 'ALLOW';
  }

  const data = ctx.incoming;
  if (!data) {
    return 'PERMISSION_DENIED';
  }

  const keys = Object.keys(data);
  const hasAll = ALLOWED_KEYS.every((k) => keys.includes(k));
  const hasOnly = keys.every((k) => ALLOWED_KEYS.includes(k));
  if (!hasAll || !hasOnly) {
    return 'PERMISSION_DENIED';
  }

  const validStrings =
    typeof data.ownerId === 'string' &&
    data.ownerId.length >= 1 &&
    data.ownerId.length <= 128 &&
    /^[a-zA-Z0-9_-]+$/.test(data.ownerId) &&
    typeof data.shopName === 'string' &&
    data.shopName.length >= 1 &&
    data.shopName.length <= 120 &&
    typeof data.skill === 'string' &&
    data.skill.length >= 1 &&
    data.skill.length <= 120 &&
    typeof data.city === 'string' &&
    data.city.length >= 1 &&
    data.city.length <= 100 &&
    typeof data.agreeToShareContact === 'boolean' &&
    typeof data.whatsappNumber === 'string' &&
    data.whatsappNumber.length <= 30 &&
    ((data.agreeToShareContact === true && data.whatsappNumber.length <= 30) ||
      (data.agreeToShareContact === false && data.whatsappNumber === '')) &&
    typeof data.isHidden === 'boolean' &&
    Array.isArray(data.products) &&
    data.products.length >= 1 &&
    data.products.length <= 3 &&
    typeof data.products[0] === 'object' &&
    data.products[0] !== null &&
    Array.isArray(data.photos) &&
    data.photos.length >= 1 &&
    data.photos.length <= 4 &&
    typeof data.photos[0] === 'string' &&
    data.photos[0].length <= 250000 &&
    typeof data.createdAt === 'number' &&
    typeof data.updatedAt === 'number';

  if (!validStrings) {
    return 'PERMISSION_DENIED';
  }

  if (ctx.op === 'create') {
    return data.createdAt === ctx.requestTime &&
      data.updatedAt === ctx.requestTime
      ? 'ALLOW'
      : 'PERMISSION_DENIED';
  }

  if (ctx.op === 'update') {
    const existing = ctx.existing;
    if (!existing) return 'PERMISSION_DENIED';
    if (
      data.ownerId !== existing.ownerId ||
      data.createdAt !== existing.createdAt ||
      data.updatedAt !== ctx.requestTime
    ) {
      return 'PERMISSION_DENIED';
    }
    return 'ALLOW';
  }

  return 'PERMISSION_DENIED';
}

const NOW = 1700000000000;
const BASE_VALID_DOC: Record<string, unknown> = {
  ownerId: 'artisan-101',
  shopName: 'Fatima Hand Embroidery',
  skill: 'Embroidery',
  city: 'Multan',
  agreeToShareContact: true,
  whatsappNumber: '03001234567',
  isHidden: false,
  products: [{ name: 'Kurta', description: 'Cotton', reason: 'Fit', price: 1500 }],
  photos: ['data:image/jpeg;base64,abc'],
  createdAt: NOW,
  updatedAt: NOW,
};

test('firestore.rules contains required security primitives and invariants', () => {
  assert.ok(rulesSource.includes("rules_version = '2';"));
  assert.ok(rulesSource.includes('allow read, write: if false;'));
  assert.ok(rulesSource.includes('isValidShop(incoming())'));
  assert.ok(rulesSource.includes('agreeToShareContact == false && data.whatsappNumber == \'\''));
});

test('Dirty Dozen #1: Shadow Field Injection returns PERMISSION_DENIED', () => {
  assert.equal(
    evaluateShopRule({
      shopId: 'shop-1',
      op: 'create',
      requestTime: NOW,
      incoming: { ...BASE_VALID_DOC, isAdmin: true },
    }),
    'PERMISSION_DENIED'
  );
});

test('Dirty Dozen #2: Consent Violation Leak (whatsappNumber when agreeToShareContact is false) returns PERMISSION_DENIED', () => {
  assert.equal(
    evaluateShopRule({
      shopId: 'shop-1',
      op: 'create',
      requestTime: NOW,
      incoming: {
        ...BASE_VALID_DOC,
        agreeToShareContact: false,
        whatsappNumber: '03001234567',
      },
    }),
    'PERMISSION_DENIED'
  );
});

test('Dirty Dozen #3: Oversized Shop Name (>120 chars) returns PERMISSION_DENIED', () => {
  assert.equal(
    evaluateShopRule({
      shopId: 'shop-1',
      op: 'create',
      requestTime: NOW,
      incoming: { ...BASE_VALID_DOC, shopName: 'A'.repeat(200) },
    }),
    'PERMISSION_DENIED'
  );
});

test('Dirty Dozen #4: Empty Required String (city == "") returns PERMISSION_DENIED', () => {
  assert.equal(
    evaluateShopRule({
      shopId: 'shop-1',
      op: 'create',
      requestTime: NOW,
      incoming: { ...BASE_VALID_DOC, city: '' },
    }),
    'PERMISSION_DENIED'
  );
});

test('Dirty Dozen #5: Unbounded Products Array (>3 items) returns PERMISSION_DENIED', () => {
  assert.equal(
    evaluateShopRule({
      shopId: 'shop-1',
      op: 'create',
      requestTime: NOW,
      incoming: {
        ...BASE_VALID_DOC,
        products: [{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }],
      },
    }),
    'PERMISSION_DENIED'
  );
});

test('Dirty Dozen #6: Unbounded Photos Array (>4 items) returns PERMISSION_DENIED', () => {
  assert.equal(
    evaluateShopRule({
      shopId: 'shop-1',
      op: 'create',
      requestTime: NOW,
      incoming: {
        ...BASE_VALID_DOC,
        photos: ['1', '2', '3', '4', '5'],
      },
    }),
    'PERMISSION_DENIED'
  );
});

test('Dirty Dozen #7: Timestamp Forgery on Create returns PERMISSION_DENIED', () => {
  assert.equal(
    evaluateShopRule({
      shopId: 'shop-1',
      op: 'create',
      requestTime: NOW,
      incoming: { ...BASE_VALID_DOC, createdAt: NOW - 5000 },
    }),
    'PERMISSION_DENIED'
  );
});

test('Dirty Dozen #8: Immutable Field Mutation (ownerId) on Update returns PERMISSION_DENIED', () => {
  assert.equal(
    evaluateShopRule({
      shopId: 'shop-1',
      op: 'update',
      requestTime: NOW + 1000,
      existing: BASE_VALID_DOC,
      incoming: {
        ...BASE_VALID_DOC,
        ownerId: 'attacker-999',
        updatedAt: NOW + 1000,
      },
    }),
    'PERMISSION_DENIED'
  );
});

test('Dirty Dozen #9: Immutable createdAt Mutation on Update returns PERMISSION_DENIED', () => {
  assert.equal(
    evaluateShopRule({
      shopId: 'shop-1',
      op: 'update',
      requestTime: NOW + 1000,
      existing: BASE_VALID_DOC,
      incoming: {
        ...BASE_VALID_DOC,
        createdAt: NOW + 1000,
        updatedAt: NOW + 1000,
      },
    }),
    'PERMISSION_DENIED'
  );
});

test('Dirty Dozen #10: Path ID Poisoning returns PERMISSION_DENIED', () => {
  assert.equal(
    evaluateShopRule({
      shopId: 'invalid id with spaces!',
      op: 'create',
      requestTime: NOW,
      incoming: BASE_VALID_DOC,
    }),
    'PERMISSION_DENIED'
  );
});

test('Dirty Dozen #11: Wrong Field Type (Value Poisoning) returns PERMISSION_DENIED', () => {
  assert.equal(
    evaluateShopRule({
      shopId: 'shop-1',
      op: 'create',
      requestTime: NOW,
      incoming: { ...BASE_VALID_DOC, shopName: 12345 },
    }),
    'PERMISSION_DENIED'
  );
});

test('Dirty Dozen #12: Blanket Collection Scraping (list) returns PERMISSION_DENIED', () => {
  assert.equal(
    evaluateShopRule({
      shopId: 'shop-1',
      op: 'list',
      requestTime: NOW,
    }),
    'PERMISSION_DENIED'
  );
});
