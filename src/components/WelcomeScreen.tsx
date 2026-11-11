import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Camera,
  Flower2,
  Languages,
  MessageCircle,
  Palette,
  Scissors,
  ShieldCheck,
  Sparkles,
  Store,
  UtensilsCrossed,
} from 'lucide-react';
import { SkillOptionId, TranslationContent } from '../i18n/translations';

interface WelcomeScreenProps {
  content: TranslationContent;
  onStart: () => void;
  onSelectSkill: (skillId: SkillOptionId) => void;
}

const HOME_SKILLS: Array<{
  id: SkillOptionId;
  Icon: typeof Scissors;
}> = [
  { id: 'stitching', Icon: Scissors },
  { id: 'embroidery', Icon: Flower2 },
  { id: 'crafts', Icon: Palette },
  { id: 'cooking', Icon: UtensilsCrossed },
];

const HOW_STRIP_ICONS = [Camera, Sparkles, Calculator, Store];
const WHAT_YOU_GET_ICONS = [Sparkles, Calculator, MessageCircle, Store];
const TRUST_ICONS = [Languages, Calculator, ShieldCheck];

export function WelcomeScreen({
  content,
  onStart,
  onSelectSkill,
}: WelcomeScreenProps) {
  const isRtl = content.dir === 'rtl';
  const home = content.homePage;
  const skillNames = content.skillInput.skillOptions;

  return (
    <section
      aria-labelledby="welcome-heading"
      data-testid="home-screen"
      className="mx-auto flex w-full max-w-[500px] flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8"
    >
      {/* 1. Hero Section with Soft Gradient & Handcrafted SVG Illustration */}
      <div
        data-testid="home-hero"
        className="animate-fade-in relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-gradient-to-br from-[#FBF7F2] via-[#F3ECE2] to-[#FCECD5] p-6 text-center shadow-xs sm:p-7"
      >
        {/* Simple Illustration: Embroidery Hoop, Scissors, Needle & Thread, Craft Motifs */}
        <div
          aria-hidden="true"
          data-testid="home-hero-illustration"
          className="mx-auto mb-5 flex items-center justify-center gap-3"
        >
          {/* Scissors Motif */}
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)]/90 text-[var(--color-primary)] shadow-2xs">
            <Scissors className="h-6 w-6 stroke-[1.9]" />
          </div>

          {/* Center Embroidery Hoop & Needle/Thread SVG */}
          <div className="flex h-18 w-18 items-center justify-center rounded-3xl border-2 border-[var(--color-accent)]/40 bg-[var(--color-canvas)] text-[var(--color-primary)] shadow-xs">
            <svg
              viewBox="0 0 64 64"
              fill="none"
              className="h-12 w-12"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Hoop top clasp */}
              <rect
                x="27"
                y="4"
                width="10"
                height="5"
                rx="2"
                stroke="#D97706"
                strokeWidth="2.2"
              />
              {/* Embroidery hoop ring */}
              <circle
                cx="32"
                cy="34"
                r="22"
                stroke="#7A283B"
                strokeWidth="2.5"
                fill="#FEF3C7"
                fillOpacity="0.45"
              />
              {/* Stitched floral motif */}
              <path
                d="M32 20L35.2 28.8L44 32L35.2 35.2L32 44L28.8 35.2L20 32L28.8 28.8L32 20Z"
                stroke="#7A283B"
                strokeWidth="2.2"
                fill="#D97706"
                fillOpacity="0.2"
              />
              <circle cx="32" cy="32" r="3" fill="#D97706" />
              {/* Needle & flowing thread */}
              <path
                d="M14 48C20 53 42 52 50 44"
                stroke="#D97706"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
              <line
                x1="44"
                y1="16"
                x2="54"
                y2="26"
                stroke="#7A283B"
                strokeWidth="2.2"
              />
            </svg>
          </div>

          {/* Embroidery / Craft Flower Motif */}
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)]/90 text-[var(--color-accent)] shadow-2xs">
            <Flower2 className="h-6 w-6 stroke-[1.9]" />
          </div>
        </div>

        {/* App Name */}
        <h1
          id="welcome-heading"
          className="mb-3 text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl text-balance"
        >
          {content.appName}
        </h1>

        {/* Clear One-Line Promise */}
        <p className="mx-auto mb-6 max-w-md text-lg font-medium text-[var(--color-text-muted)] text-balance">
          {content.tagline}
        </p>

        {/* Large Start Button */}
        <button
          type="button"
          id="start-btn"
          onClick={onStart}
          className="group flex min-h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-[var(--color-primary)] px-6 py-3.5 text-center text-xl font-bold text-white shadow-sm transition-all duration-150 hover:bg-[var(--color-primary-hover)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]"
        >
          <span>{content.startButton}</span>
          {isRtl ? (
            <ArrowLeft
              aria-hidden="true"
              className="h-6 w-6 shrink-0 text-[var(--color-accent-soft)] transition-transform duration-150 group-hover:-translate-x-1"
            />
          ) : (
            <ArrowRight
              aria-hidden="true"
              className="h-6 w-6 shrink-0 text-[var(--color-accent-soft)] transition-transform duration-150 group-hover:translate-x-1"
            />
          )}
        </button>
      </div>

      {/* 2. "Choose your skill" Row */}
      <div
        data-testid="home-choose-skill"
        className="animate-fade-in flex flex-col gap-3"
      >
        <div className="flex flex-col gap-0.5 px-1">
          <h2 className="text-xl font-bold text-[var(--color-primary)]">
            {home.chooseSkillHeading}
          </h2>
          <p className="text-sm font-medium text-[var(--color-text-muted)]">
            {home.chooseSkillSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {HOME_SKILLS.map(({ id, Icon }) => (
            <button
              key={id}
              type="button"
              id={`home-skill-${id}`}
              data-testid={`home-skill-${id}`}
              onClick={() => onSelectSkill(id)}
              className="group flex min-h-[68px] cursor-pointer items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 text-start shadow-2xs transition-all duration-150 hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface)]/80 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
            >
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-accent)] transition-colors group-hover:border-[var(--color-primary)]/30 group-hover:text-[var(--color-primary)]"
              >
                <Icon className="h-5 w-5 stroke-[2]" />
              </span>
              <span className="text-base font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
                {skillNames[id]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. "How it works" Strip (4 Compact Numbered Steps with Icons) */}
      <div
        data-testid="home-how-it-works-strip"
        className="animate-fade-in flex flex-col gap-3 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-2xs"
      >
        <h2 className="text-xl font-bold text-[var(--color-primary)]">
          {home.howItWorksHeading}
        </h2>

        <div className="grid grid-cols-2 gap-2.5">
          {home.howItWorksSteps.map((stepLabel, idx) => {
            const StepIcon = HOW_STRIP_ICONS[idx];
            return (
              <div
                key={stepLabel}
                data-testid={`home-how-step-${idx + 1}`}
                className="flex items-center gap-2.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-canvas)] p-3"
              >
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                  <StepIcon aria-hidden="true" className="h-4 w-4 stroke-[2]" />
                  <span className="font-english absolute -top-1.5 -end-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[var(--color-accent)] text-[11px] font-bold text-white tabular-nums">
                    {idx + 1}
                  </span>
                </div>
                <span className="text-sm font-bold text-[var(--color-text)]">
                  {stepLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. "What you get" Cards */}
      <div
        data-testid="home-what-you-get"
        className="animate-fade-in flex flex-col gap-3"
      >
        <h2 className="px-1 text-xl font-bold text-[var(--color-primary)]">
          {home.whatYouGetHeading}
        </h2>

        <div className="grid grid-cols-1 gap-3">
          {home.whatYouGetItems.map((item, idx) => {
            const CardIcon = WHAT_YOU_GET_ICONS[idx];
            return (
              <article
                key={item.title}
                data-testid={`home-what-card-${idx}`}
                className="flex items-start gap-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-2xs"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-accent)]"
                >
                  <CardIcon className="h-5 w-5 stroke-[2]" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <h3 className="text-base font-bold text-[var(--color-primary)]">
                    {item.title}
                  </h3>
                  <p className="text-sm font-medium text-[var(--color-text-muted)]">
                    {item.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* 5. Trust Section (3 Short Points) */}
      <div
        data-testid="home-trust-section"
        className="animate-fade-in flex flex-col gap-3 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-2xs"
      >
        <h2 className="text-lg font-bold text-[var(--color-primary)]">
          {home.trustHeading}
        </h2>

        <ul className="flex flex-col gap-2.5">
          {home.trustPoints.map((point, idx) => {
            const TrustIcon = TRUST_ICONS[idx];
            return (
              <li
                key={point}
                data-testid={`home-trust-point-${idx}`}
                className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-3.5 py-2.5"
              >
                <TrustIcon
                  aria-hidden="true"
                  className="h-4.5 w-4.5 shrink-0 text-[var(--color-accent)] stroke-[2.2]"
                />
                <span className="text-sm font-bold text-[var(--color-text)]">
                  {point}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 6. Footer Strip with UN SDG 5, 8 and 1 Badges */}
      <footer
        data-testid="home-sdg-footer"
        className="animate-fade-in flex flex-col items-center gap-2.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/75 px-4 py-4 text-center"
      >
        <span className="text-xs font-bold text-[var(--color-text-muted)]">
          {home.sdgFooterTitle}
        </span>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {home.sdgBadges.map((badge) => (
            <span
              key={badge.number}
              data-testid={`sdg-badge-${badge.number.replace(/\s+/g, '-').toLowerCase()}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-1.5 text-xs font-bold text-[var(--color-primary)] shadow-2xs"
            >
              <span
                dir="ltr"
                className="font-english rounded-md bg-[var(--color-primary)] px-1.5 py-0.5 text-[11px] font-bold text-white"
              >
                {badge.number}
              </span>
              <span>{badge.title}</span>
            </span>
          ))}
        </div>
      </footer>
    </section>
  );
}

