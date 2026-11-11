import assert from 'node:assert/strict';
import test from 'node:test';
import {
  clearFirstWeekPlanStorage,
  FIRST_WEEK_PLAN_STORAGE_KEY,
  FirstWeekPlanResponse,
  loadFirstWeekPlanStorage,
  parseAndValidateFirstWeekPlanResponse,
  saveFirstWeekPlanStorage,
  toggleCompletedDay,
} from './firstWeekPlan';

function createValidSevenDayPayload(): FirstWeekPlanResponse {
  return {
    days: [
      {
        day: 1,
        title_urdu: 'واضح تصاویر لیں',
        title_english: 'Take clear product photos',
        action_urdu: 'دن کی روشنی میں اپنے ہر کام کی صاف تصویر کھینچیں۔',
        action_english: 'Take a clear photo of each product in natural daylight.',
      },
      {
        day: 2,
        title_urdu: 'واٹس ایپ اسٹیٹس لگائیں',
        title_english: 'Post on WhatsApp status',
        action_urdu: 'اپنی بہترین مصنوعات کی تصاویر اپنے واٹس ایپ اسٹیٹس پر لگائیں۔',
        action_english: 'Share your best product photos on your WhatsApp status.',
      },
      {
        day: 3,
        title_urdu: '5 جاننے والوں کو پیغام بھیجیں',
        title_english: 'Message 5 contacts',
        action_urdu: 'اپنے 5 قریبی رشتہ داروں یا سہیلیوں کو اپنا تعارفی پیغام بھیجیں۔',
        action_english: 'Send your friendly announcement message to 5 trusted contacts.',
      },
      {
        day: 4,
        title_urdu: 'قیمتوں کی فہرست تیار کریں',
        title_english: 'Prepare a simple price list',
        action_urdu: 'اپنی 3 مصنوعات کی قیمتیں ایک کاغذ یا نوٹ میں لکھ لیں۔',
        action_english: 'Write down the prices of your 3 products so you can reply quickly.',
      },
      {
        day: 5,
        title_urdu: 'پیکنگ کا انتظام کریں',
        title_english: 'Arrange neat packaging',
        action_urdu: 'سادہ اور صاف شاپنگ بیگ یا پیکنگ کے تھیلے تیار رکھیں۔',
        action_english: 'Keep clean, simple bags or wrapping ready for your first order.',
      },
      {
        day: 6,
        title_urdu: 'پڑوس میں بتائیں',
        title_english: 'Share with neighbors',
        action_urdu: 'اپنے محلے کی خواتین کو اپنے کام کا نمونہ دکھائیں۔',
        action_english: 'Show a sample of your work to women in your neighborhood.',
      },
      {
        day: 7,
        title_urdu: 'آرڈرز اور سوالات کا جواب دیں',
        title_english: 'Follow up with interested contacts',
        action_urdu: 'جن لوگوں نے دلچسپی دکھائی ان سے خوش اخلاقی سے رابطہ کریں۔',
        action_english: 'Politely follow up with anyone who asked about your work this week.',
      },
    ],
  };
}

test('parseAndValidateFirstWeekPlanResponse accepts valid 7-day bilingual JSON and rejects invalid item counts or missing fields', () => {
  const validPayload = createValidSevenDayPayload();
  const parsed = parseAndValidateFirstWeekPlanResponse(
    JSON.stringify(validPayload)
  );
  assert.equal(parsed.days.length, 7);
  assert.equal(parsed.days[0].day, 1);
  assert.equal(parsed.days[6].day, 7);
  assert.equal(parsed.days[0].title_english, 'Take clear product photos');

  // Rejects 6 days
  assert.throws(() => {
    parseAndValidateFirstWeekPlanResponse(
      JSON.stringify({ days: validPayload.days.slice(0, 6) })
    );
  }, /exactly 7 items/);

  // Rejects missing Urdu action
  const missingUrdu = structuredClone(validPayload);
  missingUrdu.days[2].action_urdu = '   ';
  assert.throws(() => {
    parseAndValidateFirstWeekPlanResponse(JSON.stringify(missingUrdu));
  }, /missing required Urdu or English fields/);
});

test('toggleCompletedDay adds and removes days 1..7 cleanly in sorted order', () => {
  let completed: number[] = [];
  completed = toggleCompletedDay(completed, 3);
  assert.deepEqual(completed, [3]);

  completed = toggleCompletedDay(completed, 1);
  assert.deepEqual(completed, [1, 3]);

  completed = toggleCompletedDay(completed, 3);
  assert.deepEqual(completed, [1]);

  // Ignores out-of-range day numbers
  completed = toggleCompletedDay(completed, 0);
  completed = toggleCompletedDay(completed, 8);
  assert.deepEqual(completed, [1]);
});

test('saveFirstWeekPlanStorage, loadFirstWeekPlanStorage, and clearFirstWeekPlanStorage persist and clear checklist progress', () => {
  const store = new Map<string, string>();
  const mockStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
  };

  const validPlan = createValidSevenDayPayload();
  saveFirstWeekPlanStorage(
    {
      skill: 'Embroidery (کڑھائی)',
      city: 'Multan',
      plan: validPlan,
      completedDays: [1, 4],
    },
    mockStorage
  );

  assert.equal(store.has(FIRST_WEEK_PLAN_STORAGE_KEY), true);

  const loaded = loadFirstWeekPlanStorage(
    'Embroidery (کڑھائی)',
    'Multan',
    mockStorage
  );
  assert.ok(loaded);
  assert.deepEqual(loaded.completedDays, [1, 4]);
  assert.equal(loaded.plan.days.length, 7);

  // Different city returns null
  const differentCity = loadFirstWeekPlanStorage(
    'Embroidery (کڑھائی)',
    'Lahore',
    mockStorage
  );
  assert.equal(differentCity, null);

  clearFirstWeekPlanStorage(mockStorage);
  assert.equal(
    loadFirstWeekPlanStorage('Embroidery (کڑھائی)', 'Multan', mockStorage),
    null
  );
});
