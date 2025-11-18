"use client";

export default function Header() {
  return (
    <header className="w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="/" className="text-lg font-semibold">Guide Me ABC</a>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="/" className="hover:text-foreground">Home</a>
          <a href="/business/auth" className="hover:text-foreground">Login</a>
          <a href="/dashboard" className="hover:text-foreground">Dashboard</a>
        </nav>
      </div>
    </header>
  );
}