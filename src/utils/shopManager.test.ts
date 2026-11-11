import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWhatsappContactUrl,
  isAboutPath,
  parseShopIdFromLocation,
  prepareShopPayload,
  sanitizeWhatsappNumber,
  validateSaveShopInput,
} from './shopManager';

test('sanitizeWhatsappNumber stores WhatsApp number ONLY if user agrees to share contact details', () => {
  assert.equal(sanitizeWhatsappNumber(false, '0300-1234567'), '');
  assert.equal(sanitizeWhatsappNumber(true, '0300-1234567'), '0300-1234567');
  assert.equal(sanitizeWhatsappNumber(true, '   '), '');
});

test('prepareShopPayload strips whatsappNumber when agreeToShareContact is false', () => {
  const payloadDisagreed = prepareShopPayload(
    {
      shopName: 'Fatima Embroidery',
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
    false
  );

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

test('parseShopIdFromLocation extracts shop ID from /shop/:id path or hash', () => {
  assert.equal(parseShopIdFromLocation('/shop/shop-123', ''), 'shop-123');
  assert.equal(parseShopIdFromLocation('/', '#/shop/shop-456'), 'shop-456');
  assert.equal(parseShopIdFromLocation('/', '#skills'), null);
});

test('isAboutPath matches /about pathname and #about hash', () => {
  assert.equal(isAboutPath('/about', ''), true);
  assert.equal(isAboutPath('/about/', ''), true);
  assert.equal(isAboutPath('/', '#about'), true);
  assert.equal(isAboutPath('/', '#/about'), true);
  assert.equal(isAboutPath('/directory', ''), false);
});

