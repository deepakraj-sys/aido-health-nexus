import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileText, Users, Search, Calendar, Plus, BrainCircuit, AlertTriangle, Loader2, MoreHorizontal } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { PatientRecordRow, AIRiskAssessmentRow, VitalSignsRow, InsertPatientRecord } from "@/types/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { format } from "date-fns";

interface PatientRecordWithDetails extends PatientRecordRow {
  vital_signs: VitalSignsRow | null;
  ai_risk_assessment: AIRiskAssessmentRow | null;
}

export default function PatientRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<PatientRecordWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzingPatient, setAnalyzingPatient] = useState<string | null>(null);
  const [showAddPatientDialog, setShowAddPatientDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPatient, setNewPatient] = useState<Partial<InsertPatientRecord>>({
    name: "",
    age: 0,
    condition: "",
    status: "stable",
    medical_history: []
  });
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        
        // For a real implementation with Supabase
        const { data, error } = await supabase
          .rpc('get_patient_records_with_details') as { data: PatientRecordWithDetails[] | null, error: any };
        
        if (error) throw error;
        
        setPatients(data || []);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching patient data:", err);
        setError("Failed to load patient records. Please try again later.");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load patient records"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (user && user.role !== UserRole.PATIENT) {
      fetchPatients();
    }
    
    // Set up real-time subscription for patient records
    const subscription = supabase
      .channel('patient-records-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'patient_records'
        }, 
        () => {
          fetchPatients();
        }
      )
      .subscribe();
      
    // Cleanup function  
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [toast, user]);
  
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.condition.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Run AI analysis on a patient
  const runAIAnalysis = async (patientId: string) => {
    try {
      setAnalyzingPatient(patientId);
      
      const patientToAnalyze = patients.find(p => p.id === patientId);
      
      if (!patientToAnalyze) {
        throw new Error("Patient not found");
      }
      
      // This would be a call to an AI service in a real application
      // For now, we'll simulate the AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get the most recent vital signs
      const { data: vitalSignsData, error: vitalSignsError } = await supabase
        .from('vital_signs')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false })
        .limit(1);
        
      if (vitalSignsError) throw vitalSignsError;
      
      const vitalSigns = vitalSignsData?.[0];
      
      // Generate risk factors based on condition and vital signs
      const riskFactors = [];
      let overallRisk = 'low';
      
      if (patientToAnalyze.condition.toLowerCase().includes('diabetes')) {
        riskFactors.push('Diabetes management needs monitoring');
        overallRisk = 'moderate';
      }
      
      if (patientToAnalyze.condition.toLowerCase().includes('heart')) {
        riskFactors.push('Cardiovascular condition requires attention');
        overallRisk = 'moderate';
      }
      
      if (patientToAnalyze.status === 'needs-attention' || patientToAnalyze.status === 'critical') {
        riskFactors.push('Current health status indicates elevated risk');
        overallRisk = 'high';
      }
      
      if (vitalSigns) {
        // Check blood pressure
        if (vitalSigns.blood_pressure) {
          const [systolic, diastolic] = vitalSigns.blood_pressure.split('/').map(Number);
          if (systolic > 140 || diastolic > 90) {
            riskFactors.push('Elevated blood pressure detected');
            overallRisk = overallRisk === 'low' ? 'moderate' : 'high';
          }
        }
        
        // Check heart rate
        if (vitalSigns.heart_rate && (vitalSigns.heart_rate > 100 || vitalSigns.heart_rate < 60)) {
          riskFactors.push('Abnormal heart rate detected');
          overallRisk = overallRisk === 'low' ? 'moderate' : 'high';
        }
      }
      
      // Add some generic factors if we don't have enough
      if (riskFactors.length < 2) {
        riskFactors.push('Medical history analysis suggests monitoring');
        riskFactors.push('Correlation with similar patient profiles');
      }
      
      // Generate recommendations
      const recommendations = [
        'Regular check-ups recommended',
        'Maintain medication compliance',
        'Consider lifestyle adjustments'
      ];
      
      if (overallRisk === 'high') {
        recommendations.push('Immediate consultation with specialist advised');
      }
      
      // Save the AI risk assessment
      const { error: riskAssessmentError } = await supabase
        .from('ai_risk_assessments')
        .insert({
          patient_id: patientId,
          overall_risk: overallRisk,
          factors: riskFactors,
          recommendations
        });
        
      if (riskAssessmentError) throw riskAssessmentError;
      
      toast({
        title: "AI Analysis Complete",
        description: "Patient risk assessment has been updated with the latest analysis"
      });
    } catch (error: any) {
      console.error("AI analysis error:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message || "Could not complete the AI analysis. Please try again."
      });
    } finally {
      setAnalyzingPatient(null);
    }
  };
  
  // Handle form input change for new patient
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'age') {
      setNewPatient({ ...newPatient, [name]: parseInt(value) || 0 });
    } else {
      setNewPatient({ ...newPatient, [name]: value });
    }
  };
  
  // Add medical history item
  const addMedicalHistoryItem = (item: string) => {
    if (item.trim() === "") return;
    
    const updatedHistory = [...(newPatient.medical_history || []), item];
    setNewPatient({ ...newPatient, medical_history: updatedHistory });
  };
  
  // Remove medical history item
  const removeMedicalHistoryItem = (index: number) => {
    const updatedHistory = [...(newPatient.medical_history || [])];
    updatedHistory.splice(index, 1);
    setNewPatient({ ...newPatient, medical_history: updatedHistory });
  };
  
  // Add new patient
  const handleAddPatient = async () => {
    if (!user) return;
    
    if (!newPatient.name || !newPatient.condition) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide patient name and condition"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const patientData: InsertPatientRecord = {
        name: newPatient.name,
        age: newPatient.age || 0,
        condition: newPatient.condition,
        status: newPatient.status || 'stable',
        medical_history: newPatient.medical_history || [],
        user_id: user.id,
        last_visit: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('patient_records')
        .insert(patientData)
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Patient Added",
        description: "New patient record has been created successfully"
      });
      
      // Reset form
      setNewPatient({
        name: "",
        age: 0,
        condition: "",
        status: "stable",
        medical_history: []
      });
      
      setShowAddPatientDialog(false);
    } catch (err: any) {
      console.error("Error adding patient:", err);
      toast({
        variant: "destructive",
        title: "Failed to Add Patient",
        description: err.message || "An error occurred while adding the patient record"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Voice commands
  const voiceCommands = [
    {
      command: "go back",
      action: () => window.history.back(),
      description: "going back to previous page",
      category: "navigation" as const,
    },
    {
      command: "search for diabetes",
      action: () => setSearchQuery("diabetes"),
      description: "searching for diabetes patients",
      category: "navigation" as const,
    },
    {
      command: "clear search",
      action: () => setSearchQuery(""),
      description: "clearing search results",
      category: "navigation" as const,
    },
    {
      command: "analyze patient",
      action: () => {
        if (filteredPatients.length > 0) {
          runAIAnalysis(filteredPatients[0].id);
        }
      },
      description: "running AI analysis on the first visible patient",
      category: "data" as const,
    }
  ];

  if (user?.role === UserRole.PATIENT) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Restricted</AlertTitle>
          <AlertDescription>
            Patient records are only accessible to medical staff. Please contact your healthcare provider for information.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Users className="h-8 w-8 mr-2 text-primary" />
            Patient Records
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage patient records with AI-powered insights
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Patients</span>
              {user?.role === UserRole.DOCTOR && (
                <Button size="sm" onClick={() => setShowAddPatientDialog(true)}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add Patient
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients by name or condition..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading patient records...</span>
                </div>
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="border rounded-lg p-4 transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{patient.name}</h3>
                      <Badge
                        className={
                          patient.status === "stable"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : patient.status === "improving"
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                            : patient.status === "critical"
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-red-100 text-red-800 hover:bg-red-100"
                        }
                      >
                        {patient.status === "stable"
                          ? "Stable"
                          : patient.status === "improving"
                          ? "Improving"
                          : patient.status === "critical"
                          ? "Critical"
                          : "Needs Attention"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Age:</span>{" "}
                        {patient.age}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Condition:</span>{" "}
                        {patient.condition}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span>
                          {format(new Date(patient.last_visit), 'PP')}
                        </span>
                      </div>
                    </div>

                    {patient.vital_signs && (
                      <div className="mt-3 grid grid-cols-4 gap-2 text-xs bg-blue-50 p-2 rounded border border-blue-100">
                        <div>
                          <span className="font-medium">BP:</span>{" "}
                          {patient.vital_signs.blood_pressure || "N/A"}
                        </div>
                        <div>
                          <span className="font-medium">HR:</span>{" "}
                          {patient.vital_signs.heart_rate || "N/A"} bpm
                        </div>
                        <div>
                          <span className="font-medium">Temp:</span>{" "}
                          {patient.vital_signs.temperature || "N/A"}°C
                        </div>
                        <div>
                          <span className="font-medium">Resp:</span>{" "}
                          {patient.vital_signs.respiratory_rate || "N/A"}/min
                        </div>
                      </div>
                    )}

                    {patient.ai_risk_assessment && (
                      <div className="mt-3 p-2 bg-primary/5 rounded border border-primary/10">
                        <div className="flex items-center gap-1 mb-1">
                          <BrainCircuit className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">AI Risk Assessment:</span>
                          <Badge
                            className={
                              patient.ai_risk_assessment.overall_risk === "low"
                                ? "bg-green-100 text-green-800 ml-2"
                                : patient.ai_risk_assessment.overall_risk === "moderate"
                                ? "bg-yellow-100 text-yellow-800 ml-2"
                                : "bg-red-100 text-red-800 ml-2"
                            }
                          >
                            {patient.ai_risk_assessment.overall_risk.charAt(0).toUpperCase() + 
                              patient.ai_risk_assessment.overall_risk.slice(1)} Risk
                          </Badge>
                        </div>
                        <ul className="text-xs text-muted-foreground pl-5 list-disc mb-2">
                          {patient.ai_risk_assessment.factors?.slice(0, 2).map((factor, idx) => (
                            <li key={idx}>{factor}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-3 flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => runAIAnalysis(patient.id)}
                        disabled={analyzingPatient === patient.id}
                      >
                        {analyzingPatient === patient.id ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <BrainCircuit className="h-3 w-3 mr-1" />
                            AI Analysis
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Records
                      </Button>
                      <Button size="sm">Schedule Visit</Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No patients found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Patient Dialog */}
      <Dialog open={showAddPatientDialog} onOpenChange={setShowAddPatientDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Patient Name</Label>
                <Input 
                  id="name" 
                  name="name"
                  value={newPatient.name}
                  onChange={handleInputChange}
                  placeholder="Enter patient name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input 
                  id="age" 
                  name="age"
                  type="number"
                  value={newPatient.age}
                  onChange={handleInputChange}
                  placeholder="Enter age"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="condition">Medical Condition</Label>
              <Input 
                id="condition" 
                name="condition"
                value={newPatient.condition}
                onChange={handleInputChange}
                placeholder="Primary diagnosis or condition"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select 
                id="status" 
                name="status"
                className="w-full border border-input bg-background rounded-md px-3 py-2"
                value={newPatient.status}
                onChange={handleInputChange}
              >
                <option value="stable">Stable</option>
                <option value="improving">Improving</option>
                <option value="needs-attention">Needs Attention</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Medical History</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="historyItem" 
                  placeholder="Add medical history item"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addMedicalHistoryItem((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('historyItem') as HTMLInputElement;
                    addMedicalHistoryItem(input.value);
                    input.value = '';
                  }}
                >
                  Add
                </Button>
              </div>
              
              {(newPatient.medical_history || []).length > 0 && (
                <div className="mt-2 space-y-1">
                  {newPatient.medical_history?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                      <span>{item}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeMedicalHistoryItem(index)}
                        className="h-6 w-6 p-0"
                      >
                        <span className="sr-only">Remove</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPatientDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddPatient} 
              disabled={isSubmitting || !newPatient.name || !newPatient.condition}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <VoiceAssistant commands={voiceCommands} />
    </DashboardLayout>
  );
}
