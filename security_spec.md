# Hunar Saathi Firestore Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Path & Document ID Hardening**:
   - Every `userId` in `/users/{userId}` and `shopId` in `/shops/{shopId}` must be a valid alphanumeric/hyphen/underscore string of length `1..128` (`^[a-zA-Z0-9_\-]+$`).
2. **User Role & PII Isolation (`/users/{userId}`)**:
   - Only the authenticated owner (`request.auth.uid == userId`) or an admin (`role == 'admin'`) may `get` a user document. Blanket `list` on `/users` is strictly denied (`allow list: if false`).
   - On `create`: `request.auth.uid == userId`, `incoming().role == 'user'` (clients can NEVER self-assign `'admin'` or any other role), and `incoming().createdAt == request.time`.
   - On `update`: `role`, `email`, and `createdAt` are immutable; only `name` may be updated by the owner.
3. **One Shop Per User & Ownership (`/shops/{shopId}`)**:
   - Each authenticated user can create/manage at most one shop at `/shops/{uid}` where `shopId == request.auth.uid` and `incoming().ownerId == request.auth.uid`.
   - Only the shop owner (`existing().ownerId == request.auth.uid`) or an admin (`isAdmin()`) may update or delete a shop.
   - Public visitors can read visible shops (`visible == true && isHidden == false`); hidden shops can only be read or listed by their owner or an admin.
4. **Contact Consent Invariant (PII Guard)**:
   - `whatsappNumber` may only be non-empty when `agreeToShareContact == true`. When `agreeToShareContact == false`, `whatsappNumber` MUST be `""`.
5. **Volumetric & Array Bounds**:
   - `name` & `shopName`: `1..120` chars (`name == shopName`)
   - `skill`: `1..120` chars
   - `city`: `1..100` chars
   - `ownerEmail`: `0..160` chars
   - `whatsappNumber`: `0..30` chars
   - `products`: list of `1..3` product objects
   - `photos`: list of `1..4` compressed image data URL strings (`<= 250000` chars)
6. **Temporal & Ownership Immutability**:
   - On `create`: `createdAt == request.time && updatedAt == request.time`.
   - On `update`: `ownerId == resource.data.ownerId && createdAt == resource.data.createdAt && updatedAt == request.time`.

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Privilege Escalation on Registration**: Creating `/users/{uid}` with `role: "admin"` -> `PERMISSION_DENIED`.
2. **Cross-User PII Read**: Authenticated user `uid-A` attempting `get` on `/users/uid-B` when `uid-A` is not admin -> `PERMISSION_DENIED`.
3. **One-Shop-Per-User Bypass**: Authenticated user `uid-A` attempting to create `/shops/shop-random-id` where `shopId != uid-A` -> `PERMISSION_DENIED`.
4. **Cross-Owner Shop Mutation**: Authenticated non-admin user `uid-A` attempting to update or delete `/shops/uid-B` -> `PERMISSION_DENIED`.
5. **Shadow Field Injection**: Adding `"isAdmin": true` or `"verified": true` to `/shops/{shopId}` -> `PERMISSION_DENIED`.
6. **Consent Violation Leak**: Setting `agreeToShareContact: false` while storing `whatsappNumber: "+923001234567"` -> `PERMISSION_DENIED`.
7. **Oversized Shop Name (Denial of Wallet)**: Setting `shopName` or `name` to a 200-character string (`> 120` chars) -> `PERMISSION_DENIED`.
8. **Empty Required String**: Setting `city: ""` or `skill: ""` -> `PERMISSION_DENIED`.
9. **Unbounded Products or Photos Array**: Sending `products` with `> 3` items or `photos` with `> 4` items -> `PERMISSION_DENIED`.
10. **Timestamp Forgery on Create**: Supplying a forged `createdAt` instead of `request.time` -> `PERMISSION_DENIED`.
11. **Immutable Field Mutation on Update**: Attempting to mutate `createdAt` or `ownerId` during a shop update, or `role` during a user update -> `PERMISSION_DENIED`.
12. **Hidden Shop Scraping by Non-Owner/Non-Admin**: Unauthenticated or non-owner user attempting to read a hidden shop (`visible == false`) -> `PERMISSION_DENIED`.
