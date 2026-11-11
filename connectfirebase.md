# Connecting Hunar Saathi (ہنر ساتھی) to Firebase — Complete Setup Guide

This guide walks you through everything needed to set up Firebase from scratch and connect it to **Hunar Saathi**, whether you are managing the database already provisioned in Google AI Studio or connecting the app to your own standalone Firebase project.

---

## 1. Current Connection Status (Inside Google AI Studio)

Your app is **already connected** to a live Cloud Firestore database provisioned for this workspace:

- **Firebase Project ID**: `gen-lang-client-0984449448`
- **Firestore Database ID**: `ai-studio-hunarsaathi-65956f55-153e-4eb5-88f5-8c5fc686ce74`
- **Config File**: `/firebase-applet-config.json`
- **SDK Initialization & Helpers**: `/src/firebase.ts`
- **Security Rules**: `/firestore.rules` (already deployed)
- **Data Blueprint**: `/firebase-blueprint.json`

### View Your Live Database in the Firebase Console
You can view and manage saved shops under the `shops` collection directly at:
https://console.firebase.google.com/project/gen-lang-client-0984449448/firestore/databases/ai-studio-hunarsaathi-65956f55-153e-4eb5-88f5-8c5fc686ce74/data

---

## 2. Step-by-Step: Setting Up Your Own Firebase Project

Follow these steps if you want to connect Hunar Saathi to a new Firebase project of your own (for example, when exporting the code or hosting it on your own domain).

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/) and sign in with your Google account.
2. Click **Add project** (or **Create a project**).
3. Enter a project name (for example, `hunar-saathi-pk`) and note the **Project ID** shown below the name.
4. Choose whether to enable Google Analytics (optional—not required for Hunar Saathi) and click **Create project**.

---

