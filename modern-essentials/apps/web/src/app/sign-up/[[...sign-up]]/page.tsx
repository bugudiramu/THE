import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-[calc(100-8rem)] items-center justify-center py-12">
      <SignUp 
        appearance={{
          elements: {
            formButtonPrimary: 
              "bg-primary hover:bg-primary/90 text-sm normal-case",
          },
        }}
      />
    </div>
  );
}
