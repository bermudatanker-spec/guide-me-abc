// app/privacy/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Guide Me ABC",
  description:
    "How Guide Me ABC collects, uses, and protects your data across Aruba, Bonaire & Curaçao.",
};

const LAST_UPDATED = "January 2025";

export default function PrivacyPage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="mx-auto max-w-3xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </header>

        <section className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>Information We Collect</h2>
          <p>
            We collect information you provide directly to us (e.g., when you create an account,
            submit a form, or communicate with us). We may also collect limited technical data such
            as device/browser information and usage analytics to improve our services.
          </p>

          <h2>How We Use Your Information</h2>
          <ul>
            <li>To provide, maintain and improve our services and features.</li>
            <li>To personalize content and recommendations.</li>
            <li>To communicate with you about updates, support, and security notices.</li>
            <li>To monitor and analyze trends, usage, and activities.</li>
          </ul>

          <h2>Data Security</h2>
          <p>
            We implement administrative, technical, and organizational measures designed to protect
            your information against unauthorized access, loss, misuse, or alteration. However, no
            method of transmission or storage is completely secure.
          </p>

          <h2>Cookies & Similar Technologies</h2>
          <p>
            We use cookies and similar technologies for essential functionality, preferences
            (including language), and analytics. You can manage cookies in your browser settings.
          </p>

          <h2>Data Retention</h2>
          <p>
            We retain personal data only as long as necessary for the purposes described above or as
            required by law. We also anonymize or delete data when it is no longer needed.
          </p>

          <h2>Your Rights</h2>
          <p>
            Depending on your location, you may have rights to access, correct, delete, or restrict
            processing of your personal data, and to object to certain processing. You may also have
            the right to data portability.
          </p>

          <h2>Third-Party Services</h2>
          <p>
            Where we integrate third-party services (e.g., analytics, payments, hosting), their use
            of your information is governed by their own privacy policies. We select providers with
            strong security and compliance practices.
          </p>

          <h2>Contact</h2>
          <p>
            Questions or requests about this policy? Email{" "}
            <a className="text-primary underline decoration-primary/30 underline-offset-4" href="mailto:privacy@guide-me-abc.com">
              privacy@guide-me-abc.com
            </a>.
          </p>
        </section>
      </article>
    </main>
  );
}