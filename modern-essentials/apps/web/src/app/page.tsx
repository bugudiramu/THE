"use client";

import { Button } from "@modern-essentials/ui";
import Image from "next/image";
import Link from "next/link";

export default function Home(): JSX.Element {
  return (
    <>
      <main className="min-h-screen bg-surface text-on-surface">
        <section className="relative pt-40 pb-24 overflow-hidden bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="z-10">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary-fixed text-on-primary-fixed rounded-full mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-xs font-bold tracking-widest uppercase font-label">
                  Direct from Farm
                </span>
              </div>
              <h1 className="text-6xl md:text-7xl font-heading font-extrabold text-primary leading-[1.1] mb-8 tracking-tight">
                Radically Fresh Eggs.{" "}
                <span className="text-secondary">
                  Delivered on Subscription.
                </span>
              </h1>
              <p className="text-xl text-on-surface-variant leading-relaxed mb-10 max-w-xl font-body">
                Starting with eggs, expanding to your daily essentials. Every
                product carries radical transparency in sourcing and quality.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                <Button asChild size="lg">
                  <Link href="/products">Start Your Subscription</Link>
                </Button>
                <Button variant="secondary" asChild size="lg">
                  <Link href="/traceability">View Sourcing Report</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-secondary-container/30 rounded-full blur-3xl"></div>
              <div className="relative rounded-[16px] overflow-hidden shadow-[0_20px_40px_rgba(28,28,24,0.08)]">
                <div className="w-full h-[600px] bg-surface-container-low flex items-center justify-center">
                  <Image
                    src="https://images.unsplash.com/photo-1559229873-383d75ba200f?q=80&w=2012&auto=format&fit=crop"
                    alt="Product Image Placeholder"
                    width={300}
                    height={600}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
                  />
                </div>
              </div>
              <div className="absolute -bottom-10 -left-10 bg-surface-container-lowest p-6 rounded-[16px] shadow-xl max-w-[240px] border border-outline-variant/15">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-primary-fixed rounded-full flex items-center justify-center">
                    <span className="text-on-primary-fixed font-bold text-lg">
                      🌱
                    </span>
                  </div>
                  <span className="font-bold text-primary tracking-tight font-heading">
                    Certified Organic
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant font-body">
                  Laid exactly 24 hours before your delivery date.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
