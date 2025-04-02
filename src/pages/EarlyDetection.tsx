
import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Eye, Activity, FileText, Upload, Clock } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button, Badge, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole, VoiceCommand } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

export default function EarlyDetection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const isDoctor = user?.role === UserRole.DOCTOR;
  const isPatient = user?.role === UserRole.PATIENT;
  
  if (!user || (!isDoctor && !isPatient)) {
    navigate("/dashboard");
    return null;
  }
  
  const voiceCommands: VoiceCommand[] = [
    {
      command: "go back to dashboard",
      action: () => navigate("/dashboard"),
      description: "navigating back to dashboard",
      category: "navigation",
    },
    {
      command: "run eye tracking analysis",
      action: () => {
        if (isPatient) {
          setActiveTab("eye-tracking");
          handleStartAnalysis("eye-tracking");
        }
      },
      description: "starting eye tracking analysis",
      category: "detection",
    },
    {
      command: "view my brain scan results",
      action: () => {
        if (isPatient) {
          setActiveTab("brain-scans");
        }
      },
      description: "showing brain scan results",
      category: "detection",
    },
    {
      command: "upload new medical data",
      action: () => {
        toast({
          title: "Upload feature",
          description: "File upload dialog would open here",
        });
      },
      description: "opening file upload",
      category: "data",
    },
  ];
  
  const handleStartAnalysis = (type: string) => {
    setIsAnalyzing(true);
    
    toast({
      title: "Analysis Started",
      description: `${type} analysis is now running...`,
    });
    
    setTimeout(() => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis Complete",
        description: "Results are now available for review.",
      });
    }, 3000);
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">
              AI-Based Early Detection & Diagnosis
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            {isDoctor 
              ? "Analyze patient data to detect early signs of disabilities"
              : "Track your health data and get early detection insights"}
          </p>
        </motion.div>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="eye-tracking">Eye Tracking</TabsTrigger>
            <TabsTrigger value="brain-scans">Brain Scans</TabsTrigger>
            <TabsTrigger value="genetic-analysis">Genetic Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <div className="p-2 bg-primary/10 rounded-lg w-fit">
                      <Eye className="h-6 w-6" />
                    </div>
                    <CardTitle className="mt-2">Eye Tracking Analysis</CardTitle>
                    <CardDescription>
                      AI-powered eye tracking helps detect early signs of autism and other neurodevelopmental disorders.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {isPatient
                        ? "Complete a 2-minute eye tracking session to gather data"
                        : "Analyze patient eye tracking data to detect patterns"}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => setActiveTab("eye-tracking")}
                    >
                      {isPatient ? "Start Tracking" : "View Patient Data"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <div className="p-2 bg-primary/10 rounded-lg w-fit">
                      <Brain className="h-6 w-6" />
                    </div>
                    <CardTitle className="mt-2">Brain Scan Analysis</CardTitle>
                    <CardDescription>
                      Machine learning models analyze brain scans to detect early signs of neurological disorders.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {isPatient
                        ? "Upload your MRI or CT scans for AI-powered analysis"
                        : "Review patient brain scan analyses and detection results"}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => setActiveTab("brain-scans")}
                    >
                      {isPatient ? "Upload Scans" : "Review Analyses"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <div className="p-2 bg-primary/10 rounded-lg w-fit">
                      <Activity className="h-6 w-6" />
                    </div>
                    <CardTitle className="mt-2">Genetic Analysis</CardTitle>
                    <CardDescription>
                      Analyze genetic markers to identify risk factors for various disabilities.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {isPatient
                        ? "Upload genetic test results for AI analysis"
                        : "Review patient genetic analyses for early indicators"}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => setActiveTab("genetic-analysis")}
                    >
                      {isPatient ? "Submit Results" : "View Genetic Data"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
          
          <TabsContent value="eye-tracking">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-6 w-6 text-primary" />
                    <CardTitle>Eye Tracking Analysis</CardTitle>
                  </div>
                </div>
                <CardDescription>
                  Early detection of autism spectrum disorder through AI-powered eye tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-6">
                  {isPatient && (
                    <div className="relative w-full max-w-lg aspect-video bg-black rounded-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {isAnalyzing ? (
                          <div className="flex flex-col items-center gap-3">
                            <div className="h-24 w-24 rounded-full border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent animate-spin"></div>
                            <p className="text-white">Analyzing eye movements...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3">
                            <Eye className="h-16 w-16 text-white" />
                            <p className="text-white">Camera preview will appear here</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {isDoctor && (
                    <div className="w-full">
                      <h3 className="text-lg font-medium mb-4">Patient Eye Tracking Results</h3>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">John Doe</p>
                              <p className="text-sm text-muted-foreground">Age: 4 years</p>
                            </div>
                            <Badge className="bg-amber-500">Attention Required</Badge>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm">Analysis detected irregular eye movement patterns that may indicate early signs of ASD.</p>
                            <Button variant="link" size="sm" className="p-0 h-auto mt-1">
                              View Full Report
                            </Button>
                          </div>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">Emma Wilson</p>
                              <p className="text-sm text-muted-foreground">Age: 2 years</p>
                            </div>
                            <Badge className="bg-green-500">Normal</Badge>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm">No irregular patterns detected. Recommend follow-up in 6 months.</p>
                            <Button variant="link" size="sm" className="p-0 h-auto mt-1">
                              View Full Report
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {isPatient && (
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Instructions</h3>
                        <Button
                          onClick={() => handleStartAnalysis("eye-tracking")}
                          disabled={isAnalyzing}
                        >
                          {isAnalyzing ? "Analyzing..." : "Start Analysis"}
                        </Button>
                      </div>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Position yourself in a well-lit area facing the camera</li>
                        <li>Keep your head steady and follow the dot with your eyes</li>
                        <li>The analysis will take approximately 2 minutes to complete</li>
                        <li>Results will be shared with your healthcare provider</li>
                      </ol>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="brain-scans">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-primary" />
                  <CardTitle>Brain Scan Analysis</CardTitle>
                </div>
                <CardDescription>
                  ML-powered analysis of brain scans to detect early signs of neurological disorders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6">
                  <div className="bg-muted/30 p-6 rounded-lg border border-dashed border-muted-foreground/50 flex flex-col items-center justify-center">
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground mb-2">
                      Drag and drop brain scan files (MRI, CT) or click to browse
                    </p>
                    <Button>Upload Scans</Button>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Previous Analyses</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">MRI Scan Analysis</p>
                            <p className="text-xs text-muted-foreground">Uploaded on May 15, 2023</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">View Results</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">CT Scan Analysis</p>
                            <p className="text-xs text-muted-foreground">Uploaded on Feb 3, 2023</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">View Results</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="genetic-analysis">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="h-6 w-6 text-primary" />
                  <CardTitle>Genetic Analysis</CardTitle>
                </div>
                <CardDescription>
                  Analysis of genetic markers to identify potential risk factors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6">
                  <div className="bg-muted/30 p-6 rounded-lg border border-dashed border-muted-foreground/50 flex flex-col items-center justify-center">
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground mb-2">
                      Upload genetic test results for AI analysis
                    </p>
                    <Button>Upload Data</Button>
                  </div>
                  
                  {isDoctor && (
                    <div>
                      <h3 className="text-lg font-medium mb-4">Patient Genetic Analyses</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Select a patient to view their genetic analysis results and risk assessments.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Michael Johnson</p>
                            <p className="text-xs text-muted-foreground">Last updated: Apr 12, 2023</p>
                          </div>
                          <Button variant="outline" size="sm">View Analysis</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Sara Williams</p>
                            <p className="text-xs text-muted-foreground">Last updated: Jun 5, 2023</p>
                          </div>
                          <Button variant="outline" size="sm">View Analysis</Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {isPatient && (
                    <div className="p-4 border rounded-lg">
                      <h3 className="text-lg font-medium mb-2">Your Genetic Risk Assessment</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        No genetic data has been uploaded yet. Please upload your genetic test results for analysis.
                      </p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Analysis typically takes 24-48 hours after upload</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <VoiceAssistant commands={voiceCommands} />
    </DashboardLayout>
  );
}
