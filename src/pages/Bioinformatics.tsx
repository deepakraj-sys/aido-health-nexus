import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Dna, 
  FileSearch, 
  Database, 
  Upload, 
  FileDigit, 
  AlertCircle,
  BarChart4,
  BrainCircuit,
  FileSpreadsheet,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { 
  Button, 
  Badge, 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole, VoiceCommand, GenomeData } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

// Sample genome data
const sampleGenomeData: GenomeData[] = [
  {
    id: "gen-001",
    patientId: "pat-123",
    patientName: "John Smith",
    sampleDate: "2023-05-15",
    analysisStatus: "completed",
    results: {
      riskFactors: [
        {
          condition: "Parkinson's Disease",
          riskLevel: "moderate",
          confidence: 0.76,
          biomarkers: ["LRRK2", "PARK7", "SNCA"]
        },
        {
          condition: "Multiple Sclerosis",
          riskLevel: "low",
          confidence: 0.32,
          biomarkers: ["HLA-DRB1", "IL7R"]
        }
      ],
      recommendations: [
        "Regular neurological assessments every 6 months",
        "Dopamine level monitoring",
        "Consider preventative therapies targeting LRRK2"
      ],
      preventativeMeasures: [
        "Increased physical activity regimen",
        "Mediterranean diet supplementation",
        "CRISPR-based gene therapy consultation"
      ]
    }
  },
  {
    id: "gen-002",
    patientId: "pat-456",
    patientName: "Emma Wilson",
    sampleDate: "2023-06-22",
    analysisStatus: "in-progress"
  },
  {
    id: "gen-003",
    patientId: "pat-789",
    patientName: "Michael Johnson",
    sampleDate: "2023-07-10",
    analysisStatus: "pending"
  }
];

