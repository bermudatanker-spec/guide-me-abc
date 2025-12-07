// src/components/ui/slider.tsx
"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          // track (grijze achtergrond)
          "relative h-1.5 w-full grow overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800/70",
        )}
      >
        <SliderPrimitive.Range
          className="absolute h-full"
          style={{
            // Koraal gradient – zelfde vibe als je CTA-button
            background: "linear-gradient(90deg, #FF7A4F 0%, #FF946C 100%)",
          }}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          "block h-4 w-4 rounded-full border border-white/70 bg-white shadow-md",
          "transition-transform duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "focus-visible:ring-[#FF7A4F]/70 focus-visible:ring-offset-background",
        )}
      />
    </SliderPrimitive.Root>
  );
});

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };