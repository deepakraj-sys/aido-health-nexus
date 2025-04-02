import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui";
import { Brain, Heart, Activity, Wand2, User, Mail, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { VoiceAssistant } from "@/components/VoiceAssistant";

export default function Register() {
  const [searchParams] = useSearchParams();
  const preselectedRole = searchParams.get("role") as UserRole | null;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(preselectedRole || UserRole.PATIENT);
  
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    
    await register({ name, email, password, role });
    navigate("/dashboard");
  };
  
  const roleIcons = {
    [UserRole.PATIENT]: <Heart className="w-5 h-5" />,
    [UserRole.DOCTOR]: <Activity className="w-5 h-5" />,
    [UserRole.ENGINEER]: <Wand2 className="w-5 h-5" />,
    [UserRole.RESEARCHER]: <Brain className="w-5 h-5" />,
  };
  
  const roleLabels = {
    [UserRole.PATIENT]: "I am a patient seeking support",
    [UserRole.DOCTOR]: "I am a healthcare provider",
    [UserRole.ENGINEER]: "I develop assistive technology",
    [UserRole.RESEARCHER]: "I conduct medical research",
  };
  
  const voiceCommands = [
    {
      command: "go back",
      action: () => navigate("/"),
      description: "going back to welcome page",
      category: "navigation" as const,
    },
    {
      command: "I am registering as patient",
      action: () => setRole(UserRole.PATIENT),
      description: "selecting patient role",
      category: "authentication" as const,
    },
    {
      command: "I am registering as doctor",
      action: () => setRole(UserRole.DOCTOR),
      description: "selecting doctor role",
      category: "authentication" as const,
    },
    {
      command: "I am registering as engineer",
      action: () => setRole(UserRole.ENGINEER),
      description: "selecting engineer role",
      category: "authentication" as const,
    },
    {
      command: "I am registering as researcher",
      action: () => setRole(UserRole.RESEARCHER),
      description: "selecting researcher role",
      category: "authentication" as const,
    },
    {
      command: "submit registration",
      action: () => {
        if (name && email && password) {
          register({ name, email, password, role });
          navigate("/dashboard");
        }
      },
      description: "submitting your registration",
      category: "authentication" as const,
    },
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
          
          <Card className="border shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Create Your Account</CardTitle>
              <CardDescription>
                Sign up to AidoHealth Nexus to get started
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">I am a:</Label>
                  <RadioGroup
                    value={role}
                    onValueChange={(value) => setRole(value as UserRole)}
                    className="grid grid-cols-2 gap-4"
                  >
                    {Object.values(UserRole).map((roleValue) => (
                      <div key={roleValue}>
                        <RadioGroupItem
                          value={roleValue}
                          id={roleValue}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={roleValue}
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          {roleIcons[roleValue]}
                          <span className="mt-2 text-center text-sm font-medium capitalize">
                            {roleValue}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="pt-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>
              </form>
            </CardContent>
            
            <CardFooter className="flex justify-center border-t p-4">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
      
      <VoiceAssistant commands={voiceCommands} />
    </div>
  );
}
