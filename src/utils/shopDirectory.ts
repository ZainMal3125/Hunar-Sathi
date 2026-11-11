import { formatPkr } from './priceCalculator';
import { ShopProductItem, ShopRecord } from './shopManager';

function createSvgDataUrl(
  bgHex: string,
  accentHex: string,
  fgHex: string,
  patternType: 'floral' | 'stitch' | 'cooking' | 'craft' | 'kashmiri' | 'henna'
): string {
  let motif = '';
  if (patternType === 'floral') {
    motif = `<circle cx="240" cy="180" r="78" fill="${accentHex}" opacity="0.9"/>
      <circle cx="240" cy="180" r="42" fill="${fgHex}"/>
      <circle cx="140" cy="110" r="24" fill="${accentHex}" opacity="0.6"/>
      <circle cx="340" cy="250" r="24" fill="${accentHex}" opacity="0.6"/>`;
  } else if (patternType === 'stitch') {
    motif = `<rect x="110" y="75" width="260" height="210" rx="24" fill="${accentHex}" opacity="0.88"/>
      <path d="M140 120 H340 M140 180 H340 M140 240 H340" stroke="${fgHex}" stroke-width="6" stroke-dasharray="14 10" stroke-linecap="round"/>`;
  } else if (patternType === 'cooking') {
    motif = `<ellipse cx="240" cy="200" rx="130" ry="70" fill="${accentHex}"/>
      <ellipse cx="240" cy="190" rx="95" ry="48" fill="${fgHex}"/>
      <circle cx="215" cy="185" r="14" fill="${bgHex}"/>
      <circle cx="265" cy="192" r="14" fill="${bgHex}"/>`;
  } else if (patternType === 'craft') {
    motif = `<polygon points="240,65 345,180 240,295 135,180" fill="${accentHex}"/>
      <polygon points="240,105 305,180 240,255 175,180" fill="${fgHex}"/>`;
  } else if (patternType === 'kashmiri') {
    motif = `<rect x="95" y="70" width="290" height="220" rx="28" fill="none" stroke="${accentHex}" stroke-width="12"/>
      <circle cx="240" cy="180" r="56" fill="${accentHex}"/>
      <circle cx="240" cy="180" r="24" fill="${fgHex}"/>`;
  } else {
    motif = `<circle cx="240" cy="180" r="88" fill="none" stroke="${accentHex}" stroke-width="10"/>
      <circle cx="240" cy="180" r="52" fill="${accentHex}"/>
      <circle cx="240" cy="180" r="20" fill="${fgHex}"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360">
    <rect width="480" height="360" fill="${bgHex}"/>
    ${motif}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_SHOPS: ShopRecord[] = [
  {
    id: 'sample-shop-1',
    ownerId: 'sample-owner-1',
    shopName: 'SAMPLE: زینب ملتانی کڑھائی / Zainab Multani Embroidery',
    skill: 'Embroidery (کڑھائی)',
    city: 'Multan',
    agreeToShareContact: false,
    whatsappNumber: '',
    isHidden: false,
    isSample: true,
    photos: [createSvgDataUrl('#8C2D19', '#C87D20', '#FAF6F0', 'floral')],
    products: [
      {
        name: 'پھولدار کڑھائی والا دوپٹہ / Floral Embroidered Dupatta',
        description:
          'روایتی ملتانی ٹانکے سے تیار کردہ خوبصورت دوپٹہ۔ (Hand-embroidered dupatta crafted with traditional Multani floral stitchwork.)',
        reason: 'روایتی ملتانی کڑھائی کے لیے موزوں۔',
        price: 1200,
        photos: [createSvgDataUrl('#8C2D19', '#C87D20', '#FAF6F0', 'floral')],
      },
      {
        name: 'ہاتھ کی کڑھائی والا شال بارڈر / Embroidered Shawl Border',
        description:
          'سردیوں کی شال کے لیے نفیس کڑھائی۔ (Fine hand-embroidered border design for winter shawls.)',
        reason: 'باریک ٹانکے کا کام۔',
        price: 2200,
        photos: [createSvgDataUrl('#8C2D19', '#C87D20', '#FAF6F0', 'floral')],
      },
      {
        name: 'مکمل کڑھائی والا سوٹ / Full Embroidered 3-Piece Suit',
        description:
          'تقریبات کے لیے ہاتھ سے تیار کردہ کڑھائی والا سوٹ۔ (Festive 3-piece lawn suit with detailed hand embroidery.)',
        reason: 'مقامی خریداروں میں مقبول۔',
        price: 3500,
        photos: [createSvgDataUrl('#8C2D19', '#C87D20', '#FAF6F0', 'floral')],
      },
    ],
  },
  {
    id: 'sample-shop-2',
    ownerId: 'sample-owner-2',
    shopName: 'SAMPLE: آمنہ سلائی ہوم / Amina Home Stitching',
    skill: 'Stitching (سلائی)',
    city: 'Lahore',
    agreeToShareContact: true,
    whatsappNumber: '03001112233',
    isHidden: false,
    isSample: true,
    photos: [createSvgDataUrl('#6E2212', '#C87D20', '#FAF6F0', 'stitch')],
    products: [
      {
        name: 'سادہ کاٹن کرتا سلائی / Everyday Cotton Kurta Stitching',
        description:
          'روزمرہ پہننے کے لیے صاف اور مضبوط سلائی۔ (Clean, well-fitted everyday cotton kurta stitching.)',
        reason: 'روزمرہ کی ضرورت۔',
        price: 800,
        photos: [createSvgDataUrl('#6E2212', '#C87D20', '#FAF6F0', 'stitch')],
      },
      {
        name: 'بچوں کے کپڑوں کی سلائی / Kids Shalwar Kameez Set',
        description:
          'بچوں کے آرام دہ اور خوبصورت سوٹ کی سلائی۔ (Comfortable custom-stitched children outfits.)',
        reason: 'محلے کے خاندانوں کے لیے موزوں۔',
        price: 1500,
        photos: [createSvgDataUrl('#6E2212', '#C87D20', '#FAF6F0', 'stitch')],
      },
      {
        name: 'ڈیزائنر دوپیس سوٹ سلائی / Piped & Pleated 2-Piece Suit',
        description:
          'پائپنگ اور پلیٹس کے ساتھ نفیس سلائی۔ (Tailored 2-piece suit with neat piping and pintuck detailing.)',
        reason: 'صاف فنشنگ۔',
        price: 2400,
        photos: [createSvgDataUrl('#6E2212', '#C87D20', '#FAF6F0', 'stitch')],
      },
    ],
  },
  {
    id: 'sample-shop-3',
    ownerId: 'sample-owner-3',
    shopName: 'SAMPLE: مریم ہوم کچن / Maryam Home Kitchen',
    skill: 'Cooking (کھانا پکانا)',
    city: 'Karachi',
    agreeToShareContact: false,
    whatsappNumber: '',
    isHidden: false,
    isSample: true,
    photos: [createSvgDataUrl('#8C2D19', '#D99B4E', '#FAF6F0', 'cooking')],
    products: [
      {
        name: 'گھر کے بنے شامی کباب (درجن) / Homemade Shami Kabab (Dozen)',
        description:
          'صاف ستھرے مسالوں سے تیار کردہ فروزن شامی کباب۔ (Hygienic homemade frozen beef shami kababs, pack of 12.)',
        reason: 'گھریلو خواتین اور دفاتر کے لیے آسان۔',
        price: 900,
        photos: [createSvgDataUrl('#8C2D19', '#D99B4E', '#FAF6F0', 'cooking')],
      },
      {
        name: 'دیسی گھی کی پنجیری / Homemade Desi Ghee Panjiri Box',
        description:
          'خشک میوہ جات سے تیار کردہ صحت بخش پنجیری۔ (Traditional wholesome panjiri with nuts and pure desi ghee.)',
        reason: 'سردیوں اور تحفے کے لیے بہترین۔',
        price: 1600,
        photos: [createSvgDataUrl('#8C2D19', '#D99B4E', '#FAF6F0', 'cooking')],
      },
      {
        name: 'چکن اسپرنگ رولز پیک / Frozen Chicken Spring Rolls',
        description:
          'گھر میں تیار کردہ تازہ اور مزیدار اسپرنگ رولز۔ (Crisp homemade chicken and vegetable spring rolls, pack of 12.)',
        reason: 'افطار اور چائے کے لیے مقبول۔',
        price: 750,
        photos: [createSvgDataUrl('#8C2D19', '#D99B4E', '#FAF6F0', 'cooking')],
      },
    ],
  },
  {
    id: 'sample-shop-4',
    ownerId: 'sample-owner-4',
    shopName: 'SAMPLE: صدف دستکاری مرکز / Sadaf Handmade Crafts',
    skill: 'Crafts (دستکاری)',
    city: 'Peshawar',
    agreeToShareContact: true,
    whatsappNumber: '03214445566',
    isHidden: false,
    isSample: true,
    photos: [createSvgDataUrl('#78350F', '#C87D20', '#FAF6F0', 'craft')],
    products: [
      {
        name: 'ہاتھ سے بنا زیورات کا ڈبہ / Handcrafted Fabric Jewelry Box',
        description:
          'شیشے اور ریشمی دھاگے سے سجایا گیا زیورات کا ڈبہ۔ (Mirror-work and silk thread decorative jewelry organizer.)',
        reason: 'تحفے کے لیے خوبصورت انتخاب۔',
        price: 650,
        photos: [createSvgDataUrl('#78350F', '#C87D20', '#FAF6F0', 'craft')],
      },
      {
        name: 'موتیوں والا کلچ بیگ / Beaded Festive Clutch Bag',
        description:
          'شادی اور تقریبات کے لیے ہاتھ سے بنا کلچ۔ (Hand-beaded evening clutch crafted at home.)',
        reason: 'تقریبات کے لیے موزوں۔',
        price: 1400,
        photos: [createSvgDataUrl('#78350F', '#C87D20', '#FAF6F0', 'craft')],
      },
      {
        name: 'سجاوٹی وال ہینگنگ / Traditional Macrame Wall Hanging',
        description:
          'گھر کی سجاوٹ کے لیے ہاتھ سے بنی وال ہینگنگ۔ (Woven cotton cord wall hanging for living rooms.)',
        reason: 'گھریلو سجاوٹ۔',
        price: 1850,
        photos: [createSvgDataUrl('#78350F', '#C87D20', '#FAF6F0', 'craft')],
      },
    ],
  },
  {
    id: 'sample-shop-5',
    ownerId: 'sample-owner-5',
    shopName: 'SAMPLE: خدیجہ کشمیری ٹانکہ / Khadija Hand Embroidery',
    skill: 'Embroidery (کڑھائی)',
    city: 'Rawalpindi',
    agreeToShareContact: false,
    whatsappNumber: '',
    isHidden: false,
    isSample: true,
    photos: [createSvgDataUrl('#8C2D19', '#B45309', '#FAF6F0', 'kashmiri')],
    products: [
      {
        name: 'کشمیری ٹانکہ کشن کور (جوڑا) / Kashmiri Stitch Cushion Pair',
        description:
          'اون اور ریشمی دھاگے کی کشمیری کڑھائی والے کشن کور۔ (Set of 2 cushion covers featuring traditional Kashmiri crewel embroidery.)',
        reason: 'پائیدار اور خوبصورت ڈیزائن۔',
        price: 1500,
        photos: [createSvgDataUrl('#8C2D19', '#B45309', '#FAF6F0', 'kashmiri')],
      },
      {
        name: 'میز پوش کڑھائی سیٹ / Embroidered Table Runner',
        description:
          'کھانے کی میز کے لیے ہاتھ کی کڑھائی والا رنر۔ (Hand-embroidered cotton table runner with floral motifs.)',
        reason: 'مہمان داری کے لیے موزوں۔',
        price: 2600,
        photos: [createSvgDataUrl('#8C2D19', '#B45309', '#FAF6F0', 'kashmiri')],
      },
      {
        name: 'کشمیری کڑھائی والی چادر / Hand-Embroidered Shawl',
        description:
          'باریک کشمیری کڑھائی والی گرم چادر۔ (Warm shawl adorned with detailed Kashmiri floral needlework.)',
        reason: 'سردیوں کی خاص سوغات۔',
        price: 4200,
        photos: [createSvgDataUrl('#8C2D19', '#B45309', '#FAF6F0', 'kashmiri')],
      },
    ],
  },
  {
    id: 'sample-shop-6',
    ownerId: 'sample-owner-6',
    shopName: 'SAMPLE: حنا بیکنگ اور مہندی / Hina Home Baking & Henna',
    skill: 'Other: Baking & Henna (بیکنگ اور مہندی)',
    city: 'Quetta',
    agreeToShareContact: true,
    whatsappNumber: '03337778899',
    isHidden: false,
    isSample: true,
    photos: [createSvgDataUrl('#6E2212', '#D99B4E', '#FAF6F0', 'henna')],
    products: [
      {
        name: 'قدرتی مہندی کونز (6 عدد) / Organic Bridal Henna Cones (Pack of 6)',
        description:
          'کیمیکل سے پاک تازہ گھر کی بنی مہندی کونز۔ (Freshly prepared chemical-free organic henna cones.)',
        reason: 'تہوار اور شادیوں کے لیے۔',
        price: 700,
        photos: [createSvgDataUrl('#6E2212', '#D99B4E', '#FAF6F0', 'henna')],
      },
      {
        name: 'چاکلیٹ کپ کیکس باکس (6 عدد) / Homemade Chocolate Cupcakes',
        description:
          'تازہ بیک کیے گئے نرم اور مزیدار کپ کیکس۔ (Box of 6 freshly baked home-style chocolate fudge cupcakes.)',
        reason: 'سالگرہ اور دعوت کے لیے۔',
        price: 1200,
        photos: [createSvgDataUrl('#6E2212', '#D99B4E', '#FAF6F0', 'henna')],
      },
      {
        name: 'سفارش پر تیار کردہ سالگرہ کیک / Custom 2-Pound Sponge Cake',
        description:
          'گھر کے صاف ماحول میں تیار کردہ تازہ کریم کیک۔ (Custom-decorated 2-pound vanilla or chocolate celebration cake.)',
        reason: 'خاندانی تقریبات کے لیے۔',
        price: 2100,
        photos: [createSvgDataUrl('#6E2212', '#D99B4E', '#FAF6F0', 'henna')],
      },
    ],
  },
];

export type DirectorySkillFilterId =
  | 'all'
  | 'stitching'
  | 'embroidery'
  | 'crafts'
  | 'cooking'
  | 'other';

const SKILL_KEYWORDS: Record<Exclude<DirectorySkillFilterId, 'all'>, string[]> = {
  stitching: ['stitching', 'سلائی'],
  embroidery: ['embroidery', 'کڑھائی'],
  crafts: ['crafts', 'craft', 'دستکاری'],
  cooking: ['cooking', 'کھانا پکانا', 'kitchen'],
  other: ['other', 'دیگر', 'baking', 'henna', 'بیکنگ', 'مہندی'],
};

export function isSampleShop(shop: ShopRecord): boolean {
  return Boolean(shop.isSample || shop.id.startsWith('sample-shop-'));
}

export function formatShopPriceRange(
  products: ShopProductItem[],
  fallbackText: string
): string {
  const validPrices = (products || [])
    .map((p) => p.price)
    .filter(
      (price): price is number =>
        typeof price === 'number' && Number.isFinite(price) && price >= 0
    );

  if (validPrices.length === 0) {
    return fallbackText;
  }

  const minPrice = Math.min(...validPrices);
  const maxPrice = Math.max(...validPrices);

  if (minPrice === maxPrice) {
    return formatPkr(minPrice);
  }

  return `${formatPkr(minPrice)} – ${formatPkr(maxPrice)}`;
}

export function matchesSkillFilter(
  shopSkill: string,
  selectedSkill: string
): boolean {
  const normalizedFilter = selectedSkill.trim().toLowerCase();
  if (!normalizedFilter || normalizedFilter === 'all') {
    return true;
  }

  const normalizedShopSkill = shopSkill.trim().toLowerCase();
  if (normalizedFilter in SKILL_KEYWORDS) {
    const keywords =
      SKILL_KEYWORDS[normalizedFilter as Exclude<DirectorySkillFilterId, 'all'>];
    return keywords.some((kw) => normalizedShopSkill.includes(kw.toLowerCase()));
  }

  return normalizedShopSkill.includes(normalizedFilter);
}

export function matchesCityFilter(
  shopCity: string,
  selectedCity: string
): boolean {
  const normalizedFilter = selectedCity.trim().toLowerCase();
  if (!normalizedFilter || normalizedFilter === 'all') {
    return true;
  }
  return shopCity.trim().toLowerCase() === normalizedFilter;
}

export function filterPublicShops(
  shops: ShopRecord[],
  skillFilter: string,
  cityFilter: string
): ShopRecord[] {
  return shops.filter((shop) => {
    if (shop.isHidden) {
      return false;
    }
    return (
      matchesSkillFilter(shop.skill, skillFilter) &&
      matchesCityFilter(shop.city, cityFilter)
    );
  });
}

export function getAvailableCities(shops: ShopRecord[]): string[] {
  const seen = new Map<string, string>();
  for (const shop of shops) {
    if (shop.isHidden) continue;
    const clean = shop.city.trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, clean);
    }
  }
  return Array.from(seen.values());
}

export function mergeShopsWithSeededSamples(
  firestoreShops: ShopRecord[]
): ShopRecord[] {
  const byId = new Map<string, ShopRecord>();

  // First add the 6 seeded sample shops
  for (const sample of SAMPLE_SHOPS) {
    byId.set(sample.id, sample);
  }

  // Overlay any Firestore shops (user-created shops + any updated sample shops)
  for (const shop of firestoreShops) {
    const isSample = isSampleShop(shop);
    byId.set(shop.id, {
      ...shop,
      isSample,
    });
  }

  // Return non-hidden shops with user-created shops first or sample shops clearly included
  return Array.from(byId.values()).filter((s) => !s.isHidden);
}

export function findSampleShopById(shopId: string): ShopRecord | null {
  return SAMPLE_SHOPS.find((s) => s.id === shopId) ?? null;
}
