export type Plan = "start" | "groei" | "pro" | "enterprise";

export type PlanCapabilities = {
  plan: Plan;

  // limits
  maxCategories: number;
  maxLocations: number;
  maxDeals: number; // use Infinity
  maxPhotos: number;
  maxVideos: number;

  // features
  hasMiniSite: boolean;
  hasReviews: boolean;
  hasEvents: boolean;
  hasCoupons: boolean;
  hasBlog: boolean;
  hasSpotlight: boolean;
  hasLeadManagement: boolean;
  hasTeamMembers: boolean;
  hasApiAccess: boolean;
  hasCsvImportExport: boolean;
  hasWhiteLabelMiniSite: boolean;
};

const INF = Number.POSITIVE_INFINITY;

export const PLAN_CAPABILITIES: Record<Plan, PlanCapabilities> = {
  start: {
    plan: "start",
    maxCategories: 1,
    maxLocations: 1,
    maxDeals: 1,
    maxPhotos: 10,
    maxVideos: 0,
    hasMiniSite: false,
    hasReviews: false,
    hasEvents: false,
    hasCoupons: false,
    hasBlog: false,
    hasSpotlight: false,
    hasLeadManagement: false,
    hasTeamMembers: false,
    hasApiAccess: false,
    hasCsvImportExport: false,
    hasWhiteLabelMiniSite: false,
  },
  groei: {
    plan: "groei",
    maxCategories: INF,
    maxLocations: 3,
    maxDeals: INF,
    maxPhotos: 30,
    maxVideos: 5,
    hasMiniSite: false,
    hasReviews: true,
    hasEvents: false,
    hasCoupons: false,
    hasBlog: false,
    hasSpotlight: false,
    hasLeadManagement: false,
    hasTeamMembers: true,
    hasApiAccess: false,
    hasCsvImportExport: false,
    hasWhiteLabelMiniSite: false,
  },
  pro: {
    plan: "pro",
    maxCategories: INF,
    maxLocations: INF,
    maxDeals: INF,
    maxPhotos: INF,
    maxVideos: INF,
    hasMiniSite: true,
    hasReviews: true,
    hasEvents: true,
    hasCoupons: true,
    hasBlog: true,
    hasSpotlight: true,
    hasLeadManagement: true,
    hasTeamMembers: true,
    hasApiAccess: false,
    hasCsvImportExport: false,
    hasWhiteLabelMiniSite: false,
  },
  enterprise: {
    plan: "enterprise",
    maxCategories: INF,
    maxLocations: INF,
    maxDeals: INF,
    maxPhotos: INF,
    maxVideos: INF,
    hasMiniSite: true,
    hasReviews: true,
    hasEvents: true,
    hasCoupons: true,
    hasBlog: true,
    hasSpotlight: true,
    hasLeadManagement: true,
    hasTeamMembers: true,
    hasApiAccess: true,
    hasCsvImportExport: true,
    hasWhiteLabelMiniSite: true,
  },
};

export function normalizePlan(value: unknown): Plan {
  const v = String(value ?? "").toLowerCase().trim();
  if (v === "start" || v === "starter") return "start";
  if (v === "groei" || v === "growth") return "groei";
  if (v === "pro") return "pro";
  if (v === "enterprise") return "enterprise";
  return "start";
}

export function getCapabilities(plan: unknown): PlanCapabilities {
  return PLAN_CAPABILITIES[normalizePlan(plan)];
}