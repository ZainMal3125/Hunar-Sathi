import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCompressedDimensions,
  getResolvedSkillDisplay,
  INITIAL_SKILL_FORM_STATE,
  isSkillFormValid,
  SKILL_OPTION_IDS,
  SkillFormState,
} from './skillForm';
import { getTranslation } from '../i18n/translations';

const SAMPLE_PHOTO = {
  id: 'p1',
  dataUrl: 'data:image/jpeg;base64,abc',
  name: 'work1.jpg',
  width: 1024,
  height: 768,
};

test('SKILL_OPTION_IDS contains the 5 required options in order', () => {
  assert.deepEqual(SKILL_OPTION_IDS, [
    'stitching',
    'embroidery',
    'crafts',
    'cooking',
    'other',
  ]);
});

test('calculateCompressedDimensions scales images down to max 1024px without upscaling smaller ones', () => {
  assert.deepEqual(calculateCompressedDimensions(4000, 3000), {
    width: 1024,
    height: 768,
  });
  assert.deepEqual(calculateCompressedDimensions(1500, 3000), {
    width: 512,
    height: 1024,
  });
  assert.deepEqual(calculateCompressedDimensions(2048, 2048), {
    width: 1024,
    height: 1024,
  });
  assert.deepEqual(calculateCompressedDimensions(800, 600), {
    width: 800,
    height: 600,
  });
});

test('isSkillFormValid requires skill, custom text if other, city, and 1 to 4 photos', () => {
  assert.equal(isSkillFormValid(INITIAL_SKILL_FORM_STATE), false);

  const validStitching: SkillFormState = {
    skillId: 'stitching',
    customSkill: '',
    city: 'Lahore',
    photos: [SAMPLE_PHOTO],
  };
  assert.equal(isSkillFormValid(validStitching), true);

  // Missing city
  assert.equal(
    isSkillFormValid({ ...validStitching, city: '   ' }),
    false
  );

  // Missing photos
  assert.equal(
    isSkillFormValid({ ...validStitching, photos: [] }),
    false
  );

  // More than 4 photos
  assert.equal(
    isSkillFormValid({
      ...validStitching,
      photos: [
        SAMPLE_PHOTO,
        { ...SAMPLE_PHOTO, id: 'p2' },
        { ...SAMPLE_PHOTO, id: 'p3' },
        { ...SAMPLE_PHOTO, id: 'p4' },
        { ...SAMPLE_PHOTO, id: 'p5' },
      ],
    }),
    false
  );

  // "other" skill requires non-empty customSkill
  assert.equal(
    isSkillFormValid({
      ...validStitching,
      skillId: 'other',
      customSkill: '   ',
    }),
    false
  );
  assert.equal(
    isSkillFormValid({
      ...validStitching,
      skillId: 'other',
      customSkill: 'crochet',
    }),
    true
  );
});

test('getResolvedSkillDisplay returns localized skill name in Urdu and English', () => {
  const ur = getTranslation('ur');
  const en = getTranslation('en');

  assert.equal(
    getResolvedSkillDisplay(
      {
        skillId: 'embroidery',
        customSkill: '',
        city: 'Multan',
        photos: [SAMPLE_PHOTO],
      },
      ur
    ),
    'کڑھائی'
  );
  assert.equal(
    getResolvedSkillDisplay(
      {
        skillId: 'embroidery',
        customSkill: '',
        city: 'Multan',
        photos: [SAMPLE_PHOTO],
      },
      en
    ),
    'Embroidery'
  );
  assert.equal(
    getResolvedSkillDisplay(
      {
        skillId: 'other',
        customSkill: 'مہندی',
        city: 'Karachi',
        photos: [SAMPLE_PHOTO],
      },
      ur
    ),
    'دیگر: مہندی'
  );
});
