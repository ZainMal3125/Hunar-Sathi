# Hunar Saathi (ہنر ساتھی) — "About & Limitations" Page & Whole-App Quality Audit

Add an **About & Limitations** page displaying the four required disclosures in consistent Urdu and English, and resolve layout issues at `360px`, missing loading/error states, and Urdu/English text inconsistencies across the application.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed during clarification and govern this plan without altering any unrequested features or design:

- **Confirmed Decision 1 — Navigation & Route Placement**: The **About & Limitations** page is rendered inside the third bottom navigation tab (`Guide` / `رہنمائی`) and is also directly accessible at `/about` (and `#about` / `#/about`).
- **Confirmed Decision 2 — Active Language Toggle Parity**: All four statements on the **About & Limitations** page (and all labels across the app) render in the currently selected language (`Urdu` or `English`) with strict 1-to-1 translation parity.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. Provides a dedicated, easy-to-read **About & Limitations** page clearly stating:
     - **AI outputs are suggestions and not financial advice.** (`اے آئی کی تجاویز صرف رہنمائی کے لیے ہیں اور مالیاتی مشورہ نہیں ہیں۔`)
     - **Prices are calculated from the user's own costs.** (`قیمتوں کا حساب صارف کے اپنے درج کردہ اخراجات سے لگایا جاتا ہے۔`)
     - **Personal data is shared only with consent.** (`ذاتی معلومات صرف آپ کی رضامندی سے شیئر کی جاتی ہیں۔`)
     - **This is a prototype.** (`یہ ایپ ایک ابتدائی نمونہ (پروٹوٹائپ) ہے۔`)
  2. Fixes targeted issues uncovered in the whole-app review:
     - **360px Viewport Layout**: Prevents horizontal overflow and text clipping on narrow `360px` screens in both Urdu (`RTL`) and English (`LTR`), including `<select>` dropdowns and long loading/action buttons.
     - **Loading & Error States**: Adds missing error feedback on public shop hide/delete actions and directory loading recovery.
     - **Urdu & English Text Consistency**: Ensures every screen, badge, disclaimer, and checklist item renders consistently in the active language without mixed or mismatched strings.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Opening "About & Limitations"**: Tapping the third tab in the bottom navigation bar or visiting `/about` opens the **About & Limitations** screen with the 4 clear disclosure items, a link to browse the Public Shops Directory (`/directory`), and a button to return to the Welcome screen.
  2. **Switching Languages (`اردو` / `English`)**: Toggling between Urdu and English updates the **About & Limitations** page and all other screens cleanly so every label, status badge, disclaimer, and checklist item matches the active language.
- **Visual Identity & Theme**:
  - Preserves the existing warm palette (`--color-canvas`, `--color-surface`, `--color-primary`, `--color-accent`, `--color-border`), `Noto Nastaliq Urdu` (`dir="rtl"`) for Urdu, and `Plus Jakarta Sans` (`dir="ltr"`) for English.
  - Ensures touch targets remain $\ge 44\text{px}$ and zero horizontal scroll occurs at `360px` width.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Targeted Fixes Only for Audited Issues**
  - *Chosen Approach*: Restrict code changes strictly to the new **About & Limitations** screen and the four audited categories (`360px` layout fit, console error prevention, complete loading/error states on async actions, and Urdu/English text parity).
  - *Why*: Honors the prompt constraint *"Fix only these issues. Do not change any existing feature, design or text unless I ask."*

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Audit Coverage Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           App Router (App.tsx)                          │
│  • /about or #guide tab ────────► AboutLimitationsScreen                │
│  • /directory           ────────► ShopDirectoryScreen                   │
│  • /shop/:id            ────────► PublicShopScreen                      │
│  • /#welcome & /#skills ────────► WelcomeScreen / SkillInput / Results  │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
      ┌─────────────────────────────┼─────────────────────────────┐
      ▼                             ▼                             ▼
┌───────────────────────┐ ┌─────────────────────────┐ ┌───────────────────┐
│ 360px Viewport Fixes  │ │ Loading & Error States  │ │ Urdu/English Sync │
│ • Wrap long Urdu/En   │ │ • PublicShopScreen      │ │ • Active language │
│   button labels safely│ │   hide/delete error     │ │   parity on badges│
│ • Nastaliq line-height│ │   alert & retry state   │ │   disclaimers &   │
│   on <select> options │ │ • Directory error banner│ │   7-day checklist │
└───────────────────────┘ └─────────────────────────┘ └───────────────────┘
```

### Audited Issues to Fix

1. **360px Layout Fixes**:
   - Add `select` and `option` to the `.font-urdu` and `.font-english` typography rules so filter dropdowns on `/directory` render with proper Nastaliq line-height.
   - Replace rigid `whitespace-nowrap` on full-width multi-word action buttons (`#first-week-plan-btn`, `#save-shop-btn`, `#public-open-directory-btn`, `#directory-back-btn`) with responsive text wrapping (`text-center`) so long loading or action text never causes horizontal overflow at `360px`.
2. **Missing Loading & Error States**:
   - In `PublicShopScreen`, catch errors in `handleToggleVisibility` and `handleDelete` and display a localized `role="alert"` error message (`errorActionFailed`) if a network/Firestore mutation fails.
   - In `ShopDirectoryScreen`, display a non-blocking localized error banner with a retry button if `listPublicShopsFromFirestore()` fails.
3. **Urdu & English Consistency**:
   - Update `FirstWeekPlanSection`, `SaveShopSection`, `ProductPriceCalculator`, `NextStepScreen`, `PublicShopScreen`, and `ShopDirectoryScreen` so labels, disclaimers, and `"Sample data"` / `" نمونہ ڈیٹا"` badges render in the active language (`content.lang === 'ur'` shows Urdu; `content.lang === 'en'` shows English) instead of mixing languages when Urdu is selected.
