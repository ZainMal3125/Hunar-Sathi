/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { AboutLimitationsScreen } from './components/AboutLimitationsScreen';
import { BottomNav } from './components/BottomNav';
import { NextStepScreen } from './components/NextStepScreen';
import { PublicShopScreen } from './components/PublicShopScreen';
import { ShopDirectoryScreen } from './components/ShopDirectoryScreen';
import { SkillInputScreen } from './components/SkillInputScreen';
import { TopBar } from './components/TopBar';
import { WelcomeScreen } from './components/WelcomeScreen';
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
  isDirectoryPath,
  parseShopIdFromLocation,
  ShopRecord,
} from './utils/shopManager';
import {
  getResolvedSkillDisplay,
  INITIAL_SKILL_FORM_STATE,
  SkillFormState,
} from './utils/skillForm';

export default function App() {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
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
  const [activeScreen, setActiveScreen] = useState<ScreenId>(() =>
    typeof window !== 'undefined'
      ? resolveInitialScreen(window.location.search, window.location.hash)
      : 'welcome'
  );
  const [skillForm, setSkillForm] = useState<SkillFormState>(
    INITIAL_SKILL_FORM_STATE
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] =
    useState<BusinessGuideResponse | null>(null);
  const [savedShop, setSavedShop] = useState<ShopRecord | null>(null);

  const content = getTranslation(language);

  useEffect(() => {
    document.documentElement.lang = content.lang;
    document.documentElement.dir = content.dir;
  }, [content.lang, content.dir]);

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
      setPublicShopId(shopIdFromUrl);
      setIsDirectory(!shopIdFromUrl && directoryFromUrl);
      setIsAboutRoute(!shopIdFromUrl && !directoryFromUrl && aboutFromUrl);
      if (directoryFromUrl) {
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
    setPublicShopId(null);
    setIsAboutRoute(false);
    setIsDirectory(screen === 'guide');
    setActiveScreen(screen);
    if (typeof window !== 'undefined') {
      const urlMap: Record<ScreenId, string> = {
        welcome: '/#home',
        skills: '/#create',
        guide: '/directory',
      };
      window.history.pushState(null, '', urlMap[screen]);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const handleOpenPublicShop = (shopId: string) => {
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
    setIsSubmitted(false);
    setIsAnalyzing(false);
    setAnalysisError(null);
    setAnalysisResult(null);
    setSavedShop(null);
    handleNavigate('skills');
  };

  const effectiveActiveTab: ScreenId | null = publicShopId
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
      className={`${content.fontClass} min-h-dvh w-full bg-[var(--color-surface)]/45 text-[var(--color-text)] selection:bg-[var(--color-primary)] selection:text-white`}
    >
      <div
        data-testid="app-container"
        className="mx-auto flex min-h-dvh w-full max-w-[500px] flex-col border-x border-[var(--color-border)]/70 bg-[var(--color-canvas)] shadow-xs"
      >
        <TopBar
          language={language}
          content={content}
          onLanguageChange={setLanguage}
          onBrandClick={() => handleNavigate('welcome')}
        />

        <main className="flex flex-1 flex-col justify-center">
          {publicShopId ? (
            <PublicShopScreen
              shopId={publicShopId}
              content={content}
              onBackToApp={handleBackFromPublicShop}
              onOpenDirectory={handleOpenDirectory}
              onShopUpdated={setSavedShop}
            />
          ) : isAboutRoute ? (
            <AboutLimitationsScreen
              content={content}
              onBackToWelcome={() => handleNavigate('welcome')}
              onStartCreating={handleStart}
              onOpenDirectory={handleOpenDirectory}
            />
          ) : isDirectory || activeScreen === 'guide' ? (
            <ShopDirectoryScreen
              content={content}
              onSelectShop={handleOpenPublicShop}
              onBackToApp={() => handleNavigate('welcome')}
            />
          ) : activeScreen === 'welcome' ? (
            <WelcomeScreen
              content={content}
              onStart={handleStart}
              onSelectSkill={handleSelectSkillFromHome}
              onOpenDirectory={handleOpenDirectory}
            />
          ) : isSubmitted ? (
            <NextStepScreen
              content={content}
              formState={skillForm}
              isLoading={isAnalyzing}
              error={analysisError}
              result={analysisResult}
              savedShop={savedShop}
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
          onNavigate={handleNavigate}
        />
      </div>
    </div>
  );
}

