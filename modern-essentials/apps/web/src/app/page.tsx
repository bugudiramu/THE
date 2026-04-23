"use client";

import { Button, Heading, Text, Badge, AspectRatio, Card } from "@modern-essentials/ui";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Leaf } from "lucide-react";
export const runtime = "edge";


export default function Home(): JSX.Element {
  return (
    <main className="min-h-screen bg-surface">
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="z-10 space-y-8">
            <Badge variant="secondary" className="px-3 py-1.5 bg-primary text-white rounded-full gap-2 border-none shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
              <Text variant="xs" className="text-white font-black tracking-[0.1em]">Direct from Farm</Text>
            </Badge>
            
            <div className="space-y-6">
              <Heading variant="h1" className="text-4xl md:text-6xl text-primary leading-[1.1] font-bold">
                Radically Fresh Eggs.{" "}
                <span className="text-secondary block mt-1">
                  Delivered on Subscription.
                </span>
              </Heading>
              <Text variant="lead" className="text-primary/60 max-w-lg text-lg md:text-xl leading-relaxed">
                Starting with eggs, expanding to your daily essentials. Every
                product carries radical transparency in sourcing and quality.
              </Text>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="h-14 px-8 rounded-full text-xs font-black uppercase tracking-widest bg-secondary hover:brightness-110 shadow-lg shadow-secondary/20 transition-all">
                <Link href="/products">Start Your Subscription</Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="h-14 px-8 rounded-full text-xs font-black uppercase tracking-widest border-2 border-primary/5 text-primary hover:bg-primary/5 transition-all">
                <Link href="/traceability">View Sourcing Report</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-secondary/10 rounded-full blur-[100px]"></div>
            
            <Card className="relative rounded-[32px] overflow-hidden border-none shadow-xl bg-surface-container-low max-w-[500px] mx-auto lg:ml-auto">
              <AspectRatio ratio={4 / 5}>
                <Image
                  src="https://images.unsplash.com/photo-1559229873-383d75ba200f?q=80&w=2012&auto=format&fit=crop"
                  alt="Farm Fresh Eggs"
                  fill
                  priority
                  className="object-cover transition-transform hover:scale-105 duration-1000 grayscale-[0.05] hover:grayscale-0"
                />
              </AspectRatio>
            </Card>

            <Card className="absolute -bottom-8 -left-4 bg-surface p-6 rounded-[24px] shadow-2xl max-w-[240px] border-none animate-in slide-in-from-bottom-5 duration-1000 delay-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
                  <Leaf className="w-5 h-5 text-secondary" />
                </div>
                <Heading variant="h4" className="text-primary text-base font-bold">
                  Certified Organic
                </Heading>
              </div>
              <Text variant="small" className="text-primary/60 text-xs leading-relaxed font-semibold">
                Laid exactly 24 hours before your delivery date. Zero compromise.
              </Text>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
