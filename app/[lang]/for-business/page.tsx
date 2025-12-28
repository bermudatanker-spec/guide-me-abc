// src/app/[lang]/for-business/page.tsx
import type React from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { isLocale, type Locale, LOCALES } from "@/i18n/config";
import { DICTS } from "@/i18n/dictionaries";
import { buildLanguageAlternates } from "@/lib/seo/alternates";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Check,
  Users,
  MapPin,
  Globe,
  BarChart3,
  MessageCircle,
  Star,
  ArrowRight,
} from "lucide-react";

type PageProps = {
  params: Promise<{ lang: string }>;
};

export const dynamic = "force-dynamic";

const SITE_URL = "https://guide-me-abc.com";
const BASE_PATH = "/for-business";

const dict = (l: Locale) => DICTS[l] ?? DICTS.en;

/* -------------------- Metadata -------------------- */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "en";
  const t = dict(lang);

  const title = `${t.forBusiness ?? "For Business"} | Guide Me ABC`;
  const description =
    t.fbHeroSubtitle ??
    "Create your professional mini-site and reach customers on the ABC Islands with analytics, WhatsApp contact, reviews, and more.";

  const canonicalPath = `/${lang}${BASE_PATH}`;

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: canonicalPath,
      languages: buildLanguageAlternates(LOCALES, BASE_PATH),
    },
    openGraph: {
      title,
      description,
      url: new URL(canonicalPath, SITE_URL).toString(),
      type: "website",
    },
  };
}

/* -------------------- Data -------------------- */
type Plan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
};

const pricingPlans: Plan[] = [
  {
    name: "Starter",
    price: "€12",
    period: "/month",
    description: "Perfect for small businesses getting started",
    features: [
      "Basic mini-site with your branding",
      "Up to 10 photos",
      "Contact information & location",
      "WhatsApp button for inquiries",
      "Monthly analytics report",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Growth",
    price: "€29",
    period: "/month",
    description: "For businesses ready to grow their reach",
    features: [
      "Everything in Starter, plus:",
      "Unlimited photos & galleries",
      "Special offers & promotions",
      "Multi-location support",
      "Customer reviews display",
      "Weekly analytics & insights",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Pro",
    price: "€59",
    period: "/month",
    description: "Maximum visibility for established businesses",
    features: [
      "Everything in Growth, plus:",
      "Featured placement in categories",
      "Custom mini-website for your business",
      "Advanced analytics dashboard",
      "Custom domain option",
      "API integration support",
      "Dedicated account manager",
      "Premium badge & verification",
    ],
    cta: "Start Free Trial",
  },
];

type Feature = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
};

const features: Feature[] = [
  { icon: Globe, title: "Professional Mini-Site", description: "Beautiful, mobile-optimized presence" },
  { icon: MapPin, title: "Multi-Location Support", description: "Manage all your branches easily" },
  { icon: MessageCircle, title: "Direct Customer Contact", description: "WhatsApp integration for instant communication" },
  { icon: Star, title: "Customer Reviews", description: "Build trust with authentic testimonials" },
  { icon: BarChart3, title: "Analytics & Insights", description: "Track your performance and leads" },
  { icon: Users, title: "Reach More Customers", description: "Connect with locals and tourists alike" },
];

/* -------------------- Helpers: consistent CTA style -------------------- */
const ctaClass =
  "inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold text-white " +
  "transition-all duration-300 ease-out hover:scale-[1.02] " +
  "shadow-[0_6px_20px_rgba(0,191,211,0.25)]";

const ctaStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #00BFD3 0%, rgba(0,191,211,0.12) 100%)",
};

/* -------------------- Page -------------------- */
export default async function ForBusinessPage({ params }: PageProps) {
  const { lang: raw } = await params;
  const lang: Locale = isLocale(raw) ? raw : "en";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero (boxed gradient + turquoise CTA) */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-5 bg-primary/10 text-primary hover:bg-primary/20">
              For Businesses
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Grow Your Business on the ABC Islands
            </h1>

            <p className="mt-6 text-xl text-muted-foreground">
              Create your professional mini-site, reach thousands of potential customers,
              and grow your business with our all-in-one platform.
            </p>

            <div className="mt-8">
              <Link
                href={`/${lang}/business/auth`}
                className={ctaClass}
                style={ctaStyle}
                aria-label="Start free trial for businesses"
              >
                Get Started – Free Trial
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Features */}
        <section className="mb-20" aria-labelledby="features-heading">
          <h2
            id="features-heading"
            className="text-3xl font-bold mb-12 text-center text-foreground"
          >
            Everything You Need to Succeed
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="border-border">
                <CardContent className="p-6">
                  <Icon className="h-10 w-10 text-primary mb-4" aria-hidden="true" />
                  <h3 className="font-semibold text-lg text-foreground mb-2">{title}</h3>
                  <p className="text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="mb-20" aria-labelledby="pricing-heading">
          <div className="text-center mb-12">
            <h2 id="pricing-heading" className="text-3xl font-bold mb-4 text-foreground">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the plan that fits your business. Upgrade anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.popular
                    ? "border-primary shadow-[0_0_0_1px_rgba(0,191,211,0.15),0_10px_30px_rgba(0,191,211,0.15)]"
                    : "border-border"
                }`}
                aria-label={`${plan.name} plan`}
              >
                {plan.popular && (
                  <Badge
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-white font-medium border-0 shadow-sm"
                    style={{
                      background: "linear-gradient(90deg, #00BFD3 0%, rgba(0,191,211,0.12) 100%)",
                      boxShadow: "0 4px 12px rgba(0,191,211,0.35)",
                    }}
                  >
                    Most Popular
                  </Badge>
                )}

                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>

                  <div className="mb-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/${lang}/business/auth`}
                    className={`${ctaClass} w-full justify-center`}
                    style={ctaStyle}
                    aria-label={`Choose ${plan.name} plan`}
                  >
                    {plan.cta}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Social Proof (placeholder logos) */}
        <section className="mb-20 text-center" aria-labelledby="trusted-heading">
          <h2 id="trusted-heading" className="text-3xl font-bold mb-8 text-foreground">
            Trusted by Local Businesses
          </h2>

          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="w-32 h-16 bg-muted rounded flex items-center justify-center"
                aria-label={`Partner logo ${i + 1}`}
              >
                <span className="text-muted-foreground font-semibold">Logo {i + 1}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA – boxed */}
        <section
          className="text-center rounded-2xl p-10 md:p-12"
          aria-labelledby="cta-heading"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,191,211,0.10) 0%, rgba(0,191,211,0.04) 100%)",
            boxShadow:
              "0 12px 30px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,191,211,0.10) inset",
          }}
        >
          <h2 id="cta-heading" className="text-3xl font-bold mb-4 text-foreground">
            Ready to Grow Your Business?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of businesses already reaching more customers on the ABC Islands.
          </p>

          <Link
            href={`/${lang}/business/auth`}
            className={ctaClass}
            style={ctaStyle}
            aria-label="Start your free trial"
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
          </Link>
        </section>
      </main>
    </div>
  );
}