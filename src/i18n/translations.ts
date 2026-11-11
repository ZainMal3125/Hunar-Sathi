export type Language = 'ur' | 'en';

export type ScreenId = 'welcome' | 'skills' | 'guide' | 'myShop' | 'admin';

export type SkillOptionId =
  | 'stitching'
  | 'embroidery'
  | 'crafts'
  | 'cooking'
  | 'other';

export interface SkillInputTranslations {
  heading: string;
  subtitle: string;
  skillSectionLabel: string;
  skillOptions: Record<SkillOptionId, string>;
  otherSkillLabel: string;
  otherSkillPlaceholder: string;
  cityLabel: string;
  cityPlaceholder: string;
  photosLabel: string;
  photosHelper: string;
  addPhotosButton: string;
  maxPhotosReached: string;
  compressingText: string;
  removePhotoAria: string;
  continueButton: string;
  photoCountLabel: (count: number, max: number) => string;
  uploadError: string;
}

export interface PriceCalculatorTranslations {
  calculatePriceButton: string;
  editPriceButton: string;
  closeCalculatorButton: string;
  materialCostLabel: string;
  materialCostPlaceholder: string;
  hoursLabel: string;
  hoursPlaceholder: string;
  hourlyRateLabel: string;
  hourlyRatePlaceholder: string;
  otherCostsLabel: string;
  otherCostsPlaceholder: string;
  marginPercentLabel: string;
  marginPercentPlaceholder: string;
  breakdownHeading: string;
  breakdownMaterials: string;
  breakdownLabor: (hours: number, rate: number) => string;
  breakdownOther: string;
  breakdownBaseCost: string;
  breakdownProfit: (margin: number) => string;
  finalPriceLabel: string;
  ownCostsLabelUrdu: string;
  ownCostsLabelEnglish: string;
  savePriceButton: string;
  savedPriceHeading: string;
  validationEmpty: string;
  validationNegative: string;
  validationInvalid: string;
  validationSummary: string;
}

export interface SaveShopTranslations {
  cardTitle: string;
  cardSubtitle: string;
  shopNameLabel: string;
  shopNamePlaceholder: string;
  agreeCheckboxLabelUrdu: string;
  agreeCheckboxLabelEnglish: string;
  whatsappNumberLabel: string;
  whatsappNumberPlaceholder: string;
  whatsappOnlyStoredNote: string;
  saveShopButton: string;
  savingShopButton: string;
  updateShopButton: string;
  loginToSavePrompt: string;
  loginToSaveButton: string;
  shopSavedTitle: string;
  viewPublicShopButton: string;
  copyShopLinkButton: string;
  copiedShopLinkButton: string;
  hideShopButton: string;
  unhideShopButton: string;
  deleteShopButton: string;
  shopHiddenStatus: string;
  shopDeletedMessage: string;
  errorShopNameEmpty: string;
  errorInvalidWhatsapp: string;
  errorSaveFailed: string;
}

export interface PublicShopTranslations {
  loadingTitle: string;
  notFoundTitle: string;
  notFoundSubtitle: string;
  hiddenTitle: string;
  hiddenSubtitle: string;
  skillLabel: string;
  cityLabel: string;
  productsHeading: string;
  workPhotosHeading: string;
  priceNotSet: string;
  contactWhatsappButtonUrdu: string;
  contactWhatsappButtonEnglish: string;
  manageShopHeading: string;
  editShopButton: string;
  hideShopButton: string;
  unhideShopButton: string;
  deleteShopButton: string;
  backToAppButton: string;
  errorActionFailed: string;
}

export interface DirectoryTranslations {
  heading: string;
  subtitle: string;
  sampleDataBadgeUrdu: string;
  sampleDataBadgeEnglish: string;
  skillFilterLabel: string;
  allSkillsOption: string;
  cityFilterLabel: string;
  allCitiesOption: string;
  priceRangeLabel: string;
  priceNotSet: string;
  openShopLabel: string;
  ownerBadgeLabel: string;
  editShopButton: string;
  hideShopButton: string;
  unhideShopButton: string;
  deleteShopButton: string;
  noMatchingShops: string;
  resetFiltersButton: string;
  loadingTitle: string;
  browseDirectoryButton: string;
  errorLoadFailed: string;
  retryButton: string;
}

export interface AuthTranslations {
  loginNavButton: string;
  logoutNavButton: string;
  loginTab: string;
  registerTab: string;
  loginHeading: string;
  loginSubtitle: string;
  registerHeading: string;
  registerSubtitle: string;
  returnNoticeBanner: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  passwordHelper: string;
  loginSubmitButton: string;
  loggingInButton: string;
  registerSubmitButton: string;
  registeringButton: string;
  switchToRegisterPrompt: string;
  switchToRegisterAction: string;
  switchToLoginPrompt: string;
  switchToLoginAction: string;
  backButton: string;
  errorNameEmpty: string;
  errorEmailInvalid: string;
  errorPasswordShort: string;
  errorPasswordMismatch: string;
  errorWrongPassword: string;
  errorEmailInUse: string;
  errorWeakPassword: string;
  errorProviderNotEnabled: string;
  errorGeneric: string;
  permissionDeniedTitle: string;
  permissionDeniedSubtitle: string;
  loginRequiredTitle: string;
  loginRequiredSubtitle: string;
}

export interface MyShopTranslations {
  heading: string;
  subtitle: string;
  loadingTitle: string;
  emptyTitle: string;
  emptySubtitle: string;
  createYourShopButton: string;
  statusLabel: string;
  statusVisible: string;
  statusHidden: string;
  editShopButton: string;
  cancelEditButton: string;
  saveChangesButton: string;
  savingChangesButton: string;
  hideShopButton: string;
  unhideShopButton: string;
  deleteShopButton: string;
  viewPublicPageButton: string;
  copyLinkButton: string;
  copiedLinkButton: string;
  updatedSuccessMessage: string;
  deletedSuccessMessage: string;
  deleteConfirmTitle: string;
  deleteConfirmMessage: string;
  confirmDeleteButton: string;
  cancelDeleteButton: string;
}

export interface AdminTranslations {
  heading: string;
  subtitle: string;
  loadingTitle: string;
  emptyTitle: string;
  refreshButton: string;
  totalShopsLabel: (count: number) => string;
  colShopName: string;
  colOwnerEmail: string;
  colCity: string;
  colStatus: string;
  colActions: string;
  statusVisible: string;
  statusHidden: string;
  hideButton: string;
  unhideButton: string;
  deleteButton: string;
  viewShopButton: string;
  ownerEmailUnknown: string;
  deleteConfirmTitle: string;
  deleteConfirmMessage: (shopName: string) => string;
  confirmDeleteButton: string;
  cancelDeleteButton: string;
  errorLoadFailed: string;
  errorActionFailed: string;
}

