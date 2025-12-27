"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactClient({ lang }: { lang: Locale }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);

  // ✅ FIX: dot escapen, anders is het te "los"
  const isValidEmail = (v: string) => /\S+@\S+\.\S+/.test(v);

  const canSubmit =
    formData.name.trim().length >= 2 &&
    isValidEmail(formData.email) &&
    formData.subject.trim().length >= 2 &&
    formData.message.trim().length >= 10 &&
    !loading;

  const handleChange =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((s) => ({ ...s, [key]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setLoading(true);

      // TODO: koppelen aan route handler /api/contact
      // await fetch("/api/contact", { method: "POST", body: JSON.stringify(formData) });

      toast({
        title: lang === "nl" ? "Bericht verstuurd!" : "Message sent!",
        description:
          lang === "nl"
            ? "We reageren meestal binnen 1 werkdag."
            : "We’ll get back to you as soon as possible.",
      });

      setFormData(initialState);
    } catch {
      toast({
        title: lang === "nl" ? "Verzenden mislukt" : "Sending failed",
        description: lang === "nl" ? "Probeer het zo nog eens." : "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const t = {
    title: lang === "nl" ? "Contact" : "Contact",
    subtitle:
      lang === "nl"
        ? "Heb je een vraag of feedback? Stuur ons gerust een bericht."
        : "Have a question or feedback? We’d love to hear from you.",
    name: lang === "nl" ? "Naam" : "Name",
    email: lang === "nl" ? "E-mail" : "Email",
    subject: lang === "nl" ? "Onderwerp" : "Subject",
    message: lang === "nl" ? "Bericht" : "Message",
    send: lang === "nl" ? "Verstuur bericht" : "Send message",
    minChars: lang === "nl" ? "Minimum 10 tekens." : "Minimum 10 characters.",
    phone: lang === "nl" ? "Telefoon" : "Phone",
    location: lang === "nl" ? "Locatie" : "Location",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ✅ extra brede wrapper zodat je breakpoint echt gehaald wordt */}
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mx-auto w-full">
          <header className="mb-10">
            <h1 className="text-4xl font-bold text-foreground">{t.title}</h1>
            <p className="mt-3 text-lg text-muted-foreground">{t.subtitle}</p>
          </header>

          {/* ✅ Bulletproof: niet afhankelijk van tailwind 'lg' config */}
          <div className="grid grid-cols-1 gap-8 min-[1024px]:grid-cols-3">
            {/* Form */}
            <div className="min-[1024px]:col-span-2">
              <Card className="h-full">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2 text-foreground">
                        {t.name}
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={formData.name}
                        onChange={handleChange("name")}
                        placeholder={lang === "nl" ? "Jouw naam" : "Your name"}
                        aria-invalid={formData.name.trim().length < 2}
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">
                        {t.email}
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange("email")}
                        placeholder="your@email.com"
                        aria-invalid={!isValidEmail(formData.email)}
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-2 text-foreground">
                        {t.subject}
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleChange("subject")}
                        placeholder={lang === "nl" ? "Waar gaat het over?" : "How can we help?"}
                        aria-invalid={formData.subject.trim().length < 2}
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2 text-foreground">
                        {t.message}
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleChange("message")}
                        placeholder={lang === "nl" ? "Typ je bericht..." : "Your message..."}
                        aria-invalid={formData.message.trim().length < 10}
                      />
                      <p className="mt-1 text-xs text-muted-foreground">{t.minChars}</p>
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
                      {loading ? (lang === "nl" ? "Versturen…" : "Sending…") : t.send}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact cards */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <Mail className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">{t.email}</h3>
                  <p className="text-sm text-muted-foreground">info@guide-me-abc.com</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Phone className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">{t.phone}</h3>
                  <p className="text-sm text-muted-foreground">+599 96763535</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <MapPin className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">{t.location}</h3>
                  <p className="text-sm text-muted-foreground">Serving Aruba, Bonaire & Curaçao</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
