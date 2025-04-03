
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface RiskAssessment {
  overallRisk: 'high' | 'moderate' | 'low' | 'unknown';
  factors: string[];
  recommendations: string[];
}

export function useEarlyDetection() {
  const [loading, setLoading] = useState(false);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const { user } = useAuth();

  // Run early detection analysis
  const runAnalysis = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not logged in",
        description: "You must be logged in to use the early detection feature"
      });
      return null;
    }

    setLoading(true);
    try {
      // Get patient profile information
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profileData) throw new Error("User profile not found");

      // Get patient records if available
      const { data: patientRecords } = await supabase
        .from('patient_records')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Get vital signs
      const { data: vitalSigns } = await supabase
        .from('vital_signs')
        .select('*')
        .eq('patient_id', patientRecords?.id || '')
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get recent symptoms
      const { data: symptoms } = await supabase
        .from('symptoms')
        .select('*')
        .eq('patient_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(10);

      // Format patient data
      const patientData = {
        id: user.id,
        name: profileData.name || 'Unknown',
        role: profileData.role || 'patient',
        ...(patientRecords ? {
          age: patientRecords.age,
          condition: patientRecords.condition,
          medicalHistory: patientRecords.medical_history || []
        } : {})
      };

      // Call the early detection edge function
      const { data, error } = await supabase.functions.invoke('early-detection', {
        body: {
          patientData,
          vitalSigns: vitalSigns || undefined,
          symptoms: symptoms || undefined,
          medicalHistory: patientRecords?.medical_history || undefined
        }
      });

      if (error) throw error;

      if (data?.structuredAnalysis) {
        setRiskAssessment(data.structuredAnalysis);
        setAnalysisText(data.analysisText);

        // If we have a patient record, save the risk assessment
        if (patientRecords) {
          await supabase
            .from('ai_risk_assessments')
            .insert({
              patient_id: patientRecords.id,
              overall_risk: data.structuredAnalysis.overallRisk,
              factors: data.structuredAnalysis.factors,
              recommendations: data.structuredAnalysis.recommendations
            });
        }

        toast({
          title: "Analysis complete",
          description: "Early detection analysis is ready to view."
        });

        return data.structuredAnalysis;
      }
    } catch (error: any) {
      console.error("Early detection analysis error:", error);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error.message
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Clear current analysis
  const clearAnalysis = () => {
    setRiskAssessment(null);
    setAnalysisText(null);
  };

  return {
    loading,
    riskAssessment,
    analysisText,
    runAnalysis,
    clearAnalysis
  };
}
