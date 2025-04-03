
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Users, Search, Calendar, Plus, BrainCircuit, AlertTriangle, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { Badge } from "@/components/ui";
import { useToast } from "@/hooks/use-toast";
import { PatientRecord } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PatientRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzingPatient, setAnalyzingPatient] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // This would be replaced with a real API call once connected to Supabase
    const fetchPatients = async () => {
      try {
        setLoading(true);
        // Simulating API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // This would be replaced with actual API data
        const mockPatients: PatientRecord[] = [
          {
            id: "1",
            name: "Alice Johnson",
            age: 32,
            condition: "Multiple Sclerosis",
            lastVisit: "2025-04-10",
            status: "stable",
            vitalSigns: {
              bloodPressure: "120/80",
              heartRate: 75,
              temperature: 36.6,
              respiratoryRate: 16
            },
            aiRiskAssessment: {
              overallRisk: "moderate",
              factors: ["Family history", "Recent stress factors"],
              recommendations: ["Quarterly check-ups", "Stress management therapy"]
            }
          },
          {
            id: "2",
            name: "Robert Smith",
            age: 45,
            condition: "Type 2 Diabetes",
            lastVisit: "2025-03-28",
            status: "improving",
            vitalSigns: {
              bloodPressure: "135/85",
              heartRate: 80,
              temperature: 36.7,
              respiratoryRate: 18
            },
            aiRiskAssessment: {
              overallRisk: "moderate",
              factors: ["Weight management issues", "Irregular medication adherence"],
              recommendations: ["Diet consultation", "Digital medication reminder"]
            }
          },
          {
            id: "3",
            name: "Emma Davis",
            age: 28,
            condition: "Chronic Migraine",
            lastVisit: "2025-04-15",
            status: "needs-attention",
            vitalSigns: {
              bloodPressure: "110/70",
              heartRate: 68,
              temperature: 37.1,
              respiratoryRate: 15
            },
            aiRiskAssessment: {
              overallRisk: "high",
              factors: ["Increasing frequency of episodes", "Sleep pattern disruption"],
              recommendations: ["Neurologist referral", "Sleep study", "Medication review"]
            }
          },
          {
            id: "4",
            name: "James Wilson",
            age: 67,
            condition: "Parkinson's Disease",
            lastVisit: "2025-04-02",
            status: "stable",
            vitalSigns: {
              bloodPressure: "140/90",
              heartRate: 72,
              temperature: 36.5,
              respiratoryRate: 17
            },
            aiRiskAssessment: {
              overallRisk: "moderate",
              factors: ["Medication side effects", "Balance issues"],
              recommendations: ["Physical therapy", "Medication adjustment"]
            }
          }
        ];
        
        setPatients(mockPatients);
        setError(null);
      } catch (err) {
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
    
    fetchPatients();
  }, [toast]);
  
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.condition.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const runAIAnalysis = async (patientId: string) => {
    try {
      setAnalyzingPatient(patientId);
      
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update patient with AI analysis results
      setPatients(currentPatients => 
        currentPatients.map(patient => {
          if (patient.id === patientId) {
            // This would come from an actual AI model through Supabase
            const newAssessment = {
              overallRisk: patient.status === "needs-attention" ? "high" : "moderate",
              factors: [
                "Updated risk factor based on recent lab results",
                "Correlation with similar patient profiles",
                patient.status === "needs-attention" ? "Trend analysis indicates deterioration risk" : "Stable indicators across vital measurements"
              ] as string[],
              recommendations: [
                "Personalized treatment adjustment",
                "Additional screening recommended",
                "Lifestyle modification plan"
              ]
            } as PatientRecord["aiRiskAssessment"];
            
            return {
              ...patient,
              aiRiskAssessment: newAssessment
            };
          }
          return patient;
        })
      );
      
      toast({
        title: "AI Analysis Complete",
        description: "Patient risk assessment has been updated with the latest analysis"
      });
    } catch (error) {
      console.error("AI analysis error:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not complete the AI analysis. Please try again."
      });
    } finally {
      setAnalyzingPatient(null);
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
              <Button size="sm">
                <Plus className="mr-1 h-4 w-4" />
                Add Patient
              </Button>
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
                          {new Date(patient.lastVisit).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {patient.aiRiskAssessment && (
                      <div className="mt-3 p-2 bg-primary/5 rounded border border-primary/10">
                        <div className="flex items-center gap-1 mb-1">
                          <BrainCircuit className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">AI Risk Assessment:</span>
                          <Badge
                            className={
                              patient.aiRiskAssessment.overallRisk === "low"
                                ? "bg-green-100 text-green-800 ml-2"
                                : patient.aiRiskAssessment.overallRisk === "moderate"
                                ? "bg-yellow-100 text-yellow-800 ml-2"
                                : "bg-red-100 text-red-800 ml-2"
                            }
                          >
                            {patient.aiRiskAssessment.overallRisk.charAt(0).toUpperCase() + 
                              patient.aiRiskAssessment.overallRisk.slice(1)} Risk
                          </Badge>
                        </div>
                        <ul className="text-xs text-muted-foreground pl-5 list-disc mb-2">
                          {patient.aiRiskAssessment.factors.slice(0, 2).map((factor, idx) => (
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

      <VoiceAssistant commands={voiceCommands} />
    </DashboardLayout>
  );
}
