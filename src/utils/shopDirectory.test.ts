import assert from 'node:assert/strict';
import test from 'node:test';
import {
  filterPublicShops,
  formatShopPriceRange,
  getAvailableCities,
  isSampleShop,
  mergeShopsWithSeededSamples,
  SAMPLE_SHOPS,
} from './shopDirectory';

test('SAMPLE_SHOPS contains exactly 6 clearly labeled sample shops with Sample flag and privacy-respecting contact rules', () => {
  assert.equal(SAMPLE_SHOPS.length, 6);

  for (const shop of SAMPLE_SHOPS) {
    assert.equal(isSampleShop(shop), true);
    assert.equal(shop.isSample, true);
    assert.ok(shop.shopName.startsWith('SAMPLE:'));
    assert.ok(shop.photos.length >= 1);
    assert.ok(shop.products.length >= 1);

    // Contact details stay empty unless seller opted in
    if (!shop.agreeToShareContact) {
      assert.equal(shop.whatsappNumber, '');
    } else {
      assert.ok(shop.whatsappNumber.length >= 7);
    }
  }

  // Ensure mix of opted-in and opted-out sample sellers
  const optedInCount = SAMPLE_SHOPS.filter((s) => s.agreeToShareContact).length;
  const optedOutCount = SAMPLE_SHOPS.filter((s) => !s.agreeToShareContact).length;
  assert.ok(optedInCount >= 2);
  assert.ok(optedOutCount >= 2);
});

test('formatShopPriceRange computes min-max range in PKR or fallback when no prices exist', () => {
  const range = formatShopPriceRange(SAMPLE_SHOPS[0].products, 'Price on request');
  assert.equal(range, 'PKR 1,200 – PKR 3,500');

  const singlePrice = formatShopPriceRange(
    [
      {
        name: 'Item',
        description: 'Desc',
        reason: 'Reason',
        price: 1500,
        photos: [],
      },
    ],
    'Price on request'
  );
  assert.equal(singlePrice, 'PKR 1,500');

  const noPrices = formatShopPriceRange(
    [
      {
        name: 'Item',
        description: 'Desc',
        reason: 'Reason',
        price: null,
        photos: [],
      },
    ],
    'Price on request'
  );
  assert.equal(noPrices, 'Price on request');
});

test('filterPublicShops filters by skill and city and excludes hidden shops', () => {
  const embroideryShops = filterPublicShops(SAMPLE_SHOPS, 'embroidery', 'all');
  assert.equal(embroideryShops.length, 2);

  const multanEmbroidery = filterPublicShops(
    SAMPLE_SHOPS,
    'embroidery',
    'Multan'
  );
  assert.equal(multanEmbroidery.length, 1);
  assert.equal(multanEmbroidery[0].id, 'sample-shop-1');

  const lahoreStitching = filterPublicShops(
    SAMPLE_SHOPS,
    'stitching',
    'Lahore'
  );
  assert.equal(lahoreStitching.length, 1);
  assert.equal(lahoreStitching[0].id, 'sample-shop-2');
});

test('mergeShopsWithSeededSamples preserves all 6 sample shops and merges live public shops', () => {
  const merged = mergeShopsWithSeededSamples([]);
  assert.equal(merged.length, 6);

  const cities = getAvailableCities(merged);
  assert.equal(cities.length, 6);
  assert.ok(cities.includes('Multan'));
  assert.ok(cities.includes('Lahore'));
});
