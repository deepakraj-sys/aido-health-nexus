
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Users, Search, Calendar, Plus } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { Badge } from "@/components/ui";

export default function PatientRecords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients] = useState([
    {
      id: 1,
      name: "Alice Johnson",
      age: 32,
      condition: "Multiple Sclerosis",
      lastVisit: "2025-04-10",
      status: "stable"
    },
    {
      id: 2,
      name: "Robert Smith",
      age: 45,
      condition: "Type 2 Diabetes",
      lastVisit: "2025-03-28",
      status: "improving"
    },
    {
      id: 3,
      name: "Emma Davis",
      age: 28,
      condition: "Chronic Migraine",
      lastVisit: "2025-04-15",
      status: "needs-attention"
    },
    {
      id: 4,
      name: "James Wilson",
      age: 67,
      condition: "Parkinson's Disease",
      lastVisit: "2025-04-02",
      status: "stable"
    }
  ]);
  
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.condition.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
            View and manage patient records and information
          </p>
        </div>

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
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="border rounded-lg p-4 transition-colors hover:bg-accent cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{patient.name}</h3>
                      <Badge
                        className={
                          patient.status === "stable"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : patient.status === "improving"
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                            : "bg-red-100 text-red-800 hover:bg-red-100"
                        }
                      >
                        {patient.status === "stable"
                          ? "Stable"
                          : patient.status === "improving"
                          ? "Improving"
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
                    <div className="mt-2 flex justify-end space-x-2">
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
