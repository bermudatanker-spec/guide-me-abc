export default function AdminHomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold mb-6">Admin</h1>
        <p className="text-muted-foreground">Welkom! Kies een sectie hieronder.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a className="rounded-xl border p-5 hover:bg-muted/50" href="/admin/businesses">
            <div className="text-lg font-semibold">Bedrijven beheren</div>
            <div className="text-sm text-muted-foreground">Keur aanvragen goed of af, beheer listings.</div>
          </a>
          {/* Later: categories, users, reviews, etc. */}
        </div>
      </main>
    </div>
  );
}