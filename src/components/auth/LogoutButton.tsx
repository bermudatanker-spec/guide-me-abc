import AccountLink from "@/components/nav/AccountLink";
// eventueel ook LogoutButton als we die later toevoegen

export function SiteHeader() {
  return (
    <header className="...">
      {/* links: logo + hoofdmenu */}

      <div className="flex items-center gap-4">
        {/* bestaande knoppen: taal-switcher, Voor bedrijven, icons, ... */}

        <AccountLink />
      </div>
    </header>
  );
}