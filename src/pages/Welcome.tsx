import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { 
  Brain, 
  Heart, 
  Activity, 
  Users, 
  Wand2,
  ChevronRight, 
  ArrowRight,
  Sparkles 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { VoiceAssistant } from "@/components/VoiceAssistant";

const roleIcons = {
  [UserRole.PATIENT]: <Heart className="w-8 h-8 text-aido-patient" />,
  [UserRole.DOCTOR]: <Activity className="w-8 h-8 text-aido-doctor" />,
  [UserRole.ENGINEER]: <Wand2 className="w-8 h-8 text-aido-engineer" />,
  [UserRole.RESEARCHER]: <Brain className="w-8 h-8 text-aido-researcher" />,
};

const roleColors = {
  [UserRole.PATIENT]: "border-aido-patient bg-gradient-to-br from-white to-aido-patient/5",
  [UserRole.DOCTOR]: "border-aido-doctor bg-gradient-to-br from-white to-aido-doctor/5",
  [UserRole.ENGINEER]: "border-aido-engineer bg-gradient-to-br from-white to-aido-engineer/5",
  [UserRole.RESEARCHER]: "border-aido-researcher bg-gradient-to-br from-white to-aido-researcher/5",
};

const roleDescriptions = {
  [UserRole.PATIENT]: "Access personalized education, self-care tools, and connect with healthcare providers.",
  [UserRole.DOCTOR]: "View patient data, make informed decisions, and access clinical resources.",
  [UserRole.ENGINEER]: "Develop and test AI-powered assistive technologies and prototypes.",
  [UserRole.RESEARCHER]: "Access analytics tools and collaborate on breakthrough research.",
};

export default function Welcome() {
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeatureIndex((prev) => (prev + 1) % features.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);
  
  const features = [
    {
      title: "Voice Assistant",
      description: "Navigate the app hands-free with our voice assistant, perfect for users with mobility challenges.",
      icon: <Sparkles className="w-10 h-10 text-aido-accent" />,
    },
    {
      title: "Personalized AI",
      description: "AI-driven content tailored to your specific needs and health conditions.",
      icon: <Brain className="w-10 h-10 text-aido-primary" />,
    },
    {
      title: "Accessibility First",
      description: "Designed from the ground up with accessibility in mind for all users.",
      icon: <Users className="w-10 h-10 text-aido-success" />,
    },
  ];
  
  const voiceCommands = [
    {
      command: "help",
      action: () => {
        console.log("Help command triggered");
      },
      description: "showing help options",
      category: "help" as const,
    },
    {
      command: "login",
      action: () => {
        navigate("/login");
      },
      description: "navigating to login page",
      category: "authentication" as const,
    },
    {
      command: "register",
      action: () => {
        navigate("/register");
      },
      description: "navigating to registration page",
      category: "authentication" as const,
    },
    {
      command: "tell me about AidoHealth",
      action: () => {
        console.log("About AidoHealth command triggered");
      },
      description: "telling you about AidoHealth",
      category: "general" as const,
    },
    {
      command: "what can you do",
      action: () => {
        console.log("Capabilities command triggered");
      },
      description: "explaining what I can do",
      category: "help" as const,
    },
  ];
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="relative bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 pt-16 pb-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-aido-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute top-40 -left-20 w-60 h-60 bg-aido-accent/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                <span className="gradient-text">AidoHealth</span> Nexus
              </h1>
              <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
                The comprehensive platform revolutionizing disability care with AI-powered solutions.
              </p>
            </motion.div>
            
            <motion.div 
              className="mt-8 flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button asChild size="lg" className="rounded-full">
                <Link to="/register">Get Started <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link to="/login">Sign In</Link>
              </Button>
            </motion.div>
          </div>
          
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 mx-auto max-w-4xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/80 to-purple-100/80 dark:from-blue-900/20 dark:to-purple-900/20" />
              <div className="relative p-6 md:p-8 lg:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Your Health Assistant
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300">
                      Experience our voice-activated AI assistant that guides you through the platform. Perfect for users with visual impairments or mobility challenges.
                    </p>
                    <div className="mt-6">
                      <Button className="rounded-full">
                        Try Voice Commands
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="relative w-32 h-32 sm:w-48 sm:h-48">
                      <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse-soft" />
                      <div className="absolute inset-4 rounded-full bg-blue-500/30 animate-pulse-soft [animation-delay:0.2s]" />
                      <div className="absolute inset-8 rounded-full bg-blue-500/40 animate-pulse-soft [animation-delay:0.4s]" />
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                        <Sparkles className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>
      
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Features for Everyone
            </h2>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Object.values(UserRole).map((role) => (
              <motion.div
                key={role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className={`overflow-hidden hover:shadow-lg transition-all ${roleColors[role]} border`}>
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      {roleIcons[role]}
                    </div>
                    <h3 className="text-xl font-semibold capitalize mb-2">
                      For {role}s
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {roleDescriptions[role]}
                    </p>
                  </CardContent>
                  <CardFooter className="bg-gray-50/50 dark:bg-gray-800/30">
                    <Button variant="ghost" size="sm" asChild className="text-xs">
                      <Link to={`/register?role=${role}`}>
                        Learn More <ChevronRight className="ml-1 w-3 h-3" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden shadow-xl max-w-5xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-aido-primary/20 to-aido-accent/20" />
            <div className="p-8 md:p-12 relative">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`transition-opacity duration-500 ${
                    index === activeFeatureIndex ? "opacity-100" : "opacity-0 absolute inset-0"
                  } p-8 md:p-12`}
                >
                  <div className="flex items-center justify-between flex-col md:flex-row">
                    <div className="mb-6 md:mb-0 md:mr-8">
                      <h3 className="text-2xl md:text-3xl font-bold mb-4">{feature.title}</h3>
                      <p className="text-gray-700 dark:text-gray-300 max-w-lg">{feature.description}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-lg">
                        {feature.icon}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-8 flex justify-center space-x-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFeatureIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === activeFeatureIndex ? "bg-aido-primary" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                    aria-label={`View feature ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Join AidoHealth Nexus today and experience the future of healthcare technology.
            </p>
            <Button asChild size="lg" className="rounded-full">
              <Link to="/register">Create Account <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>
      
      <VoiceAssistant commands={voiceCommands} />
    </div>
  );
}
