"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  onboardingSchema,
  type OnboardingFormValues,
} from "@/lib/schemas/onboarding";
import { completeOnboarding } from "./actions";

interface OnboardingFormProps {
  initialName: string;
  initialProfilePhoto: string;
  initialPracticeSpace: string;
  initialTimezone: string;
  initialLang: string;
}

const TIMEZONES = [
  "America/Chicago",
  "America/New_York",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney",
] as const;

export function OnboardingForm({
  initialName,
  initialProfilePhoto,
  initialPracticeSpace,
  initialTimezone,
  initialLang,
}: OnboardingFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState<"profile" | "space" | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: initialName,
      profilePhotoUrl: initialProfilePhoto,
      practiceSpacePhotoUrl: initialPracticeSpace,
      timezone: initialTimezone,
      languagePreference: initialLang,
      journalVisibilityConsent: false,
      gardenVisibilityToCohort: false,
    },
  });

  const profilePhotoUrl = watch("profilePhotoUrl");
  const practiceSpacePhotoUrl = watch("practiceSpacePhotoUrl");

  async function uploadPhoto(
    file: File,
    kind: "profile" | "space"
  ): Promise<string | null> {
    setUploading(kind);
    setServerError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const bucket = kind === "profile" ? "profile-photos" : "practice-spaces";
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: false, cacheControl: "3600" });
      if (error) {
        setServerError(`Upload failed: ${error.message}`);
        return null;
      }
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Upload failed.";
      setServerError(message);
      return null;
    } finally {
      setUploading(null);
    }
  }

  async function onProfileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadPhoto(file, "profile");
    if (url) setValue("profilePhotoUrl", url, { shouldValidate: true });
  }

  async function onSpaceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadPhoto(file, "space");
    if (url) setValue("practiceSpacePhotoUrl", url, { shouldValidate: true });
  }

  function onSubmit(data: OnboardingFormValues) {
    setServerError(null);
    startTransition(async () => {
      // Re-parse so server gets the fully-defaulted output shape.
      const parsed = onboardingSchema.parse(data);
      const res = await completeOnboarding(parsed);
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setServerError(res.error);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-10"
      aria-describedby={serverError ? "form-error" : undefined}
    >
      <fieldset className="space-y-2">
        <label htmlFor="name" className="block text-sm text-forest">
          Your name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          {...register("name")}
          className="w-full h-11 px-3 bg-cream border border-sage/50 rounded text-forest-dark placeholder:text-sage focus:outline-none focus:border-forest"
          placeholder="What we should call you"
          aria-invalid={errors.name ? "true" : "false"}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <p id="name-error" role="alert" className="text-sm text-coral">
            {errors.name.message}
          </p>
        )}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm text-forest">Profile photo</legend>
        <PhotoSlot
          previewUrl={profilePhotoUrl}
          uploading={uploading === "profile"}
          onChange={onProfileChange}
          alt="Profile photo preview"
          helpText="A face we can recognize. JPG or PNG."
        />
        <input type="hidden" {...register("profilePhotoUrl")} />
        {errors.profilePhotoUrl && (
          <p role="alert" className="text-sm text-coral">
            {errors.profilePhotoUrl.message}
          </p>
        )}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm text-forest">
          Where you practice <span className="text-sage-grey">(optional)</span>
        </legend>
        <PhotoSlot
          previewUrl={practiceSpacePhotoUrl ?? ""}
          uploading={uploading === "space"}
          onChange={onSpaceChange}
          alt="Practice space preview"
          helpText="Your mat, your corner, your room. Skip if you'd rather not."
        />
        <input type="hidden" {...register("practiceSpacePhotoUrl")} />
      </fieldset>

      <div className="grid sm:grid-cols-2 gap-6">
        <fieldset className="space-y-2">
          <label htmlFor="timezone" className="block text-sm text-forest">
            Time zone
          </label>
          <select
            id="timezone"
            {...register("timezone")}
            className="w-full h-11 px-3 bg-cream border border-sage/50 rounded text-forest-dark focus:outline-none focus:border-forest"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </fieldset>

        <fieldset className="space-y-2">
          <label
            htmlFor="languagePreference"
            className="block text-sm text-forest"
          >
            Language
          </label>
          <select
            id="languagePreference"
            {...register("languagePreference")}
            className="w-full h-11 px-3 bg-cream border border-sage/50 rounded text-forest-dark focus:outline-none focus:border-forest"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
          </select>
        </fieldset>
      </div>

      <fieldset className="space-y-4 border-t border-sage/30 pt-8">
        <legend className="font-serif text-headline text-forest">
          Two quiet choices
        </legend>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register("journalVisibilityConsent")}
            className="mt-1 w-4 h-4 accent-forest"
          />
          <span className="text-sm text-forest-dark">
            <span className="font-medium">Let Alison read my journal.</span>{" "}
            <span className="text-sage-grey">
              You can turn this off any time. She will never share or quote
              without asking.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register("gardenVisibilityToCohort")}
            className="mt-1 w-4 h-4 accent-forest"
          />
          <span className="text-sm text-forest-dark">
            <span className="font-medium">
              Show my garden to my cohort.
            </span>{" "}
            <span className="text-sage-grey">
              Just the herbs, no journal text. Off by default.
            </span>
          </span>
        </label>
      </fieldset>

      {serverError && (
        <p id="form-error" role="alert" className="text-sm text-coral">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || isPending || uploading !== null}
        className="inline-flex items-center justify-center h-12 px-8 bg-forest text-cream rounded text-sm tracking-wide hover:bg-forest-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Saving…" : "Enter the garden"}
      </button>
    </form>
  );
}

interface PhotoSlotProps {
  previewUrl: string;
  uploading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  alt: string;
  helpText: string;
}

function PhotoSlot({
  previewUrl,
  uploading,
  onChange,
  alt,
  helpText,
}: PhotoSlotProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-24 h-24 rounded-lg border border-sage/40 bg-cream-deep overflow-hidden flex items-center justify-center">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-sage-grey">no photo</span>
        )}
      </div>
      <div className="flex-1">
        <label className="inline-flex items-center justify-center h-9 px-4 bg-cream-deep border border-sage/50 rounded text-sm text-forest cursor-pointer hover:bg-cream transition-colors">
          {uploading ? "Uploading…" : previewUrl ? "Change" : "Choose photo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onChange}
            disabled={uploading}
          />
        </label>
        <p className="mt-2 text-xs text-sage-grey">{helpText}</p>
      </div>
    </div>
  );
}
