// app/islands/[island]/[category]/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="mx-auto max-w-xl text-center">
        <div className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          404 • Not found
        </div>

        <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          We couldn’t find this category
        </h1>

        <p className="mt-3 text-muted-foreground">
          The page you’re looking for doesn’t exist or has moved. Try going
          back to the island overview.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/islands">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to all islands
            </Link>
          </Button>
          <Button asChild>
            <Link href="/">
              Go to homepage
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}