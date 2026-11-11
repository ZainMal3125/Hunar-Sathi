import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
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
  MAX_EMAIL_LENGTH,
  MAX_USER_NAME_LENGTH,
  normalizeShopRecord,
  prepareShopPayload,
  SaveShopInput,
  ShopRecord,
  UserProfile,
} from './utils/shopManager';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export { onAuthStateChanged };
export type { User };

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

export async function getUserProfileFromFirestore(
  uid: string,
  fallbackEmail?: string | null,
  fallbackName?: string | null
): Promise<UserProfile> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      const data = snap.data() as Record<string, unknown>;
      return {
        uid,
        name:
          typeof data.name === 'string' && data.name.trim()
            ? data.name
            : fallbackName || 'User',
        email:
          typeof data.email === 'string' && data.email.trim()
            ? data.email
            : fallbackEmail || '',
        role: data.role === 'admin' ? 'admin' : 'user',
        createdAt: data.createdAt,
      };
    }

    // Create default "user" profile if missing
    const cleanName = (
      fallbackName ||
      fallbackEmail?.split('@')[0] ||
      'Artisan'
    )
      .trim()
      .slice(0, MAX_USER_NAME_LENGTH);
    const cleanEmail = (fallbackEmail || 'user@example.com')
      .trim()
      .slice(0, MAX_EMAIL_LENGTH);

    await setDoc(doc(db, 'users', uid), {
      name: cleanName,
      email: cleanEmail,
      role: 'user',
      createdAt: serverTimestamp(),
    });

    return {
      uid,
      name: cleanName,
      email: cleanEmail,
      role: 'user',
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function registerUserWithEmail(
  name: string,
  email: string,
  password: string
): Promise<UserProfile> {
  const cleanName = name.trim().slice(0, MAX_USER_NAME_LENGTH);
  const cleanEmail = email.trim().slice(0, MAX_EMAIL_LENGTH);

  const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  try {
    await updateProfile(cred.user, { displayName: cleanName });
  } catch {
    // Non-fatal profile display name update
  }

  const path = `users/${cred.user.uid}`;
  try {
    // Strictly set role to "user". Never allow client registration to set any other role.
    await setDoc(doc(db, 'users', cred.user.uid), {
      name: cleanName,
      email: cleanEmail,
      role: 'user',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }

  return {
    uid: cred.user.uid,
    name: cleanName,
    email: cleanEmail,
    role: 'user',
  };
}

export async function loginUserWithEmail(
  email: string,
  password: string
): Promise<UserProfile> {
  const cleanEmail = email.trim();
  const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
  return getUserProfileFromFirestore(
    cred.user.uid,
    cred.user.email,
    cred.user.displayName
  );
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function saveShopToFirestore(
  input: SaveShopInput,
  existingShopId?: string | null
): Promise<ShopRecord> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('AUTH_REQUIRED');
  }

  // One shop per user: store at shops/{uid} (where document id equals owner's uid)
  const targetShopId = existingShopId || currentUser.uid;
  const path = `shops/${targetShopId}`;

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

  let existingSnap;
  try {
    existingSnap = await getDoc(doc(db, 'shops', targetShopId));
  } catch {
    existingSnap = null;
  }

  const alreadyExists = Boolean(existingSnap && existingSnap.exists());
  const existingData = alreadyExists
    ? (existingSnap!.data() as Partial<ShopRecord>)
    : null;

  const ownerId = existingData?.ownerId || currentUser.uid;
  const ownerEmail =
    input.ownerEmail ||
    existingData?.ownerEmail ||
    currentUser.email ||
    undefined;
  const currentHidden =
    typeof existingData?.isHidden === 'boolean' ? existingData.isHidden : false;

  const payload = prepareShopPayload(
    {
      ...input,
      ownerEmail,
      photos: compressedPhotos,
      products: compressedProducts,
    },
    ownerId,
    currentHidden
  );

  try {
    if (alreadyExists) {
      await updateDoc(doc(db, 'shops', targetShopId), {
        name: payload.name,
        shopName: payload.shopName,
        ...(payload.ownerEmail ? { ownerEmail: payload.ownerEmail } : {}),
        skill: payload.skill,
        city: payload.city,
        agreeToShareContact: payload.agreeToShareContact,
        whatsappNumber: payload.whatsappNumber,
        visible: payload.visible,
        isHidden: payload.isHidden,
        products: payload.products,
        photos: payload.photos,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(doc(db, 'shops', targetShopId), {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(
      error,
      alreadyExists ? OperationType.UPDATE : OperationType.CREATE,
      path
    );
  }

  return {
    id: targetShopId,
    ...payload,
  };
}

export async function getMyShopFromFirestore(
  uid: string
): Promise<ShopRecord | null> {
  const path = `shops/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'shops', uid));
    if (!snap.exists()) {
      return null;
    }
    return normalizeShopRecord(
      snap.id,
      snap.data() as Partial<ShopRecord> & Record<string, unknown>
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
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
    return normalizeShopRecord(
      snap.id,
      snap.data() as Partial<ShopRecord> & Record<string, unknown>
    );
  } catch {
    const sampleFallback = findSampleShopById(shopId);
    if (sampleFallback) {
      return sampleFallback;
    }
    return null;
  }
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
    const firestoreShops: ShopRecord[] = snap.docs.map((docSnap) =>
      normalizeShopRecord(
        docSnap.id,
        docSnap.data() as Partial<ShopRecord> & Record<string, unknown>
      )
    );

    return mergeShopsWithSeededSamples(firestoreShops);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function listAllShopsForAdminFromFirestore(): Promise<ShopRecord[]> {
  const path = 'shops';
  try {
    const allQuery = query(collection(db, 'shops'), limit(100));
    const snap = await getDocs(allQuery);
    const firestoreShops: ShopRecord[] = snap.docs.map((docSnap) =>
      normalizeShopRecord(
        docSnap.id,
        docSnap.data() as Partial<ShopRecord> & Record<string, unknown>
      )
    );

    const byId = new Map<string, ShopRecord>();
    for (const shop of firestoreShops) {
      byId.set(shop.id, shop);
    }
    for (const sample of SAMPLE_SHOPS) {
      if (!byId.has(sample.id)) {
        byId.set(sample.id, sample);
      }
    }
    return Array.from(byId.values());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateShopVisibilityInFirestore(
  shopId: string,
  isHidden: boolean
): Promise<void> {
  const path = `shops/${shopId}`;
  const hiddenFlag = Boolean(isHidden);
  try {
    await updateDoc(doc(db, 'shops', shopId), {
      visible: !hiddenFlag,
      isHidden: hiddenFlag,
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
