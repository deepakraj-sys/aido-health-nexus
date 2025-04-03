
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { InsertMedication, UpdateMedication, MedicationRow } from "@/types/supabase";

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  reminderTimes: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function useMedications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchMedications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_patient_medications', {
        p_patient_id: user.id
      });

      if (error) throw error;

      if (data) {
        const formattedMedications = data.map((med: MedicationRow) => ({
          id: med.id,
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          startDate: new Date(med.start_date),
          endDate: med.end_date ? new Date(med.end_date) : undefined,
          reminderTimes: med.reminder_times || [],
          notes: med.notes,
          createdAt: new Date(med.created_at),
          updatedAt: new Date(med.updated_at),
        }));
        setMedications(formattedMedications);
      }
    } catch (error: any) {
      console.error("Error fetching medications:", error);
      toast({
        variant: "destructive",
        title: "Failed to fetch medications",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const addMedication = async (medicationData: {
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
    reminderTimes?: string[];
    notes?: string;
  }) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not logged in",
        description: "You must be logged in to add medications"
      });
      return null;
    }

    setLoading(true);
    try {
      const newMedication: InsertMedication = {
        patient_id: user.id,
        name: medicationData.name,
        dosage: medicationData.dosage,
        frequency: medicationData.frequency,
        start_date: medicationData.startDate,
        end_date: medicationData.endDate,
        reminder_times: medicationData.reminderTimes || [],
        notes: medicationData.notes,
      };

      const { data, error } = await supabase
        .from('medications')
        .insert(newMedication)
        .select('*')
        .single();

      if (error) throw error;

      // Format the new medication
      const formattedMedication: Medication = {
        id: data.id,
        name: data.name,
        dosage: data.dosage,
        frequency: data.frequency,
        startDate: new Date(data.start_date),
        endDate: data.end_date ? new Date(data.end_date) : undefined,
        reminderTimes: data.reminder_times || [],
        notes: data.notes,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setMedications(prev => [formattedMedication, ...prev]);
      
      toast({
        title: "Medication added",
        description: `${data.name} has been added to your medications.`
      });

      return formattedMedication;
    } catch (error: any) {
      console.error("Error adding medication:", error);
      toast({
        variant: "destructive",
        title: "Failed to add medication",
        description: error.message
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateMedication = async (medicationId: string, medicationData: {
    name?: string;
    dosage?: string;
    frequency?: string;
    startDate?: string;
    endDate?: string | null;
    reminderTimes?: string[];
    notes?: string | null;
  }) => {
    if (!user) return null;

    try {
      const updates: UpdateMedication = {};
      
      if (medicationData.name) updates.name = medicationData.name;
      if (medicationData.dosage) updates.dosage = medicationData.dosage;
      if (medicationData.frequency) updates.frequency = medicationData.frequency;
      if (medicationData.startDate) updates.start_date = medicationData.startDate;
      if (medicationData.endDate !== undefined) updates.end_date = medicationData.endDate || undefined;
      if (medicationData.reminderTimes) updates.reminder_times = medicationData.reminderTimes;
      if (medicationData.notes !== undefined) updates.notes = medicationData.notes || undefined;

      const { data, error } = await supabase
        .from('medications')
        .update(updates)
        .eq('id', medicationId)
        .eq('patient_id', user.id)
        .select('*')
        .single();

      if (error) throw error;

      // Format the updated medication
      const formattedMedication: Medication = {
        id: data.id,
        name: data.name,
        dosage: data.dosage,
        frequency: data.frequency,
        startDate: new Date(data.start_date),
        endDate: data.end_date ? new Date(data.end_date) : undefined,
        reminderTimes: data.reminder_times || [],
        notes: data.notes,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setMedications(prev => prev.map(med => 
        med.id === medicationId ? formattedMedication : med
      ));
      
      toast({
        title: "Medication updated",
        description: `${data.name} has been updated.`
      });

      return formattedMedication;
    } catch (error: any) {
      console.error("Error updating medication:", error);
      toast({
        variant: "destructive",
        title: "Failed to update medication",
        description: error.message
      });
      return null;
    }
  };

  const deleteMedication = async (medicationId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', medicationId)
        .eq('patient_id', user.id);

      if (error) throw error;

      setMedications(prev => prev.filter(med => med.id !== medicationId));
      
      toast({
        title: "Medication deleted",
        description: "The medication has been removed from your list."
      });

      return true;
    } catch (error: any) {
      console.error("Error deleting medication:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete medication",
        description: error.message
      });
      return false;
    }
  };

  return {
    medications,
    loading,
    fetchMedications,
    addMedication,
    updateMedication,
    deleteMedication
  };
}
