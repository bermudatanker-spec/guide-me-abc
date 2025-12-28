// src/types/listing.ts
export type ListingRow = {
  id: string;
  owner_id: string;

  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  route_url: string | null;

  subscription_plan: string | null;
  status: string | null;

  highlight_1: string | null;
  highlight_2: string | null;
  highlight_3: string | null;

  social_instagram: string | null;
  social_facebook: string | null;
  social_tiktok: string | null;

  is_verified: boolean | null;
  verified_at: string | null;
};

// Dashboard list rows (admin/owner dashboard)
export type DashboardListingRow = {
  id: string;
  business_id: string;
  business_name: string;
  island: string;
  status: string;
  is_verified: boolean | null;
  verified_at: string | null;
  owner_id: string;
  deleted_at?: string | null;
  categories: { name: string; slug: string } | null;
  subscription?: { plan: "starter" | "growth" | "pro" } | null;
};