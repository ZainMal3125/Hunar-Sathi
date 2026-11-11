import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BUSINESS_GUIDE_SYSTEM_INSTRUCTION,
  getLocalizedProductDescription,
  parseAndValidateBusinessGuideResponse,
  parseDataUrlToInlineData,
} from './businessGuide';

const VALID_SAMPLE = {
  skill_summary: 'Hand embroidery (کڑھائی) with neat floral stitchwork.',
  style_description: 'Traditional floral motifs on cotton fabric with clean borders.',
  target_customers: 'Local women in Multan looking for custom embroidered kurtas and dupattas.',
  suggested_products: [
    {
      name: 'Embroidered Kurta Necklines / کڑھائی والے گلے',
      reason: 'Matches the floral stitch technique visible in your sample.',
      description_urdu: 'سوتی کپڑے پر خوبصورت ہاتھ کی کڑھائی والے گلے۔',
      description_english: 'Hand-embroidered floral necklines on cotton fabric.',
    },
    {
      name: 'Custom Dupatta Borders / دوپٹہ بیل',
      reason: 'Uses repeat border patterns that are quick to complete at home.',
      description_urdu: 'دوپٹے کے کناروں پر نفیس پھولوں کی بیل۔',
      description_english: 'Delicate floral border embroidery for dupattas.',
    },
    {
      name: 'Cushion Covers / کشن کور',
      reason: 'Popular gift and home decor item using the same motif size.',
      description_urdu: 'گھر کی سجاوٹ کے لیے ہاتھ کی کڑھائی والے کشن کور۔',
      description_english: 'Hand-embroidered decorative cushion covers for living rooms.',
    },
  ],
  whatsapp_message_urdu:
    'السلام علیکم! میں گھر بیٹھے نفیس ہاتھ کی کڑھائی کرتی ہوں۔ آرڈر کے لیے رابطہ کریں۔',
};

test('BUSINESS_GUIDE_SYSTEM_INSTRUCTION matches exact required text', () => {
  assert.equal(
    BUSINESS_GUIDE_SYSTEM_INSTRUCTION,
    'You are a practical business guide for home-based women in Pakistan. Write in simple Urdu and English. Never invent income figures, statistics or earnings forecasts. Base your observations only on what is visible in the photos and what the user told you. If you are unsure, say so.'
  );
});

test('parseDataUrlToInlineData extracts mimeType and base64 payload', () => {
  const parsed = parseDataUrlToInlineData('data:image/jpeg;base64,/9j/4AAQ==');
  assert.deepEqual(parsed, {
    mimeType: 'image/jpeg',
    data: '/9j/4AAQ==',
  });
  assert.equal(parseDataUrlToInlineData('invalid-url'), null);
});

test('parseAndValidateBusinessGuideResponse accepts valid 3-product JSON and rejects invalid JSON or wrong product count', () => {
  const res = parseAndValidateBusinessGuideResponse(JSON.stringify(VALID_SAMPLE));
  assert.equal(res.suggested_products.length, 3);
  assert.equal(res.skill_summary, VALID_SAMPLE.skill_summary);

  // Rejects invalid JSON syntax
  assert.throws(() => {
    parseAndValidateBusinessGuideResponse('{invalid json');
  });

  // Rejects when suggested_products has 2 items instead of 3
  assert.throws(() => {
    parseAndValidateBusinessGuideResponse(
      JSON.stringify({
        ...VALID_SAMPLE,
        suggested_products: VALID_SAMPLE.suggested_products.slice(0, 2),
      })
    );
  });

  // Rejects when a required field is empty
  assert.throws(() => {
    parseAndValidateBusinessGuideResponse(
      JSON.stringify({
        ...VALID_SAMPLE,
        whatsapp_message_urdu: '   ',
      })
    );
  });
});

test('getLocalizedProductDescription returns description in currently selected language', () => {
  const item = VALID_SAMPLE.suggested_products[0];
  assert.equal(
    getLocalizedProductDescription(item, 'ur'),
    'سوتی کپڑے پر خوبصورت ہاتھ کی کڑھائی والے گلے۔'
  );
  assert.equal(
    getLocalizedProductDescription(item, 'en'),
    'Hand-embroidered floral necklines on cotton fabric.'
  );
});
