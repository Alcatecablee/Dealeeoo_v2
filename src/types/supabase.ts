export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
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
            referencedRelation: "deals"
            referencedColumns: ["id"]
          }
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
          content: string;
          created_at: string;
          deal_id: string;
          id: string;
          sender_email: string;
          user_email: string | null;
          file_url: string | null;
          reactions: string[];
        }
        Insert: {
          content: string;
          created_at?: string;
          deal_id: string;
          id?: string;
          sender_email: string;
          user_email?: string | null;
          file_url?: string | null;
          reactions?: string[];
        }
        Update: {
          content?: string;
          created_at?: string;
          deal_id?: string;
          id?: string;
          sender_email?: string;
          user_email?: string | null;
          file_url?: string | null;
          reactions?: string[];
        }
        Relationships: [
          {
            foreignKeyName: "messages_deal_id_fkey"
            columns: ["deal_id"]
            referencedRelation: "deals"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_typing: {
        Row: {
          deal_id: string
          email: string
          is_typing: boolean
          last_typed: string
        }
        Insert: {
          deal_id: string
          email: string
          is_typing: boolean
          last_typed?: string
        }
        Update: {
          deal_id?: string
          email?: string
          is_typing?: boolean
          last_typed?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_typing_deal_id_fkey"
            columns: ["deal_id"]
            referencedRelation: "deals"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string
          deal_id: string | null
          id: string
          is_read: boolean
          link: string | null
          recipient_email: string
          type: string
        }
        Insert: {
          content: string
          created_at?: string
          deal_id?: string | null
          id?: string
          is_read?: boolean
          link?: string | null
          recipient_email: string
          type: string
        }
        Update: {
          content?: string
          created_at?: string
          deal_id?: string | null
          id?: string
          is_read?: boolean
          link?: string | null
          recipient_email?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_deal_id_fkey"
            columns: ["deal_id"]
            referencedRelation: "deals"
            referencedColumns: ["id"]
          }
        ]
      }
      notification_preferences: {
        Row: {
          user_email: string
          type: string
          enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_email: string
          type: string
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_email?: string
          type?: string
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_provider_settings: {
        Row: {
          id: string
          provider: string
          field: string
          encrypted_value: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider: string
          field: string
          encrypted_value: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          provider?: string
          field?: string
          encrypted_value?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      active_payment_providers: {
        Row: {
          id: string
          provider: string
          created_at: string
        }
        Insert: {
          id?: string
          provider: string
          created_at?: string
        }
        Update: {
          id?: string
          provider?: string
          created_at?: string
        }
        Relationships: []
      }
      refund_requests: {
        Row: {
          id: string
          deal_id: string
          requested_by: string
          reason: string
          status: string
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          requested_by: string
          reason: string
          status?: string
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          deal_id?: string
          requested_by?: string
          reason?: string
          status?: string
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refund_requests_deal_id_fkey",
            columns: ["deal_id"],
            referencedRelation: "deals",
            referencedColumns: ["id"]
          }
        ]
      }
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
            referencedRelation: "deals";
            referencedColumns: ["id"];
          },
        ];
      }
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