export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string;
          name: string;
          join_code: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          join_code: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          join_code?: string;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          display_name: string;
          team_id: string | null;
          referred_by: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          team_id?: string | null;
          referred_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          team_id?: string | null;
          referred_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      care_events: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          xp_earned: number;
          metadata: Record<string, unknown>;
          client_timestamp: string;
          server_timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: string;
          xp_earned?: number;
          metadata?: Record<string, unknown>;
          client_timestamp: string;
          server_timestamp?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          xp_earned?: number;
          metadata?: Record<string, unknown>;
          client_timestamp?: string;
          server_timestamp?: string;
        };
        Relationships: [];
      };
      discovered_specimens: {
        Row: {
          id: string;
          user_id: string;
          specimen_id: string;
          discovered_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          specimen_id: string;
          discovered_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          specimen_id?: string;
          discovered_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      leaderboard_weekly: {
        Row: {
          user_id: string;
          display_name: string;
          team_id: string | null;
          weekly_xp: number;
          active_days: number;
          specimens: number;
        };
        Relationships: [];
      };
      leaderboard_monthly: {
        Row: {
          user_id: string;
          display_name: string;
          team_id: string | null;
          monthly_xp: number;
          active_days: number;
          specimens: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      submit_care_event: {
        Args: {
          p_event_type: string;
          p_xp_earned: number;
          p_metadata?: Record<string, unknown>;
          p_client_timestamp?: string;
          p_client_id?: string;
        };
        Returns: string;
      };
      claim_referral_bonus: {
        Args: {
          p_referrer_id: string;
        };
        Returns: string;
      };
      lookup_team_by_code: {
        Args: {
          p_join_code: string;
        };
        Returns: { id: string; name: string; created_by: string }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
