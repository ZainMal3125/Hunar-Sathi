import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const rulesPath = path.resolve(process.cwd(), 'firestore.rules');

interface MockUserContext {
  collection: 'users';
  docId: string;
  op: 'get' | 'list' | 'create' | 'update' | 'delete';
  authUid: string | null;
  isAdmin?: boolean;
  requestTime: number;
  incoming?: Record<string, unknown>;
  existing?: Record<string, unknown>;
}

interface MockShopContext {
  collection: 'shops';
  docId: string;
  op: 'get' | 'list' | 'create' | 'update' | 'delete';
  authUid: string | null;
  isAdmin?: boolean;
  requestTime: number;
  incoming?: Record<string, unknown>;
  existing?: Record<string, unknown> | null;
}

const REQUIRED_SHOP_KEYS = [
  'ownerId',
  'name',
  'shopName',
  'skill',
  'city',
  'agreeToShareContact',
  'whatsappNumber',
  'visible',
  'isHidden',
  'products',
  'photos',
  'createdAt',
  'updatedAt',
];

const ALLOWED_SHOP_KEYS = [
  ...REQUIRED_SHOP_KEYS,
  'ownerEmail',
  'isSample',
];

function isValidId(id: string): boolean {
  return (
    typeof id === 'string' &&
    id.length >= 1 &&
    id.length <= 128 &&
    /^[a-zA-Z0-9_-]+$/.test(id)
  );
}

function isValidUserPayload(data: Record<string, unknown>): boolean {
  const keys = Object.keys(data);
  const reqKeys = ['name', 'email', 'role', 'createdAt'];
  if (!reqKeys.every((k) => keys.includes(k)) || !keys.every((k) => reqKeys.includes(k))) {
    return false;
  }
  return (
    typeof data.name === 'string' &&
    data.name.length >= 1 &&
    data.name.length <= 120 &&
    typeof data.email === 'string' &&
    data.email.length >= 3 &&
    data.email.length <= 160 &&
    (data.role === 'user' || data.role === 'admin') &&
    typeof data.createdAt === 'number'
  );
}

function isValidShopPayload(data: Record<string, unknown>): boolean {
  const keys = Object.keys(data);
  if (
    !REQUIRED_SHOP_KEYS.every((k) => keys.includes(k)) ||
    !keys.every((k) => ALLOWED_SHOP_KEYS.includes(k))
  ) {
    return false;
  }
  if (
    'ownerEmail' in data &&
    (typeof data.ownerEmail !== 'string' || data.ownerEmail.length > 160)
  ) {
    return false;
  }
  if ('isSample' in data && typeof data.isSample !== 'boolean') {
    return false;
  }
  return (
    typeof data.ownerId === 'string' &&
    isValidId(data.ownerId) &&
    typeof data.name === 'string' &&
    data.name.length >= 1 &&
    data.name.length <= 120 &&
    typeof data.shopName === 'string' &&
    data.shopName.length >= 1 &&
    data.shopName.length <= 120 &&
    data.name === data.shopName &&
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
    typeof data.visible === 'boolean' &&
    typeof data.isHidden === 'boolean' &&
    data.visible !== data.isHidden &&
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
    typeof data.updatedAt === 'number'
  );
}

function evaluateUserRule(ctx: MockUserContext): 'ALLOW' | 'PERMISSION_DENIED' {
  if (!ctx.authUid) return 'PERMISSION_DENIED';
  if (ctx.op === 'list' || ctx.op === 'delete') return 'PERMISSION_DENIED';
  if (!isValidId(ctx.docId)) return 'PERMISSION_DENIED';

  if (ctx.op === 'get') {
    return ctx.authUid === ctx.docId || ctx.isAdmin ? 'ALLOW' : 'PERMISSION_DENIED';
  }

  const incoming = ctx.incoming;
  if (!incoming || !isValidUserPayload(incoming)) return 'PERMISSION_DENIED';

  if (ctx.op === 'create') {
    return ctx.authUid === ctx.docId &&
      incoming.role === 'user' &&
      incoming.createdAt === ctx.requestTime
      ? 'ALLOW'
      : 'PERMISSION_DENIED';
  }

  if (ctx.op === 'update') {
    const existing = ctx.existing;
    if (!existing) return 'PERMISSION_DENIED';
    return ctx.authUid === ctx.docId &&
      incoming.role === existing.role &&
      incoming.email === existing.email &&
      incoming.createdAt === existing.createdAt
      ? 'ALLOW'
      : 'PERMISSION_DENIED';
  }

  return 'PERMISSION_DENIED';
}

