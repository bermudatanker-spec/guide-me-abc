// app/not-found.tsx
import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          404 – Page not found
        </div>

        <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Oeps, deze pagina bestaat niet
        </h1>

        <p className="mt-3 text-muted-foreground">
          De link die je hebt gevolgd bestaat niet (meer). Ga terug naar de
          startpagina van Guide Me ABC.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Terug naar home
          </Link>
        </div>
      </div>
    </main>
  );
}