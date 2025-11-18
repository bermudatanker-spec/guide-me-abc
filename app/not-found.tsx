export default function NotFound() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24 text-center">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="text-muted-foreground mb-8">Pagina niet gevonden.</p>
      <a href="/" className="inline-flex rounded-lg px-4 py-2 bg-primary text-white hover:opacity-90">
        Terug naar home
      </a>
    </main>
  );
}