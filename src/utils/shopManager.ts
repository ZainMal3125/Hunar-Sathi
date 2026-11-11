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
  shopName: string;
  skill: string;
  city: string;
  agreeToShareContact: boolean;
  whatsappNumber: string;
  isHidden: boolean;
  isSample?: boolean;
  products: ShopProductItem[];
  photos: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SaveShopInput {
  shopName: string;
  skill: string;
  city: string;
  agreeToShareContact: boolean;
  whatsappNumber: string;
  isSample?: boolean;
  products: ShopProductItem[];
  photos: string[];
}

export const MAX_SHOP_NAME_LENGTH = 120;
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
    shopName: input.shopName.trim().slice(0, MAX_SHOP_NAME_LENGTH),
    skill: input.skill.trim().slice(0, MAX_SKILL_LENGTH),
    city: input.city.trim().slice(0, MAX_CITY_LENGTH),
    agreeToShareContact: Boolean(input.agreeToShareContact),
    whatsappNumber: sanitizedWhatsapp,
    isHidden: Boolean(isHidden),
    ...(typeof input.isSample === 'boolean' ? { isSample: input.isSample } : {}),
    products: sanitizedProducts,
    photos: compactPhotos,
  };
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
  if (/^\/directory\/?$/.test(pathname)) {
    return true;
  }
  if (/^#\/?directory\/?$/.test(hash)) {
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



