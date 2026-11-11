import { Language } from '../i18n/translations';

export const BUSINESS_GUIDE_SYSTEM_INSTRUCTION =
  'You are a practical business guide for home-based women in Pakistan. Write in simple Urdu and English. Never invent income figures, statistics or earnings forecasts. Base your observations only on what is visible in the photos and what the user told you. If you are unsure, say so.';

export interface SuggestedProductItem {
  name: string;
  reason: string;
  description_urdu: string;
  description_english: string;
}

export function getLocalizedProductDescription(
  product: SuggestedProductItem,
  lang: Language
): string {
  return lang === 'ur'
    ? product.description_urdu
    : product.description_english;
}

export interface BusinessGuideResponse {
  skill_summary: string;
  style_description: string;
  target_customers: string;
  suggested_products: SuggestedProductItem[];
  whatsapp_message_urdu: string;
}

export interface AnalyzeSkillRequestPayload {
  skill: string;
  city: string;
  photos: Array<{
    dataUrl: string;
    name?: string;
  }>;
}

export function parseDataUrlToInlineData(
  dataUrl: string
): { mimeType: string; data: string } | null {
  if (typeof dataUrl !== 'string') {
    return null;
  }
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match || !match[1] || !match[2]) {
    return null;
  }
  return {
    mimeType: match[1],
    data: match[2],
  };
}

function isNonEmptyString(val: unknown): val is string {
  return typeof val === 'string' && val.trim().length > 0;
}

export function validateBusinessGuideObject(
  data: unknown
): BusinessGuideResponse {
  if (!data || typeof data !== 'object') {
    throw new Error('Response is not a JSON object');
  }

  const record = data as Record<string, unknown>;

  if (!isNonEmptyString(record.skill_summary)) {
    throw new Error('Invalid or missing skill_summary');
  }
  if (!isNonEmptyString(record.style_description)) {
    throw new Error('Invalid or missing style_description');
  }
  if (!isNonEmptyString(record.target_customers)) {
    throw new Error('Invalid or missing target_customers');
  }
  if (!isNonEmptyString(record.whatsapp_message_urdu)) {
    throw new Error('Invalid or missing whatsapp_message_urdu');
  }

  if (
    !Array.isArray(record.suggested_products) ||
    record.suggested_products.length !== 3
  ) {
    throw new Error('suggested_products must containꠠexactly 3 items');
  }

  const validatedProducts: SuggestedProductItem[] =
    record.suggested_products.map((item, idx) => {
      if (!item || typeof item !== 'object') {
        throw new Error(`suggested_products[${idx}] is not an object`);
      }
      const prod = item as Record<string, unknown>;
      if (
        !isNonEmptyString(prod.name) ||
        !isNonEmptyString(prod.reason) ||
        !isNonEmptyString(prod.description_urdu) ||
        !isNonEmptyString(prod.description_english)
      ) {
        throw new Error(
          `suggested_products[${idx}] is missing required fields`
        );
      }
      return {
        name: prod.name.trim(),
        reason: prod.reason.trim(),
        description_urdu: prod.description_urdu.trim(),
        description_english: prod.description_english.trim(),
      };
    });

  return {
    skill_summary: record.skill_summary.trim(),
    style_description: record.style_description.trim(),
    target_customers: record.target_customers.trim(),
    suggested_products: validatedProducts,
    whatsapp_message_urdu: record.whatsapp_message_urdu.trim(),
  };
}

export function parseAndValidateBusinessGuideResponse(
  rawText: string
): BusinessGuideResponse {
  if (!isNonEmptyString(rawText)) {
    throw new Error('Empty response text from Gemini');
  }
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('Invalid JSON returned by model');
  }

  return validateBusinessGuideObject(parsed);
}
