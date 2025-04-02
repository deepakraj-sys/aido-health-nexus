
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "@/components/ui";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { toast } from "@/components/ui/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    await login(email, password);
    navigate("/dashboard");
  };
  
  const handleVoiceEmail = (voiceEmail: string) => {
    // Clean up email from voice recognition
    const cleanEmail = voiceEmail.replace(/\s+/g, '').toLowerCase();
    setEmail(cleanEmail);
    
    toast({
      title: "Email Recognized",
      description: `Email set to: ${cleanEmail}`,
    });
  };
  
  const handleVoicePassword = (voicePassword: string) => {
    setPassword(voicePassword);
    
    toast({
      title: "Password Received",
      description: "Password has been set",
    });
    
    // Auto-submit after short delay
    setTimeout(() => {
      if (email && voicePassword) {
        login(email, voicePassword);
        navigate("/dashboard");
      }
    }, 1500);
  };
  
  // Voice commands
  const voiceCommands = [
    {
      command: "go back",
      action: () => navigate("/"),
      description: "going back to welcome page",
      category: "navigation" as const,
    },
    {
      command: "login with",
      action: () => {
        // This is handled by the onLoginCommand handler
      },
      description: "logging in with your credentials",
      category: "authentication" as const,
    },
    {
      command: "my password is",
      action: () => {
        // This is handled by the onPasswordCommand handler
      },
      description: "setting your password",
      category: "authentication" as const,
    },
    {
      command: "submit login",
      action: () => {
        if (email && password) {
          login(email, password);
          navigate("/dashboard");
        }
      },
      description: "submitting your login details",
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
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your AidoHealth Nexus account
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="pt-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </div>
              </form>
            </CardContent>
            
            <CardFooter className="flex justify-center border-t p-4">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:underline">
                  Create account
                </Link>
              </p>
            </CardFooter>
          </Card>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              For demo purposes, you can use:
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              patient@example.com / doctor@example.com / engineer@example.com / researcher@example.com
            </p>
          </div>
        </motion.div>
      </div>
      
      <VoiceAssistant 
        commands={voiceCommands} 
        onLoginCommand={handleVoiceEmail}
        onPasswordCommand={handleVoicePassword}
      />
    </div>
  );
}
