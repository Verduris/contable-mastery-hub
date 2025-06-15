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
      accounts: {
        Row: {
          balance: number
          code: string
          created_at: string
          description: string | null
          id: string
          level: number
          name: string
          nature: Database["public"]["Enums"]["account_nature"]
          parent_id: string | null
          sat_code: string | null
          status: Database["public"]["Enums"]["account_status"]
          type: Database["public"]["Enums"]["account_type"]
        }
        Insert: {
          balance?: number
          code: string
          created_at?: string
          description?: string | null
          id?: string
          level: number
          name: string
          nature: Database["public"]["Enums"]["account_nature"]
          parent_id?: string | null
          sat_code?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          type: Database["public"]["Enums"]["account_type"]
        }
        Update: {
          balance?: number
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          level?: number
          name?: string
          nature?: Database["public"]["Enums"]["account_nature"]
          parent_id?: string | null
          sat_code?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          type?: Database["public"]["Enums"]["account_type"]
        }
        Relationships: [
          {
            foreignKeyName: "accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          client_id: string | null
          concept: string
          created_at: string
          date: string
          id: string
          invoice_id: string | null
          number: string
          reference: string | null
          status: Database["public"]["Enums"]["journal_entry_status"]
          type: Database["public"]["Enums"]["journal_entry_type"]
        }
        Insert: {
          client_id?: string | null
          concept: string
          created_at?: string
          date: string
          id?: string
          invoice_id?: string | null
          number: string
          reference?: string | null
          status?: Database["public"]["Enums"]["journal_entry_status"]
          type: Database["public"]["Enums"]["journal_entry_type"]
        }
        Update: {
          client_id?: string | null
          concept?: string
          created_at?: string
          date?: string
          id?: string
          invoice_id?: string | null
          number?: string
          reference?: string | null
          status?: Database["public"]["Enums"]["journal_entry_status"]
          type?: Database["public"]["Enums"]["journal_entry_type"]
        }
        Relationships: []
      }
      journal_entry_lines: {
        Row: {
          account_id: string
          created_at: string
          credit: number
          debit: number
          description: string
          id: string
          journal_entry_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          credit?: number
          debit?: number
          description: string
          id?: string
          journal_entry_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          credit?: number
          debit?: number
          description?: string
          id?: string
          journal_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_events: {
        Row: {
          created_at: string
          date: string
          description: string
          id: string
          legal_basis: string
          link: string | null
          receipt_url: string | null
          regime: string
          status: Database["public"]["Enums"]["tax_event_status"]
          tax_type: string
          title: string
        }
        Insert: {
          created_at?: string
          date: string
          description: string
          id?: string
          legal_basis: string
          link?: string | null
          receipt_url?: string | null
          regime: string
          status: Database["public"]["Enums"]["tax_event_status"]
          tax_type: string
          title: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string
          id?: string
          legal_basis?: string
          link?: string | null
          receipt_url?: string | null
          regime?: string
          status?: Database["public"]["Enums"]["tax_event_status"]
          tax_type?: string
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      upsert_journal_entry: {
        Args: {
          entry_id: string
          entry_number: string
          entry_date: string
          entry_concept: string
          entry_type: Database["public"]["Enums"]["journal_entry_type"]
          entry_status: Database["public"]["Enums"]["journal_entry_status"]
          entry_reference: string
          entry_client_id: string
          lines: Json
        }
        Returns: string
      }
    }
    Enums: {
      account_nature: "Deudora" | "Acreedora"
      account_status: "Activa" | "Inactiva"
      account_type: "Activo" | "Pasivo" | "Capital" | "Ingresos" | "Egresos"
      journal_entry_status: "Borrador" | "Revisada" | "Anulada"
      journal_entry_type: "Ingreso" | "Egreso" | "Diario"
      tax_event_status: "Pendiente" | "Presentado" | "Vencido"
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
    Enums: {
      account_nature: ["Deudora", "Acreedora"],
      account_status: ["Activa", "Inactiva"],
      account_type: ["Activo", "Pasivo", "Capital", "Ingresos", "Egresos"],
      journal_entry_status: ["Borrador", "Revisada", "Anulada"],
      journal_entry_type: ["Ingreso", "Egreso", "Diario"],
      tax_event_status: ["Pendiente", "Presentado", "Vencido"],
    },
  },
} as const
