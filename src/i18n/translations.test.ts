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

test('navigation structure has Home, Create, and How it works tabs and transitions to Create on Start', () => {
  assert.equal(DEFAULT_SCREEN, 'welcome');
  assert.equal(resolveInitialScreen('', ''), 'welcome');
  assert.equal(resolveInitialScreen('', '#home'), 'welcome');
  assert.equal(resolveInitialScreen('?autostart=1', ''), 'skills');
  assert.equal(resolveInitialScreen('', '#create'), 'skills');
  assert.equal(resolveInitialScreen('', '#skills'), 'skills');
  assert.equal(resolveInitialScreen('', '#how-it-works'), 'guide');
  assert.equal(resolveInitialScreen('', '#guide'), 'guide');
  assert.equal(resolveInitialScreen('', '#about'), 'guide');
  assert.equal(getNextScreenOnStart(), 'skills');
  assert.equal(ROUTES.length, 3);

  const en = getTranslation('en');
  const ur = getTranslation('ur');
  assert.deepEqual(en.nav, {
    welcome: 'Home',
    skills: 'Create',
    guide: 'How it works',
  });
  assert.deepEqual(ur.nav, {
    welcome: 'ہوم',
    skills: 'بنائیں',
    guide: 'طریقۂ کار',
  });
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



