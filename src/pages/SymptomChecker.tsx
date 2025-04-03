
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Plus, Check, X, Brain, AlertTriangle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/DashboardLayout";
import { VoiceAssistant } from "@/components/VoiceAssistant";

export default function SymptomChecker() {
  const [step, setStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [duration, setDuration] = useState("");
  const [result, setResult] = useState<null | {
    possibleConditions: string[];
    recommendation: string;
    urgency: "low" | "medium" | "high";
  }>(null);
  
  const commonSymptoms = [
    "Headache", "Fever", "Cough", "Fatigue", 
    "Sore throat", "Nausea", "Dizziness", "Joint pain", 
    "Muscle aches", "Shortness of breath"
  ];
  
  const handleAddSymptom = (symptom: string) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };
  
  const handleRemoveSymptom = (symptom: string) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
  };
  
  const handleSubmit = () => {
    // Simple logic for demo purposes - in a real app, this would be more complex
    let possibleConditions: string[] = [];
    let recommendation = "";
    let urgency: "low" | "medium" | "high" = "low";
    
    if (selectedSymptoms.includes("Fever") && selectedSymptoms.includes("Cough")) {
      possibleConditions.push("Common Cold", "Flu", "COVID-19");
      recommendation = "Rest, stay hydrated, and monitor your symptoms. Consider getting tested for COVID-19.";
      urgency = "medium";
    } 
    else if (selectedSymptoms.includes("Headache") && selectedSymptoms.includes("Fatigue")) {
      possibleConditions.push("Migraine", "Tension Headache", "Dehydration");
      recommendation = "Rest in a dark room, stay hydrated, and consider over-the-counter pain relievers.";
      urgency = "low";
    }
    else if (selectedSymptoms.includes("Shortness of breath")) {
      possibleConditions.push("Asthma", "Anxiety", "Respiratory Infection");
      recommendation = "If severe or persistent, seek immediate medical attention.";
      urgency = "high";
    }
    else {
      possibleConditions.push("Common Cold", "Seasonal Allergies", "Fatigue");
      recommendation = "Rest, stay hydrated, and monitor your symptoms.";
      urgency = "low";
    }
    
    setResult({
      possibleConditions,
      recommendation,
      urgency
    });
    
    setStep(3);
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
      command: "add symptom headache",
      action: () => handleAddSymptom("Headache"),
      description: "adding headache to symptoms",
      category: "detection" as const,
    },
    {
      command: "add symptom fever",
      action: () => handleAddSymptom("Fever"),
      description: "adding fever to symptoms",
      category: "detection" as const,
    },
    {
      command: "next step",
      action: () => {
        if (step < 3 && selectedSymptoms.length > 0) setStep(step + 1);
      },
      description: "moving to next step",
      category: "navigation" as const,
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
            <Activity className="h-8 w-8 mr-2 text-primary" />
            Symptom Checker
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and analyze your symptoms with AI assistance
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Step {step} of 3: {step === 1 ? "Select Symptoms" : step === 2 ? "Symptom Duration" : "Results"}</CardTitle>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-medium">Selected Symptoms:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.length === 0 ? (
                      <span className="text-muted-foreground">No symptoms selected yet</span>
                    ) : (
                      selectedSymptoms.map((symptom) => (
                        <div key={symptom} className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm flex items-center">
                          {symptom}
                          <button onClick={() => handleRemoveSymptom(symptom)} className="ml-2 h-4 w-4 inline-flex items-center justify-center rounded-full">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Common Symptoms:</h3>
                  <div className="flex flex-wrap gap-2">
                    {commonSymptoms.map((symptom) => (
                      <button
                        key={symptom}
                        onClick={() => handleAddSymptom(symptom)}
                        disabled={selectedSymptoms.includes(symptom)}
                        className={`rounded-full px-3 py-1 text-sm flex items-center border ${
                          selectedSymptoms.includes(symptom)
                            ? "bg-primary/10 text-primary border-primary/30"
                            : "bg-accent hover:bg-accent/80"
                        }`}
                      >
                        {selectedSymptoms.includes(symptom) ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <Plus className="h-3 w-3 mr-1" />
                        )}
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button onClick={() => setStep(2)} disabled={selectedSymptoms.length === 0}>
                    Continue
                  </Button>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">How long have you experienced these symptoms?</h3>
                  
                  <RadioGroup value={duration} onValueChange={setDuration}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="less-than-day" id="less-than-day" />
                      <Label htmlFor="less-than-day">Less than a day</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1-3-days" id="1-3-days" />
                      <Label htmlFor="1-3-days">1-3 days</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3-7-days" id="3-7-days" />
                      <Label htmlFor="3-7-days">3-7 days</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="more-than-week" id="more-than-week" />
                      <Label htmlFor="more-than-week">More than a week</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button onClick={handleSubmit} disabled={!duration}>
                    Get Results
                  </Button>
                </div>
              </div>
            )}
            
            {step === 3 && result && (
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-accent">
                  <div className={`mb-4 p-2 rounded-md flex items-center ${
                    result.urgency === 'high' 
                      ? 'bg-destructive/10 text-destructive' 
                      : result.urgency === 'medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-green-100 text-green-800'
                  }`}>
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <div>
                      <h3 className="font-medium">
                        {result.urgency === 'high' 
                          ? 'Seek Medical Attention' 
                          : result.urgency === 'medium'
                            ? 'Consult a Healthcare Provider'
                            : 'Monitor Symptoms'}
                      </h3>
                      <p className="text-sm">
                        {result.urgency === 'high'
                          ? 'Your symptoms may require immediate medical attention.'
                          : result.urgency === 'medium'
                            ? 'Consider consulting with a healthcare provider soon.'
                            : 'Monitor your symptoms and rest.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium flex items-center">
                        <Brain className="h-4 w-4 mr-1 text-primary" />
                        Possible Conditions
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Based on AI analysis of your symptoms
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        {result.possibleConditions.map((condition, index) => (
                          <li key={index} className="text-sm">{condition}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">Recommendation</h3>
                      <p className="text-sm">{result.recommendation}</p>
                    </div>
                    
                    <div className="bg-primary/5 p-3 rounded-md text-sm">
                      <p className="font-medium text-primary">Important Note</p>
                      <p className="text-muted-foreground">
                        This is not a medical diagnosis. Always consult with a qualified healthcare provider for proper medical advice.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Start Over
                  </Button>
                  <Button onClick={() => window.location.href = "/telehealth"}>
                    Schedule Consultation
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <VoiceAssistant commands={voiceCommands} />
    </DashboardLayout>
  );
}
