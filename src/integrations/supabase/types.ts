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
      ai_analysis_results: {
        Row: {
          analysis_tool: string
          confidence: number | null
          findings: string[] | null
          id: string
          patient_id: string
          raw_data: Json | null
          recommendations: string[] | null
          timestamp: string | null
        }
        Insert: {
          analysis_tool: string
          confidence?: number | null
          findings?: string[] | null
          id?: string
          patient_id: string
          raw_data?: Json | null
          recommendations?: string[] | null
          timestamp?: string | null
        }
        Update: {
          analysis_tool?: string
          confidence?: number | null
          findings?: string[] | null
          id?: string
          patient_id?: string
          raw_data?: Json | null
          recommendations?: string[] | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_results_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_records"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_risk_assessments: {
        Row: {
          created_at: string | null
          factors: string[] | null
          id: string
          overall_risk: string
          patient_id: string
          recommendations: string[] | null
        }
        Insert: {
          created_at?: string | null
          factors?: string[] | null
          id?: string
          overall_risk: string
          patient_id: string
          recommendations?: string[] | null
        }
        Update: {
          created_at?: string | null
          factors?: string[] | null
          id?: string
          overall_risk?: string
          patient_id?: string
          recommendations?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_risk_assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_records"
            referencedColumns: ["id"]
          },
        ]
      }
      genome_data: {
        Row: {
          analysis_status: string
          created_at: string | null
          id: string
          patient_id: string
          results: Json | null
          sample_date: string | null
          updated_at: string | null
        }
        Insert: {
          analysis_status: string
          created_at?: string | null
          id?: string
          patient_id: string
          results?: Json | null
          sample_date?: string | null
          updated_at?: string | null
        }
        Update: {
          analysis_status?: string
          created_at?: string | null
          id?: string
          patient_id?: string
          results?: Json | null
          sample_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "genome_data_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_records"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_records: {
        Row: {
          age: number
          condition: string
          created_at: string | null
          id: string
          last_visit: string
          medical_history: string[] | null
          name: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age: number
          condition: string
          created_at?: string | null
          id?: string
          last_visit?: string
          medical_history?: string[] | null
          name: string
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age?: number
          condition?: string
          created_at?: string | null
          id?: string
          last_visit?: string
          medical_history?: string[] | null
          name?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      vital_signs: {
        Row: {
          blood_pressure: string | null
          heart_rate: number | null
          id: string
          patient_id: string
          recorded_at: string | null
          respiratory_rate: number | null
          temperature: number | null
        }
        Insert: {
          blood_pressure?: string | null
          heart_rate?: number | null
          id?: string
          patient_id: string
          recorded_at?: string | null
          respiratory_rate?: number | null
          temperature?: number | null
        }
        Update: {
          blood_pressure?: string | null
          heart_rate?: number | null
          id?: string
          patient_id?: string
          recorded_at?: string | null
          respiratory_rate?: number | null
          temperature?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vital_signs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_records"
            referencedColumns: ["id"]
          },
        ]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
