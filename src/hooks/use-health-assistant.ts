
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Message } from "./use-messaging";
import { useAuth } from "@/contexts/AuthContext";

interface HealthAssistantProps {
  initialMessages?: Message[];
}

export function useHealthAssistant({ initialMessages = [] }: HealthAssistantProps = {}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const askQuestion = async (question: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not logged in",
        description: "You must be logged in to use the AI Health Assistant"
      });
      return;
    }

    if (!question.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: question,
      isUser: true,
      timestamp: new Date(),
      senderId: user.id
    };
    setMessages(prev => [...prev, userMessage]);

    // Show loading indicator
    setLoading(true);

    try {
      // Get user context
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Get patient records if available
      const { data: patientRecords } = await supabase
        .from('patient_records')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Create user context
      const userContext = {
        name: profileData?.name || 'User',
        role: profileData?.role || 'patient',
        ...(patientRecords ? {
          age: patientRecords.age,
          condition: patientRecords.condition,
          medicalHistory: patientRecords.medical_history
        } : {})
      };

      // Call the health assistant edge function
      const { data, error } = await supabase.functions.invoke('health-assistant', {
        body: { message: question, userContext }
      });

      if (error) throw error;

      // Add AI response
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: data.response || "I'm sorry, I couldn't process your request.",
        isUser: false,
        timestamp: new Date(),
        senderId: 'ai-assistant'
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error: any) {
      console.error("Error from AI Health Assistant:", error);
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: "I'm sorry, I encountered an error processing your request. Please try again later.",
        isUser: false,
        timestamp: new Date(),
        senderId: 'ai-assistant'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        variant: "destructive",
        title: "AI Health Assistant Error",
        description: error.message || "Failed to get a response"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    loading,
    askQuestion,
    clearMessages
  };
}
