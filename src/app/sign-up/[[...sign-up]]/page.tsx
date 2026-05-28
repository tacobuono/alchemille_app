import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-cream">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-sage-grey">
            The Alchemille
          </p>
          <h1 className="mt-3 font-serif text-3xl text-forest">Enter.</h1>
          <p className="mt-3 text-sm text-sage-grey">
            Make a quiet account. We&rsquo;ll set up your garden next.
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-cream shadow-none border border-sage/30 rounded-lg",
              headerTitle: "font-serif text-forest",
              formButtonPrimary:
                "bg-forest hover:bg-forest-deep text-cream normal-case tracking-wide",
              footerActionLink: "text-gold hover:text-coral",
            },
            variables: {
              colorPrimary: "#2F4F3A",
              colorBackground: "#FBF7EE",
              colorText: "#2F4F3A",
              colorInputBackground: "#FBF7EE",
              colorInputText: "#1F2A24",
              fontFamily: "var(--font-inter), system-ui, sans-serif",
              borderRadius: "0.375rem",
            },
          }}
        />
      </div>
    </div>
  );
}