export interface AboutLimitationItem {
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface CreateFlowTranslations {
  stepIndicator: (current: number, total: number) => string;
  steps: [string, string, string];
  backToHomeButton: string;
  backToStep1Button: string;
}

export interface AboutLimitationsTranslations {
  pageHeading: string;
  pageSubtitle: string;
  stepsHeading: string;
  steps: [
    AboutLimitationItem,
    AboutLimitationItem,
    AboutLimitationItem,
    AboutLimitationItem,
  ];
  faqHeading: string;
  faqs: [FaqItem, FaqItem, FaqItem, FaqItem];
  heading: string;
  subtitle: string;
  items: [
    AboutLimitationItem,
    AboutLimitationItem,
    AboutLimitationItem,
    AboutLimitationItem,
  ];
  startCreatingButton: string;
  browseDirectoryButton: string;
  backButton: string;
}

export interface FirstWeekPlanTranslations {
  cardTitle: string;
  cardSubtitle: string;
  openPlanButton: string;
  hidePlanButton: string;
  showPlanButton: string;
  loadingText: string;
  errorText: string;
  retryButton: string;
  progressLabel: (completed: number, total: number) => string;
  dayLabel: (day: number) => string;
}

export interface NextStepTranslations {
  badge: string;
  heading: string;
  subtitle: string;
  loadingTitle: string;
  loadingSubtitle: string;
  errorTitle: string;
  errorSubtitle: string;
  retryButton: string;
  skillAndStyleCardTitle: string;
  skillSummaryLabel: string;
  styleDescriptionLabel: string;
  targetCustomersCardTitle: string;
  suggestedProductsHeading: string;
  productReasonLabel: string;
  productDescriptionLabel: string;
  whatsappCardTitle: string;
  whatsappHelper: string;
  copyButton: string;
  copiedButton: string;
  advisoryNoteUrdu: string;
  advisoryNoteEnglish: string;
  startOverButton: string;
  editButton: string;
  priceCalculator: PriceCalculatorTranslations;
  saveShop: SaveShopTranslations;
  firstWeekPlan: FirstWeekPlanTranslations;
}

export interface HomePageTranslations {
  chooseSkillHeading: string;
  chooseSkillSubtitle: string;
  publicShopsHeading: string;
  publicShopsSubtitle: string;
  publicShopsButton: string;
  whatYouGetHeading: string;
  whatYouGetItems: [
    AboutLimitationItem,
    AboutLimitationItem,
    AboutLimitationItem,
    AboutLimitationItem,
  ];
  trustHeading: string;
  trustPoints: [string, string, string];
  sdgFooterTitle: string;
  sdgBadges: [
    { number: string; title: string },
    { number: string; title: string },
    { number: string; title: string },
  ];
}

export interface TranslationContent {
  lang: Language;
  dir: 'rtl' | 'ltr';
  fontClass: 'font-urdu' | 'font-english';
  appName: string;
  tagline: string;
  startButton: string;
  languageLabel: string;
  urduLabel: string;
  englishLabel: string;
  navAriaLabel: string;
  nav: Record<ScreenId, string>;
  homePage: HomePageTranslations;
  skillInput: SkillInputTranslations;
  nextStep: NextStepTranslations;
  publicShop: PublicShopTranslations;
  directory: DirectoryTranslations;
  auth: AuthTranslations;
  myShop: MyShopTranslations;
  admin: AdminTranslations;
  aboutLimitations: AboutLimitationsTranslations;
  createFlow: CreateFlowTranslations;
  screens: {
    skills: {
      title: string;
      description: string;
      backButton: string;
    };
    guide: {
      title: string;
      description: string;
      backButton: string;
    };
  };
}

export const DEFAULT_LANGUAGE: Language = 'ur';

export const TRANSLATIONS: Record<Language, TranslationContent> = {
  ur: {
    lang: 'ur',
    dir: 'rtl',
    fontClass: 'font-urdu',
    appName: 'ہنر ساتھی',
    tagline: 'گھر بیٹھے اپنے ہنر سے باعزت روزگار کمانے کا آسان سفر۔',
    startButton: 'شروع کریں',
    languageLabel: 'زبان منتخب کریں',
    urduLabel: 'اردو',
    englishLabel: 'English',
    navAriaLabel: 'بنیادی نیویگیشن',
    nav: {
      welcome: 'ہوم',
      skills: 'بنائیں',
      guide: 'دکانیں دیکھیں',
      myShop: 'میری دکان',
      admin: 'ایڈمن',
    },
    homePage: {
      chooseSkillHeading: 'اپنا ہنر منتخب کریں',
      chooseSkillSubtitle: 'کسی بھی ہنر پر ٹیپ کر کے فوراً آغاز کریں',
      publicShopsHeading: 'عوامی دکانیں',
      publicShopsSubtitle:
        'پاکستان بھر کی ہنرمند خواتین کی تیار کردہ مصنوعات اور دکانیں ہنر اور شہر کے لحاظ سے دیکھیں۔',
      publicShopsButton: 'عوامی دکانیں دیکھیں',
      whatYouGetHeading: 'آپ کو کیا ملے گا',
      whatYouGetItems: [
        {
          title: 'تصاویر سے مصنوعات کے آئیڈیاز',
          description:
            'آپ کی اپ لوڈ کردہ تصاویر اور شہر کے مطابق 3 عملی مصنوعات کے مشورے۔',
        },
        {
          title: 'منصفانہ قیمت کا کیلکولیٹر',
          description:
            'سامان، وقت اور محنت کے اخراجات سے ہر چیز کی مناسب قیمت نکالیں۔',
        },
        {
          title: 'تیار واٹس ایپ پیغام',
          description:
            'اپنے جاننے والوں اور خریداروں کو بھیجنے کے لیے سادہ اردو تعارفی پیغام۔',
        },
        {
          title: 'شیئر کرنے کے قابل آن لائن دکان',
          description:
            'اپنے نام، ہنر، شہر اور قیمتوں کے ساتھ ایک صاف ستھرا عوامی دکان کا صفحہ۔',
        },
      ],
      trustHeading: 'قابلِ اعتماد اور محفوظ',
      trustPoints: [
        'اردو میں آسان رہنمائی (انگلش ٹوگل کے ساتھ)',
        'قیمتیں آپ کے اپنے درج کردہ اخراجات سے نکالی جاتی ہیں',
        'رابطہ نمبر صرف آپ کی رضامندی سے شیئر کیا جاتا ہے',
      ],
      sdgFooterTitle: 'اقوامِ متحدہ کے پائیدار ترقیاتی اہداف سے ہم آہنگ',
      sdgBadges: [
        { number: 'SDG 5', title: 'صنفی مساوات' },
        { number: 'SDG 8', title: 'باعزت روزگار' },
        { number: 'SDG 1', title: 'غربت کا خاتمہ' },
      ],
    },
    skillInput: {
      heading: 'اپنے ہنر اور کام کی تفصیل بتائیں',
      subtitle: 'آگے بڑھنے کے لیے اپنا ہنر، شہر اور کام کی تصاویر شامل کریں۔',
      skillSectionLabel: 'اپنا ہنر منتخب کریں',
      skillOptions: {
        stitching: 'سلائی',
        embroidery: 'کڑھائی',
        crafts: 'دستکاری',
        cooking: 'کھانا پکانا',
        other: 'دیگر',
      },
      otherSkillLabel: 'اپنا ہنر لکھیں',
      otherSkillPlaceholder: 'مثلاً مہندی، بنائی، بیکنگ...',
      cityLabel: 'آپ کا شہر',
      cityPlaceholder: 'اپنے شہر کا نام لکھیں (مثلاً لاہور، کراچی، ملتان)',
      photosLabel: 'اپنے پچھلے کام کی تصاویر (1 سے 4)',
      photosHelper: 'کم از کم 1 اور زیادہ سے زیادہ 4 تصاویر اپ لوڈ کریں۔',
      addPhotosButton: 'تصاویر منتخب کریں',
      maxPhotosReached: '4 تصاویر مکمل ہو چکی ہیں',
      compressingText: 'تصویر تیار ہو رہی ہے...',
      removePhotoAria: 'تصویر ہٹائیں',
      continueButton: 'آگے بڑھیں',
      photoCountLabel: (count: number, max: number) => `${count} / ${max} تصاویر`,
      uploadError: 'تصویر لوڈ کرنے میں مسئلہ پیش آیا۔ براہ کرم دوبارہ کوشش کریں۔',
    },
    nextStep: {
      badge: 'تجاویز تیار ہیں',
      heading: 'آپ کے ہنر کا کاروباری جائزہ',
      subtitle: 'آپ کی تصاویر اور معلومات کی بنیاد پر عملی تجاویز:',
      loadingTitle: 'آپ کے کام کا جائزہ لیا جا رہا ہے...',
      loadingSubtitle:
        'ہم آپ کے ہنر، شہر اور اپ لوڈ کردہ تصاویر کو دیکھ کر آسان تجاویز تیار کر رہے ہیں۔ براہ کرم چند لمحے انتظار کریں۔',
      errorTitle: 'معلومات حاصل کرنے میں رکاوٹ پیش آئی',
      errorSubtitle:
        'سروس سے رابطہ نہیں ہو سکا یا جواب درست شکل میں موصول نہیں ہوا۔ براہ کرم دوبارہ کوشش کریں۔',
      retryButton: 'دوبارہ کوشش کریں',
      skillAndStyleCardTitle: 'ہنر کا خلاصہ اور کام کا انداز',
      skillSummaryLabel: 'ہنر کا خلاصہ',
      styleDescriptionLabel: 'کام کا انداز',
      targetCustomersCardTitle: 'ممکنہ خریدار',
      suggestedProductsHeading: 'تجویز کردہ مصنوعات',
      productReasonLabel: 'یہ آپ کے لیے کیوں موزوں ہے',
      productDescriptionLabel: 'تفصیل',
      whatsappCardTitle: 'واٹس ایپ کے لیے پیغام',
      whatsappHelper: 'یہ پیغام کاپی کر کے اپنے جاننے والوں کو واٹس ایپ پر بھیجیں:',
      copyButton: 'کاپی کریں',
      copiedButton: 'کاپی ہو گیا',
      advisoryNoteUrdu: 'یہ تجاویز صرف رہنمائی کے لیے ہیں، مالیاتی مشورہ نہیں۔',
      advisoryNoteEnglish: 'AI suggestions are advisory and not financial advice.',
      startOverButton: 'دوبارہ شروع کریں',
      editButton: 'تفصیلات تبدیل کریں',
      priceCalculator: {
        calculatePriceButton: 'قیمت کا حساب لگائیں',
        editPriceButton: 'قیمت میں تبدیلی کریں',
        closeCalculatorButton: 'بند کریں',
        materialCostLabel: 'سامان کی لاگت (PKR)',
        materialCostPlaceholder: 'مثلاً 500',
        hoursLabel: 'کام کے گھنٹے',
        hoursPlaceholder: 'مثلاً 3',
        hourlyRateLabel: 'آپ کی فی گھنٹہ اجرت (PKR)',
        hourlyRatePlaceholder: 'مثلاً 250',
        otherCostsLabel: 'پیکنگ اور دیگر اخراجات (PKR)',
        otherCostsPlaceholder: 'مثلاً 50',
        marginPercentLabel: 'منافع کی شرح (%)',
        marginPercentPlaceholder: 'مثلاً 20',
        breakdownHeading: 'قیمت کی تفصیل',
        breakdownMaterials: 'سامان کی لاگت',
        breakdownLabor: (hours: number, rate: number) =>
          `محنت (${hours} گھنٹے × PKR ${rate})`,
        breakdownOther: 'پیکنگ اور دیگر اخراجات',
        breakdownBaseCost: 'کل لاگت',
        breakdownProfit: (margin: number) => `منافع (${margin}%)`,
        finalPriceLabel: 'حتمی قیمت',
        ownCostsLabelUrdu: 'آپ کے اپنے اخراجات سے حساب کردہ',
        ownCostsLabelEnglish: 'Calculated from your own costs',
        savePriceButton: 'قیمت محفوظ کریں',
        savedPriceHeading: 'محفوظ شدہ قیمت',
        validationEmpty: 'یہ خانہ خالی نہیں ہو سکتا۔',
        validationNegative: 'منفی نمبر درج نہیں کیا جا سکتا۔',
        validationInvalid: 'درست نمبر درج کریں۔',
        validationSummary: 'قیمت کا حساب لگانے کے لیے تمام خانوں میں درست (مثبت) نمبر درج کریں۔',
      },
      saveShop: {
        cardTitle: 'اپنی دکان محفوظ کریں',
        cardSubtitle:
          'اپنے نام، ہنر، شہر، مصنوعات اور تصاویر کے ساتھ اپنی آن لائن دکان بنائیں۔',
        shopNameLabel: 'آپ کا نام یا دکان کا نام',
        shopNamePlaceholder: 'مثلاً فاطمہ ہینڈ ایمبرائیڈری',
        agreeCheckboxLabelUrdu: 'میں اپنی رابطے کی معلومات شیئر کرنے پر رضامند ہوں',
        agreeCheckboxLabelEnglish: 'I agree to share my contact details',
        whatsappNumberLabel: 'واٹس ایپ نمبر (اختیاری)',
        whatsappNumberPlaceholder: 'مثلاً 03001234567',
        whatsappOnlyStoredNote:
          'آپ کا نمبر صرف تب محفوظ کیا جائے گا جب آپ اوپر رضامندی کے خانے پر نشان لگائیں گی۔',
        saveShopButton: 'دکان محفوظ کریں',
        savingShopButton: 'دکان محفوظ ہو رہی ہے...',
        updateShopButton: 'دکان اپ ڈیٹ کریں',
        loginToSavePrompt:
          'اپنی دکان محفوظ کرنے کے لیے براہ کرم پہلے لاگ ان یا رجسٹر کریں۔ آپ کا درج کردہ ڈیٹا محفوظ رہے گا۔',
        loginToSaveButton: 'لاگ ان یا رجسٹر کر کے محفوظ کریں',
        shopSavedTitle: 'آپ کی دکان محفوظ ہو گئی ہے!',
        viewPublicShopButton: 'عوامی دکان دیکھیں',
        copyShopLinkButton: 'لنک کاپی کریں',
        copiedShopLinkButton: 'لنک کاپی ہو گیا',
        hideShopButton: 'دکان چھپائیں',
        unhideShopButton: 'دکان دوبارہ دکھائیں',
        deleteShopButton: 'دکان حذف کریں',
        shopHiddenStatus: 'یہ دکان اس وقت عوامی نظروں سے چھپی ہوئی ہے۔',
        shopDeletedMessage: 'آپ کی دکان کامیابی سے حذف کر دی گئی ہے۔',
        errorShopNameEmpty: 'براہ کرم اپنا نام یا دکان کا نام درج کریں۔',
        errorInvalidWhatsapp: 'براہ کرم درست واٹس ایپ نمبر درج کریں۔',
        errorSaveFailed: 'دکان محفوظ کرنے میں مسئلہ پیش آیا۔ دوبارہ کوشش کریں۔',
      },
      firstWeekPlan: {
        cardTitle: 'پہلے ہفتے کا عملی منصوبہ',
        cardSubtitle:
          'اپنے کام کو شروع کرنے کے لیے 7 دن کے آسان اور عملی اقدامات کی فہرست حاصل کریں۔',
        openPlanButton: 'پہلے ہفتے کا منصوبہ',
        hidePlanButton: 'فہرست بند کریں',
        showPlanButton: 'پہلے ہفتے کا منصوبہ دکھائیں',
        loadingText: '7 دن کا عملی منصوبہ تیار کیا جا رہا ہے...',
        errorText:
          'منصوبہ حاصل کرنے میں مسئلہ پیش آیا۔ براہ کرم دوبارہ کوشش کریں۔',
        retryButton: 'دوبارہ کوشش کریں',
        progressLabel: (completed: number, total: number) =>
          `${completed} از ${total} مکمل`,
        dayLabel: (day: number) => `دن ${day}`,
      },
    },
    publicShop: {
      loadingTitle: 'دکان کا صفحہ لوڈ ہو رہا ہے...',
      notFoundTitle: 'دکان نہیں ملی',
      notFoundSubtitle: 'یہ دکان موجود نہیں ہے یا حذف کر دی گئی ہے۔',
      hiddenTitle: 'یہ دکان اس وقت چھپی ہوئی ہے',
      hiddenSubtitle: 'دکان کی مالکن نے اس صفحے کو عارضی طور پر چھپا رکھا ہے۔',
      skillLabel: 'ہنر',
      cityLabel: 'شہر',
      productsHeading: 'مصنوعات اور قیمتیں',
      workPhotosHeading: 'ہنر اور کام کی تصاویر',
      priceNotSet: 'قیمت باہمی مشورے سے',
      contactWhatsappButtonUrdu: 'واٹس ایپ پر رابطہ کریں',
      contactWhatsappButtonEnglish: 'Contact on WhatsApp',
      manageShopHeading: 'دکان کی ترتیبات',
      editShopButton: 'دکان میں تبدیلی کریں',
      hideShopButton: 'دکان چھپائیں',
      unhideShopButton: 'دکان دوبارہ دکھائیں',
      deleteShopButton: 'دکان حذف کریں',
      backToAppButton: 'واپس ہنر ساتھی پر',
      errorActionFailed: 'عمل مکمل کرنے میں مسئلہ پیش آیا۔ براہ کرم دوبارہ کوشش کریں۔',
    },
    directory: {
      heading: 'عوامی دکانیں تلاش کریں',
      subtitle: 'پاکستان بھر کی ہنرمند خواتین کی دکانیں ہنر اور شہر کے لحاظ سے دیکھیں۔',
      sampleDataBadgeUrdu: 'نمونہ ڈیٹا',
      sampleDataBadgeEnglish: 'Sample data',
      skillFilterLabel: 'ہنر منتخب کریں',
      allSkillsOption: 'تمام ہنر',
      cityFilterLabel: 'شہر منتخب کریں',
      allCitiesOption: 'تمام شہر',
      priceRangeLabel: 'قیمتوں کی حد',
      priceNotSet: 'قیمت باہمی مشورے سے',
      openShopLabel: 'دکان دیکھیں',
      ownerBadgeLabel: 'آپ کی دکان',
      editShopButton: 'ترمیم کریں',
      hideShopButton: 'چھپائیں',
      unhideShopButton: 'دکھائیں',
      deleteShopButton: 'حذف کریں',
      noMatchingShops: 'منتخب ہنر اور شہر کے مطابق کوئی دکان نہیں ملی۔',
      resetFiltersButton: 'تمام فلٹر صاف کریں',
      loadingTitle: 'دکانوں کی فہرست لوڈ ہو رہی ہے...',
      browseDirectoryButton: 'دکانوں کی ڈائریکٹری دیکھیں',
      errorLoadFailed: 'دکانیں لوڈ کرنے میں رکاوٹ پیش آئی۔ دوبارہ کوشش کریں۔',
      retryButton: 'دوبارہ کوشش کریں',
    },
    auth: {
      loginNavButton: 'لاگ ان',
      logoutNavButton: 'لاگ آؤٹ',
      loginTab: 'لاگ ان',
      registerTab: 'نیا اکاؤنٹ بنائیں',
      loginHeading: 'اپنے اکاؤنٹ میں لاگ ان کریں',
      loginSubtitle: 'اپنی دکان محفوظ کرنے اور منظم کرنے کے لیے ای میل اور پاس ورڈ درج کریں۔',
      registerHeading: 'نیا اکاؤنٹ بنائیں',
      registerSubtitle: 'ہنر ساتھی پر اپنی آن لائن دکان بنانے کے لیے رجسٹر کریں۔',
      returnNoticeBanner:
        'لاگ ان یا رجسٹر مکمل ہوتے ہی آپ واپس اپنے کام پر پہنچ جائیں گی اور آپ کی درج کردہ معلومات محفوظ رہیں گی۔',
      nameLabel: 'آپ کا نام',
      namePlaceholder: 'مثلاً فاطمہ بی بی',
      emailLabel: 'ای میل ایڈریس',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'پاس ورڈ',
      passwordPlaceholder: 'کم از کم 6 حروف',
      confirmPasswordLabel: 'پاس ورڈ کی تصدیق کریں',
      confirmPasswordPlaceholder: 'پاس ورڈ دوبارہ لکھیں',
      passwordHelper: 'پاس ورڈ کم از کم 6 حروف پر مشتمل ہونا چاہیے۔',
      loginSubmitButton: 'لاگ ان کریں',
      loggingInButton: 'لاگ ان ہو رہا ہے...',
      registerSubmitButton: 'اکاؤنٹ بنائیں',
      registeringButton: 'اکاؤنٹ بن رہا ہے...',
      switchToRegisterPrompt: 'کیا آپ کا اکاؤنٹ نہیں ہے؟',
      switchToRegisterAction: 'یہاں رجسٹر کریں',
      switchToLoginPrompt: 'پہلے سے اکاؤنٹ موجود ہے؟',
      switchToLoginAction: 'یہاں لاگ ان کریں',
      backButton: 'واپس جائیں',
      errorNameEmpty: 'براہ کرم اپنا نام درج کریں۔',
      errorEmailInvalid: 'براہ کرم درست ای میل ایڈریس درج کریں۔',
      errorPasswordShort: 'پاس ورڈ کم از کم 6 حروف کا ہونا ضروری ہے۔',
      errorPasswordMismatch: 'دونوں پاس ورڈ ایک جیسے نہیں ہیں۔',
      errorWrongPassword: 'ای میل یا پاس ورڈ غلط ہے۔ براہ کرم دوبارہ چیک کریں۔',
      errorEmailInUse: 'یہ ای میل پہلے سے استعمال میں ہے۔ براہ کرم لاگ ان کریں۔',
      errorWeakPassword: 'پاس ورڈ کمزور ہے۔ کم از کم 6 حروف استعمال کریں۔',
      errorProviderNotEnabled:
        'فائر بیس کنسول (Firebase Console → Authentication → Sign-in method) میں Email/Password سائن اِن ابھی فعال نہیں ہے۔ براہ کرم اسے فعال کریں۔',
      errorGeneric: 'اکاؤنٹ کی تصدیق میں مسئلہ پیش آیا۔ دوبارہ کوشش کریں۔',
      permissionDeniedTitle: 'رسائی کی اجازت نہیں ہے',
      permissionDeniedSubtitle: 'آپ کو اس صفحے کو کھولنے یا تبدیل کرنے کی اجازت نہیں ہے۔',
      loginRequiredTitle: 'لاگ ان ضروری ہے',
      loginRequiredSubtitle: 'اس حصے کو استعمال کرنے کے لیے براہ کرم لاگ ان کریں۔',
    },
    myShop: {
      heading: 'میری دکان',
      subtitle: 'اپنی آن لائن دکان کی تفصیلات دیکھیں، ترمیم کریں، چھپائیں یا حذف کریں۔',
      loadingTitle: 'آپ کی دکان لوڈ ہو رہی ہے...',
      emptyTitle: 'آپ نے ابھی تک اپنی دکان نہیں بنائی',
      emptySubtitle:
        'اپنے ہنر اور کام کی تصاویر شامل کر کے چند منٹ میں اپنی آن لائن دکان بنائیں۔',
      createYourShopButton: 'اپنی دکان بنائیں',
      statusLabel: 'دکان کی حیثیت:',
      statusVisible: 'عوامی طور پر نظر آ رہی ہے (Visible)',
      statusHidden: 'چھپی ہوئی ہے (Hidden)',
      editShopButton: 'ترمیم کریں (Edit)',
      cancelEditButton: 'منسوخ کریں',
      saveChangesButton: 'تبدیلیاں محفوظ کریں',
      savingChangesButton: 'محفوظ ہو رہا ہے...',
      hideShopButton: 'دکان چھپائیں',
      unhideShopButton: 'دکان دکھائیں',
      deleteShopButton: 'دکان حذف کریں',
      viewPublicPageButton: 'عوامی دکان کا صفحہ دیکھیں',
      copyLinkButton: 'لنک کاپی کریں',
      copiedLinkButton: 'لنک کاپی ہو گیا',
      updatedSuccessMessage: 'آپ کی دکان کامیابی سے اپ ڈیٹ ہو گئی ہے!',
      deletedSuccessMessage: 'آپ کی دکان حذف کر دی گئی ہے۔',
      deleteConfirmTitle: 'کیا آپ واقعی اپنی دکان حذف کرنا چاہتی ہیں؟',
      deleteConfirmMessage:
        'یہ عمل واپس نہیں ہو سکے گا اور آپ کی دکان مستقل طور پر ختم ہو جائے گی۔',
      confirmDeleteButton: 'جی ہاں، حذف کریں',
      cancelDeleteButton: 'نہیں، واپس جائیں',
    },
    admin: {
      heading: 'ایڈمن پینل — تمام دکانیں',
      subtitle: 'پلیٹ فارم کی تمام دکانیں (ظاہر اور چھپی ہوئی) دیکھیں اور منظم کریں۔',
      loadingTitle: 'تمام دکانیں لوڈ ہو رہی ہیں...',
      emptyTitle: 'اس وقت کوئی دکان موجود نہیں ہے۔',
      refreshButton: 'تازہ کریں',
      totalShopsLabel: (count: number) => `کل دکانیں: ${count}`,
      colShopName: 'دکان کا نام',
      colOwnerEmail: 'مالک کا ای میل',
      colCity: 'شہر',
      colStatus: 'حیثیت',
      colActions: 'عمل',
      statusVisible: 'ظاہر (Visible)',
      statusHidden: 'پوشیدہ (Hidden)',
      hideButton: 'چھپائیں',
      unhideButton: 'دکھائیں',
      deleteButton: 'حذف کریں',
      viewShopButton: 'دیکھیں',
      ownerEmailUnknown: 'فراہم نہیں کیا گیا',
      deleteConfirmTitle: 'دکان حذف کرنے کی تصدیق',
      deleteConfirmMessage: (shopName: string) =>
        `کیا آپ واقعی "${shopName}" کو مستقل طور پر حذف کرنا چاہتے ہیں؟`,
      confirmDeleteButton: 'جی ہاں، حذف کریں',
      cancelDeleteButton: 'منسوخ کریں',
      errorLoadFailed: 'دکانوں کی فہرست حاصل کرنے میں مسئلہ پیش آیا۔',
      errorActionFailed: 'عمل مکمل کرنے میں رکاوٹ پیش آئی۔',
    },
    aboutLimitations: {
      pageHeading: 'طریقۂ کار',
      pageSubtitle:
        'ہنر ساتھی آپ کو گھر بیٹھے اپنے ہنر سے کاروبار شروع کرنے میں کس طرح مدد دیتا ہے:',
      stepsHeading: '4 آسان مراحل',
      steps: [
        {
          title: '1. اپنا ہنر، شہر اور تصاویر شامل کریں',
          description:
            'اپنا بنیادی ہنر منتخب کریں، شہر لکھیں اور اپنے ہاتھ سے بنے کام کی 1 سے 4 صاف تصاویر اپ لوڈ کریں۔',
        },
        {
          title: '2. مصنوعات کے آئیڈیاز اور واٹس ایپ پیغام حاصل کریں',
          description:
            'آپ کی تصاویر اور شہر کے مطابق 3 موزوں مصنوعات، ممکنہ خریدار اور اردو میں تیار واٹس ایپ تعارفی پیغام حاصل کریں۔',
        },
        {
          title: '3. اپنے اخراجات سے مناسب قیمت نکالیں',
          description:
            'اپنے سامان کی لاگت، کام کے گھنٹے، فی گھنٹہ محنت اور منافع درج کر کے ہر چیز کی منصفانہ قیمت خود نکالیں۔',
        },
        {
          title: '4. پہلے ہفتے کا منصوبہ اور آن لائن دکان',
          description:
            '7 دن کی عملی فہرست پر عمل کریں اور چاہیں تو اپنی عوامی آن لائن دکان محفوظ کر کے لنک شیئر کریں۔',
        },
      ],
      faqHeading: 'عام سوالات (FAQ)',
      faqs: [
        {
          question: 'کیا میرا رابطہ نمبر سب کو نظر آئے گا؟',
          answer:
            'نہیں۔ آپ کا واٹس ایپ نمبر خفیہ رہتا ہے اور صرف تب دکھایا جاتا ہے جب آپ خود رضامندی کے خانے پر نشان لگاتی ہیں۔',
        },
        {
          question: 'کیا تجویز کردہ قیمتیں درست ہوتی ہیں؟',
          answer:
            'قیمتیں کوئی اندازہ نہیں بلکہ آپ کے اپنے درج کردہ سامان کے خرچ، کام کے گھنٹوں اور منافع کے تناسب سے حساب کی جاتی ہیں۔',
        },
        {
          question: 'کیا یہ سروس مفت ہے؟',
          answer:
            'جی ہاں، ہنر ساتھی کا استعمال، کاروباری رہنمائی، قیمتوں کا حساب اور آن لائن دکان بنانا بالکل مفت ہے۔',
        },
        {
          question: 'کیا میں بعد میں اپنی دکان چھپا یا ختم کر سکتی ہوں؟',
          answer:
            'جی ہاں۔ آپ کسی بھی وقت اپنی دکان کو عارضی طور پر چھپا سکتی ہیں یا مستقل طور پر حذف کر سکتی ہیں۔',
        },
      ],
      heading: 'مصنوعی ذہانت (AI) اور حدود',
      subtitle: 'ہنر ساتھی کے استعمال اور اصولوں کے بارے میں اہم معلومات:',
      items: [
        {
          title: 'اے آئی تجاویز صرف رہنمائی کے لیے ہیں',
          description:
            'اے آئی کی تجاویز صرف رہنمائی کے لیے ہیں اور مالیاتی مشورہ نہیں ہیں۔',
        },
        {
          title: 'آپ کے اپنے اخراجات سے قیمت کا حساب',
          description:
            'قیمتوں کا حساب صارف کے اپنے درج کردہ اخراجات سے لگایا جاتا ہے۔',
        },
        {
          title: 'رضامندی کے ساتھ معلومات کا اشتراک',
          description:
            'ذاتی معلومات صرف آپ کی رضامندی سے شیئر کی جاتی ہیں۔',
        },
        {
          title: 'ابتدائی نمونہ (پروٹوٹائپ)',
          description: 'یہ ایپ ایک ابتدائی نمونہ (پروٹوٹائپ) ہے۔',
        },
      ],
      startCreatingButton: 'ابھی بنانا شروع کریں',
      browseDirectoryButton: 'عوامی دکانوں کی ڈائریکٹری دیکھیں',
      backButton: 'واپس ہوم پر',
    },
    createFlow: {
      stepIndicator: (current: number, total: number) =>
        `مرحلہ ${current} از ${total}`,
      steps: ['ہنر اور تصاویر', 'رہنمائی اور قیمت', 'منصوبہ اور دکان'],
      backToHomeButton: 'واپس ہوم پر',
      backToStep1Button: 'مرحلہ 1 پر واپس جائیں',
    },
    screens: {
      skills: {
        title: 'ہنر کا انتخاب',
        description: 'یہ حصہ اگلے مرحلے میں آپ کے ہنر کی تفصیلات کے لیے تیار ہے۔',
        backButton: 'واپس ہوم پر',
      },
      guide: {
        title: 'طریقۂ کار',
        description: 'یہ حصہ اگلے مرحلے میں قدم بہ قدم رہنمائی کے لیے تیار ہے۔',
        backButton: 'واپس ہوم پر',
      },
    },
  },
  en: {
    lang: 'en',
    dir: 'ltr',
    fontClass: 'font-english',
    appName: 'Hunar Saathi',
    tagline: 'Earn from your skills right from home with simple step-by-step support.',
    startButton: 'Start',
    languageLabel: 'Select language',
    urduLabel: 'اردو',
    englishLabel: 'English',
    navAriaLabel: 'Primary navigation',
    nav: {
      welcome: 'Home',
      skills: 'Create',
      guide: 'Browse Shops',
      myShop: 'My Shop',
      admin: 'Admin',
    },
    homePage: {
      chooseSkillHeading: 'Choose your skill',
      chooseSkillSubtitle: 'Tap a skill to open Create with it selected',
      publicShopsHeading: 'Public shops',
      publicShopsSubtitle:
        'Explore public shops and handmade products by women artisans across Pakistan.',
      publicShopsButton: 'Browse Public Shops',
      whatYouGetHeading: 'What you get',
      whatYouGetItems: [
        {
          title: 'AI product ideas from your photos',
          description:
            'Three practical product suggestions tailored to your handmade work and city.',
        },
        {
          title: 'Fair price calculator',
          description:
            'Calculate transparent prices from your material, time, and packaging costs.',
        },
        {
          title: 'Ready WhatsApp message',
          description:
            'A warm, ready-to-copy Urdu announcement to share with your contacts.',
        },
        {
          title: 'Shareable shop page',
          description:
            'A clean public shop page showcasing your work photos, skill, city, and prices.',
        },
      ],
      trustHeading: 'Built for your trust',
      trustPoints: [
        'Urdu-first experience with instant English toggle',
        'Prices calculated from your own costs',
        'Contact shared only with your consent',
      ],
      sdgFooterTitle: 'Supporting UN Sustainable Development Goals',
      sdgBadges: [
        { number: 'SDG 5', title: 'Gender Equality' },
        { number: 'SDG 8', title: 'Decent Work' },
        { number: 'SDG 1', title: 'No Poverty' },
      ],
    },
    skillInput: {
      heading: 'Tell Us About Your Skill',
      subtitle: 'Select your primary skill, enter your city, and add photos of your past work.',
      skillSectionLabel: 'Select your skill',
      skillOptions: {
        stitching: 'Stitching',
        embroidery: 'Embroidery',
        crafts: 'Crafts',
        cooking: 'Cooking',
        other: 'Other',
      },
      otherSkillLabel: 'Specify your skill',
      otherSkillPlaceholder: 'e.g., Knitting, Baking, Henna...',
      cityLabel: 'Your City',
      cityPlaceholder: 'Enter your city (e.g., Lahore, Karachi, Multan)',
      photosLabel: 'Photos of your past work (1 to 4)',
      photosHelper: 'Upload at least 1 and up to 4 photos of items you have made.',
      addPhotosButton: 'Add Photos',
      maxPhotosReached: 'Maximum 4 photos added',
      compressingText: 'Compressing photo...',
      removePhotoAria: 'Remove photo',
      continueButton: 'Continue',
      photoCountLabel: (count: number, max: number) => `${count} / ${max} photos`,
      uploadError: 'Could not process image. Please try another photo.',
    },
    nextStep: {
      badge: 'Guide Ready',
      heading: 'Your Practical Business Guide',
      subtitle: 'Observations and product ideas based on your work photos and city:',
      loadingTitle: 'Reviewing your skill and photos...',
      loadingSubtitle:
        'Please wait a moment while we prepare practical suggestions based on your work and city.',
      errorTitle: 'Could not load your business guide',
      errorSubtitle:
        'The request failed or returned an invalid format. Please press Try Again.',
      retryButton: 'Try Again',
      skillAndStyleCardTitle: 'Skill Summary & Style Description',
      skillSummaryLabel: 'Skill Summary',
      styleDescriptionLabel: 'Style Description',
      targetCustomersCardTitle: 'Target Customers',
      suggestedProductsHeading: 'Suggested Products',
      productReasonLabel: 'Why this fits your work',
      productDescriptionLabel: 'Description',
      whatsappCardTitle: 'WhatsApp Message',
      whatsappHelper: 'Copy this friendly announcement to share with your contacts on WhatsApp:',
      copyButton: 'Copy',
      copiedButton: 'Copied',
      advisoryNoteUrdu: 'یہ تجاویز صرف رہنمائی کے لیے ہیں، مالیاتی مشورہ نہیں۔',
      advisoryNoteEnglish: 'AI suggestions are advisory and not financial advice.',
      startOverButton: 'Start over',
      editButton: 'Edit Details',
      priceCalculator: {
        calculatePriceButton: 'Calculate price',
        editPriceButton: 'Edit price',
        closeCalculatorButton: 'Close',
        materialCostLabel: 'Material cost (PKR)',
        materialCostPlaceholder: 'e.g. 500',
        hoursLabel: 'Hours of work',
        hoursPlaceholder: 'e.g. 3',
        hourlyRateLabel: 'Your hourly rate (PKR)',
        hourlyRatePlaceholder: 'e.g. 250',
        otherCostsLabel: 'Packaging and other costs (PKR)',
        otherCostsPlaceholder: 'e.g. 50',
        marginPercentLabel: 'Profit margin (%)',
        marginPercentPlaceholder: 'e.g. 20',
        breakdownHeading: 'Line-by-Line Breakdown',
        breakdownMaterials: 'Material cost',
        breakdownLabor: (hours: number, rate: number) =>
          `Work (${hours} hrs × PKR ${rate}/hr)`,
        breakdownOther: 'Packaging & other costs',
        breakdownBaseCost: 'Total base cost',
        breakdownProfit: (margin: number) => `Profit margin (${margin}%)`,
        finalPriceLabel: 'Final Price',
        ownCostsLabelUrdu: 'آپ کے اپنے اخراجات سے حساب کردہ',
        ownCostsLabelEnglish: 'Calculated from your own costs',
        savePriceButton: 'Save price',
        savedPriceHeading: 'Saved Product Price',
        validationEmpty: 'This field cannot be empty.',
        validationNegative: 'Value cannot be negative.',
        validationInvalid: 'Please enter a valid number.',
        validationSummary: 'Fill all fields with non-negative numbers to calculate and save the price.',
      },
      saveShop: {
        cardTitle: 'Save Your Shop',
        cardSubtitle:
          'Publish a public shop page showing your name, skill, city, products, prices, and work photos.',
        shopNameLabel: 'Your Name or Shop Name',
        shopNamePlaceholder: 'e.g. Fatima Hand Embroidery',
        agreeCheckboxLabelUrdu: 'میں اپنی رابطے کی معلومات شیئر کرنے پر رضامند ہوں',
        agreeCheckboxLabelEnglish: 'I agree to share my contact details',
        whatsappNumberLabel: 'WhatsApp Number (Optional)',
        whatsappNumberPlaceholder: 'e.g. 03001234567',
        whatsappOnlyStoredNote:
          'Only stored if you check "I agree to share my contact details".',
        saveShopButton: 'Save shop',
        savingShopButton: 'Saving shop...',
        updateShopButton: 'Update shop',
        loginToSavePrompt:
          'Please log in or register to save your shop. Your entered photos, ideas, and prices will be kept safe.',
        loginToSaveButton: 'Log in or Register to Save Shop',
        shopSavedTitle: 'Your shop is saved!',
        viewPublicShopButton: 'View public shop',
        copyShopLinkButton: 'Copy shop link',
        copiedShopLinkButton: 'Link copied',
        hideShopButton: 'Hide shop',
        unhideShopButton: 'Unhide shop',
        deleteShopButton: 'Delete shop',
        shopHiddenStatus: 'This shop is currently hidden from public visitors.',
        shopDeletedMessage: 'Your shop has been deleted.',
        errorShopNameEmpty: 'Please enter your name or shop name.',
        errorInvalidWhatsapp: 'Please enter a valid WhatsApp phone number.',
        errorSaveFailed: 'Could not save your shop. Please try again.',
      },
      firstWeekPlan: {
        cardTitle: 'First Week Plan',
        cardSubtitle:
          'Get a 7-day checklist of simple, practical actions to start sharing your work from home.',
        openPlanButton: 'First week plan',
        hidePlanButton: 'Hide checklist',
        showPlanButton: 'First week plan',
        loadingText: 'Creating your 7-day practical checklist...',
        errorText:
          'Could not generate the 7-day checklist. Please try again.',
        retryButton: 'Try Again',
        progressLabel: (completed: number, total: number) =>
          `${completed} / ${total} completed`,
        dayLabel: (day: number) => `Day ${day}`,
      },
    },
    publicShop: {
      loadingTitle: 'Loading shop page...',
      notFoundTitle: 'Shop Not Found',
      notFoundSubtitle: 'This shop does not exist or has been removed.',
      hiddenTitle: 'This shop is currently hidden',
      hiddenSubtitle: 'The shop owner has temporarily hidden this shop page.',
      skillLabel: 'Skill',
      cityLabel: 'City',
      productsHeading: 'Products & Prices',
      workPhotosHeading: 'Work Gallery',
      priceNotSet: 'Price on request',
      contactWhatsappButtonUrdu: 'واٹس ایپ پر رابطہ کریں',
      contactWhatsappButtonEnglish: 'Contact on WhatsApp',
      manageShopHeading: 'Manage Shop',
      editShopButton: 'Edit shop',
      hideShopButton: 'Hide shop',
      unhideShopButton: 'Unhide shop',
      deleteShopButton: 'Delete shop',
      backToAppButton: 'Back to Hunar Saathi',
      errorActionFailed: 'Could not complete this action. Please try again.',
    },
    directory: {
      heading: 'Browse Shops',
      subtitle: 'Browse visible public shops by skill and city across Pakistan.',
      sampleDataBadgeUrdu: 'نمونہ ڈیٹا',
      sampleDataBadgeEnglish: 'Sample data',
      skillFilterLabel: 'Filter by skill',
      allSkillsOption: 'All skills',
      cityFilterLabel: 'Filter by city',
      allCitiesOption: 'All cities',
      priceRangeLabel: 'Price range',
      priceNotSet: 'Price on request',
      openShopLabel: 'Open shop',
      ownerBadgeLabel: 'Your Shop',
      editShopButton: 'Edit',
      hideShopButton: 'Hide',
      unhideShopButton: 'Unhide',
      deleteShopButton: 'Delete',
      noMatchingShops: 'No public shops match the selected skill and city filters.',
      resetFiltersButton: 'Reset filters',
      loadingTitle: 'Loading public shops...',
      browseDirectoryButton: 'Browse Shops',
      errorLoadFailed: 'Could not refresh live shops. Please try again.',
      retryButton: 'Try Again',
    },
    auth: {
      loginNavButton: 'Login',
      logoutNavButton: 'Logout',
      loginTab: 'Login',
      registerTab: 'Register',
      loginHeading: 'Log in to your account',
      loginSubtitle: 'Enter your email and password to manage your shop.',
      registerHeading: 'Create your account',
      registerSubtitle: 'Register to save and manage your shop on Hunar Saathi.',
      returnNoticeBanner:
        'Once you log in or register, you will return right back to your work without losing any entered details.',
      nameLabel: 'Your Name',
      namePlaceholder: 'e.g. Fatima Bibi',
      emailLabel: 'Email Address',
      emailPlaceholder: 'name@example.com',
      passwordLabel: 'Password',
      passwordPlaceholder: 'At least 6 characters',
      confirmPasswordLabel: 'Confirm Password',
      confirmPasswordPlaceholder: 'Re-enter your password',
      passwordHelper: 'Password must be at least 6 characters.',
      loginSubmitButton: 'Login',
      loggingInButton: 'Logging in...',
      registerSubmitButton: 'Register',
      registeringButton: 'Creating account...',
      switchToRegisterPrompt: "Don't have an account?",
      switchToRegisterAction: 'Register here',
      switchToLoginPrompt: 'Already have an account?',
      switchToLoginAction: 'Login here',
      backButton: 'Go Back',
      errorNameEmpty: 'Please enter your name.',
      errorEmailInvalid: 'Please enter a valid email address.',
      errorPasswordShort: 'Password must be at least 6 characters.',
      errorPasswordMismatch: 'Passwords do not match.',
      errorWrongPassword: 'Incorrect email or password. Please try again.',
      errorEmailInUse: 'This email is already in use. Please log in instead.',
      errorWeakPassword: 'Weak password. Please enter at least 6 characters.',
      errorProviderNotEnabled:
        'Email/Password sign-in is not enabled yet in Firebase Console (Authentication → Sign-in method → Email/Password). Please enable it first.',
      errorGeneric: 'Authentication failed. Please try again.',
      permissionDeniedTitle: 'Permission Denied',
      permissionDeniedSubtitle: 'You do not have permission to view or manage this page.',
      loginRequiredTitle: 'Login Required',
      loginRequiredSubtitle: 'Please log in to view and manage your shop.',
    },
    myShop: {
      heading: 'My Shop',
      subtitle: 'View, edit, hide/unhide, or delete your personal shop.',
      loadingTitle: 'Loading your shop...',
      emptyTitle: 'You do not have a shop yet',
      emptySubtitle:
        'Share your skill, city, and work photos to create your public shop in minutes.',
      createYourShopButton: 'Create your shop',
      statusLabel: 'Status:',
      statusVisible: 'Visible in Browse Shops',
      statusHidden: 'Hidden from public',
      editShopButton: 'Edit',
      cancelEditButton: 'Cancel',
      saveChangesButton: 'Save changes',
      savingChangesButton: 'Saving...',
      hideShopButton: 'Hide',
      unhideShopButton: 'Unhide',
      deleteShopButton: 'Delete',
      viewPublicPageButton: 'View public shop page',
      copyLinkButton: 'Copy shop link',
      copiedLinkButton: 'Link copied',
      updatedSuccessMessage: 'Your shop has been updated!',
      deletedSuccessMessage: 'Your shop has been deleted.',
      deleteConfirmTitle: 'Delete your shop?',
      deleteConfirmMessage:
        'Are you sure you want to permanently delete your shop? This action cannot be undone.',
      confirmDeleteButton: 'Yes, delete shop',
      cancelDeleteButton: 'Cancel',
    },
    admin: {
      heading: 'Admin Panel — All Shops',
      subtitle: 'View and manage all shops across Hunar Saathi (including hidden shops).',
      loadingTitle: 'Loading all shops...',
      emptyTitle: 'No shops found.',
      refreshButton: 'Refresh',
      totalShopsLabel: (count: number) => `Total shops: ${count}`,
      colShopName: 'Shop Name',
      colOwnerEmail: 'Owner Email',
      colCity: 'City',
      colStatus: 'Status',
      colActions: 'Actions',
      statusVisible: 'Visible',
      statusHidden: 'Hidden',
      hideButton: 'Hide',
      unhideButton: 'Unhide',
      deleteButton: 'Delete',
      viewShopButton: 'View',
      ownerEmailUnknown: 'Not provided',
      deleteConfirmTitle: 'Confirm Shop Deletion',
      deleteConfirmMessage: (shopName: string) =>
        `Are you sure you want to permanently delete "${shopName}"?`,
      confirmDeleteButton: 'Yes, delete',
      cancelDeleteButton: 'Cancel',
      errorLoadFailed: 'Could not load shops list.',
      errorActionFailed: 'Could not complete action.',
    },
    aboutLimitations: {
      pageHeading: 'How it works',
      pageSubtitle:
        'How Hunar Saathi helps you turn your home skill into a practical small business:',
      stepsHeading: 'How It Works in 4 Steps',
      steps: [
        {
          title: '1. Share your skill, city, and work photos',
          description:
            'Pick your primary skill, enter your city, and upload 1 to 4 clear photos of items you have made.',
        },
        {
          title: '2. Get product ideas & a WhatsApp intro',
          description:
            'Receive 3 tailored product suggestions, target customer insights, and a ready-to-share Urdu WhatsApp message.',
        },
        {
          title: '3. Calculate fair prices from your costs',
          description:
            'Enter your material costs, work hours, hourly rate, and profit margin to calculate a transparent price for each item.',
        },
        {
          title: '4. Follow your 7-day plan & save your shop',
          description:
            'Tick off simple daily actions in your First Week Plan and optionally publish a public shop page.',
        },
      ],
      faqHeading: 'Frequently Asked Questions',
      faqs: [
        {
          question: 'Is my contact shared publicly?',
          answer:
            'No. Your WhatsApp number stays hidden unless you explicitly check the consent box agreeing to share your contact details.',
        },
        {
          question: 'Are prices accurate?',
          answer:
            "Prices are calculated directly from the user's own material costs, work hours, hourly rate, and chosen profit margin.",
        },
        {
          question: 'Is it free?',
          answer:
            'Yes. Hunar Saathi is free to use for generating product suggestions, calculating prices, and saving your shop page.',
        },
        {
          question: 'Can I hide or delete my shop later?',
          answer:
            'Yes. You can hide, unhide, or permanently delete your public shop page at any time from your device.',
        },
      ],
      heading: 'AI & limitations',
      subtitle: 'Important information about how Hunar Saathi works:',
      items: [
        {
          title: 'Advisory AI Suggestions',
          description: 'AI outputs are suggestions and not financial advice.',
        },
        {
          title: 'Cost-Based Price Calculation',
          description: "Prices are calculated from the user's own costs.",
        },
        {
          title: 'Consent-Only Data Sharing',
          description: 'Personal data is shared only with consent.',
        },
        {
          title: 'Prototype Notice',
          description: 'This is a prototype.',
        },
      ],
      startCreatingButton: 'Start Creating',
      browseDirectoryButton: 'Browse Public Shops Directory',
      backButton: 'Back to Home',
    },
    createFlow: {
      stepIndicator: (current: number, total: number) =>
        `Step ${current} of ${total}`,
      steps: ['Skill & Photos', 'Guide & Pricing', 'Plan & Shop'],
      backToHomeButton: 'Back to Home',
      backToStep1Button: 'Back to Step 1',
    },
    screens: {
      skills: {
        title: 'Create',
        description: 'This screen slot is ready for upcoming skill selection modules.',
        backButton: 'Back to Home',
      },
      guide: {
        title: 'How it works',
        description: 'This screen slot is ready for upcoming earning guidance modules.',
        backButton: 'Back to Home',
      },
    },
  },
};

export function getTranslation(lang: Language): TranslationContent {
  return TRANSLATIONS[lang] ?? TRANSLATIONS[DEFAULT_LANGUAGE];
}

export function toggleLanguageValue(current: Language): Language {
  return current === 'ur' ? 'en' : 'ur';
}
