import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center py-12 bg-surface">
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-none border-0 bg-surface-container-low",
            headerTitle: "font-headline text-2xl text-on-surface",
            headerSubtitle: "font-body text-on-surface-variant",
            formButtonPrimary: 
              "bg-secondary hover:bg-secondary/90 text-sm normal-case rounded-full py-3",
            socialButtonsBlockButton: "border-on-surface-variant/20 hover:bg-surface-container-high",
            formFieldLabel: "font-label text-on-surface-variant",
            formFieldInput: "bg-surface border-on-surface-variant/20 rounded-lg",
            footerActionText: "font-body text-on-surface-variant",
            footerActionLink: "text-secondary hover:text-secondary/80 font-medium",
          },
        }}
      />
    </div>
  );
}
