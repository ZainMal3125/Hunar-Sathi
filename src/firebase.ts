import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getFirestore,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  findSampleShopById,
  mergeShopsWithSeededSamples,
  SAMPLE_SHOPS,
} from './utils/shopDirectory';
import {
  compressDataUrlForFirestore,
  prepareShopPayload,
  SaveShopInput,
  ShopRecord,
} from './utils/shopManager';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

if (typeof window !== 'undefined') {
  testConnection();
}

const LOCAL_OWNER_ID_KEY = 'hunar_saathi_owner_id';

export function getOrCreateOwnerId(): string {
  if (auth.currentUser?.uid) {
    return auth.currentUser.uid;
  }
  if (typeof window === 'undefined') {
    return 'owner-server';
  }
  try {
    const existing = window.localStorage.getItem(LOCAL_OWNER_ID_KEY);
    if (existing && /^[a-zA-Z0-9_-]{1,128}$/.test(existing)) {
      return existing;
    }
    const generated = `artisan-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
    window.localStorage.setItem(LOCAL_OWNER_ID_KEY, generated);
    return generated;
  } catch {
    return `artisan-${Date.now()}`;
  }
}

export function generateShopId(): string {
  return `shop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function saveShopToFirestore(
  input: SaveShopInput,
  existingShopId?: string | null
): Promise<ShopRecord> {
  const shopId = existingShopId || generateShopId();
  const ownerId = getOrCreateOwnerId();

  const compressedPhotos = await Promise.all(
    input.photos.slice(0, 4).map((dataUrl) => compressDataUrlForFirestore(dataUrl))
  );

  const compressedProducts = await Promise.all(
    input.products.slice(0, 3).map(async (prod) => {
      const prodPhotos =
        prod.photos && prod.photos.length > 0
          ? await Promise.all(
              prod.photos
                .slice(0, 2)
                .map((url) => compressDataUrlForFirestore(url))
            )
          : compressedPhotos.slice(0, 1);
      return {
        ...prod,
        photos: prodPhotos,
      };
    })
  );

  const payload = prepareShopPayload(
    {
      ...input,
      photos: compressedPhotos,
      products: compressedProducts,
    },
    ownerId,
    false
  );

  const path = `shops/${shopId}`;
  try {
    if (existingShopId) {
      await updateDoc(doc(db, 'shops', shopId), {
        shopName: payload.shopName,
        skill: payload.skill,
        city: payload.city,
        agreeToShareContact: payload.agreeToShareContact,
        whatsappNumber: payload.whatsappNumber,
        isHidden: payload.isHidden,
        products: payload.products,
        photos: payload.photos,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(doc(db, 'shops', shopId), {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(
      error,
      existingShopId ? OperationType.UPDATE : OperationType.CREATE,
      path
    );
  }

  return {
    id: shopId,
    ...payload,
  };
}

export async function getShopFromFirestore(
  shopId: string
): Promise<ShopRecord | null> {
  const path = `shops/${shopId}`;
  try {
    const snap = await getDoc(doc(db, 'shops', shopId));
    if (!snap.exists()) {
      return findSampleShopById(shopId);
    }
    const data = snap.data() as Omit<ShopRecord, 'id'>;
    return {
      id: snap.id,
      ...data,
    };
  } catch (error) {
    const sampleFallback = findSampleShopById(shopId);
    if (sampleFallback) {
      return sampleFallback;
    }
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function seedSampleShopsInFirestore(
  existingIds: Set<string>
): Promise<void> {
  const missingSamples = SAMPLE_SHOPS.filter((s) => !existingIds.has(s.id));
  await Promise.all(
    missingSamples.map(async (sample) => {
      try {
        await setDoc(doc(db, 'shops', sample.id), {
          ownerId: sample.ownerId,
          shopName: sample.shopName,
          skill: sample.skill,
          city: sample.city,
          agreeToShareContact: sample.agreeToShareContact,
          whatsappNumber: sample.whatsappNumber,
          isHidden: false,
          isSample: true,
          products: sample.products,
          photos: sample.photos,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch {
        // Ignore background seed errors
      }
    })
  );
}

export async function listPublicShopsFromFirestore(): Promise<ShopRecord[]> {
  const path = 'shops';
  try {
    const publicQuery = query(
      collection(db, 'shops'),
      where('isHidden', '==', false),
      limit(50)
    );
    const snap = await getDocs(publicQuery);
    const firestoreShops: ShopRecord[] = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<ShopRecord, 'id'>),
    }));

    const existingIds = new Set(firestoreShops.map((s) => s.id));
    void seedSampleShopsInFirestore(existingIds);

    return mergeShopsWithSeededSamples(firestoreShops);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateShopVisibilityInFirestore(
  shopId: string,
  isHidden: boolean
): Promise<void> {
  const path = `shops/${shopId}`;
  try {
    await updateDoc(doc(db, 'shops', shopId), {
      isHidden,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteShopFromFirestore(shopId: string): Promise<void> {
  const path = `shops/${shopId}`;
  try {
    await deleteDoc(doc(db, 'shops', shopId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
