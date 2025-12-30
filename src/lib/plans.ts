// lib/plans.ts
export type Plan = "starter" | "growth" | "pro";

export const PLAN_ORDER: Plan[] = ["starter", "growth", "pro"];

export const PLANS: Record<
  Plan,
  {
    key: Plan;
    label: string;
    priceMonthly: number; // in your currency (e.g. USD/EUR)
    aiDailyLimit: number;
    featuredSlots: number;
    perks: string[];
  }
> = {
  starter: {
    key: "starter",
    label: "Starter",
    priceMonthly: 29,
    aiDailyLimit: 10,
    featuredSlots: 0,
    perks: ["Basis listing", "Toegang tot dashboard", "Beperkte AI (daily)"],
  },
  growth: {
    key: "growth",
    label: "Growth",
    priceMonthly: 59,
    aiDailyLimit: 50,
    featuredSlots: 3,
    perks: ["Meer zichtbaarheid", "Meer AI (daily)", "Featured slots"],
  },
  pro: {
    key: "pro",
    label: "Pro",
    priceMonthly: 99,
    aiDailyLimit: 200,
    featuredSlots: 6,
    perks: ["Maximale zichtbaarheid", "Max AI (daily)", "Meer featured slots"],
  },
};