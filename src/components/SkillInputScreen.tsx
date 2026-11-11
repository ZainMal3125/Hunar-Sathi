import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Flower2,
  ImagePlus,
  Scissors,
  Trash2,
  UtensilsCrossed,
  Palette,
  PenTool,
} from 'lucide-react';
import { SkillOptionId, TranslationContent } from '../i18n/translations';
import {
  compressImageFile,
  isSkillFormValid,
  MAX_IMAGE_DIMENSION,
  MAX_PHOTOS,
  SKILL_OPTION_IDS,
  SkillFormState,
} from '../utils/skillForm';

interface SkillInputScreenProps {
  content: TranslationContent;
  formState: SkillFormState;
  onChange: (nextState: SkillFormState) => void;
  onContinue: () => void;
  onBackToHome: () => void;
}

const SKILL_ICONS: Record<SkillOptionId, typeof Scissors> = {
  stitching: Scissors,
  embroidery: Flower2,
  crafts: Palette,
  cooking: UtensilsCrossed,
  other: PenTool,
};

export function SkillInputScreen({
  content,
  formState,
  onChange,
  onContinue,
  onBackToHome,
}: SkillInputScreenProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isRtl = content.dir === 'rtl';
  const labels = content.skillInput;
  const flowLabels = content.createFlow;
  const isValid = isSkillFormValid(formState) && !isCompressing;
  const remainingSlots = MAX_PHOTOS - formState.photos.length;

  const handleSkillSelect = (skillId: SkillOptionId) => {
    onChange({
      ...formState,
      skillId,
    });
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) {
      return;
    }

    setUploadError(null);
    const filesArray = Array.from(fileList).slice(0, remainingSlots);
    if (filesArray.length === 0) {
      event.target.value = '';
      return;
    }

    setIsCompressing(true);
    try {
      const compressed = await Promise.all(
        filesArray.map((file) => compressImageFile(file, MAX_IMAGE_DIMENSION))
      );
      onChange({
        ...formState,
        photos: [...formState.photos, ...compressed].slice(0, MAX_PHOTOS),
      });
    } catch {
      setUploadError(labels.uploadError);
    } finally {
      setIsCompressing(false);
      event.target.value = '';
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    onChange({
      ...formState,
      photos: formState.photos.filter((photo) => photo.id !== photoId),
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isValid) {
      onContinue();
    }
  };

  return (
    <section
      aria-labelledby="skill-input-heading"
      data-testid="create-step-1-screen"
      className="mx-auto flex w-full max-w-[500px] flex-1 flex-col px-5 py-7 sm:px-6 sm:py-9"
    >
      {/* Top Back to Home & Step Progress Indicator */}
      <div className="mb-6 flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            id="skill-back-home-btn"
            data-testid="skill-back-home-btn"
            onClick={onBackToHome}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 text-sm font-bold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-border)]"
          >
            {isRtl ? (
              <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
            ) : (
              <ArrowLeft aria-hidden="true" className="h-4 w-4 shrink-0" />
            )}
            <span>{flowLabels.backToHomeButton}</span>
          </button>

          <span
            data-testid="create-progress-indicator"
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-1.5 text-sm font-bold text-[var(--color-accent)] tabular-nums"
          >
            {flowLabels.stepIndicator(1, 3)}
          </span>
        </div>

        {/* 3-Step Visual Progress Bar & Labels */}
        <div
          aria-label={flowLabels.stepIndicator(1, 3)}
          className="grid grid-cols-3 gap-2"
        >
          {flowLabels.steps.map((stepTitle, idx) => {
            const isCurrent = idx === 0;
            return (
              <div key={stepTitle} className="flex flex-col gap-1.5">
                <div
                  className={`h-2 w-full rounded-full transition-colors ${
                    isCurrent
                      ? 'bg-[var(--color-primary)]'
                      : 'bg-[var(--color-border)]'
                  }`}
                />
                <span
                  className={`text-xs leading-snug ${
                    isCurrent
                      ? 'font-bold text-[var(--color-primary)]'
                      : 'font-medium text-[var(--color-text-muted)]'
                  }`}
                >
                  {idx + 1}. {stepTitle}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-7">
        <h1
          id="skill-input-heading"
          className="mb-2.5 text-3xl font-bold tracking-tight text-[var(--color-primary)] text-balance"
        >
          {labels.heading}
        </h1>
        <p className="text-lg font-medium text-[var(--color-text-muted)] text-balance">
          {labels.subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-7" noValidate>
        {/* 1. Skill Selection */}
        <fieldset className="flex flex-col gap-3.5">
          <legend className="mb-2.5 text-xl font-bold text-[var(--color-text)]">
            {labels.skillSectionLabel}
          </legend>

          <div className="grid grid-cols-1 gap-3">
            {SKILL_OPTION_IDS.map((optionId) => {
              const isSelected = formState.skillId === optionId;
              const Icon = SKILL_ICONS[optionId];
              return (
                <button
                  key={optionId}
                  type="button"
                  id={`skill-opt-${optionId}`}
                  onClick={() => handleSkillSelect(optionId)}
                  aria-pressed={isSelected}
                  className={`flex min-h-[64px] w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-start transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ${
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-xs'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-primary)]/50'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span
                      aria-hidden="true"
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        isSelected
                          ? 'bg-white/15 text-[var(--color-accent-soft)]'
                          : 'bg-[var(--color-canvas)] text-[var(--color-accent)] border border-[var(--color-border)]'
                      }`}
                    >
                      <Icon className="h-5 w-5 stroke-[2]" />
                    </span>
                    <span className="text-xl font-bold truncate">
                      {labels.skillOptions[optionId]}
                    </span>
                  </div>

                  <span
                    aria-hidden="true"
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                      isSelected
                        ? 'border-white bg-white text-[var(--color-primary)]'
                        : 'border-[var(--color-border)] bg-[var(--color-canvas)] text-transparent'
                    }`}
                  >
                    <Check className="h-4 w-4 stroke-[3]" />
                  </span>
                </button>
              );
            })}
          </div>

          {/* Conditional "Other" text box */}
          {formState.skillId === 'other' && (
            <div className="mt-2 flex flex-col gap-2.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <label
                htmlFor="other-skill-input"
                className="text-lg font-bold text-[var(--color-text)]"
              >
                {labels.otherSkillLabel}
              </label>
              <input
                id="other-skill-input"
                type="text"
                value={formState.customSkill}
                onChange={(e) =>
                  onChange({ ...formState, customSkill: e.target.value })
                }
                placeholder={labels.otherSkillPlaceholder}
                className="min-h-[56px] w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] px-4 py-3 text-lg text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/70 focus:border-[var(--color-primary)] focus:outline-2 focus:outline-[var(--color-primary)]"
              />
            </div>
          )}
        </fieldset>

        {/* 2. City Text Field */}
        <div className="flex flex-col gap-2.5">
          <label
            htmlFor="city-input"
            className="text-xl font-bold text-[var(--color-text)]"
          >
            {labels.cityLabel}
          </label>
          <input
            id="city-input"
            type="text"
            value={formState.city}
            onChange={(e) => onChange({ ...formState, city: e.target.value })}
            placeholder={labels.cityPlaceholder}
            className="min-h-[60px] w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3.5 text-lg text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/70 focus:border-[var(--color-primary)] focus:bg-[var(--color-canvas)] focus:outline-2 focus:outline-[var(--color-primary)]"
          />
        </div>

        {/* 3. Photo Upload Area (1 to 4 photos, compressed <= 1024px) */}
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <label
              htmlFor="photo-upload-input"
              className="text-xl font-bold text-[var(--color-text)]"
            >
              {labels.photosLabel}
            </label>
            <span className="text-base font-semibold text-[var(--color-text-muted)] tabular-nums">
              {labels.photoCountLabel(formState.photos.length, MAX_PHOTOS)}
            </span>
          </div>

          <p className="text-base text-[var(--color-text-muted)]">
            {labels.photosHelper}
          </p>

          <input
            ref={fileInputRef}
            id="photo-upload-input"
            type="file"
            accept="image/*"
            multiple
            disabled={remainingSlots <= 0 || isCompressing}
            onChange={handleFileChange}
            className="sr-only"
          />

          <button
            type="button"
            id="photo-upload-trigger"
            disabled={remainingSlots <= 0 || isCompressing}
            onClick={() => fileInputRef.current?.click()}
            className={`flex min-h-[84px] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-5 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ${
              remainingSlots > 0 && !isCompressing
                ? 'border-[var(--color-primary)]/40 bg-[var(--color-surface)] text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)]/80 cursor-pointer'
                : 'border-[var(--color-border)] bg-[var(--color-surface)]/50 text-[var(--color-text-muted)] cursor-not-allowed opacity-70'
            }`}
          >
            <ImagePlus
              aria-hidden="true"
              className="h-7 w-7 text-[var(--color-accent)] stroke-[2]"
            />
            <span className="text-lg font-bold">
              {isCompressing
                ? labels.compressingText
                : remainingSlots > 0
                  ? labels.addPhotosButton
                  : labels.maxPhotosReached}
            </span>
          </button>

          {uploadError && (
            <p
              role="alert"
              className="rounded-xl border border-[var(--color-primary)]/30 bg-[var(--color-surface)] px-4 py-3 text-base font-medium text-[var(--color-primary)]"
            >
              {uploadError}
            </p>
          )}

          {/* Thumbnails grid with Remove button */}
          {formState.photos.length > 0 && (
            <div
              data-testid="photo-thumbnails-grid"
              className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4"
            >
              {formState.photos.map((photo, index) => (
                <div
                  key={photo.id}
                  data-testid="photo-thumbnail-card"
                  data-width={photo.width}
                  data-height={photo.height}
                  className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] aspect-square"
                >
                  <img
                    src={photo.dataUrl}
                    alt={`${photo.name || 'Work photo'} ${index + 1}`}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(photo.id)}
                    aria-label={`${labels.removePhotoAria} ${index + 1}`}
                    className="absolute top-2 end-2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-[var(--color-primary)] text-white shadow-sm transition-transform hover:bg-[var(--color-primary-hover)] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <Trash2 aria-hidden="true" className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Continue Button */}
        <div className="pt-2">
          <button
            type="submit"
            id="continue-btn"
            disabled={!isValid}
            className={`group flex min-h-[64px] w-full items-center justify-center gap-4 rounded-2xl px-8 py-4 text-xl font-bold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] whitespace-nowrap ${
              isValid
                ? 'bg-[var(--color-primary)] text-white shadow-sm hover:bg-[var(--color-primary-hover)] active:scale-[0.98] cursor-pointer'
                : 'bg-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed opacity-70'
            }`}
          >
            <span>{labels.continueButton}</span>
            {isRtl ? (
              <ArrowLeft
                aria-hidden="true"
                className="h-6 w-6 shrink-0 transition-transform duration-150 group-hover:-translate-x-1"
              />
            ) : (
              <ArrowRight
                aria-hidden="true"
                className="h-6 w-6 shrink-0 transition-transform duration-150 group-hover:translate-x-1"
              />
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
