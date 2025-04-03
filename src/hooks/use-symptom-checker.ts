
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { InsertSymptom } from "@/types/supabase";

export interface SymptomAnalysis {
  severity: string;
  recommendedAction: string;
  potentialCauses: string[];
  homeCare: string[];
  warningSigns: string[];
}

export interface Symptom {
  id: string;
  name: string;
  severity: number;
  duration?: string;
  notes?: string;
  recordedAt: Date;
  analysis?: SymptomAnalysis;
}

export function useSymptomChecker() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const { user } = useAuth();

  // Fetch user's symptoms
  const fetchSymptoms = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_patient_symptoms', {
        p_patient_id: user.id
      });

      if (error) throw error;

      if (data) {
        const formattedSymptoms = data.map(item => ({
          id: item.id,
          name: item.symptom_name,
          severity: item.severity,
          duration: item.duration || undefined,
          notes: item.notes || undefined,
          recordedAt: new Date(item.recorded_at),
          analysis: item.ai_analysis ? item.ai_analysis : undefined
        }));
        setSymptoms(formattedSymptoms);
      }
    } catch (error: any) {
      console.error("Error fetching symptoms:", error);
      toast({
        variant: "destructive",
        title: "Failed to fetch symptoms",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a new symptom
  const addSymptom = async (
    symptomName: string, 
    severity: number, 
    duration?: string,
    notes?: string
  ) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not logged in",
        description: "You must be logged in to track symptoms"
      });
      return null;
    }

    setLoading(true);
    try {
      const newSymptom: InsertSymptom = {
        patient_id: user.id,
        symptom_name: symptomName,
        severity,
        duration,
        notes
      };

      const { data, error } = await supabase
        .from('symptoms')
        .insert(newSymptom)
        .select('*')
        .single();

      if (error) throw error;

      // Format the new symptom
      const formattedSymptom: Symptom = {
        id: data.id,
        name: data.symptom_name,
        severity: data.severity,
        duration: data.duration || undefined,
        notes: data.notes || undefined,
        recordedAt: new Date(data.recorded_at)
      };

      setSymptoms(prev => [formattedSymptom, ...prev]);
      
      toast({
        title: "Symptom added",
        description: `${symptomName} has been recorded.`
      });

      return formattedSymptom;
    } catch (error: any) {
      console.error("Error adding symptom:", error);
      toast({
        variant: "destructive",
        title: "Failed to add symptom",
        description: error.message
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Analyze a symptom
  const analyzeSymptom = async (symptomId: string) => {
    if (!user) return null;

    const symptom = symptoms.find(s => s.id === symptomId);
    if (!symptom) return null;

    setAnalyzing(true);
    try {
      // Get patient profile information
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Get patient records if available
      const { data: patientRecords } = await supabase
        .from('patient_records')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Create user context
      const userDetails = {
        name: profileData?.name || 'User',
        role: profileData?.role || 'patient',
        ...(patientRecords ? {
          age: patientRecords.age,
          condition: patientRecords.condition,
          medicalHistory: patientRecords.medical_history
        } : {})
      };

      // Call the symptom checker edge function
      const { data, error } = await supabase.functions.invoke('symptom-checker', {
        body: { 
          symptomName: symptom.name, 
          severity: symptom.severity, 
          duration: symptom.duration, 
          notes: symptom.notes,
          userDetails 
        }
      });

      if (error) throw error;

      if (data?.structuredAnalysis) {
        // Update the symptom with analysis
        const { error: updateError } = await supabase
          .from('symptoms')
          .update({ ai_analysis: data.structuredAnalysis })
          .eq('id', symptomId);

        if (updateError) throw updateError;

        // Update local state
        const updatedSymptoms = symptoms.map(s => {
          if (s.id === symptomId) {
            return { ...s, analysis: data.structuredAnalysis };
          }
          return s;
        });

        setSymptoms(updatedSymptoms);
        
        toast({
          title: "Analysis complete",
          description: `Analysis for ${symptom.name} is ready.`
        });

        return data.structuredAnalysis;
      }
    } catch (error: any) {
      console.error("Error analyzing symptom:", error);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error.message
      });
      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  // Delete a symptom
  const deleteSymptom = async (symptomId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('symptoms')
        .delete()
        .eq('id', symptomId)
        .eq('patient_id', user.id);

      if (error) throw error;

      setSymptoms(prev => prev.filter(s => s.id !== symptomId));
      
      toast({
        title: "Symptom deleted",
        description: "The symptom record has been deleted."
      });

      return true;
    } catch (error: any) {
      console.error("Error deleting symptom:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete symptom",
        description: error.message
      });
      return false;
    }
  };

  return {
    symptoms,
    loading,
    analyzing,
    fetchSymptoms,
    addSymptom,
    analyzeSymptom,
    deleteSymptom
  };
}
