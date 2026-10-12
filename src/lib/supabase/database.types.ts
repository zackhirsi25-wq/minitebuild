export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: { Args: { extensions?: Json; operationName?: string; query?: string; variables?: Json }; Returns: Json };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      billing_events: {
        Row: {
          business_id: string | null;
          error: string | null;
          event_id: string;
          id: string;
          payload: NonNullable<Json>;
          processed_at: string | null;
          provider: string;
          received_at: string;
          type: string;
        };
        ComputedFields: never;
        Insert: {
          business_id?: string | null;
          error?: string | null;
          event_id: string;
          id?: string;
          payload: NonNullable<Json>;
          processed_at?: string | null;
          provider: string;
          received_at?: string;
          type: string;
        };
        Update: {
          business_id?: string | null;
          error?: string | null;
          event_id?: string;
          id?: string;
          payload?: NonNullable<Json>;
          processed_at?: string | null;
          provider?: string;
          received_at?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "billing_events_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      build_drafts: {
        Row: {
          business_id: string | null;
          created_at: string;
          data: Json;
          id: string;
          token_hash: string;
          updated_at: string;
        };
        Insert: {
          business_id?: string | null;
          created_at?: string;
          data?: Json;
          id?: string;
          token_hash: string;
          updated_at?: string;
        };
        Update: {
          business_id?: string | null;
          created_at?: string;
          data?: Json;
          id?: string;
          token_hash?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      rate_limits: {
        Row: { count: number; key: string; window_start: string };
        Insert: { count?: number; key: string; window_start: string };
        Update: { count?: number; key?: string; window_start?: string };
        Relationships: [];
      };
      terms_acceptances: {
        Row: {
          accepted_at: string;
          business_id: string | null;
          business_name: string;
          business_slug: string;
          documents: Json;
          id: string;
          ip_hash: string | null;
          plan: string;
          user_agent: string | null;
        };
        Insert: {
          accepted_at?: string;
          business_id?: string | null;
          business_name: string;
          business_slug: string;
          documents: Json;
          id?: string;
          ip_hash?: string | null;
          plan: string;
          user_agent?: string | null;
        };
        Update: {
          accepted_at?: string;
          business_id?: string | null;
          business_name?: string;
          business_slug?: string;
          documents?: Json;
          id?: string;
          ip_hash?: string | null;
          plan?: string;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      businesses: {
        Row: {
          address: string | null;
          edit_token_hash: string | null;
          expires_at: string | null;
          palette: string | null;
          source: string;
          category: string | null;
          city: string;
          content: NonNullable<Json>;
          created_at: string;
          details_confirmed_at: string | null;
          hours: string[];
          id: string;
          images: NonNullable<Json>;
          input_city: string;
          input_name: string;
          input_phone: string;
          input_services: string[];
          name: string;
          notes: string;
          owner_confirmed_at: string | null;
          paused_at: string | null;
          phone: string;
          place_id: string | null;
          places_fetched_at: string | null;
          published_at: string | null;
          services_confirmed_at: string | null;
          slug: string;
          status: string;
          tags: string[];
          template: string;
          trade: string;
          updated_at: string;
          website_url: string | null;
        };
        ComputedFields: never;
        Insert: {
          address?: string | null;
          edit_token_hash?: string | null;
          expires_at?: string | null;
          palette?: string | null;
          source?: string;
          category?: string | null;
          city: string;
          content: NonNullable<Json>;
          created_at?: string;
          details_confirmed_at?: string | null;
          hours?: string[];
          id?: string;
          images?: NonNullable<Json>;
          input_city: string;
          input_name: string;
          input_phone: string;
          input_services?: string[];
          name: string;
          notes?: string;
          owner_confirmed_at?: string | null;
          paused_at?: string | null;
          phone: string;
          place_id?: string | null;
          places_fetched_at?: string | null;
          published_at?: string | null;
          services_confirmed_at?: string | null;
          slug: string;
          status?: string;
          tags?: string[];
          template?: string;
          trade?: string;
          updated_at?: string;
          website_url?: string | null;
        };
        Update: {
          address?: string | null;
          edit_token_hash?: string | null;
          expires_at?: string | null;
          palette?: string | null;
          source?: string;
          category?: string | null;
          city?: string;
          content?: NonNullable<Json>;
          created_at?: string;
          details_confirmed_at?: string | null;
          hours?: string[];
          id?: string;
          images?: NonNullable<Json>;
          input_city?: string;
          input_name?: string;
          input_phone?: string;
          input_services?: string[];
          name?: string;
          notes?: string;
          owner_confirmed_at?: string | null;
          paused_at?: string | null;
          phone?: string;
          place_id?: string | null;
          places_fetched_at?: string | null;
          published_at?: string | null;
          services_confirmed_at?: string | null;
          slug?: string;
          status?: string;
          tags?: string[];
          template?: string;
          trade?: string;
          updated_at?: string;
          website_url?: string | null;
        };
        Relationships: [];
      };
      import_batches: {
        Row: {
          completed_at: string | null;
          created_at: string;
          created_by: string | null;
          filename: string | null;
          id: string;
          source: string;
          total_rows: number;
        };
        ComputedFields: never;
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          filename?: string | null;
          id?: string;
          source: string;
          total_rows?: number;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          filename?: string | null;
          id?: string;
          source?: string;
          total_rows?: number;
        };
        Relationships: [];
      };
      import_jobs: {
        Row: {
          attempts: number;
          batch_id: string;
          business_id: string | null;
          created_at: string;
          error: string | null;
          finished_at: string | null;
          id: string;
          input: NonNullable<Json>;
          locked_at: string | null;
          max_attempts: number;
          row_number: number;
          run_after: string;
          status: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          attempts?: number;
          batch_id: string;
          business_id?: string | null;
          created_at?: string;
          error?: string | null;
          finished_at?: string | null;
          id?: string;
          input: NonNullable<Json>;
          locked_at?: string | null;
          max_attempts?: number;
          row_number: number;
          run_after?: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          attempts?: number;
          batch_id?: string;
          business_id?: string | null;
          created_at?: string;
          error?: string | null;
          finished_at?: string | null;
          id?: string;
          input?: NonNullable<Json>;
          locked_at?: string | null;
          max_attempts?: number;
          row_number?: number;
          run_after?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "import_jobs_batch_id_fkey";
            columns: ["batch_id"];
            isOneToOne: false;
            referencedRelation: "import_batches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "import_jobs_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          business_id: string | null;
          business_name: string | null;
          business_slug: string | null;
          canceled_at: string | null;
          created_at: string;
          current_period_end: string | null;
          id: string;
          plan: string;
          provider: string;
          provider_customer_id: string | null;
          provider_subscription_id: string;
          status: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          business_id?: string | null;
          business_name?: string | null;
          business_slug?: string | null;
          canceled_at?: string | null;
          created_at?: string;
          current_period_end?: string | null;
          id?: string;
          plan: string;
          provider: string;
          provider_customer_id?: string | null;
          provider_subscription_id: string;
          status: string;
          updated_at?: string;
        };
        Update: {
          business_id?: string | null;
          business_name?: string | null;
          business_slug?: string | null;
          canceled_at?: string | null;
          created_at?: string;
          current_period_end?: string | null;
          id?: string;
          plan?: string;
          provider?: string;
          provider_customer_id?: string | null;
          provider_subscription_id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      claim_import_jobs: {
        Args: { p_batch_id?: string; p_limit?: number };
        Returns: {
          attempts: number;
          batch_id: string;
          business_id: string | null;
          created_at: string;
          error: string | null;
          finished_at: string | null;
          id: string;
          input: NonNullable<Json>;
          locked_at: string | null;
          max_attempts: number;
          row_number: number;
          run_after: string;
          status: string;
          updated_at: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "import_jobs";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      get_public_site: { Args: { p_slug: string }; Returns: Json };
      hit_rate_limit: { Args: { p_key: string; p_window_seconds: number; p_max: number }; Returns: boolean };
      invoke_import_worker: { Args: Record<PropertyKey, never>; Returns: undefined };
      invoke_housekeeping: { Args: Record<PropertyKey, never>; Returns: undefined };
      sites_due_for_deletion: {
        Args: { p_retention_days: number | null };
        Returns: { id: string; slug: string; images: Json; reason: string }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
