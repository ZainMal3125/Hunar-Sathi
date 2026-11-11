export const FIRST_WEEK_PLAN_STORAGE_KEY = 'hunar_saathi_first_week_plan_v1';

export const FIRST_WEEK_PLAN_SYSTEM_INSTRUCTION =
  'You are a practical business guide for home-based women in Pakistan. Write in simple Urdu and English. Never invent income figures, statistics or earnings forecasts. Create a 7-day checklist of simple, practical actions she can do from home (for example: take a clear photo of each product in daylight, post on WhatsApp status, message 5 contacts). Return exactly 7 days (Day 1 to Day 7) with one clear action per day in both simple Urdu and simple English.';

export interface FirstWeekDayItem {
  day: number;
  title_urdu: string;
  title_english: string;
  action_urdu: string;
  action_english: string;
}

export interface FirstWeekPlanResponse {
  days: [
    FirstWeekDayItem,
    FirstWeekDayItem,
    FirstWeekDayItem,
    FirstWeekDayItem,
    FirstWeekDayItem,
    FirstWeekDayItem,
    FirstWeekDayItem,
  ];
}

export interface FirstWeekPlanRequestPayload {
  skill: string;
  city: string;
  products: string[];
}

export interface StoredFirstWeekPlanState {
  skill: string;
  city: string;
  plan: FirstWeekPlanResponse;
  completedDays: number[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateFirstWeekPlanObject(
  parsed: unknown
): FirstWeekPlanResponse {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Response is not a JSON object');
  }

  const candidate = parsed as Record<string, unknown>;
  if (!Array.isArray(candidate.days) || candidate.days.length !== 7) {
    throw new Error('days must be an array of exactly 7 items');
  }

  const validatedDays: FirstWeekDayItem[] = candidate.days.map((item, idx) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`days[${idx}] must be an object`);
    }
    const obj = item as Record<string, unknown>;
    if (
      !isNonEmptyString(obj.title_urdu) ||
      !isNonEmptyString(obj.title_english) ||
      !isNonEmptyString(obj.action_urdu) ||
      !isNonEmptyString(obj.action_english)
    ) {
      throw new Error(
        `days[${idx}] is missing required Urdu or English fields`
      );
    }

    return {
      day: idx + 1,
      title_urdu: obj.title_urdu.trim(),
      title_english: obj.title_english.trim(),
      action_urdu: obj.action_urdu.trim(),
      action_english: obj.action_english.trim(),
    };
  });

  return {
    days: [
      validatedDays[0],
      validatedDays[1],
      validatedDays[2],
      validatedDays[3],
      validatedDays[4],
      validatedDays[5],
      validatedDays[6],
    ],
  };
}

export function parseAndValidateFirstWeekPlanResponse(
  jsonText: string
): FirstWeekPlanResponse {
  if (!isNonEmptyString(jsonText)) {
    throw new Error('Empty response from model');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('Model returned invalid JSON');
  }

  return validateFirstWeekPlanObject(parsed);
}

export function sanitizeCompletedDays(days: unknown): number[] {
  if (!Array.isArray(days)) {
    return [];
  }
  const unique = new Set<number>();
  for (const val of days) {
    if (typeof val === 'number' && Number.isInteger(val) && val >= 1 && val <= 7) {
      unique.add(val);
    }
  }
  return Array.from(unique).sort((a, b) => a - b);
}

export function toggleCompletedDay(
  completedDays: number[],
  dayNumber: number
): number[] {
  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 7) {
    return sanitizeCompletedDays(completedDays);
  }
  const current = sanitizeCompletedDays(completedDays);
  if (current.includes(dayNumber)) {
    return current.filter((d) => d !== dayNumber);
  }
  return sanitizeCompletedDays([...current, dayNumber]);
}

export function loadFirstWeekPlanStorage(
  skill: string,
  city: string,
  storage?: Pick<Storage, 'getItem'>
): StoredFirstWeekPlanState | null {
  const targetStorage =
    storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  if (!targetStorage) {
    return null;
  }

  try {
    const raw = targetStorage.getItem(FIRST_WEEK_PLAN_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (
      typeof parsed?.skill !== 'string' ||
      typeof parsed?.city !== 'string' ||
      parsed.skill.trim().toLowerCase() !== skill.trim().toLowerCase() ||
      parsed.city.trim().toLowerCase() !== city.trim().toLowerCase()
    ) {
      return null;
    }
    const validatedPlan = validateFirstWeekPlanObject(parsed.plan);
    const completedDays = sanitizeCompletedDays(parsed.completedDays);
    return {
      skill: parsed.skill,
      city: parsed.city,
      plan: validatedPlan,
      completedDays,
    };
  } catch {
    return null;
  }
}

export function saveFirstWeekPlanStorage(
  state: StoredFirstWeekPlanState,
  storage?: Pick<Storage, 'setItem'>
): void {
  const targetStorage =
    storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  if (!targetStorage) {
    return;
  }

  try {
    targetStorage.setItem(
      FIRST_WEEK_PLAN_STORAGE_KEY,
      JSON.stringify({
        skill: state.skill.trim(),
        city: state.city.trim(),
        plan: state.plan,
        completedDays: sanitizeCompletedDays(state.completedDays),
      })
    );
  } catch {
    // Ignore storage quota errors
  }
}

export function clearFirstWeekPlanStorage(
  storage?: Pick<Storage, 'removeItem'>
): void {
  const targetStorage =
    storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  if (!targetStorage) {
    return;
  }

  try {
    targetStorage.removeItem(FIRST_WEEK_PLAN_STORAGE_KEY);
  } catch {
    // Ignore errors
  }
}
