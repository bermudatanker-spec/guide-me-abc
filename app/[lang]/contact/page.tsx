"use client";

import { useState } from "react";
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

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);

  // simpele client-validatie
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

      // 👉 In productie: POST naar je route handler /api/contact
      // await fetch("/api/contact", { method: "POST", body: JSON.stringify(formData) });

      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });
      setFormData(initialState);
    } catch {
      toast({
        title: "Sending failed",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Contact Us</h1>
          <p className="text-lg text-muted-foreground mb-12">
            Have a question or feedback? We'd love to hear from you.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium mb-2 text-foreground"
                      >
                        Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={formData.name}
                        onChange={handleChange("name")}
                        placeholder="Your name"
                        aria-invalid={formData.name.trim().length < 2}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium mb-2 text-foreground"
                      >
                        Email
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
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium mb-2 text-foreground"
                      >
                        Subject
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleChange("subject")}
                        placeholder="How can we help?"
                        aria-invalid={formData.subject.trim().length < 2}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium mb-2 text-foreground"
                      >
                        Message
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleChange("message")}
                        placeholder="Your message..."
                        aria-invalid={formData.message.trim().length < 10}
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Minimum 10 characters.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      variant="default"
                      size="lg"
                      className="w-full"
                      disabled={!canSubmit}
                    >
                      {loading ? "Sending…" : "Send Message"}
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
                  <h3 className="font-semibold text-foreground mb-2">Email</h3>
                  <p className="text-sm text-muted-foreground">info@guide-me-abc.com</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Phone className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Phone</h3>
                  <p className="text-sm text-muted-foreground">+599 96763535</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <MapPin className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">Location</h3>
                  <p className="text-sm text-muted-foreground">
                    Serving Aruba, Bonaire & Curaçao
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}