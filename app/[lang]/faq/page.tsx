// src/app/[lang]/faq/page.tsx
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { DICTS } from "@/i18n/dictionaries"; 
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { notFound } from "next/navigation";

// ✅ Next 16 type definitie: params MOET een Promise zijn
interface PageProps {
  params: Promise<{ lang: string }>;
}

type QA = { q: string; a: string };

const getDict = (l: Locale) => DICTS[l] ?? DICTS.en;

/* ---------- helper: FAQ per taal ---------- */
function getFaqs(lang: Locale): QA[] {
  if (lang === "nl") {
    return [
      { q: "Wat is Guide Me ABC?", a: "Een digitale gids voor Aruba, Bonaire en Curaçao met activiteiten, restaurants, winkels en vertrouwde lokale bedrijven." },
      { q: "Hoe ontdek ik bedrijven per eiland?", a: "Ga in de navigatie naar ‘Islands’ en kies Aruba, Bonaire of Curaçao. Filter daarna op categorie." },
      { q: "Kan ik de taal wisselen en op dezelfde pagina blijven?", a: "Ja. Gebruik de taalselector in de header — de route blijft gelijk, alleen de taal in de URL wijzigt." },
      { q: "Ik heb een bedrijf. Hoe voeg ik mijn vermelding toe?", a: "Ga naar ‘For Business’ voor pakketten en om je vermelding ter review in te sturen." },
      { q: "Worden vermeldingen gecontroleerd?", a: "Ja, we beoordelen inzendingen en tonen enkel betrouwbare lokale bedrijven." },
    ];
  }

  if (lang === "pap") {
    return [
      { q: "Ki ta Guide Me ABC?", a: "Un guia digital pa Aruba, Boneiru i Kòrsou ku aktividad, restoran i negoshinan lokal konfiá." },
      { q: "Kon mi por hanja negoshinan pa kada isla?", a: "Bai na ‘Islands’ den e menunan i skohe bo isla, despues skohe kategoria." },
      { q: "Mi por kambia di idioma anto keda riba mesun página?", a: "Si, usa e selektor di idioma riba e header." },
    ];
  }

  if (lang === "es") {
    return [
      { q: "¿Qué es Guide Me ABC?", a: "Una guía digital para Aruba, Bonaire y Curazao con actividades, restaurantes y negocios locales confiables." },
      { q: "¿Cómo exploro por isla?", a: "Ve a ‘Islands’ y elige tu isla; luego filtra por categoría." },
    ];
  }

  return [
    { q: "What is Guide Me ABC?", a: "A digital guide to Aruba, Bonaire & Curaçao with activities, restaurants, shops and trusted local businesses." },
    { q: "How do I explore businesses per island?", a: "Go to ‘Islands’ in the top navigation and choose your island. Then pick a category." },
  ];
}

/* ---------- Metadata (Next 16 Proof) ---------- */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: raw } = await params; // ✅ Await is verplicht in Next 16
  const lang = isLocale(raw) ? raw : "en";
  const t = getDict(lang);

  // ✅ Voorkom 'pap' rode kronkels door Record type casting
  const languages: Record<string, string> = {
    en: "/en/faq",
    nl: "/nl/faq",
    pap: "/pap/faq",
    es: "/es/faq",
  };

  return {
    title: `FAQ | Guide Me ABC`,
    description: t.faqSubtitle || "Answers about islands, listings and bookings.",
    metadataBase: new URL('https://guide-me-abc.com'),
    alternates: {
      canonical: `/${lang}/faq`,
      languages: languages,
    },
  };
}

/* ---------- Page Component ---------- */
export default async function FaqPage({ params }: PageProps) {
  // ✅ Verplicht awaiten van params voor de build check
  const { lang: raw } = await params;
  
  if (!isLocale(raw)) {
    notFound();
  }

  const lang = raw as Locale;
  const t = getDict(lang);
  const faqs = getFaqs(lang);

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <header className="max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          {t.faq || "FAQ"}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t.faqSubtitle || "Your complete guide to Aruba, Bonaire & Curaçao."}
        </p>
      </header>

      <div className="mt-12 max-w-3xl">
        <Accordion type="single" collapsible className="w-full space-y-2">
          {faqs.map((item, i) => (
            <AccordionItem key={i} value={`item-${i + 1}`} className="border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-medium hover:no-underline py-4">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}