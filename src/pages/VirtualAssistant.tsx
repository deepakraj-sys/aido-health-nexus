
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, MessageSquare, Plus, User, HelpCircle, Settings, Mic, MicOff, PanelLeftOpen } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { VoiceAssistant } from "@/components/VoiceAssistant";

export default function VirtualAssistant() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your Virtual Assistant for AidoHealth Nexus. How can I help you today?", isUser: false },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const suggestions = [
    "What can you do?",
    "Navigate to my dashboard",
    "Help me find a doctor",
    "How does the symptom checker work?",
    "Tell me about my health insights"
  ];
  
  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage = { id: messages.length + 1, text: inputValue, isUser: true };
    setMessages([...messages, userMessage]);
    setInputValue("");
    
    // Hide suggestions after first interaction
    setShowSuggestions(false);
    
    // Simulate AI response
    setTimeout(() => {
      const responses = {
        "help": "I can help you navigate the application, provide information about your health data, assist with finding doctors, and answer questions about the platform's features.",
        "dashboard": "I'll help you navigate to the dashboard. You can access your key health metrics and recent activities there.",
        "doctor": "I can help you find healthcare providers. Would you like to search by specialty or location?",
        "symptom": "The symptom checker allows you to input your symptoms and receive potential causes and recommendations. Would you like me to open the symptom checker for you?",
        "health": "Your health insights show patterns in your health data and provide personalized recommendations based on your history and goals."
      };
      
      const lowerInput = inputValue.toLowerCase();
      let responseText = "I'm here to assist you with AidoHealth Nexus. Is there something specific you'd like to know or do?";
      
      for (const [keyword, response] of Object.entries(responses)) {
        if (lowerInput.includes(keyword)) {
          responseText = response;
          break;
        }
      }
      
      const aiMessage = { id: messages.length + 2, text: responseText, isUser: false };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    }, 1000);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setTimeout(() => handleSend(), 100);
  };
  
  const toggleListening = () => {
    setIsListening(!isListening);
    
    if (!isListening) {
      // Simulate voice recognition
      setTimeout(() => {
        setInputValue("What can you help me with?");
        setTimeout(() => handleSend(), 500);
        setIsListening(false);
      }, 2000);
    }
  };
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messages]);
  
  // Voice commands
  const voiceCommands = [
    {
      command: "go back",
      action: () => window.history.back(),
      description: "going back to previous page",
      category: "navigation" as const,
    },
    {
      command: "what can you help me with",
      action: () => {
        setInputValue("What can you help me with?");
        setTimeout(handleSend, 500);
      },
      description: "asking about assistant capabilities",
      category: "help" as const,
    },
    {
      command: "go to dashboard",
      action: () => window.location.href = "/dashboard",
      description: "navigating to dashboard",
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
            <Sparkles className="h-8 w-8 mr-2 text-primary" />
            Virtual Assistant
          </h1>
          <p className="text-muted-foreground mt-1">
            Your AI-powered companion for navigating AidoHealth
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card className="border h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  AidoHealth Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                <div 
                  id="message-container"
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                >
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {!message.isUser && <Sparkles className="h-4 w-4" />}
                          {message.isUser && <User className="h-4 w-4" />}
                          <span className="text-xs font-medium">
                            {message.isUser ? "You" : "Virtual Assistant"}
                          </span>
                        </div>
                        <p>{message.text}</p>
                      </div>
                    </div>
                  ))}
                  
                  {showSuggestions && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t bg-background">
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`flex-shrink-0 ${isListening ? 'bg-primary/10 text-primary' : ''}`}
                      onClick={toggleListening}
                    >
                      {isListening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                    </Button>
                    <Input
                      placeholder="Type your message..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSend()}
                      className="flex-1"
                    />
                    <Button onClick={handleSend} className="flex-shrink-0">
                      <Plus className="h-4 w-4 mr-1" />
                      Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="hidden lg:block">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2" />
                    Quick Help
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ask the assistant about:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Navigating the application</li>
                    <li>Understanding your health data</li>
                    <li>Finding health resources</li>
                    <li>Tracking symptoms</li>
                    <li>Setting reminders</li>
                  </ul>
                </div>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Assistant Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Voice Interaction</span>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Clear History</span>
                    <Button variant="outline" size="sm">Clear</Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Conversation Style</span>
                    <Button variant="outline" size="sm">
                      <PanelLeftOpen className="h-4 w-4 mr-1" />
                      Customize
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </motion.div>

      <VoiceAssistant commands={voiceCommands} />
    </DashboardLayout>
  );
}
