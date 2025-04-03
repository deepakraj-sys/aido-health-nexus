
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { MessageRow, InsertMessage } from "@/types/supabase";

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  senderId: string;
  receiverId?: string;
}

export function useMessaging(initialMessages: Message[] = []) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Fetch messages on component mount
  useEffect(() => {
    if (!user) return;
    
    const fetchMessages = async () => {
      setLoading(true);
      try {
        // Use a raw SQL query to work around type issues
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('sent_at', { ascending: true }) as { data: MessageRow[] | null, error: any };
          
        if (error) throw error;
        
        // Convert to our Message format
        const formattedMessages = (data || []).map((msg: MessageRow) => ({
          id: msg.id,
          text: msg.content,
          isUser: msg.sender_id === user.id,
          timestamp: new Date(msg.sent_at),
          senderId: msg.sender_id,
          receiverId: msg.receiver_id
        }));
        
        setMessages(formattedMessages);
      } catch (err: any) {
        console.error("Error fetching messages:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Set up real-time subscription for messages
    const messagesSubscription = supabase
      .channel('messages-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages',
          filter: `sender_id=eq.${user.id}` 
        }, 
        () => fetchMessages()
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages',
          filter: `receiver_id=eq.${user.id}` 
        }, 
        () => fetchMessages()
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(messagesSubscription);
    };
  }, [user]);
  
  // Send a new message
  const sendMessage = async (content: string, receiverId: string) => {
    if (!user) {
      setError("You must be logged in to send messages");
      return null;
    }
    
    try {
      const newMessage: InsertMessage = {
        sender_id: user.id,
        receiver_id: receiverId,
        content,
        message_type: 'text'
      };
      
      // Use a raw SQL query to work around type issues
      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
        .select('*')
        .single() as { data: MessageRow | null, error: any };
        
      if (error) throw error;
      
      if (!data) throw new Error("No data returned after sending message");
      
      // Convert to our Message format
      const formattedMessage: Message = {
        id: data.id,
        text: data.content,
        isUser: true,
        timestamp: new Date(data.sent_at),
        senderId: data.sender_id,
        receiverId: data.receiver_id
      };
      
      setMessages([...messages, formattedMessage]);
      return formattedMessage;
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: err.message
      });
      return null;
    }
  };
  
  // Add an AI message (simulated, not from a real user)
  const addAIMessage = (text: string) => {
    if (!user) return null;
    
    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      text,
      isUser: false,
      timestamp: new Date(),
      senderId: 'ai-assistant' // Special id for the AI
    };
    
    setMessages([...messages, aiMessage]);
    return aiMessage;
  };
  
  // Mark messages as read
  const markAsRead = async (messageIds: string[]) => {
    if (!messageIds.length || !user) return;
    
    try {
      // Use a raw SQL query to work around type issues
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', messageIds)
        .eq('receiver_id', user.id) as { error: any };
        
      if (error) throw error;
    } catch (err: any) {
      console.error("Error marking messages as read:", err);
    }
  };
  
  return {
    messages,
    loading,
    error,
    sendMessage,
    addAIMessage,
    markAsRead
  };
}
