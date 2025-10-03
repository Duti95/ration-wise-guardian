export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      government_diet_menu: {
        Row: {
          created_at: string
          id: string
          items: Json
          meal_type: string
          menu_date: string
          week_number: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          items: Json
          meal_type: string
          menu_date: string
          week_number?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          meal_type?: string
          menu_date?: string
          week_number?: number | null
        }
        Relationships: []
      }
      issue_transactions_report: {
        Row: {
          balance_amount: number | null
          balance_quantity: number | null
          created_at: string | null
          dep_warden_signature: string | null
          id: string
          issued_amount: number | null
          issued_quantity: number | null
          item_id: string | null
          item_name: string | null
          principal_signature: string | null
          purchased_amount: number | null
          purchased_quantity: number | null
          remarks: string | null
          sno: number | null
          transaction_date: string | null
          transaction_id: string | null
          transaction_type: string | null
          updated_at: string | null
          vendor_name: string | null
        }
        Insert: {
          balance_amount?: number | null
          balance_quantity?: number | null
          created_at?: string | null
          dep_warden_signature?: string | null
          id?: string
          issued_amount?: number | null
          issued_quantity?: number | null
          item_id?: string | null
          item_name?: string | null
          principal_signature?: string | null
          purchased_amount?: number | null
          purchased_quantity?: number | null
          remarks?: string | null
          sno?: number | null
          transaction_date?: string | null
          transaction_id?: string | null
          transaction_type?: string | null
          updated_at?: string | null
          vendor_name?: string | null
        }
        Update: {
          balance_amount?: number | null
          balance_quantity?: number | null
          created_at?: string | null
          dep_warden_signature?: string | null
          id?: string
          issued_amount?: number | null
          issued_quantity?: number | null
          item_id?: string | null
          item_name?: string | null
          principal_signature?: string | null
          purchased_amount?: number | null
          purchased_quantity?: number | null
          remarks?: string | null
          sno?: number | null
          transaction_date?: string | null
          transaction_id?: string | null
          transaction_type?: string | null
          updated_at?: string | null
          vendor_name?: string | null
        }
        Relationships: []
      }
      item_transaction_report: {
        Row: {
          balance_amount: number | null
          balance_quantity: number | null
          created_at: string | null
          dep_warden_signature: string | null
          id: string
          issued_amount: number | null
          issued_quantity: number | null
          item_id: string | null
          item_name: string | null
          principal_signature: string | null
          purchased_amount: number | null
          purchased_quantity: number | null
          remarks: string | null
          sno: number | null
          transaction_date: string | null
          transaction_id: string | null
          transaction_type: string | null
          updated_at: string | null
          vendor_name: string | null
        }
        Insert: {
          balance_amount?: number | null
          balance_quantity?: number | null
          created_at?: string | null
          dep_warden_signature?: string | null
          id?: string
          issued_amount?: number | null
          issued_quantity?: number | null
          item_id?: string | null
          item_name?: string | null
          principal_signature?: string | null
          purchased_amount?: number | null
          purchased_quantity?: number | null
          remarks?: string | null
          sno?: number | null
          transaction_date?: string | null
          transaction_id?: string | null
          transaction_type?: string | null
          updated_at?: string | null
          vendor_name?: string | null
        }
        Update: {
          balance_amount?: number | null
          balance_quantity?: number | null
          created_at?: string | null
          dep_warden_signature?: string | null
          id?: string
          issued_amount?: number | null
          issued_quantity?: number | null
          item_id?: string | null
          item_name?: string | null
          principal_signature?: string | null
          purchased_amount?: number | null
          purchased_quantity?: number | null
          remarks?: string | null
          sno?: number | null
          transaction_date?: string | null
          transaction_id?: string | null
          transaction_type?: string | null
          updated_at?: string | null
          vendor_name?: string | null
        }
        Relationships: []
      }
      items: {
        Row: {
          created_at: string
          current_stock: number | null
          danger_threshold: number | null
          id: string
          is_active: boolean | null
          medium_threshold: number | null
          name: string
          rate_per_unit: number | null
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_stock?: number | null
          danger_threshold?: number | null
          id?: string
          is_active?: boolean | null
          medium_threshold?: number | null
          name: string
          rate_per_unit?: number | null
          unit: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_stock?: number | null
          danger_threshold?: number | null
          id?: string
          is_active?: boolean | null
          medium_threshold?: number | null
          name?: string
          rate_per_unit?: number | null
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      purchase_items: {
        Row: {
          created_at: string
          damaged_quantity: number | null
          discount_type: string | null
          discount_value: number | null
          id: string
          item_id: string | null
          mrp: number | null
          purchase_id: string | null
          quantity: number
          rate_per_unit: number
          total_price: number
        }
        Insert: {
          created_at?: string
          damaged_quantity?: number | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          item_id?: string | null
          mrp?: number | null
          purchase_id?: string | null
          quantity: number
          rate_per_unit: number
          total_price: number
        }
        Update: {
          created_at?: string
          damaged_quantity?: number | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          item_id?: string | null
          mrp?: number | null
          purchase_id?: string | null
          quantity?: number
          rate_per_unit?: number
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_transactions_report: {
        Row: {
          balance_amount: number | null
          balance_quantity: number | null
          created_at: string | null
          dep_warden_signature: string | null
          id: string
          issued_amount: number | null
          issued_quantity: number | null
          item_id: string | null
          item_name: string | null
          principal_signature: string | null
          purchased_amount: number | null
          purchased_quantity: number | null
          remarks: string | null
          sno: number | null
          transaction_date: string | null
          transaction_id: string | null
          transaction_type: string | null
          updated_at: string | null
          vendor_name: string | null
        }
        Insert: {
          balance_amount?: number | null
          balance_quantity?: number | null
          created_at?: string | null
          dep_warden_signature?: string | null
          id?: string
          issued_amount?: number | null
          issued_quantity?: number | null
          item_id?: string | null
          item_name?: string | null
          principal_signature?: string | null
          purchased_amount?: number | null
          purchased_quantity?: number | null
          remarks?: string | null
          sno?: number | null
          transaction_date?: string | null
          transaction_id?: string | null
          transaction_type?: string | null
          updated_at?: string | null
          vendor_name?: string | null
        }
        Update: {
          balance_amount?: number | null
          balance_quantity?: number | null
          created_at?: string | null
          dep_warden_signature?: string | null
          id?: string
          issued_amount?: number | null
          issued_quantity?: number | null
          item_id?: string | null
          item_name?: string | null
          principal_signature?: string | null
          purchased_amount?: number | null
          purchased_quantity?: number | null
          remarks?: string | null
          sno?: number | null
          transaction_date?: string | null
          transaction_id?: string | null
          transaction_type?: string | null
          updated_at?: string | null
          vendor_name?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          bill_no: string
          created_at: string
          id: string
          purchase_date: string
          total_amount: number | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          bill_no: string
          created_at?: string
          id?: string
          purchase_date?: string
          total_amount?: number | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          bill_no?: string
          created_at?: string
          id?: string
          purchase_date?: string
          total_amount?: number | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_issue_items: {
        Row: {
          created_at: string
          id: string
          issue_id: string | null
          item_id: string | null
          quantity: number
          rate_per_unit: number
          total_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          issue_id?: string | null
          item_id?: string | null
          quantity: number
          rate_per_unit: number
          total_price: number
        }
        Update: {
          created_at?: string
          id?: string
          issue_id?: string | null
          item_id?: string | null
          quantity?: number
          rate_per_unit?: number
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_issue_items_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "stock_issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_issue_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_issues: {
        Row: {
          created_at: string
          id: string
          issue_date: string
          issue_type: string | null
          total_value: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          issue_date?: string
          issue_type?: string | null
          total_value?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          issue_date?: string
          issue_type?: string | null
          total_value?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      strength_categories: {
        Row: {
          assigned_amount: number | null
          category_name: string
          created_at: string
          id: string
          is_active: boolean | null
          student_count: number | null
          updated_at: string
        }
        Insert: {
          assigned_amount?: number | null
          category_name: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          student_count?: number | null
          updated_at?: string
        }
        Update: {
          assigned_amount?: number | null
          category_name?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          student_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      transaction_metadata: {
        Row: {
          created_at: string | null
          custom_balance_amount: number | null
          custom_balance_quantity: number | null
          dep_warden_signature: string | null
          id: string
          item_id: string
          principal_signature: string | null
          remarks: string | null
          transaction_id: string
          transaction_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_balance_amount?: number | null
          custom_balance_quantity?: number | null
          dep_warden_signature?: string | null
          id?: string
          item_id: string
          principal_signature?: string | null
          remarks?: string | null
          transaction_id: string
          transaction_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_balance_amount?: number | null
          custom_balance_quantity?: number | null
          dep_warden_signature?: string | null
          id?: string
          item_id?: string
          principal_signature?: string | null
          remarks?: string | null
          transaction_id?: string
          transaction_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_metadata_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      utensils: {
        Row: {
          capacity: string | null
          created_at: string
          current_quantity: number | null
          damaged_quantity: number | null
          id: string
          name: string
          replacement_needed: number | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          capacity?: string | null
          created_at?: string
          current_quantity?: number | null
          damaged_quantity?: number | null
          id?: string
          name: string
          replacement_needed?: number | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          capacity?: string | null
          created_at?: string
          current_quantity?: number | null
          damaged_quantity?: number | null
          id?: string
          name?: string
          replacement_needed?: number | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "readonly"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "readonly"],
    },
  },
} as const
