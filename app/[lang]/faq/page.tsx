// app/[lang]/faq/page.tsx
import type { Metadata } from "next";
import { isLocale, type Locale } from "@/i18n/config";
import { DICTS } from "@/i18n/dictionaries";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Params = { lang: Locale };
const dict = (l: Locale) => DICTS[l] ?? DICTS.en;

/* ---------- helper: FAQ per taal ---------- */
type QA = { q: string; a: string };

function getFaqs(lang: Locale): QA[] {
  // NL
  if (lang === "nl") {
    return [
      {
        q: "Wat is Guide Me ABC?",
        a: "Een digitale gids voor Aruba, Bonaire en Curaçao met activiteiten, restaurants, winkels en vertrouwde lokale bedrijven.",
      },
      {
        q: "Hoe ontdek ik bedrijven per eiland?",
        a: "Ga in de navigatie naar ‘Islands’ en kies Aruba, Bonaire of Curaçao. Filter daarna op categorie (bv. Restaurants of Car Rentals).",
      },
      {
        q: "Kan ik de taal wisselen en op dezelfde pagina blijven?",
        a: "Ja. Gebruik de taalselector in de header — je blijft op dezelfde route en we wisselen alleen het taalstuk in de URL.",
      },
      {
        q: "Ik heb een bedrijf. Hoe voeg ik mijn vermelding toe?",
        a: "Ga naar ‘For Business’ voor pakketten en om je vermelding ter review in te sturen.",
      },
      {
        q: "Worden vermeldingen gecontroleerd?",
        a: "Ja, we beoordelen inzendingen en tonen enkel betrouwbare lokale bedrijven. Reviews kunnen worden gemodereerd om misbruik te voorkomen.",
      },
      {
        q: "Kan ik direct via jullie boeken?",
        a: "We linken nu door naar betrouwbare partners. Direct boeken op Guide Me ABC komt later.",
      },
      {
        q: "Wat kost een vermelding?",
        a: "We bieden gratis en betaalde pakketten. Bekijk ‘For Business’ voor actuele opties en prijzen.",
      },
      {
        q: "Hoe neem ik contact op?",
        a: "Gebruik de contactpagina of mail naar info@guide-me-abc.com — we reageren meestal binnen 1 werkdag.",
      },
    ];
  }

  // Papiamentu (korte placeholder-vertaling)
  if (lang === "pap") {
    return [
      { q: "Ki ta Guide Me ABC?", a: "Un guia digital pa Aruba, Boneiru i Kòrsou ku aktividad, restoran i negoshinan lokal konfiá." },
      { q: "Kiko manera mi por hanja negoshinan pa isla?", a: "Bai na ‘Islands’ den e menunan i skohe Aruba, Boneiru òf Kòrsou, despues skohe kategoria." },
      { q: "Mi por kambia idioma sin sali di e mesun página?", a: "Si, uza e selektor di idioma riba e header." },
      { q: "Kon mi por agrega mi negoshi?", a: "Bisa ‘For Business’ pa plananan i pa submiti bo listing." },
      { q: "Bosonan ta kontrolá listing i review?", a: "Si, nos ta revisá pa keda konfiá i eliminá spam." },
      { q: "Mi por reservá direktamente?", a: "Aworaki nos ta dirigí bo na partnernan konfiá." },
    ];
  }

  // Español (corto)
  if (lang === "es") {
    return [
      { q: "¿Qué es Guide Me ABC?", a: "Una guía digital para Aruba, Bonaire y Curazao con actividades, restaurantes y negocios locales confiables." },
      { q: "¿Cómo exploro por isla?", a: "Ve a ‘Islands’ y elige Aruba, Bonaire o Curazao; luego filtra por categoría." },
      { q: "¿Puedo cambiar el idioma y quedarme en la misma página?", a: "Sí, usa el selector de idioma del encabezado." },
      { q: "Soy empresa, ¿cómo me doy de alta?", a: "Visita ‘For Business’ para planes y enviar tu ficha." },
      { q: "¿Verifican los listados?", a: "Sí, revisamos envíos y moderamos reseñas contra el spam." },
    ];
  }

  // EN (default)
  return [
    {
      q: "What is Guide Me ABC?",
      a: "A digital guide to Aruba, Bonaire & Curaçao with activities, restaurants, shops and trusted local businesses.",
    },
    {
      q: "How do I explore businesses per island?",
      a: "Go to ‘Islands’ in the top navigation and choose Aruba, Bonaire or Curaçao. Then pick a category like Restaurants or Car Rentals.",
    },
    {
      q: "Can I switch language and stay on the same page?",
      a: "Yes. Use the language selector in the header — we keep you on the same route and only change the language segment in the URL.",
    },
    {
      q: "I’m a business owner. How can I get listed?",
      a: "Visit ‘For Business’ to see plans and submit your listing for review.",
    },
    {
      q: "Do you verify listings and reviews?",
      a: "We vet submissions and surface trusted local businesses. Reviews may be moderated to prevent spam or abuse.",
    },
    {
      q: "Can I book directly via Guide Me ABC?",
      a: "We currently link out to trusted partners. Direct booking on Guide Me ABC is on the roadmap.",
    },
    {
      q: "What does a listing cost?",
      a: "We offer free and paid plans. Check ‘For Business’ for current options and pricing.",
    },
    {
      q: "How can I contact you?",
      a: "Use the contact page or email info@guide-me-abc.com — we typically reply within one business day.",
    },
  ];
}

/* ---------- Metadata ---------- */
export async function generateMetadata(
  { params }: { params: Params }
): Promise<Metadata> {
  const lang = isLocale(params.lang) ? params.lang : "en";
  const t = dict(lang);

  const languages: Record<string, string> = {
    en: "/en/faq",
    nl: "/nl/faq",
    pap: "/pap/faq",
    es: "/es/faq",
  };

  return {
    title: `FAQ | Guide Me ABC`,
    description:
      t.faqSubtitle ??
      "Answers about islands, listings, bookings and businesses.",
    alternates: {
      canonical: `/${lang}/faq`,
      languages,
    } as Metadata["alternates"], // voorkomt 'pap' type warning
    openGraph: { title: "FAQ | Guide Me ABC", url: `/${lang}/faq` },
  };
}

/* ---------- Page ---------- */
export default async function FaqPage({ params }: { params: Params }) {
  const lang = isLocale(params.lang) ? params.lang : "en";
  const t = dict(lang);
  const faqs = getFaqs(lang);

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
        {t.faq ?? "FAQ"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {t.faqSubtitle ??
          "Your complete guide to Aruba, Bonaire & Curaçao — beaches, restaurants, tours and trusted local businesses."}
      </p>

      <div className="mt-8">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((item, i) => (
            <AccordionItem key={i} value={`item-${i + 1}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}