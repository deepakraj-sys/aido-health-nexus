import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Brain, 
  Clock, 
  Database,
  FileText, 
  Heart, 
  MessageCircle, 
  Sparkles,
  Stethoscope,
  Tablet,
  User,
  Wand2,
  Eye,
  Dna,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { UserRole, AIFeature } from "@/types";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  
  if (!user) return null;
  
  // Features specific to each user role
  const roleFeatures: Record<UserRole, AIFeature[]> = {
    [UserRole.PATIENT]: [
      {
        id: "ai-health-assistant",
        name: "AI Health Assistant",
        description: "Get personalized health recommendations and answer questions about your conditions.",
        icon: "sparkles",
        route: "/health-assistant",
        forRoles: [UserRole.PATIENT],
      },
      {
        id: "early-detection",
        name: "Early Detection & Diagnosis",
        description: "AI-powered analysis to detect disabilities at an early stage.",
        icon: "brain",
        route: "/early-detection",
        forRoles: [UserRole.PATIENT, UserRole.DOCTOR],
      },
      {
        id: "symptom-checker",
        name: "Symptom Checker",
        description: "Track and analyze your symptoms with AI assistance.",
        icon: "activity",
        route: "/symptom-checker",
        forRoles: [UserRole.PATIENT],
      },
      {
        id: "telehealth",
        name: "Telehealth Consultation",
        description: "Connect with healthcare providers through video calls.",
        icon: "video",
        route: "/telehealth",
        forRoles: [UserRole.PATIENT],
      },
      {
        id: "medication-tracker",
        name: "Medication Tracker",
        description: "Monitor and get reminders for your medications.",
        icon: "pill",
        route: "/medication",
        forRoles: [UserRole.PATIENT],
        comingSoon: true,
      },
    ],
    [UserRole.DOCTOR]: [
      {
        id: "patient-analytics",
        name: "Patient Analytics",
        description: "View AI-driven insights about your patients.",
        icon: "activity",
        route: "/patient-analytics",
        forRoles: [UserRole.DOCTOR],
      },
      {
        id: "early-detection",
        name: "Early Detection & Diagnosis",
        description: "AI-powered analysis of patient data to detect disabilities early.",
        icon: "brain",
        route: "/early-detection",
        forRoles: [UserRole.PATIENT, UserRole.DOCTOR],
      },
      {
        id: "bioinformatics",
        name: "AI + Bioinformatics",
        description: "AI-driven genome sequencing to detect and prevent potential disabilities.",
        icon: "dna",
        route: "/bioinformatics",
        forRoles: [UserRole.DOCTOR, UserRole.RESEARCHER],
      },
      {
        id: "ai-diagnosis",
        name: "AI Diagnosis Support",
        description: "Get AI-powered suggestions for diagnoses and treatments.",
        icon: "stethoscope",
        route: "/ai-diagnosis",
        forRoles: [UserRole.DOCTOR],
      },
      {
        id: "clinical-resources",
        name: "Clinical Resources",
        description: "Access the latest research and clinical guidelines.",
        icon: "file-text",
        route: "/clinical-resources",
        forRoles: [UserRole.DOCTOR],
      },
      {
        id: "patient-management",
        name: "Patient Management",
        description: "Manage patient records and communications.",
        icon: "users",
        route: "/patient-management",
        forRoles: [UserRole.DOCTOR],
        comingSoon: true,
      },
    ],
    [UserRole.ENGINEER]: [
      {
        id: "device-prototyping",
        name: "Device Prototyping",
        description: "Design and test AI-powered assistive devices.",
        icon: "cpu",
        route: "/device-prototyping",
        forRoles: [UserRole.ENGINEER],
      },
      {
        id: "prosthetics-lab",
        name: "Prosthetics Lab",
        description: "Design and simulate smart prosthetics and exoskeletons.",
        icon: "wand2",
        route: "/prosthetics-lab",
        forRoles: [UserRole.ENGINEER],
      },
      {
        id: "sensor-integration",
        name: "Sensor Integration",
        description: "Connect and manage IoT sensors for assistive devices.",
        icon: "activity",
        route: "/sensor-integration",
        forRoles: [UserRole.ENGINEER],
      },
      {
        id: "engineering-analytics",
        name: "Engineering Analytics",
        description: "View performance analytics for your devices.",
        icon: "bar-chart-3",
        route: "/engineering-analytics",
        forRoles: [UserRole.ENGINEER],
        comingSoon: true,
      },
    ],
    [UserRole.RESEARCHER]: [
      {
        id: "data-analysis",
        name: "Data Analysis",
        description: "Analyze health data using AI models.",
        icon: "database",
        route: "/data-analysis",
        forRoles: [UserRole.RESEARCHER],
      },
      {
        id: "bioinformatics",
        name: "AI + Bioinformatics",
        description: "AI-driven genome sequencing to detect and prevent potential disabilities.",
        icon: "dna",
        route: "/bioinformatics",
        forRoles: [UserRole.DOCTOR, UserRole.RESEARCHER],
      },
      {
        id: "research-collaboration",
        name: "Research Collaboration",
        description: "Collaborate with other researchers on projects.",
        icon: "users",
        route: "/research-collaboration",
        forRoles: [UserRole.RESEARCHER],
      },
      {
        id: "ai-models",
        name: "AI Models",
        description: "Access and train AI models for health research.",
        icon: "brain",
        route: "/ai-models",
        forRoles: [UserRole.RESEARCHER],
      },
      {
        id: "publication-tools",
        name: "Publication Tools",
        description: "Prepare and analyze research findings for publication.",
        icon: "file-text",
        route: "/publication-tools",
        forRoles: [UserRole.RESEARCHER],
        comingSoon: true,
      },
    ],
  };
  
  // Feature icon mapping
  const featureIcons: Record<string, React.ReactNode> = {
    "sparkles": <Sparkles className="h-6 w-6" />,
    "brain": <Brain className="h-6 w-6" />,
    "activity": <Activity className="h-6 w-6" />,
    "video": <MessageCircle className="h-6 w-6" />,
    "pill": <Clock className="h-6 w-6" />,
    "stethoscope": <Stethoscope className="h-6 w-6" />,
    "file-text": <FileText className="h-6 w-6" />,
    "users": <User className="h-6 w-6" />,
    "cpu": <Tablet className="h-6 w-6" />,
    "wand2": <Wand2 className="h-6 w-6" />,
    "bar-chart-3": <Activity className="h-6 w-6" />,
    "database": <Database className="h-6 w-6" />,
    "eye": <Eye className="h-6 w-6" />,
    "dna": <Dna className="h-6 w-6" />,
  };
  
  // Role icon mapping
  const roleIcons = {
    [UserRole.PATIENT]: <Heart className="h-6 w-6" />,
    [UserRole.DOCTOR]: <Activity className="h-6 w-6" />,
    [UserRole.ENGINEER]: <Wand2 className="h-6 w-6" />,
    [UserRole.RESEARCHER]: <Brain className="h-6 w-6" />,
  };
  
  // Role color mapping
  const roleColors = {
    [UserRole.PATIENT]: "text-aido-patient",
    [UserRole.DOCTOR]: "text-aido-doctor",
    [UserRole.ENGINEER]: "text-aido-engineer",
    [UserRole.RESEARCHER]: "text-aido-researcher",
  };
  
  // Voice commands
  const voiceCommands = [
    {
      command: "go to profile",
      action: () => navigate("/profile"),
      description: "navigating to your profile",
      category: "navigation" as const,
    },
    {
      command: "go to settings",
      action: () => navigate("/settings"),
      description: "navigating to settings",
      category: "navigation" as const,
    },
    {
      command: "open early detection",
      action: () => navigate("/early-detection"),
      description: "opening early detection and diagnosis",
      category: "navigation" as const,
    },
    {
      command: "log out",
      action: () => {
        const { logout } = useAuth();
        logout();
        navigate("/");
      },
      description: "logging you out",
      category: "authentication" as const,
    },
  ];
  
  // Add feature-specific voice commands
  roleFeatures[user.role].forEach((feature) => {
    if (!feature.comingSoon) {
      voiceCommands.push({
        command: `open ${feature.name}`,
        action: () => navigate(feature.route),
        description: `opening ${feature.name}`,
        category: "navigation",
      });
    }
  });
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            {roleIcons[user.role]}
            <h1 className={`text-3xl font-bold ${roleColors[user.role]}`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.name}. Here's what you can do today.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roleFeatures[user.role].map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={feature.comingSoon ? "opacity-70" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {featureIcons[feature.icon]}
                    </div>
                    {feature.comingSoon && (
                      <span className="px-2 py-1 text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-md">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <CardTitle className="mt-2">{feature.name}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    disabled={feature.comingSoon}
                    onClick={() => navigate(feature.route)}
                  >
                    {feature.comingSoon ? "Stay Tuned" : "Open"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
      
      <VoiceAssistant commands={voiceCommands} />
    </DashboardLayout>
  );
}
