import { Button, Card, CardContent, CardHeader, Heading, Text } from "@modern-essentials/ui";
import Link from "next/link";
import { Construction } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-surface py-20">
      <Card className="w-full max-w-2xl bg-surface-container-low border-none shadow-sm rounded-[40px] overflow-hidden">
        <CardHeader className="pt-12 pb-6 items-center space-y-6">
          <div className="bg-surface w-20 h-20 rounded-full flex items-center justify-center shadow-inner">
            <Construction className="w-10 h-10 text-primary/20" />
          </div>
          <div className="space-y-3">
            <Heading variant="h1" className="text-3xl md:text-4xl text-primary tracking-tighter">
              {title}
            </Heading>
            <Text variant="lead" className="text-primary/60 max-w-lg mx-auto leading-relaxed text-sm md:text-base">
              {description ||
                "We are currently curating this experience. Check back soon for radical transparency and updates."}
            </Text>
          </div>
        </CardHeader>
        <CardContent className="pb-12 flex justify-center">
          <Button
            asChild
            size="lg"
            className="bg-secondary hover:brightness-110 text-white font-bold px-10 h-14 rounded-full tracking-[0.1em] uppercase text-[10px] shadow-xl shadow-secondary/20 transition-all duration-300"
          >
            <Link href="/">Return Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
