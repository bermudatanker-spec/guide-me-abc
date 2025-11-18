import { useEffect, useState } from "react";

/**
 * Geeft `true` als viewport < breakpoint, anders `false`.
 * Tijdens SSR is de waarde tijdelijk `undefined` tot de client mount.
 */
export function useIsMobile(breakpoint = 768): boolean | undefined {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    // initieel
    setIsMobile(mql.matches);

    // moderne + oudere browsers
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, [breakpoint]);

  return isMobile;
}