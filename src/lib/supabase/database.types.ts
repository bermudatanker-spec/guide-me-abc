// src/lib/supabase/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/* -------------------------------------------------
 * Helpers (bewust soepel om TS-hel te voorkomen)
 * - Hierdoor krijg je geen "never" op tables
 * - En hoef je niet élke kolom perfect te typeren
 * ------------------------------------------------- */
type InsertBase = Record<string, any>;
type UpdateBase = Record<string, any>;

export type Database = {
  public: {
    /* =========================
     * TABLES
     * ========================= */
    Tables: {
      /* -------- ai_questions -------- */
      ai_questions: {
        Row: {
          id: string;
          question: string | null;
          lang: string | null;
          island: string | null;
          created_at: string | null;
          updated_at: string | null;
          [key: string]: any;
        };
        Insert: InsertBase;
        Update: UpdateBase;
        Relationships: any[];
      };

      /* -------- alerts -------- */
      alerts: {
        Row: {
          id: string;
          title: string | null;
          body: string | null;
          level: string | null; // info/warn/error
          starts_at: string | null;
          ends_at: string | null;
          created_at: string | null;
          updated_at: string | null;
          [key: string]: any;
        };
        Insert: InsertBase;
        Update: UpdateBase;
        Relationships: any[];
      };

      /* -------- business_listings -------- */
      business_listings: {
        Row: {
          id: string;
          owner_id: string | null;

          // Belangrijk voor jouw search / listings
          business_name: string | null; // ✅ jij gebruikt business_name
          name: string | null; // sommige seeds/oudere code gebruikt "name"
          slug: string | null;

          island: string | null;
          island_id: string | null;

          description: string | null;
          status: string | null;

          highlight_1: string | null;
          highlight_2: string | null;
          highlight_3: string | null;

          social_instagram: string | null;
          social_facebook: string | null;
          social_tiktok: string | null;

          created_at: string | null;
          updated_at: string | null;

          [key: string]: any;
        };
        Insert: InsertBase;
        Update: UpdateBase;
        Relationships: any[];
      };

      /* -------- business_offers -------- */
      business_offers: {
        Row: {
          id: string;
          business_id: string | null;

          title: string | null;
          description: string | null;

          // ⚠️ BELANGRIJK: string, geen number (zoals jij zei)
          price: string | null;

          valid_until: string | null; // ISO date
          image_url: string | null;

          created_at: string | null;
          updated_at: string | null;

          [key: string]: any;
        };
        Insert: InsertBase;
        Update: UpdateBase;
        Relationships: any[];
      };

      /* -------- categories -------- */
      categories: {
        Row: {
          id: string;
          name: string | null;
          slug: string | null;

          // vaak handig in Guide-Me-ABC
          island: string | null;
          icon: string | null;
          color: string | null;
          sort_order: number | null;

          created_at: string | null;
          updated_at: string | null;

          [key: string]: any;
        };
        Insert: InsertBase;
        Update: UpdateBase;
        Relationships: any[];
      };

      /* -------- claim_requests -------- */
      claim_requests: {
        Row: {
          id: string;
          business_id: string | null;
          user_id: string | null;

          status: string | null; // pending/approved/rejected
          message: string | null;

          created_at: string | null;
          updated_at: string | null;

          [key: string]: any;
        };
        Insert: InsertBase;
        Update: UpdateBase;
        Relationships: any[];
      };

      /* -------- listing_pages -------- */
      listing_pages: {
        Row: {
          id: string;
          owner_id: string | null;

          title: string | null;
          slug: string | null;

          island: string | null;
          island_id: string | null;

          description: string | null;

          created_at: string | null;
          updated_at: string | null;

          [key: string]: any;
        };
        Insert: InsertBase;
        Update: UpdateBase;
        Relationships: any[];
      };

      /* -------- places_of_interest -------- */
      places_of_interest: {
        Row: {
          id: string;
          name: string | null;
          slug: string | null;
          island: string | null;
          description: string | null;

          lat: number | null;
          lng: number | null;

          created_at: string | null;
          updated_at: string | null;

          [key: string]: any;
        };
        Insert: InsertBase;
        Update: UpdateBase;
        Relationships: any[];
      };

      /* -------- platform_settings -------- */
      platform_settings: {
        Row: {
          key: string;
          value: Json | null;
          updated_at: string | null;
          [key: string]: any;
        };
        Insert: InsertBase;
        Update: UpdateBase;
        Relationships: any[];
      };

      /* -------- profiles -------- */
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;

          roles: string[] | null;
          is_blocked: boolean | null;

          created_at: string | null;
          updated_at: string | null;

          [key: string]: any;
        };
        Insert: InsertBase;
        Update: UpdateBase;
        Relationships: any[];
      };

      /* -------- public_businesses -------- */
      public_businesses: {
        Row: {
          id: string;
          business_id: string | null;
          slug: string | null;
          island: string | null;

          title: string | null;
          description: string | null;

          created_at: string | null;
          updated_at: string | null;

          [key: string]: any;
        };
        Insert: InsertBase;
        Update: UpdateBase;
        Relationships: any[];
      };

      /* -------- reviews -------- */
      reviews: {
        Row: {
          id: string;
          business_id: string | null;
          user_id: string | null;

          rating: number | null;
          title: string | null;
          body: string | null;

          created_at: string | null;
          updated_at: string | null;

          [key: string]: any;
        };
        Insert: InsertBase;
        Update: UpdateBase;
        Relationships: any[];
      };

      /* -------- subscriptions -------- */
      subscriptions: {
        Row: {
          id: string;
          user_id: string | null;
          business_id: string | null;

          plan: string | null;
          status: string | null; // active/canceled/past_due/etc.
          current_period_start: string | null;
          current_period_end: string | null;

          created_at: string | null;
          updated_at: string | null;

          [key: string]: any;
        };
        Insert: InsertBase;
        Update: UpdateBase;
        Relationships: any[];
      };

      /* -------- user_roles -------- */
      user_roles: {
        Row: {
          id: string;
          user_id: string | null;
          role: string | null; // admin/super_admin/business_owner/etc.
          created_at: string | null;
          updated_at: string | null;
          [key: string]: any;
        };
        Insert: InsertBase;
        Update: UpdateBase;
        Relationships: any[];
      };

      /* -------- audit_business_moderation -------- */
      audit_business_moderation: {
        Row: {
          id: string;
          business_id: string | null;
          action: string | null;
          detail: Json | null;
          created_at: string | null;
          [key: string]: any;
        };
        Insert: InsertBase;
        Update: UpdateBase;
        Relationships: any[];
      };
    };

    /* =========================
     * RPC FUNCTIONS
     * ========================= */
    Functions: {
      toggle_user_role: {
        Args: {
          p_user_id: string;
          p_role: string;
        };
        Returns: Json;
      };

      toggle_user_blocked: {
        Args: {
          p_user_id: string;
        };
        Returns: Json;
      };

      get_all_users_with_roles: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          email: string | null;
          full_name: string | null;
          roles: string[] | null;
          is_blocked: boolean | null;
          created_at: string | null;
          updated_at: string | null;
          // optioneel, als je RPC dit teruggeeft:
          last_sign_in_at?: string | null;
          business_name?: string | null;
          [key: string]: any;
        }[];
      };
    };

    Views: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};