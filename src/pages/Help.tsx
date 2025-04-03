
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lightbulb, MessageCircle, Search, HelpCircle, BookOpen, Video, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const faqItems = [
    {
      question: "How do I update my personal information?",
      answer: "You can update your information by going to the Profile page and clicking the 'Edit Profile' button."
    },
    {
      question: "How does the voice assistant work?",
      answer: "The voice assistant can be activated by clicking the microphone icon at the bottom right of the screen. Say 'Wake up' to activate it, then speak your command."
    },
    {
      question: "What should I do if I experience technical issues?",
      answer: "If you encounter technical issues, please try refreshing the page. If the problem persists, contact our support team at support@aidohealth.com."
    },
    {
      question: "How secure is my health data?",
      answer: "We use industry-standard encryption and security measures to protect your health data. Your information is stored securely and only accessible to authorized healthcare providers."
    },
  ];
  
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      const filteredResults = faqItems.filter(
        item => 
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(filteredResults);
      setIsSearching(false);
    }, 800);
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
      command: "contact support",
      action: () => window.location.href = "mailto:support@aidohealth.com",
      description: "opening email to contact support",
      category: "help" as const,
    },
    {
      command: "search for voice",
      action: () => {
        setSearchQuery("voice");
        setTimeout(handleSearch, 500);
      },
      description: "searching for voice assistance help",
      category: "help" as const,
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
            <HelpCircle className="h-8 w-8 mr-2 text-primary" />
            Help Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Find answers to common questions and get support
          </p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for help topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button 
            className="absolute right-2 top-2" 
            size="sm" 
            onClick={handleSearch}
            disabled={isSearching}
          >
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>
        
        {searchQuery && (
          <div>
            <h2 className="text-lg font-medium mb-3">Search Results for "{searchQuery}"</h2>
            {isSearching ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((result, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <h3 className="font-medium">{result.question}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{result.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p>No results found for "{searchQuery}"</p>
                  <p className="text-sm text-muted-foreground mt-2">Try another search term or browse the topics below</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faqItems.map((item, index) => (
                  <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                    <h3 className="font-medium mb-1">{item.question}</h3>
                    <p className="text-sm text-muted-foreground">{item.answer}</p>
                  </div>
                ))}
                <Button variant="outline" className="w-full">View All FAQs</Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Guides & Tutorials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3 border rounded-md p-3 hover:bg-accent cursor-pointer transition-colors">
                  <Video className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">Getting Started Guide</p>
                    <p className="text-xs text-muted-foreground">A complete walkthrough of the platform</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 border rounded-md p-3 hover:bg-accent cursor-pointer transition-colors">
                  <Video className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">Using Voice Assistant</p>
                    <p className="text-xs text-muted-foreground">Learn how to use voice commands</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 border rounded-md p-3 hover:bg-accent cursor-pointer transition-colors">
                  <Video className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">AI Features Tutorial</p>
                    <p className="text-xs text-muted-foreground">Understanding AI-powered tools</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Contact Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertTitle>Need personalized help?</AlertTitle>
                  <AlertDescription>
                    Our support team is available Monday-Friday, 9am-5pm EST.
                  </AlertDescription>
                </Alert>
                <div className="mt-4 space-y-2">
                  <Button className="w-full">Chat with Support</Button>
                  <Button variant="outline" className="w-full">
                    Email Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      <VoiceAssistant commands={voiceCommands} />
    </DashboardLayout>
  );
}
