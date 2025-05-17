export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      attachments: {
        Row: {
          deal_id: string
          file_path: string
          file_size: number
          file_type: string
          filename: string
          id: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          deal_id: string
          file_path: string
          file_size: number
          file_type: string
          filename: string
          id?: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          deal_id?: string
          file_path?: string
          file_size?: number
          file_type?: string
          filename?: string
          id?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          amount: number
          buyer_email: string
          created_at: string
          description: string
          id: string
          seller_email: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          amount: number
          buyer_email: string
          created_at?: string
          description: string
          id?: string
          seller_email: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          buyer_email?: string
          created_at?: string
          description?: string
          id?: string
          seller_email?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          message: string
          created_at: string
          deal_id: string
          id: string
          sender_email: string
          read_by?: string[]
        }
        Insert: {
          message: string
          created_at?: string
          deal_id: string
          id?: string
          sender_email: string
          read_by?: string[]
        }
        Update: {
          message?: string
          created_at?: string
          deal_id?: string
          id?: string
          sender_email?: string
          read_by?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "messages_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_typing: {
        Row: {
          id: string;
          deal_id: string;
          user_email: string;
          is_typing: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          deal_id: string;
          user_email: string;
          is_typing?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          deal_id?: string;
          user_email?: string;
          is_typing?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      }
      notifications: {
        Row: {
          id: string;
          user_email: string;
          type: string;
          message: string;
          deal_id: string | null;
          read: boolean;
          created_at: string;
          link: string | null;
        };
        Insert: {
          id?: string;
          user_email: string;
          type: string;
          message: string;
          deal_id?: string | null;
          read?: boolean;
          created_at?: string;
          link?: string | null;
        };
        Update: {
          id?: string;
          user_email?: string;
          type?: string;
          message?: string;
          deal_id?: string | null;
          read?: boolean;
          created_at?: string;
          link?: string | null;
        };
        Relationships: [];
      },
      notification_preferences: {
        Row: {
          id: string;
          user_email: string;
          type: string;
          enabled: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_email: string;
          type: string;
          enabled?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_email?: string;
          type?: string;
          enabled?: boolean;
          created_at?: string;
        };
        Relationships: [];
      },
      refund_requests: {
        Row: {
          id: string;
          deal_id: string;
          requested_by: string;
          reason: string;
          status: string;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          deal_id: string;
          requested_by: string;
          reason: string;
          status?: string;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          deal_id?: string;
          requested_by?: string;
          reason?: string;
          status?: string;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "refund_requests_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
        ];
      },
      deal_participants: {
        Row: {
          id: string;
          deal_id: string;
          email: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          deal_id: string;
          email: string;
          role: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          deal_id?: string;
          email?: string;
          role?: string;
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "deal_participants_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
        ];
      },
      chat_attachments: {
        Row: {
          id: string;
          deal_id: string;
          message_id: string | null;
          uploaded_by: string;
          file_url: string;
          file_name: string;
          file_type: string;
          file_size: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          deal_id: string;
          message_id?: string | null;
          uploaded_by: string;
          file_url: string;
          file_name: string;
          file_type: string;
          file_size: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          deal_id?: string;
          message_id?: string | null;
          uploaded_by?: string;
          file_url?: string;
          file_name?: string;
          file_type?: string;
          file_size?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_attachments_deal_id_fkey";
            columns: ["deal_id"];
            isOneToOne: false;
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
        ];
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