### Step 2: Register Your Web Application
1. Inside your new project's **Project Overview** page, click the **Web** icon (`</>`).
2. Enter an App nickname (for example, `Hunar Saathi Web`).
3. Leave **Also set up Firebase Hosting** unchecked for now (unless you plan to host via Firebase Hosting) and click **Register app**.
4. Firebase will display a `firebaseConfig` object containing your keys (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`). Keep these values handy for **Step 4**.
5. Click **Continue to console**.

---

### Step 3: Create the Cloud Firestore Database
1. In the left-hand sidebar of the Firebase Console, go to **Build → Firestore Database**.
2. Click **Create database**.
3. **Select Edition & Location**:
   - Choose a region close to your users in Pakistan (recommended: `asia-south1` Mumbai or `asia-southeast1` Singapore).
   - Note the **Database ID** (by default it is `(default)`, or you can give it a custom name).
4. **Security Rules Mode**:
   - Select **Start in production mode** and click **Create** (you will publish the project's custom `firestore.rules` in **Step 5**).

---

### Step 4: Connect Your Firebase Config to the App
Open `/firebase-applet-config.json` in the root of the project and replace the values with your Firebase project's credentials from **Step 2** and **Step 3**:

```json
{
  "projectId": "YOUR_PROJECT_ID",
  "appId": "YOUR_WEB_APP_ID",
  "apiKey": "YOUR_FIREBASE_API_KEY",
  "authDomain": "YOUR_PROJECT_ID.firebaseapp.com",
  "firestoreDatabaseId": "(default)",
  "storageBucket": "YOUR_PROJECT_ID.firebasestorage.app",
  "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
  "measurementId": "",
  "oAuthClientId": "",
  "recaptchaSiteKey": ""
}
```

> **Important Note on `firestoreDatabaseId`**:
> - If you created the standard default Firestore database in Step 3, set `"firestoreDatabaseId": "(default)"`.
> - If you created a named Firestore database (like AI Studio does), set `"firestoreDatabaseId"` to that exact database ID string.
> - `/src/firebase.ts` automatically passes `firebaseConfig.firestoreDatabaseId` into `getFirestore(app, firebaseConfig.firestoreDatabaseId)`.

---

### Step 5: Deploy Firestore Security Rules
Hunar Saathi includes hardened security rules in `/firestore.rules` that validate every shop document (including ensuring a WhatsApp number is stored **only** when `agreeToShareContact` is `true`, enforcing string/array size limits, and blocking collection-wide scraping).

You can deploy `/firestore.rules` in either of two ways:

#### Option A: Via the Firebase Console (Fastest, No CLI Required)
1. Open the [Firebase Console](https://console.firebase.google.com/) and open your project.
2. Go to **Build → Firestore Database** and click the **Rules** tab at the top.
3. Copy the entire contents of `/firestore.rules` from this project and paste it into the editor, replacing the existing rules.
4. Click **Publish**.

#### Option B: Via the Firebase CLI (Recommended for Local Development)
1. Install the Firebase CLI if you haven't already:
   ```bash
   npm install -g firebase-tools
   ```
2. Log in to your Google account:
   ```bash
   firebase login
   ```
3. Initialize Firestore in the project root (select your project and keep `firestore.rules` as the rules file without overwriting it):
   ```bash
   firebase init firestore
   ```
4. Validate the rules locally with ESLint:
   ```bash
   npx eslint firestore.rules
   ```
5. Deploy the rules to your Firebase project:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## 3. How the App Uses Firestore (Architecture & Data Schema)

### Collection Path: `/shops/{shopId}`
When a woman saves her shop on the results screen, `/src/firebase.ts` compresses her uploaded work photos (`<= 480px`, JPEG quality `0.65`) via `compressDataUrlForFirestore` so the entire shop document stays well under Firestore's `1 MB` document limit, and writes the document to `/shops/{shopId}`.

Each document in `/shops/{shopId}` has the following fields:

| Field | Type | Description |
| :--- | :--- | :--- |
| `shopName` | `string` (1–120 chars) | Her shop or artisan name |
| `skill` | `string` (1–160 chars) | Her craft/skill (e.g., Embroidery, Stitching) |
| `city` | `string` (1–120 chars) | Her city in Pakistan |
| `agreeToShareContact` | `boolean` | Whether she checked `"I agree to share my contact details"` |
| `whatsappNumber` | `string` (0–30 chars) | Stored **only** if `agreeToShareContact === true`; otherwise strictly `""` |
| `products` | `list` (1–3 items) | Each item contains `{ name, description, reason, price, photos }` |
| `photos` | `list` (1–4 items) | Compressed base64 JPEG data URLs of her work samples |
| `isHidden` | `boolean` | `false` when public; `true` when hidden by the user |
| `ownerId` | `string` | Owner identifier (anonymous or authenticated UID) |
| `createdAt` | `timestamp` | Server timestamp (`serverTimestamp()`) set on creation |
| `updatedAt` | `timestamp` | Server timestamp (`serverTimestamp()`) updated on every edit |

### Key Application Operations in `/src/firebase.ts`
- **`saveShopToFirestore(input, existingShopId)`**: Creates or updates `/shops/{shopId}` with server timestamps and compressed photos.
- **`getShopFromFirestore(shopId)`**: Fetches `/shops/{shopId}` when a visitor opens `/shop/:id`.
- **`updateShopVisibilityInFirestore(shopId, isHidden)`**: Toggles `isHidden` between `true` and `false` when the user clicks **Hide shop** / **Show shop**.
- **`deleteShopFromFirestore(shopId)`**: Permanently deletes `/shops/{shopId}` when the user clicks **Delete shop**.

---

## 4. Optional: Enabling Authentication & Hardening for Production

Currently, the app allows artisans to create and manage their shop without requiring a Google login first. Before sharing your app broadly in production, we recommend hardening ownership with Firebase Authentication:

1. In the Firebase Console, go to **Build → Authentication → Get started**.
2. Under the **Sign-in method** tab, select **Google**, toggle **Enable**, choose a support email, and click **Save**.
3. Under **Authentication → Settings → Authorized domains**, make sure your production domain (or Cloud Run URL) is listed.
4. Update `/firestore.rules` so `create`, `update`, and `delete` require `request.auth != null && request.auth.uid == resource.data.ownerId`.

---

## 5. Verifying Your Setup

1. Start the app locally:
   ```bash
   npm run dev
   ```
2. Run the automated unit & security rule tests:
   ```bash
   npx tsx --test src/utils/shopManager.test.ts firestore.rules.test.ts
   ```
3. In the browser (`http://localhost:3000`):
   - Complete the skill input and product analysis flow.
   - Enter a shop name in the **Save Your Shop** card and click **Save shop**.
   - Click **View public shop page** to open `/shop/:id` and verify your shop document appears in the Firebase Console under the `shops` collection.
