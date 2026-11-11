export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: unknown;
}

export interface ShopProductItem {
  name: string;
  description: string;
  reason: string;
  price: number | null;
  photos: string[];
}

export interface ShopRecord {
  id: string;
  ownerId: string;
  ownerEmail?: string;
  name: string;
  shopName: string;
  skill: string;
  city: string;
  agreeToShareContact: boolean;
  whatsappNumber: string;
  visible: boolean;
  isHidden: boolean;
  isSample?: boolean;
  products: ShopProductItem[];
  photos: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SaveShopInput {
  shopName: string;
  ownerEmail?: string;
  skill: string;
  city: string;
  agreeToShareContact: boolean;
  whatsappNumber: string;
  isSample?: boolean;
  products: ShopProductItem[];
  photos: string[];
}

export const MAX_SHOP_NAME_LENGTH = 120;
export const MAX_USER_NAME_LENGTH = 120;
export const MAX_EMAIL_LENGTH = 160;
export const MIN_PASSWORD_LENGTH = 6;
export const MAX_SKILL_LENGTH = 120;
export const MAX_CITY_LENGTH = 100;
export const MAX_WHATSAPP_LENGTH = 30;
export const FIRESTORE_PHOTO_MAX_DIMENSION = 480;
export const FIRESTORE_PHOTO_QUALITY = 0.65;

export function sanitizeWhatsappNumber(
  agreeToShareContact: boolean,
  rawNumber: string
): string {
  if (!agreeToShareContact) {
    return '';
  }
  const cleaned = rawNumber.replace(/[^\d+\-\s()]/g, '').trim();
  return cleaned.slice(0, MAX_WHATSAPP_LENGTH);
}

export function buildWhatsappContactUrl(
  whatsappNumber: string,
  shopName: string
): string | null {
  const digits = whatsappNumber.replace(/\D/g, '');
  if (!digits) {
    return null;
  }
  // Convert leading 03xx Pakistani mobile numbers to 923xx for wa.me links
  const normalized =
    digits.startsWith('0') && digits.length === 11
      ? `92${digits.slice(1)}`
      : digits;
  const text = encodeURIComponent(
    `السلام علیکم ${shopName}! میں نے ہنر ساتھی پر آپ کی دکان دیکھی ہے۔`
  );
  return `https://wa.me/${normalized}?text=${text}`;
}

export function validateSaveShopInput(input: SaveShopInput): {
  isValid: boolean;
  errorKey?: 'shopNameEmpty' | 'invalidWhatsapp';
} {
  if (!input.shopName || input.shopName.trim().length === 0) {
    return { isValid: false, errorKey: 'shopNameEmpty' };
  }
  if (input.agreeToShareContact && input.whatsappNumber.trim().length > 0) {
    const digits = input.whatsappNumber.replace(/\D/g, '');
    if (digits.length < 7) {
      return { isValid: false, errorKey: 'invalidWhatsapp' };
    }
  }
  return { isValid: true };
}

export interface RegisterValidationInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function validateRegisterInput(input: RegisterValidationInput): {
  isValid: boolean;
  errorKey?:
    | 'nameEmpty'
    | 'emailInvalid'
    | 'passwordShort'
    | 'passwordMismatch';
} {
  if (!input.name || input.name.trim().length === 0) {
    return { isValid: false, errorKey: 'nameEmpty' };
  }
  const emailTrimmed = input.email.trim();
  if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
    return { isValid: false, errorKey: 'emailInvalid' };
  }
  if (!input.password || input.password.length < MIN_PASSWORD_LENGTH) {
    return { isValid: false, errorKey: 'passwordShort' };
  }
  if (input.password !== input.confirmPassword) {
    return { isValid: false, errorKey: 'passwordMismatch' };
  }
  return { isValid: true };
}

export function validateLoginInput(email: string, password: string): {
  isValid: boolean;
  errorKey?: 'emailInvalid' | 'passwordShort';
} {
  const emailTrimmed = email.trim();
  if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
    return { isValid: false, errorKey: 'emailInvalid' };
  }
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return { isValid: false, errorKey: 'passwordShort' };
  }
  return { isValid: true };
}

export function prepareShopPayload(
  input: SaveShopInput,
  ownerId: string,
  isHidden: boolean = false
): Omit<ShopRecord, 'id' | 'createdAt' | 'updatedAt'> {
  const sanitizedWhatsapp = sanitizeWhatsappNumber(
    input.agreeToShareContact,
    input.whatsappNumber
  );
  const compactPhotos = input.photos.slice(0, 4);
  const cleanShopName = input.shopName.trim().slice(0, MAX_SHOP_NAME_LENGTH);
  const hiddenFlag = Boolean(isHidden);

  const sanitizedProducts: ShopProductItem[] = input.products
    .slice(0, 3)
    .map((p) => ({
      name: p.name.trim().slice(0, 160),
      description: p.description.trim().slice(0, 600),
      reason: p.reason.trim().slice(0, 400),
      price:
        typeof p.price === 'number' && Number.isFinite(p.price) && p.price >= 0
          ? p.price
          : null,
      photos: (p.photos && p.photos.length > 0
        ? p.photos
        : compactPhotos.slice(0, 1)
      ).slice(0, 2),
    }));

  return {
    ownerId: ownerId.trim().slice(0, 128),
    ...(input.ownerEmail
      ? { ownerEmail: input.ownerEmail.trim().slice(0, MAX_EMAIL_LENGTH) }
      : {}),
    name: cleanShopName,
    shopName: cleanShopName,
    skill: input.skill.trim().slice(0, MAX_SKILL_LENGTH),
    city: input.city.trim().slice(0, MAX_CITY_LENGTH),
    agreeToShareContact: Boolean(input.agreeToShareContact),
    whatsappNumber: sanitizedWhatsapp,
    visible: !hiddenFlag,
    isHidden: hiddenFlag,
    ...(typeof input.isSample === 'boolean' ? { isSample: input.isSample } : {}),
    products: sanitizedProducts,
    photos: compactPhotos,
  };
}

