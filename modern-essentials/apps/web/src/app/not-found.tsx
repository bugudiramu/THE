import Link from "next/link";
import { Button, Heading, Text, Card } from "@modern-essentials/ui";
import { ShoppingBag } from "lucide-react";

export const runtime = "edge";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <Card className="max-w-xl w-full border-none bg-surface-container-low rounded-[40px] p-16 text-center space-y-10 shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-10">
          <div className="w-24 h-24 bg-surface rounded-full mx-auto flex items-center justify-center shadow-inner">
            <ShoppingBag className="w-10 h-10 text-primary/20" />
          </div>
          <div className="space-y-4">
            <Heading variant="h1" className="text-primary tracking-tighter">404 - Not Found</Heading>
            <Text variant="lead" className="text-primary/60 leading-relaxed">
              The page you are looking for has been curated away or never existed. 
              Let's get you back to the collection.
            </Text>
          </div>
          <Button asChild size="lg" className="px-12 bg-secondary rounded-full h-16 font-bold uppercase tracking-widest shadow-lg">
            <Link href="/">Go back home</Link>
          </Button>
        </div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
      </Card>
    </div>
  );
}