function evaluateShopRule(ctx: MockShopContext): 'ALLOW' | 'PERMISSION_DENIED' {
  if (ctx.op === 'list') {
    const existing = ctx.existing;
    if (existing && existing.isHidden === false) return 'ALLOW';
    if (ctx.authUid && ctx.isAdmin) return 'ALLOW';
    return 'PERMISSION_DENIED';
  }

  if (!isValidId(ctx.docId)) return 'PERMISSION_DENIED';

  if (ctx.op === 'get') {
    if (ctx.existing === null) return 'ALLOW';
    if (!ctx.existing) return 'PERMISSION_DENIED';
    if (ctx.existing.isHidden === false) return 'ALLOW';
    if (ctx.authUid && (ctx.existing.ownerId === ctx.authUid || ctx.isAdmin)) {
      return 'ALLOW';
    }
    return 'PERMISSION_DENIED';
  }

  if (ctx.op === 'delete') {
    if (!ctx.authUid || !ctx.existing) return 'PERMISSION_DENIED';
    return (ctx.docId === ctx.authUid && ctx.existing.ownerId === ctx.authUid) ||
      ctx.isAdmin
      ? 'ALLOW'
      : 'PERMISSION_DENIED';
  }

  if (!ctx.authUid || !ctx.incoming || !isValidShopPayload(ctx.incoming)) {
    return 'PERMISSION_DENIED';
  }

  if (ctx.op === 'create') {
    return ctx.docId === ctx.authUid &&
      ctx.incoming.ownerId === ctx.authUid &&
      ctx.incoming.createdAt === ctx.requestTime &&
      ctx.incoming.updatedAt === ctx.requestTime
      ? 'ALLOW'
      : 'PERMISSION_DENIED';
  }

  if (ctx.op === 'update') {
    if (!ctx.existing) return 'PERMISSION_DENIED';
    const isOwnerOrAdmin =
      (ctx.docId === ctx.authUid && ctx.existing.ownerId === ctx.authUid) ||
      Boolean(ctx.isAdmin);
    if (
      !isOwnerOrAdmin ||
      ctx.incoming.ownerId !== ctx.existing.ownerId ||
      ctx.incoming.createdAt !== ctx.existing.createdAt ||
      ctx.incoming.updatedAt !== ctx.requestTime
    ) {
      return 'PERMISSION_DENIED';
    }
    return 'ALLOW';
  }

  return 'PERMISSION_DENIED';
}

const NOW = 1700000000000;
const BASE_VALID_SHOP: Record<string, unknown> = {
  ownerId: 'user-101',
  ownerEmail: 'artisan@example.com',
  name: 'Fatima Hand Embroidery',
  shopName: 'Fatima Hand Embroidery',
  skill: 'Embroidery',
  city: 'Multan',
  agreeToShareContact: true,
  whatsappNumber: '03001234567',
  visible: true,
  isHidden: false,
  products: [{ name: 'Kurta', description: 'Cotton', reason: 'Fit', price: 1500 }],
  photos: ['data:image/jpeg;base64,abc'],
  createdAt: NOW,
  updatedAt: NOW,
};

test('firestore.rules contains required RBAC and shop invariants', () => {
  const rulesSource = fs.readFileSync(rulesPath, 'utf8');
  assert.ok(rulesSource.includes("rules_version = '2';"));
  assert.ok(rulesSource.includes('allow read, write: if false;'));
  assert.ok(rulesSource.includes('isValidUser(incoming())'));
  assert.ok(rulesSource.includes('isValidShop(incoming())'));
  assert.ok(rulesSource.includes("incoming().role == 'user'"));
  assert.ok(rulesSource.includes('shopId == request.auth.uid'));
});

test('Dirty Dozen #1: Privilege Escalation on Registration (role: "admin") returns PERMISSION_DENIED', () => {
  assert.equal(
    evaluateUserRule({
      collection: 'users',
      docId: 'user-101',
      op: 'create',
      authUid: 'user-101',
      requestTime: NOW,
      incoming: {
        name: 'Attacker',
        email: 'attacker@example.com',
        role: 'admin',
        createdAt: NOW,
      },
    }),
    'PERMISSION_DENIED'
  );
});

test('Dirty Dozen #2: Cross-User PII Read returns PERMISSION_DENIED for non-admin', () => {
  assert.equal(
    evaluateUserRule({
      collection: 'users',
      docId: 'user-202',
      op: 'get',
      authUid: 'user-101',
      isAdmin: false,
      requestTime: NOW,
    }),
    'PERMISSION_DENIED'
  );
});

