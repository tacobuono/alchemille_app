/**
 * Supabase types — mirrors supabase/migrations/0001_initial.sql.
 *
 * Regenerate from the live DB once the migration runs:
 *   npx supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts
 *
 * Until then, keep hand-maintained shape in sync with the SQL.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Intention = "creative" | "deep_learning" | "open";
export type RoutineType = "blrm" | "aerobic" | "yoga" | "savasana10";
export type OpenedIntoCategory =
  | "creative"
  | "learning"
  | "reflective"
  | "engaged"
  | "other"
  | "rested";
export type CreationTag =
  | "music"
  | "language"
  | "garden"
  | "writing"
  | "other";
export type ContentType = "video" | "audio";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_user_id: string;
          email: string;
          display_name: string | null;
          handle: string | null;
          avatar_url: string | null;
          timezone: string;
          language_preference: string;
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_user_id: string;
          email: string;
          display_name?: string | null;
          handle?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          language_preference?: string;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
        Relationships: [];
      };
      check_ins: {
        Row: {
          id: string;
          user_id: string;
          local_date: string;
          checked_in_at: string;
          intention: Intention | null;
          pps_quality: number | null;
          texture_chips: string[];
          journal_text: string | null;
          journaled_on_paper: boolean;
          hrv_value: number | null;
          fast_path_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          local_date: string;
          checked_in_at?: string;
          intention?: Intention | null;
          pps_quality?: number | null;
          texture_chips?: string[];
          journal_text?: string | null;
          journaled_on_paper?: boolean;
          hrv_value?: number | null;
          fast_path_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["check_ins"]["Insert"]>;
        Relationships: [];
      };
      check_in_routines: {
        Row: {
          id: string;
          check_in_id: string;
          routine_type: RoutineType;
          preset_slug: string | null;
          duration_minutes: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          check_in_id: string;
          routine_type: RoutineType;
          preset_slug?: string | null;
          duration_minutes?: number | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["check_in_routines"]["Insert"]
        >;
        Relationships: [];
      };
      check_in_opened_into: {
        Row: {
          id: string;
          check_in_id: string;
          category: OpenedIntoCategory;
          activity_slug: string;
          free_text: string | null;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          check_in_id: string;
          category: OpenedIntoCategory;
          activity_slug: string;
          free_text?: string | null;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["check_in_opened_into"]["Insert"]
        >;
        Relationships: [];
      };
      creation_logs: {
        Row: {
          id: string;
          check_in_id: string;
          tag: CreationTag;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          check_in_id: string;
          tag: CreationTag;
          body: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["creation_logs"]["Insert"]
        >;
        Relationships: [];
      };
      course_content: {
        Row: {
          id: string;
          course_slug: string;
          content_type: ContentType;
          title: string;
          slug: string;
          order_index: number;
          url: string | null;
          duration_seconds: number | null;
          transcript: string | null;
          description: string | null;
          language: string;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_slug: string;
          content_type: ContentType;
          title: string;
          slug: string;
          order_index?: number;
          url?: string | null;
          duration_seconds?: number | null;
          transcript?: string | null;
          description?: string | null;
          language?: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["course_content"]["Insert"]
        >;
        Relationships: [];
      };
      course_progress: {
        Row: {
          id: string;
          user_id: string;
          content_id: string;
          last_position_seconds: number;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content_id: string;
          last_position_seconds?: number;
          completed_at?: string | null;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["course_progress"]["Insert"]
        >;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
