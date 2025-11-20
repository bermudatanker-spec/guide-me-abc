// app/terms/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Guide Me ABC",
  description:
    "Read the terms and conditions for using Guide Me ABC — your trusted platform for discovering businesses and experiences across the ABC Islands.",
};

const LAST_UPDATED = "January 2025";

export default function TermsPage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="mx-auto max-w-3xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </header>

        <section className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using this website, you accept and agree to be bound by the terms and
            provisions of this agreement. If you do not agree with any part of these terms, you must
            not use this website or any of its services.
          </p>

          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily access the materials on Guide Me ABC’s website for
            personal, non-commercial transitory viewing only. This is the grant of a license, not a
            transfer of title, and under this license you may not:
          </p>
          <ul>
            <li>Modify or copy the materials.</li>
            <li>Use the materials for any commercial purpose or public display.</li>
            <li>
              Attempt to decompile or reverse engineer any software contained on the Guide Me ABC
              website.
            </li>
            <li>
              Remove any copyright or proprietary notations from the materials or transfer them to
              another person.
            </li>
          </ul>

          <h2>3. Disclaimer</h2>
          <p>
            The materials on Guide Me ABC’s website are provided on an “as is” basis. Guide Me ABC
            makes no warranties, expressed or implied, and hereby disclaims and negates all other
            warranties, including without limitation implied warranties or conditions of
            merchantability, fitness for a particular purpose, or non-infringement of intellectual
            property or other violation of rights.
          </p>

          <h2>4. Limitations</h2>
          <p>
            In no event shall Guide Me ABC or its suppliers be liable for any damages (including,
            without limitation, damages for loss of data or profit, or due to business interruption)
            arising out of the use or inability to use the materials on the website.
          </p>

          <h2>5. Revisions and Errata</h2>
          <p>
            The materials appearing on the Guide Me ABC website could include technical,
            typographical, or photographic errors. Guide Me ABC does not warrant that any of the
            materials are accurate, complete, or current. We may make changes to the materials at
            any time without notice.
          </p>

          <h2>6. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of
            Aruba, and you irrevocably submit to the exclusive jurisdiction of the courts in that
            location.
          </p>
        </section>
      </article>
    </main>
  );
}