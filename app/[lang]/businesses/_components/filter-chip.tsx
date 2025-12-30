import Link from "next/link";

export function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background/70 text-foreground hover:bg-muted/80",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}