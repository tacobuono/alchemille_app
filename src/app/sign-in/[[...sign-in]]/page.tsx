import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-12 bg-cream">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-sage-deep">
            Alchemille
          </p>
          <h1 className="mt-2 font-display text-3xl text-forest">
            Welcome back.
          </h1>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-cream-deep shadow-card border border-sage/30 rounded-card",
              headerTitle: "font-display text-forest",
              headerSubtitle: "text-sage-deep",
              formButtonPrimary:
                "bg-terracotta hover:bg-terracotta-deep text-cream normal-case tracking-wide rounded-cta",
              footerActionLink: "text-terracotta hover:text-terracotta-deep",
            },
            variables: {
              colorPrimary: "#C06B47",
              colorBackground: "#F4EFE3",
              colorText: "#2E4332",
              colorInputBackground: "#F4EFE3",
              colorInputText: "#2E4332",
              fontFamily: "var(--font-sans), system-ui, sans-serif",
              borderRadius: "0.625rem",
            },
          }}
        />
      </div>
    </div>
  );
}
