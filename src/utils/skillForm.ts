import { SkillOptionId, TranslationContent } from '../i18n/translations';

export const SKILL_OPTION_IDS: SkillOptionId[] = [
  'stitching',
  'embroidery',
  'crafts',
  'cooking',
  'other',
];

export const MAX_PHOTOS = 4;
export const MIN_PHOTOS = 1;
export const MAX_IMAGE_DIMENSION = 1024;

export interface CompressedPhoto {
  id: string;
  dataUrl: string;
  name: string;
  width: number;
  height: number;
}

export interface SkillFormState {
  skillId: SkillOptionId | null;
  customSkill: string;
  city: string;
  photos: CompressedPhoto[];
}

export const INITIAL_SKILL_FORM_STATE: SkillFormState = {
  skillId: null,
  customSkill: '',
  city: '',
  photos: [],
};

export function calculateCompressedDimensions(
  width: number,
  height: number,
  maxDimension: number = MAX_IMAGE_DIMENSION
): { width: number; height: number } {
  if (width <= 0 || height <= 0) {
    return { width: maxDimension, height: maxDimension };
  }
  if (width <= maxDimension && height <= maxDimension) {
    return { width: Math.round(width), height: Math.round(height) };
  }
  if (width >= height) {
    const ratio = maxDimension / width;
    return {
      width: maxDimension,
      height: Math.max(1, Math.round(height * ratio)),
    };
  }
  const ratio = maxDimension / height;
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: maxDimension,
  };
}

export function isSkillFormValid(state: SkillFormState): boolean {
  if (!state.skillId) {
    return false;
  }
  if (state.skillId === 'other' && state.customSkill.trim().length === 0) {
    return false;
  }
  if (state.city.trim().length === 0) {
    return false;
  }
  if (state.photos.length < MIN_PHOTOS || state.photos.length > MAX_PHOTOS) {
    return false;
  }
  return true;
}

export function getResolvedSkillDisplay(
  state: SkillFormState,
  content: TranslationContent
): string {
  if (!state.skillId) {
    return '';
  }
  if (state.skillId === 'other') {
    const trimmed = state.customSkill.trim();
    return trimmed
      ? `${content.skillInput.skillOptions.other}: ${trimmed}`
      : content.skillInput.skillOptions.other;
  }
  return content.skillInput.skillOptions[state.skillId];
}

export function compressImageFile(
  file: File,
  maxDimension: number = MAX_IMAGE_DIMENSION
): Promise<CompressedPhoto> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      const resultUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!resultUrl) {
        reject(new Error('Empty file result'));
        return;
      }
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.onload = () => {
        const { width, height } = calculateCompressedDimensions(
          img.naturalWidth || img.width,
          img.naturalHeight || img.height,
          maxDimension
        );
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          dataUrl,
          name: file.name,
          width,
          height,
        });
      };
      img.src = resultUrl;
    };
    reader.readAsDataURL(file);
  });
}
