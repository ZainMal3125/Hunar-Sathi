# Hunar Saathi — Authentication & Role-Based Shop Management

Add email/password authentication via Firebase Authentication, user profile documents in Firestore (`users/{uid}`), one-shop-per-user persistence (`shops/{uid}`), owner-only and admin-level shop management, and bilingual (Urdu/English) navigation for "My Shop", "Browse Shops", and "Admin".

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product and architectural choices have been confirmed from your answers and the specification:

- **Confirmed Decision 1 (Navigation Placement)**: Login/Logout controls will be placed in the top bar alongside the Urdu/English language toggle, while dynamic tabs ("My Shop" when logged in, and "Admin" when `role === "admin"`) appear in the bottom navigation bar alongside "Home", "Create", and "Browse Shops".
- **Confirmed Decision 2 (Admin Role Provisioning)**: Client registration strictly creates `users/{uid}` with `role: "user"` and never hardcodes credentials or self-assigns the admin role in application code. The specified admin account and its `users/{uid}` document (`role: "admin"`) will be provisioned in Firebase Auth/Firestore during setup, and Firestore security rules will enforce `role == "admin"` exclusively by reading `users/$(request.auth.uid).data.role == 'admin'`.
- **Decision 3 (Email Confirmation Off)**: Email/password sign-in works immediately upon registration without requiring email verification (`emailVerified` is not required to log in or manage one's shop).

---

## 1. Overview & Core Concept

- **What It Does**: Enables women artisans to register and log in with email and password, create and manage a single personal shop stored at `shops/{uid}`, browse all visible shops, and allows administrators (`role === "admin"`) to view, hide/unhide, and delete any shop across the platform.
- **Target Audience / Persona**: Pakistani women artisans managing their home-based businesses in Urdu or English, visitors browsing public shops, and platform administrators moderating shop listings.
- **Key Value**: Protects every artisan's shop under her own authenticated account, preserves her Create-flow progress if she logs in mid-flow, and gives administrators a dedicated moderation view.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Register & Login Flow**:
     - Tapping **Login** in the top bar (or being prompted when clicking **Save Shop** while logged out) opens the bilingual **Login / Register** view.
     - **Register** collects Name, Email, Password (minimum 6 characters), and Confirm Password with friendly bilingual validation and Firebase Auth error messages (wrong password, email already in use, weak password, invalid email).
     - Upon registration, a document at `users/{uid}` is created with `{ name, email, role: "user", createdAt }`.
     - If triggered from the Create flow's **Save Shop** step, completing Login or Register returns the user directly to her Create results screen with all entered photos, AI product ideas, calculated prices, and shop inputs intact.
  2. **One Shop Per User & "My Shop" Tab**:
     - Logged-in users see a **My Shop** (`میری دکان` / `My Shop`) tab in the bottom navigation.
     - If the user has a shop at `shops/{uid}`, **My Shop** displays her shop details along with **Edit**, **Hide / Unhide**, and **Delete** (with a confirmation dialog).
     - If the user has no shop yet, **My Shop** displays a clear empty state with a **Create your shop** CTA button that opens the Create flow.
  3. **Browse Shops (Directory) & Public Shop View**:
     - Visitors and logged-in users can browse all visible (`visible == true` / `isHidden == false`) shops in **Browse Shops** and open individual `/shop/:id` pages.
     - **Edit**, **Hide / Unhide**, and **Delete** controls appear **only** on the shop belonging to the logged-in owner (`shop.ownerId === user.uid`) or an admin (`role === "admin"`). Logged-out visitors never see management buttons.
  4. **Admin Panel (`role === "admin"`)**:
     - Users whose `users/{uid}` document has `role === "admin"` see an **Admin** (`ایڈمن` / `Admin`) tab in the bottom navigation.
     - The Admin screen lists all shops (both visible and hidden) showing **Shop Name**, **Owner Email**, **City**, **Status** (Visible / Hidden), and action buttons for **Hide / Unhide** and **Delete** (with a confirmation dialog).
     - Non-admin users never see the Admin tab; attempting to visit `/admin` directly shows a clear bilingual permission-denied notice.
- **Visual Identity & Theme**:
  - Preserves the warm editorial palette (`#FAF6F0` cream canvas, `#F3ECE2` sandstone cards, `#7A283B` deep maroon primary, `#D97706` warm marigold accent), `rounded-3xl` card geometry, `max-w-[500px]` centered app container, and `Noto Nastaliq Urdu` / `Plus Jakarta Sans` typography.
  - All interactive buttons maintain $\ge 48\text{px}$ touch targets (`min-h-[48px]` to `min-h-[58px]`) for effortless mobile thumb reach.
- **Interactive Feedback & Motion**:
  - Loading spinners during authentication and Firestore operations, inline confirmation dialogs before deleting a shop, and clear permission-denied and empty-state cards.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Preserving In-Progress Create State Across Auth**:
  - *Chosen Approach*: Hold the pending Create flow state (`skillForm`, `analysisResult`, and draft `SaveShopSection` fields) in `App` state while presenting the Auth view as an overlay/screen with a return callback, so logging in or registering immediately resumes at the exact Save Shop step.
  - *Why*: Prevents artisans from losing uploaded photos, AI product suggestions, or calculated prices if they started creating before logging in.
- **Decision 2: Backward-Compatible Canonical Shop Schema at `shops/{uid}`**:
  - *Chosen Approach*: Store each user's shop at `shops/{uid}` (where document ID equals `auth.currentUser.uid`) with `ownerId`, `ownerEmail`, `name` (synced with `shopName`), `skill`, `city`, `products`, `visible` (synced with `isHidden: !visible`), and `createdAt`.
  - *Why*: Satisfies the exact `shops/{uid}` schema (`ownerId, name, skill, city, products, visible, createdAt`) and Admin table requirements (`ownerEmail`) while keeping all existing components (`PublicShopScreen`, `ShopDirectoryScreen`, `SaveShopSection`) working seamlessly.
- **Decision 3: Zero-Trust Role Verification in Firestore Rules**:
  - *Chosen Approach*: In `firestore.rules`, `users/{userId}` creation strictly enforces `incoming().role == 'user'`, and `update` forbids changing `role`. Admin privileges in `firestore.rules` are checked via `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'`.
  - *Why*: Guarantees no client can escalate privileges or overwrite another user's shop.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              App Shell                                  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ TopBar: Brand │ Language Toggle (اردو / EN) │ Login / Logout Btn  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                   │                                     │
│  ┌────────────────────────────────▼──────────────────────────────────┐  │
│  │ Auth State & Role Context (Firebase Auth + users/{uid} Listener)  │  │
│  └──┬─────────────┬───────────────┬────────────────┬─────────────────┘  │
│     │             │               │                │                    │
│     ▼             ▼               ▼                ▼                    │
│ ┌────────┐  ┌───────────┐  ┌─────────────┐  ┌──────────────┐            │
│ │  Auth  │  │  Create   │  │   My Shop   │  │ Admin Panel  │            │
│ │ Screen │  │   Flow    │  │   Screen    │  │ (Admin Only) │            │
│ │(Login/ │  │(Requires  │  │(Edit, Hide/ │  │(All Shops +  │            │
│ │Regist.)│  │Login on   │  │Unhide, Del  │  │Hide/Unhide & │            │
│ │        │  │Save Shop) │  │w/ Confirm)  │  │Del Confirm)  │            │
│ └────────┘  └───────────┘  └─────────────┘  └──────────────┘            │
│                                   │                                     │
│  ┌────────────────────────────────▼──────────────────────────────────┐  │
│  │ BottomNav: Home │ Create │ Browse Shops │ [My Shop] │ [Admin]     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - **`users/{uid}`**:
    - `name` (string, 1–120 chars)
    - `email` (string, 3–160 chars)
    - `role` (`"user"` | `"admin"` — client `create` rule strictly enforces `role == "user"`)
    - `createdAt` (server timestamp)
  - **`shops/{uid}`** (Document ID = `ownerId` = `uid`):
    - `ownerId` (string, matches `uid`)
    - `ownerEmail` (string, owner's email for Admin listing)
    - `name` & `shopName` (string, 1–120 chars)
    - `skill` (string, 1–120 chars)
    - `city` (string, 1–100 chars)
    - `products` (list of 1–3 product objects with `name`, `description`, `reason`, `price`, `photos`)
    - `photos` (list of 1–4 compressed data URLs)
    - `visible` (boolean) & `isHidden` (boolean, `isHidden == !visible`)
    - `agreeToShareContact` (boolean) & `whatsappNumber` (string)
    - `createdAt` & `updatedAt` (server timestamps)
- **Interactive Component & State Mapping**:
  - **`AuthScreen`**: Switches between Login and Register modes; validates name, email format, password length ($\ge 6$), and password match; maps Firebase Auth error codes (`auth/invalid-credential`, `auth/wrong-password`, `auth/user-not-found`, `auth/email-already-in-use`, `auth/weak-password`) to friendly Urdu/English alerts; writes `users/{uid}` on registration.
  - **`MyShopScreen`**: Fetches `shops/{uid}`; renders empty state with "Create your shop" button if none exists; renders full shop view with Edit (loads shop into form/editor), Hide/Unhide toggle, and Delete with confirmation modal if shop exists.
  - **`ShopDirectoryScreen` & `PublicShopScreen`**: Queries visible shops (`visible == true` / `isHidden == false`); renders inline Edit/Hide/Delete controls only when `currentUser?.uid === shop.ownerId || userProfile?.role === 'admin'`.
  - **`AdminShopsScreen`**: Guarded by `userProfile?.role === 'admin'` (renders a bilingual permission-denied screen otherwise); fetches all documents in `shops` (visible and hidden); displays each shop's name, owner email, city, visibility status, and Hide/Unhide + Delete (with confirmation dialog) controls.
