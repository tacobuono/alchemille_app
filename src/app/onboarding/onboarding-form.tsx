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
  initialAvatar: string;
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
  initialAvatar,
  initialTimezone,
  initialLang,
}: OnboardingFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      displayName: initialName,
      avatarUrl: initialAvatar,
      timezone: initialTimezone,
      languagePreference: initialLang,
    },
  });

  const avatarUrl = watch("avatarUrl") ?? "";

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setServerError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: false, cacheControl: "3600" });
      if (error) {
        setServerError(`Upload failed: ${error.message}`);
        return;
      }
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setValue("avatarUrl", data.publicUrl, { shouldValidate: true });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Upload failed.";
      setServerError(message);
    } finally {
      setUploading(false);
    }
  }

  function onSubmit(data: OnboardingFormValues) {
    setServerError(null);
    startTransition(async () => {
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
      className="space-y-8"
      aria-describedby={serverError ? "form-error" : undefined}
    >
      <fieldset className="space-y-2">
        <label
          htmlFor="displayName"
          className="block text-small text-forest"
        >
          Your name
        </label>
        <input
          id="displayName"
          type="text"
          autoComplete="name"
          {...register("displayName")}
          className="w-full h-12 px-4 bg-cream-deep border border-sage/40 rounded text-forest placeholder:text-sage-deep focus:outline-none focus:border-terracotta"
          placeholder="What we should call you"
          aria-invalid={errors.displayName ? "true" : "false"}
        />
        {errors.displayName && (
          <p role="alert" className="text-small text-terracotta">
            {errors.displayName.message}
          </p>
        )}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-small text-forest">
          Avatar <span className="text-sage-deep">(optional)</span>
        </legend>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full border border-sage/40 bg-cream-deep overflow-hidden flex items-center justify-center">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-sage-deep">none</span>
            )}
          </div>
          <label className="inline-flex items-center justify-center h-10 px-4 bg-cream-deep border border-sage/40 rounded text-small text-forest cursor-pointer hover:bg-sage-tint transition-colors">
            {uploading ? "Uploading…" : avatarUrl ? "Change" : "Choose photo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarChange}
              disabled={uploading}
            />
          </label>
        </div>
        <input type="hidden" {...register("avatarUrl")} />
      </fieldset>

      <div className="grid grid-cols-2 gap-4">
        <fieldset className="space-y-2">
          <label
            htmlFor="timezone"
            className="block text-small text-forest"
          >
            Time zone
          </label>
          <select
            id="timezone"
            {...register("timezone")}
            className="w-full h-12 px-3 bg-cream-deep border border-sage/40 rounded text-forest focus:outline-none focus:border-terracotta"
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
            className="block text-small text-forest"
          >
            Language
          </label>
          <select
            id="languagePreference"
            {...register("languagePreference")}
            className="w-full h-12 px-3 bg-cream-deep border border-sage/40 rounded text-forest focus:outline-none focus:border-terracotta"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
          </select>
        </fieldset>
      </div>

      {serverError && (
        <p id="form-error" role="alert" className="text-small text-terracotta">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || isPending || uploading}
        className="w-full h-12 rounded-cta bg-terracotta text-cream font-medium shadow-cta hover:bg-terracotta-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
