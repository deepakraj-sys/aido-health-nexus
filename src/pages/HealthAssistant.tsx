
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, User, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { Badge } from "@/components/ui";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function HealthAssistant() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI Health Assistant. How can I help you today?", isUser: false },
  ]);
  const [inputValue, setInputValue] = useState("");
  
  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage = { id: messages.length + 1, text: inputValue, isUser: true };
    setMessages([...messages, userMessage]);
    setInputValue("");
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponses = {
        "headache": "Based on your symptoms, you might be experiencing a tension headache. Try resting in a quiet, dark room and staying hydrated. If the pain persists for more than 24 hours or is severe, please consult with a healthcare professional.",
        "diabetes": "Diabetes management requires regular monitoring of blood sugar levels, a balanced diet, regular exercise, and medication if prescribed. I recommend scheduling regular check-ups with your healthcare provider to discuss your specific needs.",
        "exercise": "Regular exercise is beneficial for overall health. For most adults, aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity weekly, along with muscle-strengthening activities twice a week.",
        "diet": "A balanced diet should include a variety of fruits, vegetables, whole grains, lean proteins, and healthy fats. Try to limit processed foods, excessive sugar, and high sodium intake.",
      };
      
      const lowerInput = inputValue.toLowerCase();
      let responseText = "I'm here to provide general health information. Please consult with a healthcare professional for personalized medical advice.";
      
      for (const [keyword, response] of Object.entries(aiResponses)) {
        if (lowerInput.includes(keyword)) {
          responseText = response;
          break;
        }
      }
      
      const aiMessage = { id: messages.length + 2, text: responseText, isUser: false };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    }, 1000);
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
      command: "ask about headache",
      action: () => {
        setInputValue("What should I do about my headache?");
        setTimeout(handleSend, 500);
      },
      description: "asking about headache remedies",
      category: "health" as const,
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
            AI Health Assistant
          </h1>
          <p className="text-muted-foreground mt-1">
            Get personalized health recommendations and answers to your questions
          </p>
        </div>
        
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertTitle>AI-Powered Health Assistant</AlertTitle>
          <AlertDescription>
            This assistant provides general health information but is not a substitute for professional medical advice. Always consult with a qualified healthcare provider for medical concerns.
          </AlertDescription>
        </Alert>

        <Card className="border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                <span>Health Conversation</span>
              </div>
              <Badge>AI-Powered</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] overflow-y-auto mb-4 space-y-4 p-4 border rounded-lg">
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
                        {message.isUser ? "You" : "AI Health Assistant"}
                      </span>
                    </div>
                    <p>{message.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Type your health question here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className="flex-1"
              />
              <Button onClick={handleSend}>
                <Plus className="h-4 w-4 mr-1" />
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <VoiceAssistant commands={voiceCommands} />
    </DashboardLayout>
  );
}
