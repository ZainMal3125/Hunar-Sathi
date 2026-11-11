# Hunar Saathi Firestore Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Path & Document ID Hardening**: Every `shopId` in `/shops/{shopId}` must be a valid alphanumeric/hyphen/underscore string of length `1..128` (`^[a-zA-Z0-9_\-]+$`).
2. **Strict Schema & Key Enforcement**: Every document in `/shops/{shopId}` must contain ONLY the 11 allowed keys: `['ownerId', 'shopName', 'skill', 'city', 'agreeToShareContact', 'whatsappNumber', 'isHidden', 'products', 'photos', 'createdAt', 'updatedAt']`. Shadow or undeclared keys are rejected.
3. **Contact Consent Invariant (PII Guard)**: `whatsappNumber` may only be non-empty when `agreeToShareContact == true`. When `agreeToShareContact == false`, `whatsappNumber` MUST be the empty string `""`.
4. **Volumetric & Array Bounds**:
   - `shopName`: `1..120` chars
   - `skill`: `1..120` chars
   - `city`: `1..100` chars
   - `whatsappNumber`: `0..30` chars
   - `products`: list of `1..3` product objects
   - `photos`: list of `1..4` compressed image data URL strings (`<= 200000` chars each)
5. **Temporal & Ownership Immutability**:
   - On `create`: `createdAt == request.time && updatedAt == request.time`.
   - On `update`: `ownerId == resource.data.ownerId && createdAt == resource.data.createdAt && updatedAt == request.time`.

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Shadow Field Injection**: Adding `"isAdmin": true` or `"verified": true` to `/shops/{shopId}` on create or update -> `PERMISSION_DENIED`.
2. **Consent Violation Leak**: Setting `agreeToShareContact: false` while storing `whatsappNumber: "+923001234567"` -> `PERMISSION_DENIED`.
3. **Oversized Shop Name (Denial of Wallet)**: Setting `shopName` to a 5,000-character string (`> 120` chars) -> `PERMISSION_DENIED`.
4. **Empty Required String**: Setting `city: ""` or `skill: ""` -> `PERMISSION_DENIED`.
5. **Unbounded Products Array**: Sending `products` with 10 items (`> 3` max) -> `PERMISSION_DENIED`.
6. **Unbounded Photos Array**: Sending `photos` with 6 items (`> 4` max) or 0 items -> `PERMISSION_DENIED`.
7. **Timestamp Forgery on Create**: Supplying a forged past or future `createdAt` instead of `request.time` -> `PERMISSION_DENIED`.
8. **Immutable Field Mutation on Update**: Attempting to mutate `createdAt` or `ownerId` during an update -> `PERMISSION_DENIED`.
9. **Unauthorized Update Affected Keys**: Modifying fields outside the allowed update action keys -> `PERMISSION_DENIED`.
10. **Path ID Poisoning**: Creating a document with an invalid ID containing spaces or special characters -> `PERMISSION_DENIED`.
11. **Wrong Field Type (Value Poisoning)**: Passing a number or boolean for `shopName` or `city` -> `PERMISSION_DENIED`.
12. **Blanket Collection Scraping (`list`)**: Attempting an unrestricted `list` query across `/shops` -> `PERMISSION_DENIED`.
