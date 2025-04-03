
import { Database } from '@/integrations/supabase/types';

// Type aliases for Supabase tables
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type PatientRecordRow = Database['public']['Tables']['patient_records']['Row'];
export type VitalSignsRow = Database['public']['Tables']['vital_signs']['Row'];
export type AIRiskAssessmentRow = Database['public']['Tables']['ai_risk_assessments']['Row'];
export type AIAnalysisResultRow = Database['public']['Tables']['ai_analysis_results']['Row'];
export type GenomeDataRow = Database['public']['Tables']['genome_data']['Row'];

// Insert types
export type InsertProfile = Database['public']['Tables']['profiles']['Insert'];
export type InsertPatientRecord = Database['public']['Tables']['patient_records']['Insert'];
export type InsertVitalSigns = Database['public']['Tables']['vital_signs']['Insert'];
export type InsertAIRiskAssessment = Database['public']['Tables']['ai_risk_assessments']['Insert'];
export type InsertAIAnalysisResult = Database['public']['Tables']['ai_analysis_results']['Insert'];
export type InsertGenomeData = Database['public']['Tables']['genome_data']['Insert'];

// Update types
export type UpdateProfile = Database['public']['Tables']['profiles']['Update'];
export type UpdatePatientRecord = Database['public']['Tables']['patient_records']['Update'];
export type UpdateVitalSigns = Database['public']['Tables']['vital_signs']['Update'];
export type UpdateAIRiskAssessment = Database['public']['Tables']['ai_risk_assessments']['Update'];
export type UpdateAIAnalysisResult = Database['public']['Tables']['ai_analysis_results']['Update'];
export type UpdateGenomeData = Database['public']['Tables']['genome_data']['Update'];
