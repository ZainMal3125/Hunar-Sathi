import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWhatsappContactUrl,
  canUserManageShop,
  isAboutPath,
  isAdminPath,
  isMyShopPath,
  isOwnerOfShop,
  parseShopIdFromLocation,
  prepareShopPayload,
  sanitizeWhatsappNumber,
  validateLoginInput,
  validateRegisterInput,
  validateSaveShopInput,
} from './shopManager';

test('sanitizeWhatsappNumber stores WhatsApp number ONLY if user agrees to share contact details', () => {
  assert.equal(sanitizeWhatsappNumber(false, '0300-1234567'), '');
  assert.equal(sanitizeWhatsappNumber(true, '0300-1234567'), '0300-1234567');
  assert.equal(sanitizeWhatsappNumber(true, '   '), '');
});

test('prepareShopPayload sets canonical name and visible fields and strips whatsappNumber when agreeToShareContact is false', () => {
  const payloadDisagreed = prepareShopPayload(
    {
      shopName: 'Fatima Embroidery',
      ownerEmail: 'fatima@example.com',
      skill: 'Embroidery (کڑھائی)',
      city: 'Multan',
      agreeToShareContact: false,
      whatsappNumber: '03001234567',
      products: [
        {
          name: 'Kurta Neckline',
          description: 'Hand-embroidered neckline',
          reason: 'Fits motif',
          price: 1560,
          photos: ['data:image/jpeg;base64,abc'],
        },
      ],
      photos: ['data:image/jpeg;base64,abc'],
    },
    'artisan-123',
    false
  );

  assert.equal(payloadDisagreed.name, 'Fatima Embroidery');
  assert.equal(payloadDisagreed.shopName, 'Fatima Embroidery');
  assert.equal(payloadDisagreed.ownerEmail, 'fatima@example.com');
  assert.equal(payloadDisagreed.visible, true);
  assert.equal(payloadDisagreed.isHidden, false);
  assert.equal(payloadDisagreed.agreeToShareContact, false);
  assert.equal(payloadDisagreed.whatsappNumber, '');

  const payloadAgreed = prepareShopPayload(
    {
      shopName: 'Fatima Embroidery',
      skill: 'Embroidery (کڑھائی)',
      city: 'Multan',
      agreeToShareContact: true,
      whatsappNumber: '03001234567',
      products: [
        {
          name: 'Kurta Neckline',
          description: 'Hand-embroidered neckline',
          reason: 'Fits motif',
          price: 1560,
          photos: ['data:image/jpeg;base64,abc'],
        },
      ],
      photos: ['data:image/jpeg;base64,abc'],
    },
    'artisan-123',
    true
  );

  assert.equal(payloadAgreed.visible, false);
  assert.equal(payloadAgreed.isHidden, true);
  assert.equal(payloadAgreed.agreeToShareContact, true);
  assert.equal(payloadAgreed.whatsappNumber, '03001234567');
});

test('buildWhatsappContactUrl normalizes Pakistani 03xx numbers to 923xx wa.me links', () => {
  const url = buildWhatsappContactUrl('0300-1234567', 'فاطمہ');
  assert.ok(url?.startsWith('https://wa.me/923001234567?text='));
  assert.equal(buildWhatsappContactUrl('', 'فاطمہ'), null);
});

test('validateSaveShopInput requires shop name and validates optional WhatsApp number when agreed', () => {
  assert.equal(
    validateSaveShopInput({
      shopName: '   ',
      skill: 'Stitching',
      city: 'Lahore',
      agreeToShareContact: false,
      whatsappNumber: '',
      products: [],
      photos: [],
    }).isValid,
    false
  );

  assert.equal(
    validateSaveShopInput({
      shopName: 'Amina Crafts',
      skill: 'Stitching',
      city: 'Lahore',
      agreeToShareContact: true,
      whatsappNumber: '123',
      products: [],
      photos: [],
    }).isValid,
    false
  );

  assert.equal(
    validateSaveShopInput({
      shopName: 'Amina Crafts',
      skill: 'Stitching',
      city: 'Lahore',
      agreeToShareContact: true,
      whatsappNumber: '03001234567',
      products: [],
      photos: [],
    }).isValid,
    true
  );
});

test('validateRegisterInput and validateLoginInput enforce 6-char password, valid email, and matching confirm password', () => {
  assert.deepEqual(
    validateRegisterInput({
      name: '',
      email: 'user@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    }),
    { isValid: false, errorKey: 'nameEmpty' }
  );

  assert.deepEqual(
    validateRegisterInput({
      name: 'Ayesha',
      email: 'invalid-email',
      password: 'password123',
      confirmPassword: 'password123',
    }),
    { isValid: false, errorKey: 'emailInvalid' }
  );

  assert.deepEqual(
    validateRegisterInput({
      name: 'Ayesha',
      email: 'ayesha@example.com',
      password: '12345',
      confirmPassword: '12345',
    }),
    { isValid: false, errorKey: 'passwordShort' }
  );

  assert.deepEqual(
    validateRegisterInput({
      name: 'Ayesha',
      email: 'ayesha@example.com',
      password: 'password123',
      confirmPassword: 'password456',
    }),
    { isValid: false, errorKey: 'passwordMismatch' }
  );

  assert.deepEqual(
    validateRegisterInput({
      name: 'Ayesha',
      email: 'ayesha@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    }),
    { isValid: true }
  );

  assert.deepEqual(validateLoginInput('ayesha@example.com', '123456'), {
    isValid: true,
  });
});

test('canUserManageShop and isOwnerOfShop enforce role-based and owner-based access', () => {
  const shop = { id: 'uid-1', ownerId: 'uid-1' };
  assert.equal(isOwnerOfShop(shop, null), false);
  assert.equal(isOwnerOfShop(shop, 'uid-2'), false);
  assert.equal(isOwnerOfShop(shop, 'uid-1'), true);

  assert.equal(canUserManageShop(shop, null, null), false);
  assert.equal(canUserManageShop(shop, 'uid-2', 'user'), false);
  assert.equal(canUserManageShop(shop, 'uid-1', 'user'), true);
  assert.equal(canUserManageShop(shop, 'uid-2', 'admin'), true);
});

test('parseShopIdFromLocation and route path helpers match expected paths', () => {
  assert.equal(parseShopIdFromLocation('/shop/shop-123', ''), 'shop-123');
  assert.equal(parseShopIdFromLocation('/', '#/shop/shop-456'), 'shop-456');
  assert.equal(parseShopIdFromLocation('/', '#skills'), null);
  assert.equal(isAboutPath('/about', ''), true);
  assert.equal(isMyShopPath('/my-shop', ''), true);
  assert.equal(isAdminPath('/admin', ''), true);
});