export default function Bioinformatics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSample, setSelectedSample] = useState<GenomeData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const isDoctor = user?.role === UserRole.DOCTOR;
  const isResearcher = user?.role === UserRole.RESEARCHER;
  
  if (!user || (!isDoctor && !isResearcher)) {
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
      command: "analyze genome sample",
      action: () => {
        setActiveTab("genome-analysis");
        handleStartAnalysis();
      },
      description: "starting genome analysis",
      category: "data",
    },
    {
      command: "show biomarker database",
      action: () => {
        setActiveTab("biomarker-database");
      },
      description: "showing biomarker database",
      category: "data",
    },
    {
      command: "upload new genome data",
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
  
  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    
    toast({
      title: "Analysis Started",
      description: "Genome analysis is now running...",
    });
    
    setTimeout(() => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis Complete",
        description: "Results are now available for review.",
      });
    }, 3000);
  };
  
  const handleSampleSelect = (sample: GenomeData) => {
    setSelectedSample(sample);
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
            <Dna className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">
              AI + Bioinformatics for Disability Prevention
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            {isDoctor 
              ? "Analyze genetic data to predict and prevent potential disabilities in patients"
              : "Research and develop AI models for disability prevention through genomic analysis"}
          </p>
        </motion.div>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="genome-analysis">Genome Analysis</TabsTrigger>
            <TabsTrigger value="biomarker-database">Biomarker Database</TabsTrigger>
            <TabsTrigger value="crispr-simulation">CRISPR Simulation</TabsTrigger>
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
                      <Dna className="h-6 w-6" />
                    </div>
                    <CardTitle className="mt-2">Genome Sequencing Analysis</CardTitle>
                    <CardDescription>
                      AI-driven genome sequencing to detect potential disabilities before birth and in early development.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {isDoctor
                        ? "Analyze patient genomic data to predict inherited conditions"
                        : "Research genomic markers associated with disability risk factors"}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => setActiveTab("genome-analysis")}
                    >
                      {isDoctor ? "Analyze Patient Genomes" : "Research Genome Markers"}
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
                      <Database className="h-6 w-6" />
                    </div>
                    <CardTitle className="mt-2">Biomarker Database</CardTitle>
                    <CardDescription>
                      Comprehensive database of biomarkers for predicting degenerative disabilities.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {isDoctor
                        ? "Reference biomarkers for clinical decision making"
                        : "Contribute to the growing database of disability biomarkers"}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => setActiveTab("biomarker-database")}
                    >
                      {isDoctor ? "Access Database" : "Manage Database"}
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
                      <BrainCircuit className="h-6 w-6" />
                    </div>
                    <CardTitle className="mt-2">CRISPR Gene Therapy Simulation</CardTitle>
                    <CardDescription>
                      Simulate AI-based DNA repair mechanisms for preventing inherited disabilities.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {isDoctor
                        ? "Explore potential treatments for genetic conditions"
                        : "Design and test gene therapy approaches through simulation"}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => setActiveTab("crispr-simulation")}
                    >
                      {isDoctor ? "Explore Treatments" : "Run Simulations"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
          
          <TabsContent value="genome-analysis">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dna className="h-6 w-6 text-primary" />
                    <CardTitle>Genome Analysis</CardTitle>
                  </div>
                </div>
                <CardDescription>
                  AI-driven analysis of genomic data to predict potential disabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6">
                  <div className="bg-muted/30 p-6 rounded-lg border border-dashed border-muted-foreground/50 flex flex-col items-center justify-center">
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground mb-2">
                      Upload genome sequence data (FASTA, VCF, BAM) for AI analysis
                    </p>
                    <Button>Upload Genome Data</Button>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Available Samples</h3>
                    <div className="space-y-3">
                      {sampleGenomeData.map((sample) => (
                        <div 
                          key={sample.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition"
                          onClick={() => handleSampleSelect(sample)}
                        >
                          <div className="flex items-center gap-3">
                            <FileDigit className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">{sample.patientName}</p>
                              <p className="text-xs text-muted-foreground">Sample from {sample.sampleDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={
                              sample.analysisStatus === 'completed' ? 'bg-green-500' : 
                              sample.analysisStatus === 'in-progress' ? 'bg-amber-500' : 'bg-slate-500'
                            }>
                              {sample.analysisStatus.charAt(0).toUpperCase() + sample.analysisStatus.slice(1)}
                            </Badge>
                            <Button variant="outline" size="sm">View</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {selectedSample && selectedSample.analysisStatus === "completed" && selectedSample.results && (
                    <Card className="border-2 border-primary/20">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Analysis Results: {selectedSample.patientName}</CardTitle>
                          <Badge className="bg-green-500">Completed</Badge>
                        </div>
                        <CardDescription>Sample ID: {selectedSample.id} • Analyzed on {selectedSample.sampleDate}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Risk Factors Identified</h4>
                            <div className="space-y-2">
                              {selectedSample.results.riskFactors.map((risk, idx) => (
                                <div key={idx} className="p-3 border rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium">{risk.condition}</p>
                                    <Badge className={
                                      risk.riskLevel === 'high' ? 'bg-red-500' : 
                                      risk.riskLevel === 'moderate' ? 'bg-amber-500' : 'bg-green-500'
                                    }>
                                      {risk.riskLevel.charAt(0).toUpperCase() + risk.riskLevel.slice(1)} Risk
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Confidence: {(risk.confidence * 100).toFixed(0)}%
                                  </p>
                                  <div className="mt-2">
                                    <p className="text-xs font-medium">Relevant Biomarkers:</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {risk.biomarkers.map((marker) => (
                                        <span key={marker} className="text-xs px-2 py-0.5 bg-primary/10 rounded">
                                          {marker}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Recommendations</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {selectedSample.results.recommendations.map((rec, idx) => (
                                <li key={idx} className="text-sm">{rec}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Preventative Measures</h4>
                            <ul className="list-disc pl-5 space-y-1">
                              {selectedSample.results.preventativeMeasures.map((measure, idx) => (
                                <li key={idx} className="text-sm">{measure}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline">Export Report</Button>
                        <Button>Schedule Consultation</Button>
                      </CardFooter>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="biomarker-database">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="h-6 w-6 text-primary" />
                  <CardTitle>Biomarker Database</CardTitle>
                </div>
                <CardDescription>
                  Comprehensive database of biomarkers for predicting and preventing disabilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileSearch className="h-5 w-5" />
                      <h3 className="text-lg font-medium">Search Biomarkers</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export Data
                      </Button>
                      {isResearcher && (
                        <Button size="sm">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Add New Biomarker
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="border rounded-lg">
                    <div className="grid grid-cols-4 font-medium p-3 border-b bg-muted/50">
                      <div>Biomarker</div>
                      <div>Associated Conditions</div>
                      <div>Risk Factor</div>
                      <div>Prevention Strategy</div>
                    </div>
                    <div className="divide-y">
                      <div className="grid grid-cols-4 p-3 hover:bg-muted/20">
                        <div className="font-medium">LRRK2</div>
                        <div>Parkinson's Disease</div>
                        <div>Neurodegeneration</div>
                        <div>LRRK2 inhibitors, Kinase targeting</div>
                      </div>
                      <div className="grid grid-cols-4 p-3 hover:bg-muted/20">
                        <div className="font-medium">SMN1/SMN2</div>
                        <div>Spinal Muscular Atrophy</div>
                        <div>Motor neuron loss</div>
                        <div>Gene therapy, SMN protein enhancement</div>
                      </div>
                      <div className="grid grid-cols-4 p-3 hover:bg-muted/20">
                        <div className="font-medium">HLA-DRB1</div>
                        <div>Multiple Sclerosis</div>
                        <div>Autoimmune response</div>
                        <div>Immunomodulation, Early intervention</div>
                      </div>
                      <div className="grid grid-cols-4 p-3 hover:bg-muted/20">
                        <div className="font-medium">FMR1</div>
                        <div>Fragile X Syndrome</div>
                        <div>Cognitive impairment</div>
                        <div>mGluR5 antagonists, CRISPR therapy</div>
                      </div>
                      <div className="grid grid-cols-4 p-3 hover:bg-muted/20">
                        <div className="font-medium">MECP2</div>
                        <div>Rett Syndrome</div>
                        <div>Neurodevelopmental regression</div>
                        <div>Gene therapy, BDNF enhancement</div>
                      </div>
                    </div>
                  </div>
                  
                  {isResearcher && (
                    <div>
                      <h3 className="text-lg font-medium mb-3">Research Insights</h3>
                      <Card className="bg-muted/30">
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">Biomarker Correlation Study</p>
                              <Badge>In Progress</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Analyzing correlations between multiple biomarkers to improve early prediction accuracy for neurodegenerative disorders.
                            </p>
                            <div className="flex items-center gap-2">
                              <BarChart4 className="h-4 w-4 text-primary" />
                              <p className="text-xs">72% correlation identified</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="crispr-simulation">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-6 w-6 text-primary" />
                  <CardTitle>CRISPR Gene Therapy Simulation</CardTitle>
                </div>
                <CardDescription>
                  AI-driven simulation of gene editing for disability prevention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-6">
                  <div className="bg-muted/30 p-6 rounded-lg border border-dashed border-muted-foreground/50">
                    <h3 className="text-lg font-medium mb-4">CRISPR-Cas9 Simulation Platform</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {isDoctor ? 
                        "Explore potential CRISPR-based treatments for genetic conditions in your patients" :
                        "Design and test gene editing approaches for disability prevention"
                      }
                    </p>
                    <div className="flex justify-center mb-4">
                      <div className="w-full max-w-lg h-60 bg-gray-800 rounded-lg flex items-center justify-center">
                        <p className="text-white text-center">
                          CRISPR Simulation Visualization
                          <br />
                          <span className="text-sm text-gray-400">(Interactive 3D model would render here)</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Button>
                        {isDoctor ? "Explore Treatment Options" : "Run New Simulation"}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Recent Simulations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="p-2 rounded bg-muted/50 flex justify-between">
                            <div>SMN1 Gene Repair for SMA</div>
                            <Badge>Success: 89%</Badge>
                          </div>
                          <div className="p-2 rounded bg-muted/50 flex justify-between">
                            <div>MECP2 Expression Regulation</div>
                            <Badge>Success: 76%</Badge>
                          </div>
                          <div className="p-2 rounded bg-muted/50 flex justify-between">
                            <div>DMD Exon Skipping</div>
                            <Badge>Success: 92%</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Research Publications</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="p-2 rounded bg-muted/50">
                            <p className="font-medium">CRISPR-Cas9 mediated repair of FMR1 for Fragile X prevention</p>
                            <p className="text-xs text-muted-foreground">Journal of Medical Genetics, 2023</p>
                          </div>
                          <div className="p-2 rounded bg-muted/50">
                            <p className="font-medium">Base editing approaches for Parkinson's biomarker modification</p>
                            <p className="text-xs text-muted-foreground">Nature Biotechnology, 2023</p>
                          </div>
                          <div className="p-2 rounded bg-muted/50">
                            <p className="font-medium">AI-guided gene therapy for neurodegenerative disorder prevention</p>
                            <p className="text-xs text-muted-foreground">Science Advances, 2022</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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
