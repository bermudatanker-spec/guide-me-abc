import type { ReactNode } from "react";
import ClientRoot from "../ClientRoot";

type LangLayoutProps = {
  children: ReactNode;
  params: {
    lang: string; 
  };
};

export default function LangLayout({ children }: LangLayoutProps) {
  return <ClientRoot>{children}</ClientRoot>;
}