export type Plan = "free" | "starter" | "growth" | "pro";
export type Island = "aruba" | "bonaire" | "curacao";

export const VALID_ISLANDS: Island[] = ["aruba", "bonaire", "curacao"];

export const ISLAND_LABELS: Record<Island, string> = {
  aruba: "Aruba",
  bonaire: "Bonaire",
  curacao: "Curaçao",
};

export const PLAN_LABEL: Record<Plan, string> = {
  free: "Free",
  starter: "Starter",
  growth: "Growth",
  pro: "Pro",
};

export const PLAN_BADGE_CLASS: Record<Plan, string> = {
  free: "bg-slate-600 text-slate-50",
  starter: "bg-sky-600 text-sky-50",
  growth: "bg-emerald-600 text-emerald-50",
  pro: "bg-primary text-primary-foreground",
};

export const PLAN_RANK: Record<Plan, number> = {
  pro: 0,
  growth: 1,
  starter: 2,
  free: 3,
};