export function normalizeShopRecord(
  id: string,
  raw: Partial<ShopRecord> & Record<string, unknown>
): ShopRecord {
  const resolvedName =
    (typeof raw.name === 'string' && raw.name.trim()) ||
    (typeof raw.shopName === 'string' && raw.shopName.trim()) ||
    'Shop';
  const isHidden =
    typeof raw.isHidden === 'boolean'
      ? raw.isHidden
      : typeof raw.visible === 'boolean'
      ? !raw.visible
      : false;
  const visible = !isHidden;

  return {
    id,
    ownerId: typeof raw.ownerId === 'string' ? raw.ownerId : id,
    ...(typeof raw.ownerEmail === 'string' ? { ownerEmail: raw.ownerEmail } : {}),
    name: resolvedName,
    shopName: resolvedName,
    skill: typeof raw.skill === 'string' ? raw.skill : '',
    city: typeof raw.city === 'string' ? raw.city : '',
    agreeToShareContact: Boolean(raw.agreeToShareContact),
    whatsappNumber:
      typeof raw.whatsappNumber === 'string' ? raw.whatsappNumber : '',
    visible,
    isHidden,
    ...(typeof raw.isSample === 'boolean' ? { isSample: raw.isSample } : {}),
    products: Array.isArray(raw.products)
      ? (raw.products as ShopProductItem[])
      : [],
    photos: Array.isArray(raw.photos) ? (raw.photos as string[]) : [],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function canUserManageShop(
  shop: Pick<ShopRecord, 'ownerId' | 'id'>,
  currentUserId: string | null | undefined,
  role?: UserRole | null
): boolean {
  if (!currentUserId) {
    return false;
  }
  if (role === 'admin') {
    return true;
  }
  return shop.ownerId === currentUserId || shop.id === currentUserId;
}

export function isOwnerOfShop(
  shop: Pick<ShopRecord, 'ownerId' | 'id'>,
  currentUserId: string | null | undefined
): boolean {
  if (!currentUserId) {
    return false;
  }
  return shop.ownerId === currentUserId || shop.id === currentUserId;
}

export function compressDataUrlForFirestore(
  dataUrl: string,
  maxDimension: number = FIRESTORE_PHOTO_MAX_DIMENSION,
  quality: number = FIRESTORE_PHOTO_QUALITY
): Promise<string> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(dataUrl);
      return;
    }
    const img = new Image();
    img.onerror = () => resolve(dataUrl);
    img.onload = () => {
      let width = img.naturalWidth || img.width || maxDimension;
      let height = img.naturalHeight || img.height || maxDimension;
      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.max(1, Math.round((height * maxDimension) / width));
          width = maxDimension;
        } else {
          width = Math.max(1, Math.round((width * maxDimension) / height));
          height = maxDimension;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  });
}

export function parseShopIdFromLocation(
  pathname: string,
  hash: string
): string | null {
  const pathMatch = pathname.match(/^\/shop\/([a-zA-Z0-9_-]+)\/?$/);
  if (pathMatch && pathMatch[1]) {
    return pathMatch[1];
  }
  const hashMatch = hash.match(/^#\/?shop\/([a-zA-Z0-9_-]+)\/?$/);
  if (hashMatch && hashMatch[1]) {
    return hashMatch[1];
  }
  return null;
}

export function isDirectoryPath(pathname: string, hash: string): boolean {
  if (/^\/(directory|shops|browse)\/?$/.test(pathname)) {
    return true;
  }
  if (/^#\/?(directory|shops|browse|public-shops)\/?$/.test(hash)) {
    return true;
  }
  return false;
}

export function isAboutPath(pathname: string, hash: string): boolean {
  if (/^\/(about|how-it-works)\/?$/.test(pathname)) {
    return true;
  }
  if (/^#\/?(about|how-it-works)\/?$/.test(hash)) {
    return true;
  }
  return false;
}

export function isMyShopPath(pathname: string, hash: string): boolean {
  if (/^\/my-shop\/?$/.test(pathname)) {
    return true;
  }
  if (/^#\/?my-shop\/?$/.test(hash)) {
    return true;
  }
  return false;
}

export function isAdminPath(pathname: string, hash: string): boolean {
  if (/^\/admin\/?$/.test(pathname)) {
    return true;
  }
  if (/^#\/?admin\/?$/.test(hash)) {
    return true;
  }
  return false;
}

export function isAuthPath(pathname: string, hash: string): boolean {
  if (/^\/(login|register|auth)\/?$/.test(pathname)) {
    return true;
  }
  if (/^#\/?(login|register|auth)\/?$/.test(hash)) {
    return true;
  }
  return false;
}
