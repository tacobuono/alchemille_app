"use client";

import { useMemo, useState, useTransition } from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  type Control,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  checkInSchema,
  type CheckInFormValues,
} from "@/lib/schemas/check-in";
import {
  INTENTIONS,
  ROUTINE_TYPES,
  presetsForRoutine,
  OPENED_INTO_CATEGORIES,
  OPENED_INTO_ACTIVITIES,
  activitiesByCategory,
  TEXTURE_CHIPS,
  CREATION_TAGS,
  isFastPathComplete,
  type IntentionSlug,
  type RoutineType,
  type OpenedIntoCategory,
} from "@/lib/check-in-config";
import { saveCheckIn } from "./actions";

interface CheckInFormProps {
  initialValues: CheckInFormValues;
  isEdit: boolean;
}

export function CheckInForm({ initialValues, isEdit }: CheckInFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showExpand, setShowExpand] = useState(
    Boolean(
      initialValues.journal_text ||
        initialValues.journaled_on_paper ||
        (initialValues.creations?.length ?? 0) > 0 ||
        initialValues.hrv_value != null
    )
  );

  const form = useForm<CheckInFormValues>({
    resolver: zodResolver(checkInSchema),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  // Live "fast path complete" feedback for the sticky bar.
  const watched = watch();
  const fastPathOk = useMemo(
    () =>
      isFastPathComplete({
        intention: (watched.intention as IntentionSlug | undefined) ?? null,
        hasAtLeastOneRoutine: (watched.routines?.length ?? 0) > 0,
        hasAtLeastOneOpenedInto: (watched.opened_into?.length ?? 0) > 0,
        pps_quality: watched.pps_quality ?? null,
      }),
    [watched]
  );

  function onSubmit(data: CheckInFormValues) {
    setServerError(null);
    startTransition(async () => {
      const parsed = checkInSchema.parse(data);
      const res = await saveCheckIn(parsed);
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setServerError(res.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-10">
      {/* 1. Intention --------------------------------------------------- */}
      <Section
        index={1}
        title="Intention"
        hint="What kind of window were you setting up for?"
      >
        <Controller
          control={control}
          name="intention"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {INTENTIONS.map((opt) => (
                <Chip
                  key={opt.slug}
                  selected={field.value === opt.slug}
                  onPress={() => field.onChange(opt.slug)}
                  label={opt.label}
                />
              ))}
            </div>
          )}
        />
        {errors.intention && (
          <ErrorLine message={errors.intention.message ?? ""} />
        )}
      </Section>

      {/* 2. Routines ---------------------------------------------------- */}
      <Section
        index={2}
        title="What I did"
        hint="Pick what you actually did today."
      >
        <RoutinesField control={control} watch={watch} setValue={setValue} />
        {errors.routines && (
          <ErrorLine message={errors.routines.message ?? "Pick at least one routine."} />
        )}
      </Section>

      {/* 3. Opened into ------------------------------------------------- */}
      <Section
        index={3}
        title="What my window opened into"
        hint="Tap any that fit. Marking one as a primary focus is optional."
      >
        <OpenedIntoField control={control} watch={watch} setValue={setValue} />
        {errors.opened_into && (
          <ErrorLine
            message={
              errors.opened_into.message ?? "Pick at least one — even ‘rested’ counts."
            }
          />
        )}
      </Section>

      {/* 4. Quality + texture chips ------------------------------------- */}
      <Section
        index={4}
        title="The quality of the window"
        hint="1–10. Texture words are optional."
      >
        <Controller
          control={control}
          name="pps_quality"
          render={({ field }) => (
            <div
              role="radiogroup"
              aria-label="PPS quality 1 to 10"
              className="grid grid-cols-10 gap-1.5"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={field.value === n}
                  onClick={() => field.onChange(n)}
                  className={[
                    "h-11 rounded text-small font-medium transition-colors",
                    field.value === n
                      ? "bg-forest text-cream"
                      : "bg-cream-deep text-forest hover:bg-sage-tint",
                  ].join(" ")}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        />
        {errors.pps_quality && (
          <ErrorLine message={errors.pps_quality.message ?? ""} />
        )}

        <Controller
          control={control}
          name="texture_chips"
          render={({ field }) => {
            const value = field.value ?? [];
            return (
              <div className="mt-5 flex flex-wrap gap-2">
                {TEXTURE_CHIPS.map((chip) => {
                  const on = value.includes(chip.slug);
                  return (
                    <Chip
                      key={chip.slug}
                      selected={on}
                      tone="sage"
                      onPress={() => {
                        field.onChange(
                          on
                            ? value.filter((s) => s !== chip.slug)
                            : [...value, chip.slug]
                        );
                      }}
                      label={chip.label}
                    />
                  );
                })}
              </div>
            );
          }}
        />
      </Section>

      {/* Expand layer toggle ------------------------------------------- */}
      <div className="border-t border-sage/30 pt-6">
        <button
          type="button"
          onClick={() => setShowExpand((s) => !s)}
          className="flex items-center gap-2 text-small text-forest hover:text-terracotta transition-colors"
          aria-expanded={showExpand}
        >
          <span
            aria-hidden
            className={[
              "inline-block transition-transform",
              showExpand ? "rotate-90" : "",
            ].join(" ")}
          >
            ›
          </span>
          {showExpand ? "Close deeper" : "Go deeper (optional)"}
        </button>
      </div>

      {showExpand && (
        <>
          {/* 5. Journal --------------------------------------------------- */}
          <Section
            index={5}
            title="Journal"
            hint={null}
            optional
          >
            <Controller
              control={control}
              name="journaled_on_paper"
              render={({ field }) => (
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value ?? false}
                    onChange={(e) => {
                      field.onChange(e.target.checked);
                      // PAPER-TOGGLE INVARIANT: clear any text when toggle goes on.
                      if (e.target.checked) {
                        setValue("journal_text", "", { shouldDirty: true });
                      }
                    }}
                    className="mt-1 w-5 h-5 accent-forest"
                  />
                  <span className="text-small text-forest-soft">
                    I journaled on paper today.{" "}
                    <span className="text-sage-deep">
                      Honor the no-screen value. Mark it done and move on.
                    </span>
                  </span>
                </label>
              )}
            />

            {/*
              PAPER-TOGGLE INVARIANT — see src/lib/check-in-config.ts
              and docs/BUILD_NOTES.md. When the toggle is on, the
              textarea is REMOVED FROM THE DOM. Not disabled.
            */}
            {!watched.journaled_on_paper && (
              <Controller
                control={control}
                name="journal_text"
                render={({ field }) => (
                  <textarea
                    {...field}
                    value={field.value ?? ""}
                    rows={6}
                    placeholder="What arrived in the window?"
                    className="mt-4 w-full px-4 py-3 bg-cream-deep border border-sage/40 rounded text-forest placeholder:text-sage-deep focus:outline-none focus:border-terracotta resize-vertical"
                  />
                )}
              />
            )}
          </Section>

          {/* 6. Creation logs -------------------------------------------- */}
          <Section
            index={6}
            title="What you made"
            hint="Short notes on what came out of the window. Tag for later."
            optional
          >
            <CreationsField control={control} watch={watch} />
          </Section>

          {/* 7. HRV ------------------------------------------------------ */}
          <Section
            index={7}
            title="HRV"
            hint="Optional. Single number from your reading. Not part of the streak."
            optional
          >
            <Controller
              control={control}
              name="hrv_value"
              render={({ field }) => (
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={249}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === "" ? null : Number(v));
                  }}
                  placeholder="—"
                  className="w-32 h-12 px-4 bg-cream-deep border border-sage/40 rounded text-forest placeholder:text-sage-deep focus:outline-none focus:border-terracotta"
                />
              )}
            />
          </Section>
        </>
      )}

      {/* Sticky bottom bar --------------------------------------------- */}
      <div
        className="sticky bottom-bottom-nav z-20 -mx-5 px-5 py-4 bg-cream/95 backdrop-blur border-t border-sage/30"
        style={{ bottom: "calc(theme(spacing.bottom-nav) + env(safe-area-inset-bottom))" }}
      >
        {serverError && (
          <p role="alert" className="text-small text-terracotta mb-2">
            {serverError}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting || isPending}
          className="w-full h-12 rounded-cta bg-terracotta text-cream font-medium shadow-cta hover:bg-terracotta-deep transition-colors disabled:opacity-50"
        >
          {isPending
            ? "Saving…"
            : isEdit
              ? "Save changes"
              : fastPathOk
                ? "Save check-in"
                : "Save what you have"}
        </button>
        <p className="text-xs text-sage-deep text-center mt-2">
          {fastPathOk
            ? "Fast path complete — this counts toward your streak."
            : "Streak counts when intention, a routine, an opened-into, and quality are picked."}
        </p>
      </div>
    </form>
  );
}

// =====================================================================
//  Routines — chip per type; tap to add/remove. Per-row preset + duration.
// =====================================================================

interface RoutinesFieldProps {
  control: Control<CheckInFormValues>;
  watch: UseFormWatch<CheckInFormValues>;
  setValue: UseFormSetValue<CheckInFormValues>;
}

function RoutinesField({ control, watch, setValue }: RoutinesFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "routines",
  });
  const watchedRoutines = watch("routines") ?? [];

  function toggleType(type: RoutineType) {
    const existingIndex = watchedRoutines.findIndex(
      (r) => r.routine_type === type
    );
    if (existingIndex >= 0) {
      remove(existingIndex);
    } else {
      append({
        routine_type: type,
        preset_slug: null,
        duration_minutes: null,
      });
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {ROUTINE_TYPES.map((rt) => {
          const on = watchedRoutines.some((r) => r.routine_type === rt.slug);
          return (
            <Chip
              key={rt.slug}
              selected={on}
              onPress={() => toggleType(rt.slug)}
              label={rt.label}
            />
          );
        })}
      </div>

      {fields.length > 0 && (
        <ul className="mt-4 space-y-3">
          {fields.map((f, idx) => {
            const rt = watchedRoutines[idx]?.routine_type as RoutineType;
            const presets = presetsForRoutine(rt);
            return (
              <li
                key={f.id}
                className="rounded-card bg-cream-deep border border-sage/30 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-title text-forest">
                    {ROUTINE_TYPES.find((r) => r.slug === rt)?.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="text-xs text-sage-deep hover:text-terracotta"
                    aria-label={`Remove ${rt}`}
                  >
                    remove
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  {presets.length > 0 && (
                    <Controller
                      control={control}
                      name={`routines.${idx}.preset_slug` as const}
                      render={({ field }) => (
                        <label className="text-xs text-sage-deep">
                          Preset
                          <select
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.value || null)
                            }
                            className="mt-1 w-full h-10 px-2 bg-cream border border-sage/40 rounded text-small text-forest focus:outline-none focus:border-terracotta"
                          >
                            <option value="">Choose…</option>
                            {presets.map((p) => (
                              <option key={p.slug} value={p.slug}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                    />
                  )}

                  <Controller
                    control={control}
                    name={`routines.${idx}.duration_minutes` as const}
                    render={({ field }) => (
                      <label className="text-xs text-sage-deep">
                        Minutes
                        <DurationStepper
                          value={field.value ?? null}
                          onChange={(v) =>
                            setValue(`routines.${idx}.duration_minutes`, v, {
                              shouldDirty: true,
                              shouldValidate: true,
                            })
                          }
                        />
                      </label>
                    )}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

// =====================================================================
//  Opened-into — grouped multi-select with optional primary nudge.
// =====================================================================

interface OpenedIntoFieldProps {
  control: Control<CheckInFormValues>;
  watch: UseFormWatch<CheckInFormValues>;
  setValue: UseFormSetValue<CheckInFormValues>;
}

function OpenedIntoField({ control, watch, setValue }: OpenedIntoFieldProps) {
  const { append, remove } = useFieldArray({
    control,
    name: "opened_into",
  });
  const watched = watch("opened_into") ?? [];

  function toggle(category: OpenedIntoCategory, activitySlug: string) {
    const existingIndex = watched.findIndex(
      (o) => o.activity_slug === activitySlug
    );
    if (existingIndex >= 0) {
      remove(existingIndex);
    } else {
      append({
        category,
        activity_slug: activitySlug,
        free_text: null,
        is_primary: false,
      });
    }
  }

  function setPrimary(activitySlug: string) {
    // Enforce single primary: clear all others, set this one true.
    const next = watched.map((o) => ({
      ...o,
      is_primary: o.activity_slug === activitySlug,
    }));
    setValue("opened_into", next, { shouldDirty: true, shouldValidate: true });
  }

  // Show category groups; the 'rested' and 'other' groups get special treatment.
  const visibleCategories = OPENED_INTO_CATEGORIES.filter(
    (c) => c !== "other" && c !== "rested"
  );

  return (
    <div className="space-y-5">
      {visibleCategories.map((cat) => {
        const acts = activitiesByCategory(cat);
        return (
          <div key={cat}>
            <p className="text-xs uppercase tracking-[0.14em] text-sage-deep mb-2">
              {categoryLabel(cat)}
            </p>
            <div className="flex flex-wrap gap-2">
              {acts.map((a) => {
                const on = watched.some((o) => o.activity_slug === a.slug);
                return (
                  <Chip
                    key={a.slug}
                    selected={on}
                    onPress={() => toggle(cat, a.slug)}
                    label={a.label}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Other (free text) */}
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-sage-deep mb-2">
          Other
        </p>
        <OtherFreeTextChip
          watched={watched}
          onToggle={() => toggle("other", "other")}
          onChangeText={(text) => {
            const next = watched.map((o) =>
              o.activity_slug === "other" ? { ...o, free_text: text } : o
            );
            setValue("opened_into", next, { shouldDirty: true });
          }}
        />
      </div>

      {/* Rested — honored, not penalized */}
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-sage-deep mb-2">
          Or
        </p>
        <Chip
          selected={watched.some((o) => o.activity_slug === "rested")}
          onPress={() => toggle("rested", "rested")}
          label="Didn’t open / rested"
        />
        <p className="text-xs text-sage-deep mt-2">
          Rest counts. Your streak stays.
        </p>
      </div>

      {watched.length > 1 && (
        <div className="pt-3 border-t border-sage/30">
          <p className="text-xs text-sage-deep mb-2">
            If you want, mark one as your primary focus.
          </p>
          <div className="flex flex-wrap gap-2">
            {watched.map((o) => {
              const a = OPENED_INTO_ACTIVITIES.find(
                (act) => act.slug === o.activity_slug
              );
              return (
                <button
                  key={o.activity_slug}
                  type="button"
                  onClick={() => setPrimary(o.activity_slug)}
                  className={[
                    "rounded-chip border px-3 py-1.5 text-xs transition-colors",
                    o.is_primary
                      ? "bg-forest text-cream border-forest"
                      : "bg-cream text-forest border-sage/40 hover:border-forest",
                  ].join(" ")}
                >
                  {a?.label ?? o.activity_slug}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface OtherFreeTextChipProps {
  watched: NonNullable<CheckInFormValues["opened_into"]>;
  onToggle: () => void;
  onChangeText: (text: string) => void;
}

function OtherFreeTextChip({
  watched,
  onToggle,
  onChangeText,
}: OtherFreeTextChipProps) {
  const row = watched.find((o) => o.activity_slug === "other");
  return (
    <div className="flex flex-col gap-2">
      <Chip
        selected={Boolean(row)}
        onPress={onToggle}
        label={row ? "Other ✓" : "Other (free text)"}
      />
      {row && (
        <input
          type="text"
          value={row.free_text ?? ""}
          onChange={(e) => onChangeText(e.target.value)}
          maxLength={500}
          placeholder="A few words"
          className="w-full h-11 px-3 bg-cream-deep border border-sage/40 rounded text-forest placeholder:text-sage-deep focus:outline-none focus:border-terracotta"
        />
      )}
    </div>
  );
}

// =====================================================================
//  Creations (Layer 2)
// =====================================================================

interface CreationsFieldProps {
  control: Control<CheckInFormValues>;
  watch: UseFormWatch<CheckInFormValues>;
}

function CreationsField({ control, watch }: CreationsFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "creations",
  });
  const watched = watch("creations") ?? [];

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {fields.map((f, idx) => (
          <li
            key={f.id}
            className="rounded-card bg-cream-deep border border-sage/30 p-3"
          >
            <div className="flex items-start gap-2">
              <Controller
                control={control}
                name={`creations.${idx}.tag` as const}
                render={({ field }) => (
                  <select
                    {...field}
                    className="h-10 px-2 bg-cream border border-sage/40 rounded text-small text-forest focus:outline-none focus:border-terracotta"
                  >
                    {CREATION_TAGS.map((t) => (
                      <option key={t.slug} value={t.slug}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                )}
              />
              <button
                type="button"
                onClick={() => remove(idx)}
                className="ml-auto text-xs text-sage-deep hover:text-terracotta"
              >
                remove
              </button>
            </div>
            <Controller
              control={control}
              name={`creations.${idx}.body` as const}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={2}
                  placeholder={creationPlaceholder(watched[idx]?.tag)}
                  className="mt-2 w-full px-3 py-2 bg-cream border border-sage/40 rounded text-small text-forest placeholder:text-sage-deep focus:outline-none focus:border-terracotta resize-vertical"
                />
              )}
            />
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() =>
          append({ tag: "writing", body: "" })
        }
        className="inline-flex items-center justify-center h-10 px-4 rounded border border-sage/40 text-small text-forest hover:bg-sage-tint transition-colors"
      >
        + Add a creation
      </button>
    </div>
  );
}

// =====================================================================
//  Small primitives
// =====================================================================

interface SectionProps {
  index: number;
  title: string;
  hint: string | null;
  optional?: boolean;
  children: React.ReactNode;
}

function Section({ index, title, hint, optional, children }: SectionProps) {
  return (
    <section aria-labelledby={`s-${index}`} className="space-y-3">
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-xs uppercase tracking-[0.14em] text-sage-deep">
            {String(index).padStart(2, "0")}
          </span>
          <h2
            id={`s-${index}`}
            className="font-display text-headline text-forest"
          >
            {title}
          </h2>
          {optional && (
            <span className="text-xs text-sage-deep">· optional</span>
          )}
        </div>
        {hint && <p className="text-xs text-sage-deep mt-1">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

interface ChipProps {
  selected: boolean;
  onPress: () => void;
  label: string;
  tone?: "forest" | "sage";
}

function Chip({ selected, onPress, label, tone = "forest" }: ChipProps) {
  const selectedStyle =
    tone === "sage"
      ? "bg-sage text-cream border-sage"
      : "bg-forest text-cream border-forest";
  return (
    <button
      type="button"
      onClick={onPress}
      aria-pressed={selected}
      className={[
        "min-h-tap-target rounded-chip border px-4 text-chip transition-colors",
        selected
          ? selectedStyle
          : "bg-cream border-sage/40 text-forest hover:border-forest",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

interface DurationStepperProps {
  value: number | null;
  onChange: (next: number | null) => void;
}

function DurationStepper({ value, onChange }: DurationStepperProps) {
  const step = 5;
  return (
    <div className="mt-1 flex items-center">
      <button
        type="button"
        onClick={() =>
          onChange(value == null ? 0 : Math.max(0, value - step))
        }
        className="w-10 h-10 rounded-l bg-cream border border-sage/40 text-forest text-lg hover:bg-sage-tint"
        aria-label="Decrease minutes"
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={600}
        value={value ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? null : Number(v));
        }}
        placeholder="—"
        className="w-16 h-10 text-center bg-cream-deep border-y border-sage/40 text-forest focus:outline-none focus:border-terracotta"
      />
      <button
        type="button"
        onClick={() => onChange((value ?? 0) + step)}
        className="w-10 h-10 rounded-r bg-cream border border-sage/40 text-forest text-lg hover:bg-sage-tint"
        aria-label="Increase minutes"
      >
        +
      </button>
    </div>
  );
}

function ErrorLine({ message }: { message: string }) {
  return (
    <p role="alert" className="text-small text-terracotta">
      {message}
    </p>
  );
}

function categoryLabel(c: OpenedIntoCategory): string {
  switch (c) {
    case "creative":
      return "Creative";
    case "learning":
      return "Learning";
    case "reflective":
      return "Reflective";
    case "engaged":
      return "Engaged";
    case "other":
      return "Other";
    case "rested":
      return "Or";
  }
}

function creationPlaceholder(tag: string | undefined): string {
  switch (tag) {
    case "music":
      return "wrote 2 verses, recorded a sketch…";
    case "language":
      return "20 min subjunctive, watched X with subtitles…";
    case "garden":
      return "transplanted seedlings, mulched the path…";
    case "writing":
      return "drafted a paragraph, edited the intro…";
    default:
      return "what came out of the window?";
  }
}
