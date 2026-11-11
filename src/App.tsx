/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { AboutLimitationsScreen } from './components/AboutLimitationsScreen';
import { AdminShopsScreen } from './components/AdminShopsScreen';
import { AuthScreen } from './components/AuthScreen';
import { BottomNav } from './components/BottomNav';
import { MyShopScreen } from './components/MyShopScreen';
import {
  NextStepScreen,
  SavedProductPriceState,
} from './components/NextStepScreen';
import { PublicShopScreen } from './components/PublicShopScreen';
import { DraftSaveShopFields } from './components/SaveShopSection';
import { ShopDirectoryScreen } from './components/ShopDirectoryScreen';
import { SkillInputScreen } from './components/SkillInputScreen';
import { TopBar } from './components/TopBar';
import { WelcomeScreen } from './components/WelcomeScreen';
import {
  auth,
  getMyShopFromFirestore,
  getUserProfileFromFirestore,
  logoutUser,
  onAuthStateChanged,
} from './firebase';
import {
  DEFAULT_LANGUAGE,
  getTranslation,
  Language,
  ScreenId,
  SkillOptionId,
  TRANSLATIONS,
} from './i18n/translations';
import {
  getNextScreenOnStart,
  resolveInitialScreen,
} from './navigation/routes';
import {
  BusinessGuideResponse,
  validateBusinessGuideObject,
} from './utils/businessGuide';
import { clearFirstWeekPlanStorage } from './utils/firstWeekPlan';
import {
  isAboutPath,
  isAdminPath,
  isAuthPath,
  isDirectoryPath,
  isMyShopPath,
  parseShopIdFromLocation,
  ShopRecord,
  UserProfile,
} from './utils/shopManager';
import {
  getResolvedSkillDisplay,
  INITIAL_SKILL_FORM_STATE,
  SkillFormState,
} from './utils/skillForm';

const INITIAL_DRAFT_SAVE_SHOP: DraftSaveShopFields = {
  shopName: '',
  agreeToShareContact: false,
  whatsappNumber: '',
};

