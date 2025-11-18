// components/BusinessMenu.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// kleine helper: haal lang uit het pad: /en/... /nl/...
function currentLangFromPath(pathname: string | null): "en"|"nl"|"pap"|"es" {
  const m = pathname?.split("/").filter(Boolean) ?? [];
  const cand = (m[0] ?? "en") as any;
  return ["en","nl","pap","es"].includes(cand) ? cand : "en";
}

export default function BusinessMenu() {
  const pathname = usePathname();
  const lang = currentLangFromPath(pathname);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">For Business</Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link href={`/${lang}/business/auth`}>Sign in / Register</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${lang}/business/dashboard`}>Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${lang}/business/create`}>Add a Listing</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/${lang}/business`}>Browse Businesses</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}