// app/[lang]/islands/[island]/[category]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Phone, Globe, ArrowLeft } from "lucide-react";

/* ── Constants ─────────────────────────────────────────── */
const LANGS = ["en", "nl", "pap", "es"] as const;
type Lang = (typeof LANGS)[number];

const ISLANDS = ["aruba", "bonaire", "curacao"] as const;
type Island = (typeof ISLANDS)[number];

const CATEGORY_KEYS = [
  "shops",
  "activities",
  "car-rentals",
  "restaurants",
  "services",
  "real-estate",
] as const;
type CategoryKey = (typeof CATEGORY_KEYS)[number];

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const isLang = (v: string): v is Lang => LANGS.includes(v as any);
const isIsland = (v: string): v is Island => ISLANDS.includes(v as any);
const isCategory = (v: string): v is CategoryKey =>
  CATEGORY_KEYS.includes(v as any);

/* ── i18n copy ─────────────────────────────────────────── */
type CatCopy = { title: string; description: string };
type PageCopy = {
  backTo: string;
  featured: string;
  faqsTitle: string;
  categories: Record<CategoryKey, CatCopy>;
};

const COPY: Record<Lang, PageCopy> = {
  en: {
    backTo: "Back to",
    featured: "Featured",
    faqsTitle: "Frequently Asked Questions",
    categories: {
      shops: { title: "Shops", description: "Discover unique boutiques, local artisans, and shopping destinations across the island." },
      activities: { title: "Activities", description: "From water sports to cultural tours, find unforgettable experiences for every traveler." },
      "car-rentals": { title: "Car Rentals", description: "Find reliable car rental services to explore the island at your own pace." },
      restaurants: { title: "Restaurants", description: "Savor diverse culinary experiences from Caribbean flavors to international cuisine." },
      services: { title: "Services", description: "Professional services to support your business and personal needs on the island." },
      "real-estate": { title: "Commercial Real Estate", description: "Explore commercial properties and business spaces available for rent or purchase." },
    },
  },
  nl: {
    backTo: "Terug naar",
    featured: "Uitgelicht",
    faqsTitle: "Veelgestelde vragen",
    categories: {
      shops: { title: "Shops", description: "Ontdek boetieks, lokale ambachten en fijne winkelbestemmingen verspreid over het eiland." },
      activities: { title: "Activiteiten", description: "Van watersport tot culturele tours: onvergetelijke ervaringen voor iedere reiziger." },
      "car-rentals": { title: "Autoverhuur", description: "Betrouwbare autoverhuur om het eiland in je eigen tempo te verkennen." },
      restaurants: { title: "Restaurants", description: "Proef lokale Caribische smaken en internationale keuken." },
      services: { title: "Services", description: "Professionele diensten voor zakelijke en persoonlijke behoeften." },
      "real-estate": { title: "Zakelijk Vastgoed", description: "Ontdek commerciële panden en bedrijfsruimtes te huur of te koop." },
    },
  },
  es: {
    backTo: "Volver a",
    featured: "Destacados",
    faqsTitle: "Preguntas frecuentes",
    categories: {
      shops: { title: "Tiendas", description: "Descubre boutiques únicas, artesanos locales y zonas de compras por toda la isla." },
      activities: { title: "Actividades", description: "De deportes acuáticos a tours culturales: experiencias inolvidables para todos." },
      "car-rentals": { title: "Alquiler de autos", description: "Servicios confiables para explorar la isla a tu ritmo." },
      restaurants: { title: "Restaurantes", description: "Sabores caribeños e internacionales para todos los gustos." },
      services: { title: "Servicios", description: "Servicios profesionales para tus necesidades personales y de negocio." },
      "real-estate": { title: "Bienes raíces comerciales", description: "Explora espacios comerciales en renta o venta." },
    },
  },
  pap: {
    backTo: "Bèk pa",
    featured: "Destaká",
    faqsTitle: "Preguntanan frekuente",
    categories: {
      shops: { title: "Tienda", description: "Deskubrí boetík uniko, arte lokal i lugarnan pa kumpra riba isla." },
      activities: { title: "Aktividat", description: "For di sport di awa te tour kultural: eksperienshan inolvidabel pa tur hende." },
      "car-rentals": { title: "Hür auto", description: "Servisionan di hür konfiabel pa eksplorá isla na bo propio ritmo." },
      restaurants: { title: "Restoran", description: "Sabor lokal Karibeño i kosina internashonal." },
      services: { title: "Servisionan", description: "Servisionan profeshonal pa bo nesesidat personal òf di negoshi." },
      "real-estate": { title: "Propiedat komersial", description: "Eksplorá espasionan komersial pa huur òf benta." },
    },
  },
};
const getCopy = (lang: Lang) => COPY[lang] ?? COPY.en;

/* ── Demo listings ─────────────────────────────────────── */
type Listing = {
  title: string;
  description: string;
  image: string;
  location: string;
  rating: number;
  category: CategoryKey;
};

