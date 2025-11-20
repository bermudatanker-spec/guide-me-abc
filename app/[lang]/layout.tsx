// app/[lang]/layout.tsx
import type { ReactNode } from "react";
import ClientRoot from "../ClientRoot";

type LangLayoutProps = {
  children: ReactNode;
  params: {
    lang: string; // dynamic segment: /nl, /en, ...
  };
};

export default function LangLayout({ children, params }: LangLayoutProps) {
  // Voor nu gebruiken we lang niet hier, Navigation/Footer halen zelf de lang uit de URL
  // maar we accepteren 'params' wél, zodat Next's types tevreden zijn.
  void params; // voorkomt "unused" warning, doet verder niets

  return <ClientRoot>{children}</ClientRoot>;
}