export default function App() {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isAuthScreenOpen, setIsAuthScreenOpen] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? isAuthPath(window.location.pathname, window.location.hash)
      : false
  );
  const [isReturningToCreate, setIsReturningToCreate] =
    useState<boolean>(false);

  const [publicShopId, setPublicShopId] = useState<string | null>(() =>
    typeof window !== 'undefined'
      ? parseShopIdFromLocation(window.location.pathname, window.location.hash)
      : null
  );
  const [isDirectory, setIsDirectory] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? isDirectoryPath(window.location.pathname, window.location.hash)
      : false
  );
  const [isAboutRoute, setIsAboutRoute] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? isAboutPath(window.location.pathname, window.location.hash)
      : false
  );
  const [activeScreen, setActiveScreen] = useState<ScreenId>(() => {
    if (typeof window === 'undefined') return 'welcome';
    if (isMyShopPath(window.location.pathname, window.location.hash)) {
      return 'myShop';
    }
    if (isAdminPath(window.location.pathname, window.location.hash)) {
      return 'admin';
    }
    if (isDirectoryPath(window.location.pathname, window.location.hash)) {
      return 'guide';
    }
    return resolveInitialScreen(window.location.search, window.location.hash);
  });

  const [skillForm, setSkillForm] = useState<SkillFormState>(
    INITIAL_SKILL_FORM_STATE
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] =
    useState<BusinessGuideResponse | null>(null);
  const [savedPrices, setSavedPrices] = useState<
    Record<number, SavedProductPriceState>
  >({});
  const [draftSaveShop, setDraftSaveShop] = useState<DraftSaveShopFields>(
    INITIAL_DRAFT_SAVE_SHOP
  );
  const [savedShop, setSavedShop] = useState<ShopRecord | null>(null);

  const content = getTranslation(language);

  useEffect(() => {
    document.documentElement.lang = content.lang;
    document.documentElement.dir = content.dir;
  }, [content.lang, content.dir]);

  // Keep user logged in across page refreshes and sync profile + shop
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUserProfile(null);
        setSavedShop(null);
        setIsAuthReady(true);
        return;
      }

      try {
        const profile = await getUserProfileFromFirestore(
          firebaseUser.uid,
          firebaseUser.email,
          firebaseUser.displayName
        );
        setUserProfile(profile);

        const existingShop = await getMyShopFromFirestore(firebaseUser.uid);
        if (existingShop) {
          setSavedShop(existingShop);
        }
      } catch {
        setUserProfile({
          uid: firebaseUser.uid,
          name:
            firebaseUser.displayName ||
            firebaseUser.email?.split('@')[0] ||
            'Artisan',
          email: firebaseUser.email || '',
          role: 'user',
        });
      } finally {
        setIsAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const syncRouteFromLocation = () => {
      const shopIdFromUrl = parseShopIdFromLocation(
        window.location.pathname,
        window.location.hash
      );
      const directoryFromUrl = isDirectoryPath(
        window.location.pathname,
        window.location.hash
      );
      const aboutFromUrl = isAboutPath(
        window.location.pathname,
        window.location.hash
      );
      const myShopFromUrl = isMyShopPath(
        window.location.pathname,
        window.location.hash
      );
      const adminFromUrl = isAdminPath(
        window.location.pathname,
        window.location.hash
      );
      const authFromUrl = isAuthPath(
        window.location.pathname,
        window.location.hash
      );

      setIsAuthScreenOpen(authFromUrl);
      setPublicShopId(shopIdFromUrl);
      setIsDirectory(!shopIdFromUrl && directoryFromUrl);
      setIsAboutRoute(!shopIdFromUrl && !directoryFromUrl && aboutFromUrl);

      if (myShopFromUrl) {
        setActiveScreen('myShop');
      } else if (adminFromUrl) {
        setActiveScreen('admin');
      } else if (directoryFromUrl) {
        setActiveScreen('guide');
      } else if (!shopIdFromUrl && !aboutFromUrl) {
        const next = resolveInitialScreen(
          window.location.search,
          window.location.hash
        );
        setActiveScreen(next);
      }
    };
    window.addEventListener('hashchange', syncRouteFromLocation);
    window.addEventListener('popstate', syncRouteFromLocation);
    return () => {
      window.removeEventListener('hashchange', syncRouteFromLocation);
      window.removeEventListener('popstate', syncRouteFromLocation);
    };
  }, []);

  const handleNavigate = (screen: ScreenId) => {
    setIsAuthScreenOpen(false);
    setIsReturningToCreate(false);
    setPublicShopId(null);
    setIsAboutRoute(false);
    setIsDirectory(screen === 'guide');
    setActiveScreen(screen);
    if (typeof window !== 'undefined') {
      const urlMap: Record<ScreenId, string> = {
        welcome: '/#home',
        skills: '/#create',
        guide: '/directory',
        myShop: '/my-shop',
        admin: '/admin',
      };
      window.history.pushState(null, '', urlMap[screen]);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const handleOpenAuth = () => {
    setIsReturningToCreate(false);
    setIsAuthScreenOpen(true);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const handleRequireAuthFromCreate = () => {
    setIsReturningToCreate(true);
    setIsAuthScreenOpen(true);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const handleAuthSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    setIsAuthScreenOpen(false);
    if (isReturningToCreate) {
      setIsReturningToCreate(false);
      // Keep activeScreen === 'skills' and isSubmitted === true so user returns directly to her Create results & SaveShopSection
      setActiveScreen('skills');
      setPublicShopId(null);
      setIsDirectory(false);
      setIsAboutRoute(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUserProfile(null);
    setSavedShop(null);
    if (activeScreen === 'myShop' || activeScreen === 'admin') {
      handleNavigate('welcome');
    }
  };

  const handleOpenPublicShop = (shopId: string) => {
    setIsAuthScreenOpen(false);
    setIsDirectory(false);
    setIsAboutRoute(false);
    setPublicShopId(shopId);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/shop/${shopId}`);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const handleOpenDirectory = () => {
    handleNavigate('guide');
  };

  const handleBackFromPublicShop = () => {
    setPublicShopId(null);
    setIsDirectory(false);
    setIsAboutRoute(false);
    const targetScreen = isSubmitted ? 'skills' : 'welcome';
    handleNavigate(targetScreen);
  };

  const handleStart = () => {
    setIsSubmitted(false);
    handleNavigate(getNextScreenOnStart());
  };

  const handleSelectSkillFromHome = (skillId: SkillOptionId) => {
    setSkillForm((prev) => ({
      ...prev,
      skillId,
    }));
    setIsSubmitted(false);
    handleNavigate(getNextScreenOnStart());
  };

  const handleBackToStep1 = () => {
    setIsSubmitted(false);
    setIsAnalyzing(false);
    setAnalysisError(null);
    handleNavigate('skills');
  };

  const runSkillAnalysis = useCallback(async (formToSubmit: SkillFormState) => {
    setIsSubmitted(true);
    setIsAnalyzing(true);
    setAnalysisError(null);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    try {
      const enSkill = getResolvedSkillDisplay(formToSubmit, TRANSLATIONS.en);
      const urSkill = getResolvedSkillDisplay(formToSubmit, TRANSLATIONS.ur);
      const combinedSkill = `${enSkill} (${urSkill})`;

      const response = await fetch('/api/analyze-skill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skill: combinedSkill,
          city: formToSubmit.city.trim(),
          photos: formToSubmit.photos.map((photo) => ({
            dataUrl: photo.dataUrl,
            name: photo.name,
          })),
        }),
      });

      if (!response.ok) {
        let errorMessage = `Request failed (${response.status})`;
        try {
          const errJson = (await response.json()) as { error?: string };
          if (errJson?.error) {
            errorMessage = errJson.error;
          }
        } catch {
          // ignore JSON parse failure on error body
        }
        throw new Error(errorMessage);
      }

      const payload = (await response.json()) as { result?: unknown };
      const validated = validateBusinessGuideObject(payload?.result);
      setAnalysisResult(validated);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Could not analyze skill details';
      setAnalysisError(msg);
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const handleStartOver = () => {
    clearFirstWeekPlanStorage();
    setSkillForm(INITIAL_SKILL_FORM_STATE);
    setSavedPrices({});
    setDraftSaveShop(INITIAL_DRAFT_SAVE_SHOP);
    setIsSubmitted(false);
    setIsAnalyzing(false);
    setAnalysisError(null);
    setAnalysisResult(null);
    handleNavigate('skills');
  };

  const effectiveActiveTab: ScreenId | null = isAuthScreenOpen
    ? null
    : publicShopId
    ? null
    : isAboutRoute
    ? null
    : isDirectory
    ? 'guide'
    : activeScreen;

  return (
    <div
      lang={content.lang}
      dir={content.dir}
      data-auth-ready={isAuthReady ? 'true' : 'false'}
      className={`${content.fontClass} min-h-dvh w-full bg-[var(--color-surface)]/45 text-[var(--color-text)] selection:bg-[var(--color-primary)] selection:text-white`}
    >
      <div
        data-testid="app-container"
        className="mx-auto flex min-h-dvh w-full max-w-[500px] flex-col border-x border-[var(--color-border)]/70 bg-[var(--color-canvas)] shadow-xs"
      >
        <TopBar
          language={language}
          content={content}
          userProfile={userProfile}
          onLanguageChange={setLanguage}
          onBrandClick={() => handleNavigate('welcome')}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
        />

        <main className="flex flex-1 flex-col justify-center">
          {isAuthScreenOpen ? (
            <AuthScreen
              content={content}
              isReturningToCreate={isReturningToCreate}
              onAuthSuccess={handleAuthSuccess}
              onCancel={() => {
                setIsAuthScreenOpen(false);
                setIsReturningToCreate(false);
              }}
            />
          ) : publicShopId ? (
            <PublicShopScreen
              shopId={publicShopId}
              content={content}
              userProfile={userProfile}
              onBackToApp={handleBackFromPublicShop}
              onOpenDirectory={handleOpenDirectory}
              onEditMyShop={() => handleNavigate('myShop')}
              onShopUpdated={setSavedShop}
            />
          ) : isAboutRoute ? (
            <AboutLimitationsScreen
              content={content}
              onBackToWelcome={() => handleNavigate('welcome')}
              onStartCreating={handleStart}
              onOpenDirectory={handleOpenDirectory}
            />
          ) : activeScreen === 'myShop' ? (
            <MyShopScreen
              content={content}
              userProfile={userProfile}
              onStartCreateFlow={handleStart}
              onOpenPublicShop={handleOpenPublicShop}
              onRequireLogin={handleOpenAuth}
              onShopChanged={setSavedShop}
            />
          ) : activeScreen === 'admin' ? (
            <AdminShopsScreen
              content={content}
              userProfile={userProfile}
              onSelectShop={handleOpenPublicShop}
              onBackToHome={() => handleNavigate('welcome')}
            />
          ) : isDirectory || activeScreen === 'guide' ? (
            <ShopDirectoryScreen
              content={content}
              userProfile={userProfile}
              onSelectShop={handleOpenPublicShop}
              onEditMyShop={() => handleNavigate('myShop')}
              onShopChanged={setSavedShop}
              onBackToApp={() => handleNavigate('welcome')}
            />
          ) : activeScreen === 'welcome' ? (
            <WelcomeScreen
              content={content}
              onStart={handleStart}
              onSelectSkill={handleSelectSkillFromHome}
            />
          ) : isSubmitted ? (
            <NextStepScreen
              content={content}
              userProfile={userProfile}
              formState={skillForm}
              isLoading={isAnalyzing}
              error={analysisError}
              result={analysisResult}
              savedShop={savedShop}
              savedPrices={savedPrices}
              onSavedPricesChange={setSavedPrices}
              draftSaveShop={draftSaveShop}
              onDraftSaveShopChange={setDraftSaveShop}
              onRequireAuthForSave={handleRequireAuthFromCreate}
              onShopSaved={setSavedShop}
              onOpenPublicShop={handleOpenPublicShop}
              onRetry={() => runSkillAnalysis(skillForm)}
              onStartOver={handleStartOver}
              onBackToStep1={handleBackToStep1}
              onBackToHome={() => handleNavigate('welcome')}
            />
          ) : (
            <SkillInputScreen
              content={content}
              formState={skillForm}
              onChange={setSkillForm}
              onContinue={() => runSkillAnalysis(skillForm)}
              onBackToHome={() => handleNavigate('welcome')}
            />
          )}
        </main>

        <BottomNav
          activeScreen={effectiveActiveTab}
          content={content}
          isLoggedIn={Boolean(userProfile)}
          isAdmin={userProfile?.role === 'admin'}
          onNavigate={handleNavigate}
        />
      </div>
    </div>
  );
}
