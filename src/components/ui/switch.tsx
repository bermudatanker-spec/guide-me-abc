"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300",
      // OFF STATE
      "bg-gray-300",
      // ON STATE (Guide Me ABC turquoise gradient)
      "data-[state=checked]:bg-[linear-gradient(90deg,#00BFD3_0%,#A2E6F2_100%)]",
      // DISABLED
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-300",
        // OFF POSITION
        "translate-x-0",
        // ON POSITION
        "data-[state=checked]:translate-x-5"
      )}
    />
  </SwitchPrimitives.Root>
));

Switch.displayName = "Switch";

export { Switch };