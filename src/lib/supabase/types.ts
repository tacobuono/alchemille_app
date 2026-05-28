/**
 * Supabase generated types — regenerate after schema changes:
 *
 *   npx supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts
 *
 * Hand-maintained shape below mirrors supabase/migrations/0001_initial.sql.
 * Each table includes `Relationships: []` so postgrest-js type inference works;
 * filled in properly when types are regenerated from the live schema.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "student" | "teacher";
export type AlchemicalStage = "nigredo" | "albedo" | "rubedo";
export type VoiceNoteTrigger =
  | "first_practice"
  | "week_one_complete"
  | "halfway"
  | "last_day"
  | "return_after_gap";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_user_id: string;
          email: string;
          name: string | null;
          profile_photo_url: string | null;
          practice_space_photo_url: string | null;
          timezone: string;
          language_preference: string;
          enrollment_date: string | null;
          cohort_id: string | null;
          role: UserRole;
          journal_visibility_consent: boolean;
          garden_visibility_to_cohort: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          clerk_user_id: string;
          email: string;
          name?: string | null;
          profile_photo_url?: string | null;
          practice_space_photo_url?: string | null;
          timezone?: string;
          language_preference?: string;
          enrollment_date?: string | null;
          cohort_id?: string | null;
          role?: UserRole;
          journal_visibility_consent?: boolean;
          garden_visibility_to_cohort?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
        Relationships: [];
      };
      cohorts: {
        Row: {
          id: string;
          course_name: string;
          start_date: string;
          end_date: string;
          max_students: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_name?: string;
          start_date: string;
          end_date: string;
          max_students?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["cohorts"]["Insert"]>;
        Relationships: [];
      };
      practice_sessions: {
        Row: {
          id: string;
          user_id: string;
          started_at: string;
          ended_at: string | null;
          duration_minutes: number | null;
          practice_type: string;
          ujjayi_completed: boolean;
          drishti_completed: boolean;
          tapas_duration_minutes: number | null;
          savasana_duration_minutes: number | null;
          window_opened_at: string | null;
          window_closes_at: string | null;
          herb_planted: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          started_at: string;
          ended_at?: string | null;
          duration_minutes?: number | null;
          practice_type: string;
          ujjayi_completed?: boolean;
          drishti_completed?: boolean;
          tapas_duration_minutes?: number | null;
          savasana_duration_minutes?: number | null;
          window_opened_at?: string | null;
          window_closes_at?: string | null;
          herb_planted?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["practice_sessions"]["Insert"]
        >;
        Relationships: [];
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          practice_session_id: string | null;
          written_at: string;
          body: string;
          written_inside_window: boolean;
          shared_with_cohort: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          practice_session_id?: string | null;
          written_at?: string;
          body: string;
          written_inside_window?: boolean;
          shared_with_cohort?: boolean;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["journal_entries"]["Insert"]
        >;
        Relationships: [];
      };
      modules: {
        Row: {
          id: string;
          stage: AlchemicalStage;
          order_index: number;
          title: string;
          description: string | null;
          video_url: string | null;
          workbook_content: Json | null;
          unlocked_after_practices: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          stage: AlchemicalStage;
          order_index: number;
          title: string;
          description?: string | null;
          video_url?: string | null;
          workbook_content?: Json | null;
          unlocked_after_practices?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["modules"]["Insert"]>;
        Relationships: [];
      };
      module_progress: {
        Row: {
          id: string;
          user_id: string;
          module_id: string;
          completed_at: string | null;
          workbook_responses: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          module_id: string;
          completed_at?: string | null;
          workbook_responses?: Json | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["module_progress"]["Insert"]
        >;
        Relationships: [];
      };
      voice_notes: {
        Row: {
          id: string;
          trigger_event: VoiceNoteTrigger;
          audio_url: string;
          transcript: string | null;
          recorded_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          trigger_event: VoiceNoteTrigger;
          audio_url: string;
          transcript?: string | null;
          recorded_at?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["voice_notes"]["Insert"]>;
        Relationships: [];
      };
      community_letters: {
        Row: {
          id: string;
          sender_user_id: string;
          recipient_cohort_id: string;
          journal_entry_id: string;
          sent_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_user_id: string;
          recipient_cohort_id: string;
          journal_entry_id: string;
          sent_at?: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["community_letters"]["Insert"]
        >;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      user_role: UserRole;
      alchemical_stage: AlchemicalStage;
      voice_note_trigger: VoiceNoteTrigger;
    };
    CompositeTypes: { [_ in never]: never };
  };
}
