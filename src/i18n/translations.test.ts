import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_LANGUAGE,
  getTranslation,
  toggleLanguageValue,
} from './translations';
import {
  DEFAULT_SCREEN,
  getNextScreenOnStart,
  getVisibleRoutes,
  resolveInitialScreen,
  ROUTES,
} from '../navigation/routes';

test('default language is Urdu with RTL direction and Noto Nastaliq Urdu font class', () => {
  assert.equal(DEFAULT_LANGUAGE, 'ur');
  const t = getTranslation(DEFAULT_LANGUAGE);
  assert.equal(t.lang, 'ur');
  assert.equal(t.dir, 'rtl');
  assert.equal(t.fontClass, 'font-urdu');
  assert.equal(t.appName, 'ہنر ساتھی');
});

test('English language uses LTR direction and clean sans-serif font class', () => {
  const t = getTranslation('en');
  assert.equal(t.lang, 'en');
  assert.equal(t.dir, 'ltr');
  assert.equal(t.fontClass, 'font-english');
  assert.equal(t.appName, 'Hunar Saathi');
  assert.equal(t.startButton, 'Start');
});

test('toggleLanguageValue flips between ur and en', () => {
  assert.equal(toggleLanguageValue('ur'), 'en');
  assert.equal(toggleLanguageValue('en'), 'ur');
});

test('navigation structure supports logged-out, logged-in user, and admin tabs', () => {
  assert.equal(DEFAULT_SCREEN, 'welcome');
  assert.equal(resolveInitialScreen('', ''), 'welcome');
  assert.equal(resolveInitialScreen('', '#home'), 'welcome');
  assert.equal(resolveInitialScreen('?autostart=1', ''), 'skills');
  assert.equal(resolveInitialScreen('', '#create'), 'skills');
  assert.equal(resolveInitialScreen('', '#skills'), 'skills');
  assert.equal(resolveInitialScreen('', '#how-it-works'), 'guide');
  assert.equal(resolveInitialScreen('', '#guide'), 'guide');
  assert.equal(resolveInitialScreen('', '#my-shop'), 'myShop');
  assert.equal(resolveInitialScreen('', '#admin'), 'admin');
  assert.equal(getNextScreenOnStart(), 'skills');
  assert.equal(ROUTES.length, 3);

  assert.deepEqual(
    getVisibleRoutes(false, false).map((r) => r.id),
    ['welcome', 'skills', 'guide']
  );
  assert.deepEqual(
    getVisibleRoutes(true, false).map((r) => r.id),
    ['welcome', 'skills', 'guide', 'myShop']
  );
  assert.deepEqual(
    getVisibleRoutes(true, true).map((r) => r.id),
    ['welcome', 'skills', 'guide', 'myShop', 'admin']
  );

  const en = getTranslation('en');
  const ur = getTranslation('ur');
  assert.equal(en.nav.welcome, 'Home');
  assert.equal(en.nav.skills, 'Create');
  assert.equal(en.nav.guide, 'Browse Shops');
  assert.equal(en.nav.myShop, 'My Shop');
  assert.equal(en.nav.admin, 'Admin');
  assert.equal(ur.nav.myShop, 'میری دکان');
  assert.equal(ur.nav.admin, 'ایڈمن');
});

test('How it works page contains 4-step explanation, 4 FAQs, and 4 AI & limitations disclosures in Urdu and English', () => {
  const ur = getTranslation('ur').aboutLimitations;
  const en = getTranslation('en').aboutLimitations;

  assert.equal(ur.steps.length, 4);
  assert.equal(en.steps.length, 4);
  assert.equal(ur.faqs.length, 4);
  assert.equal(en.faqs.length, 4);
  assert.equal(ur.items.length, 4);
  assert.equal(en.items.length, 4);

  const faqQuestions = en.faqs.map((f) => f.question).join(' ');
  assert.match(faqQuestions, /Is my contact shared publicly\?/i);
  assert.match(faqQuestions, /Are prices accurate\?/i);
  assert.match(faqQuestions, /Is it free\?/i);

  assert.match(`${en.items[0].title} ${en.items[0].description}`, /suggestions and not financial advice/i);
  assert.match(`${en.items[1].title} ${en.items[1].description}`, /calculated from the user's own costs/i);
  assert.match(`${en.items[2].title} ${en.items[2].description}`, /shared only with consent/i);
  assert.match(`${en.items[3].title} ${en.items[3].description}`, /prototype/i);
});
