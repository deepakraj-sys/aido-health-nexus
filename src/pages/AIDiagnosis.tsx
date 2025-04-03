
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, FileText, Stethoscope, Database, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AIDiagnosis() {
  const [activeTab, setActiveTab] = useState("diagnosis");
  
  // Voice commands
  const voiceCommands = [
    {
      command: "go back",
      action: () => window.history.back(),
      description: "going back to previous page",
      category: "navigation" as const,
    },
    {
      command: "show treatments",
      action: () => setActiveTab("treatments"),
      description: "showing treatments tab",
      category: "diagnosis" as const,
    },
    {
      command: "show research",
      action: () => setActiveTab("research"),
      description: "showing research tab",
      category: "diagnosis" as const,
    },
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
            <Stethoscope className="h-8 w-8 mr-2 text-primary" />
            AI Diagnosis Support
          </h1>
          <p className="text-muted-foreground mt-1">
            Get AI-powered suggestions for diagnoses and treatments
          </p>
        </div>
        
        <Alert>
          <Brain className="h-4 w-4" />
          <AlertTitle>AI Diagnostic Aid</AlertTitle>
          <AlertDescription>
            This tool is designed to assist healthcare professionals with diagnoses. Always rely on your clinical judgment and expertise when providing patient care.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="diagnosis" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="diagnosis">Diagnosis Assistant</TabsTrigger>
            <TabsTrigger value="treatments">Treatment Options</TabsTrigger>
            <TabsTrigger value="research">Research Integration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="diagnosis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-primary" />
                  Diagnostic Suggestions
                </CardTitle>
                <CardDescription>
                  Upload patient data or enter symptoms to receive AI-powered diagnostic suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 border-2 border-dashed rounded-lg text-center">
                  <Database className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <p className="font-medium mb-2">Upload Patient Data</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag & drop patient files or click to browse
                  </p>
                  <Button variant="outline">Upload Files</Button>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-4">Recent Diagnoses</h3>
                  <div className="space-y-2">
                    <div className="border rounded-lg p-3 hover:bg-accent transition-colors cursor-pointer">
                      <div className="flex justify-between">
                        <span className="font-medium">Emma Davis - Chronic Migraine</span>
                        <span className="text-xs text-muted-foreground">Today</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        AI confidence: 92% - Based on symptoms and patient history
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-3 hover:bg-accent transition-colors cursor-pointer">
                      <div className="flex justify-between">
                        <span className="font-medium">James Wilson - Parkinson's Assessment</span>
                        <span className="text-xs text-muted-foreground">Yesterday</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        AI confidence: 88% - Based on movement analysis and imaging
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="treatments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Treatment Recommendations
                </CardTitle>
                <CardDescription>
                  AI-generated treatment options based on diagnosis and patient profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Chronic Migraine - Treatment Plan</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Primary Treatment:</strong> Sumatriptan 50mg as needed for acute attacks</p>
                      <p><strong>Preventive Treatment:</strong> Topiramate 25mg daily, increasing to 50mg after 2 weeks</p>
                      <p><strong>Lifestyle Modifications:</strong> Regular sleep schedule, stress management techniques</p>
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-primary font-medium">AI Notes:</p>
                        <p className="text-muted-foreground">Patient has responded well to triptans in the past. Consider botulinum toxin injections if oral medications fail to provide relief.</p>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button size="sm">Apply Treatment</Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Type 2 Diabetes - Treatment Plan</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Primary Treatment:</strong> Metformin 500mg twice daily with meals</p>
                      <p><strong>Additional Management:</strong> Blood glucose monitoring, HbA1c check every 3 months</p>
                      <p><strong>Lifestyle Modifications:</strong> Low-carb diet, 30 minutes of exercise 5 days/week</p>
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-primary font-medium">AI Notes:</p>
                        <p className="text-muted-foreground">Patient has impaired kidney function. Adjust metformin dosage accordingly and monitor renal function regularly.</p>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button size="sm">Apply Treatment</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="research" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-primary" />
                  Research Integration
                </CardTitle>
                <CardDescription>
                  Latest research findings relevant to current diagnoses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">Neurology</span>
                    <h3 className="font-medium mt-2">Advances in Migraine Treatment: CGRP Inhibitors</h3>
                    <p className="text-sm text-muted-foreground my-2">
                      Recent studies show CGRP inhibitors can reduce migraine frequency by 50% in 60% of patients with chronic migraine.
                    </p>
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <span className="text-muted-foreground">Journal of Neurology (2025)</span>
                      <Button variant="link" size="sm" className="h-auto p-0">
                        Read Full Paper
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">Endocrinology</span>
                    <h3 className="font-medium mt-2">New Insights into Parkinson's Disease Management</h3>
                    <p className="text-sm text-muted-foreground my-2">
                      A combination of physical therapy and novel dopamine agonists shows improved outcomes in early-stage Parkinson's patients.
                    </p>
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <span className="text-muted-foreground">Movement Disorders (2025)</span>
                      <Button variant="link" size="sm" className="h-auto p-0">
                        Read Full Paper
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Button variant="outline">
                      Search Medical Literature
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      <VoiceAssistant commands={voiceCommands} />
    </DashboardLayout>
  );
}
