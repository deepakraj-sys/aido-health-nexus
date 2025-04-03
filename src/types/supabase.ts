
import { Database } from '@/integrations/supabase/types';

// Type aliases for Supabase tables
export type ProfileRow = Database['public']['Tables']['profiles']['Row'] & { phone_verified?: boolean };
export type PatientRecordRow = Database['public']['Tables']['patient_records']['Row'];
export type VitalSignsRow = Database['public']['Tables']['vital_signs']['Row'];
export type AIRiskAssessmentRow = Database['public']['Tables']['ai_risk_assessments']['Row'];
export type AIAnalysisResultRow = Database['public']['Tables']['ai_analysis_results']['Row'];
export type GenomeDataRow = Database['public']['Tables']['genome_data']['Row'];
export type MessageRow = { 
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  sent_at: string;
  read_at?: string;
  message_type: string;
};
export type AppointmentRow = {
  id: string;
  patient_id: string;
  doctor_id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  created_at: string;
};

// Insert types
export type InsertProfile = Database['public']['Tables']['profiles']['Insert'] & { phone_verified?: boolean };
export type InsertPatientRecord = Database['public']['Tables']['patient_records']['Insert'];
export type InsertVitalSigns = Database['public']['Tables']['vital_signs']['Insert'];
export type InsertAIRiskAssessment = Database['public']['Tables']['ai_risk_assessments']['Insert'];
export type InsertAIAnalysisResult = Database['public']['Tables']['ai_analysis_results']['Insert'];
export type InsertGenomeData = Database['public']['Tables']['genome_data']['Insert'];
export type InsertMessage = {
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: string;
  read_at?: string;
};
export type InsertAppointment = {
  patient_id: string;
  doctor_id: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
};

// Update types
export type UpdateProfile = Database['public']['Tables']['profiles']['Update'] & { phone_verified?: boolean };
export type UpdatePatientRecord = Database['public']['Tables']['patient_records']['Update'];
export type UpdateVitalSigns = Database['public']['Tables']['vital_signs']['Update'];
export type UpdateAIRiskAssessment = Database['public']['Tables']['ai_risk_assessments']['Update'];
export type UpdateAIAnalysisResult = Database['public']['Tables']['ai_analysis_results']['Update'];
export type UpdateGenomeData = Database['public']['Tables']['genome_data']['Update'];
export type UpdateMessage = {
  content?: string;
  read_at?: string;
};
export type UpdateAppointment = {
  start_time?: string;
  end_time?: string;
  status?: string;
  notes?: string;
};
