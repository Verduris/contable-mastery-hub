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
      accounts_payable: {
        Row: {
          associated_account_id: string | null
          created_at: string
          due_date: string
          id: string
          invoice_id: string | null
          issue_date: string
          notes: string | null
          outstanding_balance: number | null
          paid_amount: number
          payment_method: string | null
          status: Database["public"]["Enums"]["account_payable_status"]
          supplier_id: string
          total_amount: number
        }
        Insert: {
          associated_account_id?: string | null
          created_at?: string
          due_date: string
          id?: string
          invoice_id?: string | null
          issue_date: string
          notes?: string | null
          outstanding_balance?: number | null
          paid_amount?: number
          payment_method?: string | null
          status?: Database["public"]["Enums"]["account_payable_status"]
          supplier_id: string
          total_amount: number
        }
        Update: {
          associated_account_id?: string | null
          created_at?: string
          due_date?: string
          id?: string
          invoice_id?: string | null
          issue_date?: string
          notes?: string | null
          outstanding_balance?: number | null
          paid_amount?: number
          payment_method?: string | null
          status?: Database["public"]["Enums"]["account_payable_status"]
          supplier_id?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "accounts_payable_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts_receivable: {
        Row: {
          client_id: string
          created_at: string
          due_date: string
          id: string
          invoice_id: string | null
          issue_date: string
          notes: string | null
          outstanding_balance: number | null
          paid_amount: number
          status: Database["public"]["Enums"]["account_receivable_status"]
          total_amount: number
        }
        Insert: {
          client_id: string
          created_at?: string
          due_date: string
          id?: string
          invoice_id?: string | null
          issue_date: string
          notes?: string | null
          outstanding_balance?: number | null
          paid_amount?: number
          status?: Database["public"]["Enums"]["account_receivable_status"]
          total_amount: number
        }
        Update: {
          client_id?: string
          created_at?: string
          due_date?: string
          id?: string
          invoice_id?: string | null
          issue_date?: string
          notes?: string | null
          outstanding_balance?: number | null
          paid_amount?: number
          status?: Database["public"]["Enums"]["account_receivable_status"]
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "accounts_receivable_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      client_audit_logs: {
        Row: {
          action: string
          client_id: string
          created_at: string
          details: string | null
          id: string
          user: string
        }
        Insert: {
          action: string
          client_id: string
          created_at?: string
          details?: string | null
          id?: string
          user: string
        }
        Update: {
          action?: string
          client_id?: string
          created_at?: string
          details?: string | null
          id?: string
          user?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_audit_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string
          associated_account_id: string | null
          balance: number
          cfdi_use: string | null
          contract_url: string | null
          created_at: string
          credit_days: number | null
          credit_limit: number | null
          email: string
          id: string
          internal_notes: string | null
          name: string
          payment_method: string | null
          phone: string
          rfc: string
          status: Database["public"]["Enums"]["client_status"]
          tax_regime: string
          type: Database["public"]["Enums"]["person_type"]
        }
        Insert: {
          address: string
          associated_account_id?: string | null
          balance?: number
          cfdi_use?: string | null
          contract_url?: string | null
          created_at?: string
          credit_days?: number | null
          credit_limit?: number | null
          email: string
          id?: string
          internal_notes?: string | null
          name: string
          payment_method?: string | null
          phone: string
          rfc: string
          status?: Database["public"]["Enums"]["client_status"]
          tax_regime: string
          type: Database["public"]["Enums"]["person_type"]
        }
        Update: {
          address?: string
          associated_account_id?: string | null
          balance?: number
          cfdi_use?: string | null
          contract_url?: string | null
          created_at?: string
          credit_days?: number | null
          credit_limit?: number | null
          email?: string
          id?: string
          internal_notes?: string | null
          name?: string
          payment_method?: string | null
          phone?: string
          rfc?: string
          status?: Database["public"]["Enums"]["client_status"]
          tax_regime?: string
          type?: Database["public"]["Enums"]["person_type"]
        }
        Relationships: [
          {
            foreignKeyName: "clients_associated_account_id_fkey"
            columns: ["associated_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          cfdi_use: string
          client_id: string
          created_at: string
          date: string
          file_name: string | null
          id: string
          journal_entry_id: string | null
          sat_status: Database["public"]["Enums"]["invoice_sat_status"]
        }
        Insert: {
          amount: number
          cfdi_use: string
          client_id: string
          created_at?: string
          date: string
          file_name?: string | null
          id: string
          journal_entry_id?: string | null
          sat_status: Database["public"]["Enums"]["invoice_sat_status"]
        }
        Update: {
          amount?: number
          cfdi_use?: string
          client_id?: string
          created_at?: string
          date?: string
          file_name?: string | null
          id?: string
          journal_entry_id?: string | null
          sat_status?: Database["public"]["Enums"]["invoice_sat_status"]
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
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
        Relationships: [
          {
            foreignKeyName: "journal_entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
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
      payable_payments: {
        Row: {
          account_payable_id: string
          amount: number
          created_at: string
          date: string
          id: string
          notes: string | null
        }
        Insert: {
          account_payable_id: string
          amount: number
          created_at?: string
          date: string
          id?: string
          notes?: string | null
        }
        Update: {
          account_payable_id?: string
          amount?: number
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payable_payments_account_payable_id_fkey"
            columns: ["account_payable_id"]
            isOneToOne: false
            referencedRelation: "accounts_payable"
            referencedColumns: ["id"]
          },
        ]
      }
      receivable_payments: {
        Row: {
          account_receivable_id: string
          amount: number
          created_at: string
          date: string
          id: string
          notes: string | null
        }
        Insert: {
          account_receivable_id: string
          amount: number
          created_at?: string
          date: string
          id?: string
          notes?: string | null
        }
        Update: {
          account_receivable_id?: string
          amount?: number
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receivable_payments_account_receivable_id_fkey"
            columns: ["account_receivable_id"]
            isOneToOne: false
            referencedRelation: "accounts_receivable"
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
      create_invoice_with_relations: {
        Args: {
          p_invoice_id: string
          p_client_id: string
          p_date: string
          p_amount: number
          p_cfdi_use: string
          p_sat_status: Database["public"]["Enums"]["invoice_sat_status"]
          p_file_name: string
        }
        Returns: string
      }
      mark_payable_as_paid: {
        Args: { p_payable_id: string }
        Returns: undefined
      }
      mark_receivable_as_paid: {
        Args: { p_receivable_id: string }
        Returns: undefined
      }
      record_payable_payment: {
        Args: {
          p_payable_id: string
          p_amount: number
          p_date: string
          p_notes: string
        }
        Returns: undefined
      }
      record_receivable_payment: {
        Args: {
          p_receivable_id: string
          p_amount: number
          p_date: string
          p_notes: string
        }
        Returns: undefined
      }
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
      account_payable_status:
        | "Pendiente"
        | "Pagada"
        | "Parcialmente Pagada"
        | "Vencida"
      account_receivable_status:
        | "Pendiente"
        | "Pagada"
        | "Vencida"
        | "Parcialmente Pagada"
      account_status: "Activa" | "Inactiva"
      account_type: "Activo" | "Pasivo" | "Capital" | "Ingresos" | "Egresos"
      client_status: "Activo" | "Inactivo"
      invoice_sat_status: "Vigente" | "Cancelada"
      journal_entry_status: "Borrador" | "Revisada" | "Anulada"
      journal_entry_type: "Ingreso" | "Egreso" | "Diario"
      person_type: "Física" | "Moral"
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
      account_payable_status: [
        "Pendiente",
        "Pagada",
        "Parcialmente Pagada",
        "Vencida",
      ],
      account_receivable_status: [
        "Pendiente",
        "Pagada",
        "Vencida",
        "Parcialmente Pagada",
      ],
      account_status: ["Activa", "Inactiva"],
      account_type: ["Activo", "Pasivo", "Capital", "Ingresos", "Egresos"],
      client_status: ["Activo", "Inactivo"],
      invoice_sat_status: ["Vigente", "Cancelada"],
      journal_entry_status: ["Borrador", "Revisada", "Anulada"],
      journal_entry_type: ["Ingreso", "Egreso", "Diario"],
      person_type: ["Física", "Moral"],
      tax_event_status: ["Pendiente", "Presentado", "Vencido"],
    },
  },
} as const
