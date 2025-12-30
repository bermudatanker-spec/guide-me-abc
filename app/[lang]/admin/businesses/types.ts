export type SubscriptionPlan = "free" | "starter" | "growth" | "pro";
export type SubscriptionStatus = "active" | "inactive";

export type BusinessRow = {
  id: string;
  name: string;
  island: string | null;
  // LET OP: dit is GEEN array, want UNIQUE(business_id) => max 1 record
  subscriptions: {
    id: string;
    business_id: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
  } | null;
};