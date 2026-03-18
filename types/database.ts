export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TransactionType = "WAGE" | "ADVANCE" | "DEDUCTION";
export type EmployeeRow = Database["public"]["Tables"]["employees"]["Row"];
export type EmployeeInsert = Database["public"]["Tables"]["employees"]["Insert"];
export type TransactionRow = Database["public"]["Tables"]["transactions"]["Row"];
export type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
export type DashboardRow =
  Database["public"]["Functions"]["get_employee_dashboard_data"]["Returns"][number];

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string;
          name: string;
          join_date: string;
          initial_advance: number;
          default_rate: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          join_date: string;
          initial_advance?: number;
          default_rate?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          join_date?: string;
          initial_advance?: number;
          default_rate?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          employee_id: string;
          transaction_date: string;
          transaction_type: TransactionType;
          amount: number;
          bricks_produced: number | null;
          rate_used: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          transaction_date: string;
          transaction_type: TransactionType;
          amount: number;
          bricks_produced?: number | null;
          rate_used?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          transaction_date?: string;
          transaction_type?: TransactionType;
          amount?: number;
          bricks_produced?: number | null;
          rate_used?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_employee_dashboard_data: {
        Args: {
          [_ in never]: never;
        };
        Returns: {
          employee_id: string;
          employee_name: string;
          initial_advance: number;
          total_earned: number;
          current_balance: number;
        }[];
      };
    };
    Enums: {
      transaction_type: TransactionType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
