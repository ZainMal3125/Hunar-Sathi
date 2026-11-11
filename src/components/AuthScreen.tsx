import { FormEvent, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Lock,
  LogIn,
  Mail,
  User as UserIcon,
  UserPlus,
} from 'lucide-react';
import { loginUserWithEmail, registerUserWithEmail } from '../firebase';
import { TranslationContent } from '../i18n/translations';
import {
  UserProfile,
  validateLoginInput,
  validateRegisterInput,
} from '../utils/shopManager';

interface AuthScreenProps {
  content: TranslationContent;
  initialMode?: 'login' | 'register';
  isReturningToCreate?: boolean;
  onAuthSuccess: (profile: UserProfile) => void;
  onCancel: () => void;
}

function mapFirebaseAuthError(
  error: unknown,
  authLabels: TranslationContent['auth']
): string {
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
      ? (error as { code: string }).code
      : error instanceof Error
      ? error.message
      : '';

  if (
    code.includes('auth/wrong-password') ||
    code.includes('auth/invalid-credential') ||
    code.includes('auth/user-not-found') ||
    code.includes('INVALID_LOGIN_CREDENTIALS')
  ) {
    return authLabels.errorWrongPassword;
  }
  if (
    code.includes('auth/email-already-in-use') ||
    code.includes('EMAIL_EXISTS')
  ) {
    return authLabels.errorEmailInUse;
  }
  if (code.includes('auth/weak-password') || code.includes('WEAK_PASSWORD')) {
    return authLabels.errorWeakPassword;
  }
  if (
    code.includes('auth/operation-not-allowed') ||
    code.includes('OPERATION_NOT_ALLOWED')
  ) {
    return authLabels.errorProviderNotEnabled;
  }
  if (code.includes('auth/invalid-email') || code.includes('INVALID_EMAIL')) {
    return authLabels.errorEmailInvalid;
  }
  return authLabels.errorGeneric;
}

