
import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Send, Brain, Sparkles, User, RefreshCcw, Trash2, MicIcon } from "lucide-react";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { useHealthAssistant } from "@/hooks/use-health-assistant";

export default function HealthAssistant() {
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, loading, askQuestion, clearMessages } = useHealthAssistant();
  const [listeningForVoice, setListeningForVoice] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    askQuestion(inputValue);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleVoiceInput = () => {
    if (listeningForVoice) {
      setListeningForVoice(false);
      return;
    }

    // Initialize AudioContext on first click
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    setListeningForVoice(true);
    
    // Start voice recognition using browser's SpeechRecognition API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: "Voice Input Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      });
      setListeningForVoice(false);
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      // Play a sound to indicate listening started
      playTone(700, 0.1);
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      
      // Auto-send after short delay
      setTimeout(() => {
        askQuestion(transcript);
        setInputValue("");
      }, 500);
      
      // Play a sound to indicate successful recognition
      playTone(1200, 0.1);
    };
    
    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      toast({
        title: "Voice Recognition Error",
        description: `Error: ${event.error}`,
        variant: "destructive",
      });
      setListeningForVoice(false);
    };
    
    recognition.onend = () => {
      setListeningForVoice(false);
    };
    
    recognition.start();
  };

  const playTone = (frequency: number, duration: number) => {
    if (!audioContext.current) return;
    
    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = "sine";
    
    gainNode.gain.setValueAtTime(0, audioContext.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.current.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.current.currentTime + duration);
    
    oscillator.start();
    oscillator.stop(audioContext.current.currentTime + duration);
  };

  // Voice commands
  const voiceCommands = [
    {
      command: "clear messages",
      action: clearMessages,
      description: "clearing all messages",
      category: "health" as const,
    },
    {
      command: "ask about",
      action: (text: string) => {
        if (text.includes("ask about")) {
          const question = text.replace("ask about", "").trim();
          if (question) {
            askQuestion(question);
          }
        }
      },
      description: "asking a health question",
      category: "health" as const,
    },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Brain className="mr-2 h-6 w-6 text-primary" />
                AI Health Assistant
              </h1>
              <p className="text-muted-foreground mt-1">
                Ask health questions for personalized insights and advice
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearMessages}
                disabled={messages.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card className="border h-[70vh] flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-xl">
                    <Sparkles className="h-5 w-5 mr-2 text-primary" />
                    Health Assistant Chat
                  </CardTitle>
                  <CardDescription>
                    Ask me anything about health, symptoms, or medical conditions
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow overflow-hidden p-0">
                  <ScrollArea className="h-full p-4">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground px-4">
                        <Sparkles className="h-12 w-12 mb-4 text-primary/50" />
                        <h3 className="font-medium text-lg mb-2">Welcome to AI Health Assistant</h3>
                        <p className="max-w-md">
                          Ask me health questions like "What causes migraines?" or "How can I improve my sleep quality?"
                        </p>
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-xl">
                          {[
                            "What are the symptoms of diabetes?",
                            "How can I reduce my stress levels?",
                            "What should I do about persistent headaches?",
                            "How much exercise is recommended weekly?",
                          ].map((suggestion, i) => (
                            <Button
                              key={i}
                              variant="outline"
                              className="justify-start overflow-hidden text-left"
                              onClick={() => askQuestion(suggestion)}
                            >
                              <span className="truncate">{suggestion}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.isUser ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                message.isUser
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <div className="flex items-center mb-1 text-xs opacity-80">
                                {message.isUser ? (
                                  <>
                                    <User className="h-3 w-3 mr-1" />
                                    <span>You</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    <span>AI Health Assistant</span>
                                  </>
                                )}
                              </div>
                              <div className="whitespace-pre-wrap text-sm">
                                {message.text}
                              </div>
                            </div>
                          </div>
                        ))}
                        {loading && (
                          <div className="flex justify-start">
                            <div className="max-w-[80%] p-3 rounded-lg bg-muted">
                              <div className="flex items-center mb-1 text-xs opacity-80">
                                <Sparkles className="h-3 w-3 mr-1" />
                                <span>AI Health Assistant</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:-300ms]"></div>
                                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:-150ms]"></div>
                                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce"></div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
                <CardFooter className="p-2 border-t">
                  <div className="flex items-center w-full gap-2">
                    <Button
                      size="icon"
                      variant={listeningForVoice ? "default" : "outline"}
                      onClick={handleVoiceInput}
                      className={listeningForVoice ? "bg-primary text-primary-foreground animate-pulse" : ""}
                      disabled={loading}
                    >
                      <MicIcon className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Ask about any health topic..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={loading || listeningForVoice}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || loading || listeningForVoice}
                    >
                      {loading ? (
                        <RefreshCcw className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-1" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </div>

            <div className="hidden lg:block">
              <Card>
                <CardHeader>
                  <CardTitle>About AI Health Assistant</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium">What I can help with:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm mt-2 text-muted-foreground">
                      <li>Information about health conditions</li>
                      <li>Healthy lifestyle recommendations</li>
                      <li>Nutrition and fitness advice</li>
                      <li>General medical knowledge</li>
                      <li>Interpreting common symptoms</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Limitations:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm mt-2 text-muted-foreground">
                      <li>Not a replacement for medical care</li>
                      <li>Cannot diagnose specific conditions</li>
                      <li>No access to your medical records</li>
                      <li>Cannot prescribe medications</li>
                    </ul>
                  </div>

                  <div className="bg-muted p-3 rounded-lg text-xs mt-4">
                    <p className="font-medium mb-1">Medical Disclaimer</p>
                    <p>
                      This AI assistant provides general health information and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>

      <VoiceAssistant commands={voiceCommands} />
    </DashboardLayout>
  );
}