const EXAMPLE_LISTINGS: Listing[] = [
  {
    title: "Caribbean Blue Car Rental",
    description: "Reliable vehicles from economy to luxury. Free airport pickup and 24/7 roadside assistance.",
    image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&auto=format&fit=crop",
    location: "Palm Beach",
    rating: 4.8,
    category: "car-rentals",
  },
  {
    title: "Sunset Catamaran Tours",
    description: "Experience breathtaking sunsets with snorkeling, drinks, and unforgettable memories.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop",
    location: "Oranjestad Harbor",
    rating: 4.9,
    category: "activities",
  },
  {
    title: "The Waterfront Restaurant",
    description: "Fresh seafood and Caribbean fusion cuisine with stunning ocean views.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop",
    location: "Eagle Beach",
    rating: 4.7,
    category: "restaurants",
  },
  {
    title: "Island Boutique & Gifts",
    description: "Locally-made crafts, jewelry, art, and unique souvenirs from Caribbean artisans.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop",
    location: "Downtown",
    rating: 4.6,
    category: "shops",
  },
];

/* ── FAQs ─────────────────────────────────────────────── */
const FAQS: Partial<Record<CategoryKey, Array<{ q: string; a: string }>>> = {
  "car-rentals": [
    { q: "Do I need an international driver's license?", a: "A valid license from your home country is usually sufficient for stays under 90 days. Requirements vary by company." },
    { q: "What's the minimum age to rent a car?", a: "Typically 21–25. Young-driver fees may apply under 25." },
    { q: "Is insurance included?", a: "Basic coverage often is; check each vendor for comprehensive options." },
  ],
  restaurants: [
    { q: "Do I need reservations?", a: "Recommended during peak season (Dec–Apr), especially for popular spots." },
    { q: "Typical dining hours?", a: "Lunch 11:30–15:00, dinner 18:00–22:00 (varies per venue)." },
  ],
  activities: [
    { q: "How far in advance should I book?", a: "For diving and boat tours, 2–7 days ahead in peak season." },
    { q: "What should I bring?", a: "Sunscreen, swimwear, water shoes, towel; some tours require extras." },
  ],
};

/* ── Static params & SEO ───────────────────────────────── */
export const dynamicParams = false;

export function generateStaticParams() {
  const out: Array<{ lang: Lang; island: Island; category: CategoryKey }> = [];
  for (const lang of LANGS) {
    for (const island of ISLANDS) {
      for (const category of CATEGORY_KEYS) out.push({ lang, island, category });
    }
  }
  return out;
}

export function generateMetadata({
  params,
}: {
  params: { lang: string; island: string; category: string };
}): Metadata {
  // ⚠ Do not throw notFound() here. Just compute safe metadata.
  const lang = isLang(params.lang) ? (params.lang as Lang) : "en";
  const island = isIsland(params.island) ? (params.island as Island) : "aruba";
  const category = isCategory(params.category)
    ? (params.category as CategoryKey)
    : "shops";

  const c = getCopy(lang).categories[category];
  return {
    title: `${c.title} in ${cap(island)} | Guide Me ABC`,
    description: c.description,
  };
}

/* ── Page ─────────────────────────────────────────────── */
export default function CategoryPage({
  params,
}: {
  params: { lang: string; island: string; category: string };
}) {
  // Validate here (allowed to 404 from the page)
  if (!isLang(params.lang) || !isIsland(params.island) || !isCategory(params.category)) {
    notFound();
  }
  const lang = params.lang as Lang;
  const island = params.island as Island;
  const category = params.category as CategoryKey;

  const pageCopy = getCopy(lang);
  const cat = pageCopy.categories[category];

  // demo listings
  const listings: Listing[] = [
    ...EXAMPLE_LISTINGS.filter((l) => l.category === category),
    ...EXAMPLE_LISTINGS.filter((l) => l.category !== category).slice(0, 2),
  ];
  const categoryFaqs = FAQS[category] ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="mb-4">
            <Button asChild variant="outline" size="sm">
              <Link href={`/${lang}/islands/${island}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {pageCopy.backTo} {cap(island)}
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {cat.title} • {cap(island)}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            {cat.description}
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Listings */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-foreground">
            {pageCopy.featured} {cat.title}
          </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing, i) => (
            <Card
              key={`${listing.title}-${i}`}
              className="overflow-hidden transition-all duration-300 hover:shadow-card hover:border-primary/50"
            >
              <div
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${listing.image})` }}
              />
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-sm font-medium">
                      {listing.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {listing.location}
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {listing.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {listing.description}
                </p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-4 w-4" /> Phone
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Globe className="h-4 w-4" /> Website
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        </section>

        {/* FAQ */}
        {categoryFaqs.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 text-foreground">
              {pageCopy.faqsTitle}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {categoryFaqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger>{faq.q}</AccordionTrigger>
                  <AccordionContent>{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}
      </main>
    </div>
  );
}