export function AuthScreen({
  content,
  initialMode = 'login',
  isReturningToCreate = false,
  onAuthSuccess,
  onCancel,
}: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const labels = content.auth;
  const isRtl = content.dir === 'rtl';

  const switchMode = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'register') {
      const validation = validateRegisterInput({
        name,
        email,
        password,
        confirmPassword,
      });
      if (!validation.isValid) {
        if (validation.errorKey === 'nameEmpty') {
          setErrorMessage(labels.errorNameEmpty);
        } else if (validation.errorKey === 'emailInvalid') {
          setErrorMessage(labels.errorEmailInvalid);
        } else if (validation.errorKey === 'passwordShort') {
          setErrorMessage(labels.errorPasswordShort);
        } else {
          setErrorMessage(labels.errorPasswordMismatch);
        }
        return;
      }

      setIsSubmitting(true);
      try {
        const profile = await registerUserWithEmail(name, email, password);
        onAuthSuccess(profile);
      } catch (err) {
        setErrorMessage(mapFirebaseAuthError(err, labels));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const validation = validateLoginInput(email, password);
      if (!validation.isValid) {
        if (validation.errorKey === 'emailInvalid') {
          setErrorMessage(labels.errorEmailInvalid);
        } else {
          setErrorMessage(labels.errorPasswordShort);
        }
        return;
      }

      setIsSubmitting(true);
      try {
        const profile = await loginUserWithEmail(email, password);
        onAuthSuccess(profile);
      } catch (err) {
        setErrorMessage(mapFirebaseAuthError(err, labels));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <section
      aria-labelledby="auth-heading"
      data-testid="auth-screen"
      className="mx-auto flex w-full max-w-[500px] flex-1 flex-col gap-6 px-5 py-7 sm:px-6 sm:py-9"
    >
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          id="auth-back-btn"
          data-testid="auth-back-btn"
          onClick={onCancel}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-bold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-border)]"
        >
          {isRtl ? (
            <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
          ) : (
            <ArrowLeft aria-hidden="true" className="h-4 w-4 shrink-0" />
          )}
          <span>{labels.backButton}</span>
        </button>
      </div>

      {/* Return to Create Banner */}
      {isReturningToCreate && (
        <div
          role="status"
          data-testid="auth-return-banner"
          className="rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-surface)] px-5 py-4 text-base font-bold text-[var(--color-primary)]"
        >
          {labels.returnNoticeBanner}
        </div>
      )}

      {/* Auth Card */}
      <article className="animate-fade-in flex flex-col gap-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-xs sm:p-8">
        {/* Login / Register Mode Switcher */}
        <div
          role="tablist"
          className="grid grid-cols-2 gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] p-1.5"
        >
          <button
            type="button"
            role="tab"
            id="auth-tab-login"
            data-testid="auth-tab-login"
            aria-selected={mode === 'login'}
            onClick={() => switchMode('login')}
            className={`min-h-[48px] rounded-xl px-4 py-2.5 text-base font-bold transition-colors whitespace-nowrap ${
              mode === 'login'
                ? 'bg-[var(--color-primary)] text-white shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {labels.loginTab}
          </button>

          <button
            type="button"
            role="tab"
            id="auth-tab-register"
            data-testid="auth-tab-register"
            aria-selected={mode === 'register'}
            onClick={() => switchMode('register')}
            className={`min-h-[48px] rounded-xl px-4 py-2.5 text-base font-bold transition-colors whitespace-nowrap ${
              mode === 'register'
                ? 'bg-[var(--color-primary)] text-white shadow-xs'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {labels.registerTab}
          </button>
        </div>

        {/* Heading & Subtitle */}
        <div className="flex flex-col gap-1.5">
          <h1
            id="auth-heading"
            data-testid="auth-heading"
            className="text-2xl font-bold text-[var(--color-primary)] sm:text-3xl text-balance"
          >
            {mode === 'login' ? labels.loginHeading : labels.registerHeading}
          </h1>
          <p className="text-base font-medium text-[var(--color-text-muted)]">
            {mode === 'login' ? labels.loginSubtitle : labels.registerSubtitle}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {mode === 'register' && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="auth-name-input"
                className="text-base font-bold text-[var(--color-text)]"
              >
                {labels.nameLabel}
              </label>
              <div className="relative">
                <input
                  id="auth-name-input"
                  data-testid="auth-name-input"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={labels.namePlaceholder}
                  className="min-h-[54px] w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-4 py-3 text-lg text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/60 focus:border-[var(--color-primary)] focus:outline-2 focus:outline-[var(--color-primary)]"
                />
                <UserIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute end-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="auth-email-input"
              className="text-base font-bold text-[var(--color-text)]"
            >
              {labels.emailLabel}
            </label>
            <div className="relative">
              <input
                id="auth-email-input"
                data-testid="auth-email-input"
                type="email"
                dir="ltr"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={labels.emailPlaceholder}
                className="font-english min-h-[54px] w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-4 py-3 text-base text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/60 focus:border-[var(--color-primary)] focus:outline-2 focus:outline-[var(--color-primary)]"
              />
              <Mail
                aria-hidden="true"
                className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="auth-password-input"
              className="text-base font-bold text-[var(--color-text)]"
            >
              {labels.passwordLabel}
            </label>
            <div className="relative">
              <input
                id="auth-password-input"
                data-testid="auth-password-input"
                type="password"
                dir="ltr"
                autoComplete={
                  mode === 'login' ? 'current-password' : 'new-password'
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={labels.passwordPlaceholder}
                className="font-english min-h-[54px] w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-4 py-3 text-base text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/60 focus:border-[var(--color-primary)] focus:outline-2 focus:outline-[var(--color-primary)]"
              />
              <Lock
                aria-hidden="true"
                className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
            </div>
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              {labels.passwordHelper}
            </span>
          </div>

          {mode === 'register' && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="auth-confirm-password-input"
                className="text-base font-bold text-[var(--color-text)]"
              >
                {labels.confirmPasswordLabel}
              </label>
              <div className="relative">
                <input
                  id="auth-confirm-password-input"
                  data-testid="auth-confirm-password-input"
                  type="password"
                  dir="ltr"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={labels.confirmPasswordPlaceholder}
                  className="font-english min-h-[54px] w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-4 py-3 text-base text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/60 focus:border-[var(--color-primary)] focus:outline-2 focus:outline-[var(--color-primary)]"
                />
                <Lock
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]"
                />
              </div>
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              data-testid="auth-error-message"
              className="flex items-start gap-2.5 rounded-2xl border border-[var(--color-primary)]/40 bg-[var(--color-canvas)] px-4 py-3.5 text-base font-bold text-[var(--color-primary)]"
            >
              <AlertCircle
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0"
              />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            id="auth-submit-btn"
            data-testid="auth-submit-btn"
            disabled={isSubmitting}
            className="mt-2 flex min-h-[58px] w-full items-center justify-center gap-3 rounded-2xl bg-[var(--color-primary)] px-6 py-4 text-center text-xl font-bold text-white shadow-xs transition-transform duration-150 hover:bg-[var(--color-primary-hover)] active:scale-[0.98] disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2
                  aria-hidden="true"
                  className="h-5 w-5 animate-spin shrink-0"
                />
                <span>
                  {mode === 'login'
                    ? labels.loggingInButton
                    : labels.registeringButton}
                </span>
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn aria-hidden="true" className="h-5 w-5 shrink-0" />
                <span>{labels.loginSubmitButton}</span>
              </>
            ) : (
              <>
                <UserPlus aria-hidden="true" className="h-5 w-5 shrink-0" />
                <span>{labels.registerSubmitButton}</span>
              </>
            )}
          </button>
        </form>

        {/* Bottom Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-[var(--color-border)] pt-4 text-base font-medium text-[var(--color-text-muted)]">
          <span>
            {mode === 'login'
              ? labels.switchToRegisterPrompt
              : labels.switchToLoginPrompt}
          </span>
          <button
            type="button"
            id="auth-switch-mode-btn"
            data-testid="auth-switch-mode-btn"
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
            className="font-bold text-[var(--color-primary)] underline underline-offset-4 hover:text-[var(--color-primary-hover)]"
          >
            {mode === 'login'
              ? labels.switchToRegisterAction
              : labels.switchToLoginAction}
          </button>
        </div>
      </article>
    </section>
  );
}