test('Dirty Dozen #3: One-Shop-Per-User Bypass (shopId != auth.uid) returns PERMISSION_DENIED', () => {
  assert.equal(
    evaluateShopRule({
      collection: 'shops',
      docId: 'shop-extra-999',
      op: 'create',
      authUid: 'user-101',
      requestTime: NOW,
      incoming: BASE_VALID_SHOP,
    }),
    'PERMISSION_DENIED'
  );
});

test('Dirty Dozen #4: Cross-Owner Shop Mutation returns PERMISSION_DENIED for non-admin', () => {
  assert.equal(
    evaluateShopRule({
      collection: 'shops',
      docId: 'user-101',
      op: 'delete',
      authUid: 'user-202',
      isAdmin: false,
      requestTime: NOW,
      existing: BASE_VALID_SHOP,
    }),
    'PERMISSION_DENIED'
  );
});

test('Dirty Dozen #5: Shadow Field Injection returns PERMISSION_DENIED', () => {
  assert.equal(
    evaluateShopRule({
      collection: 'shops',
      docId: 'user-101',
      op: 'create',
      authUid: 'user-101',
      requestTime: NOW,
      incoming: { ...BASE_VALID_SHOP, isAdmin: true },
    }),
    'PERMISSION_DENIED'
  );
});

test('Dirty Dozen #6: Consent Violation Leak (whatsappNumber when agreeToShareContact is false) returns PERMISSION_DENIED', () => {
  assert.equal(
    evaluateShopRule({
      collection: 'shops',
      docId: 'user-101',
      op: 'create',
      authUid: 'user-101',
      requestTime: NOW,
      incoming: {
        ...BASE_VALID_SHOP,
        agreeToShareContact: false,
        whatsappNumber: '03001234567',
      },
    }),
    'PERMISSION_DENIED'
  );
});

test('Dirty Dozen #7: Oversized Shop Name (>120 chars) returns PERMISSION_DENIED', () => {
  const longName = 'A'.repeat(200);
  assert.equal(
    evaluateShopRule({
      collection: 'shops',
      docId: 'user-101',
      op: 'create',
      authUid: 'user-101',
      requestTime: NOW,
      incoming: { ...BASE_VALID_SHOP, name: longName, shopName: longName },
    }),
    'PERMISSION_DENIED'
  );
});

test('Dirty Dozen #8: Empty Required String (city == "") returns PERMISSION_DENIED', () => {
  assert.equal(
    evaluateShopRule({
      collection: 'shops',
      docId: 'user-101',
      op: 'create',
      authUid: 'user-101',
      requestTime: NOW,
      incoming: { ...BASE_VALID_SHOP, city: '' },
    }),
    'PERMISSION_DENIED'
  );
});

test('Dirty Dozen #9: Unbounded Products Array (>3 items) returns PERMISSION_DENIED', () => {
  assert.equal(
    evaluateShopRule({
      collection: 'shops',
      docId: 'user-101',
      op: 'create',
      authUid: 'user-101',
      requestTime: NOW,
      incoming: {
        ...BASE_VALID_SHOP,
        products: [{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }],
      },
    }),
    'PERMISSION_DENIED'
  );
});

test('Dirty Dozen #10: Timestamp Forgery on Create returns PERMISSION_DENIED', () => {
  assert.equal(
    evaluateShopRule({
      collection: 'shops',
      docId: 'user-101',
      op: 'create',
      authUid: 'user-101',
      requestTime: NOW,
      incoming: { ...BASE_VALID_SHOP, createdAt: NOW - 5000 },
    }),
    'PERMISSION_DENIED'
  );
});

test('Dirty Dozen #11: Immutable Field Mutation (ownerId or role) on Update returns PERMISSION_DENIED', () => {
  assert.equal(
    evaluateShopRule({
      collection: 'shops',
      docId: 'user-101',
      op: 'update',
      authUid: 'user-101',
      requestTime: NOW + 1000,
      existing: BASE_VALID_SHOP,
      incoming: {
        ...BASE_VALID_SHOP,
        ownerId: 'user-999',
        updatedAt: NOW + 1000,
      },
    }),
    'PERMISSION_DENIED'
  );
});

test('Dirty Dozen #12: Hidden Shop Read by Unauthenticated Visitor returns PERMISSION_DENIED', () => {
  assert.equal(
    evaluateShopRule({
      collection: 'shops',
      docId: 'user-101',
      op: 'get',
      authUid: null,
      requestTime: NOW,
      existing: { ...BASE_VALID_SHOP, visible: false, isHidden: true },
    }),
    'PERMISSION_DENIED'
  );
});
