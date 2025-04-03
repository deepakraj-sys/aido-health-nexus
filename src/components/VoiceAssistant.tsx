
import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Info, Ear, AlertCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useVoiceAssistant } from '@/hooks/use-voice-assistant';
import { VoiceCommand } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface VoiceAssistantProps {
  commands?: VoiceCommand[];
  onLoginCommand?: (email: string) => void;
  onPasswordCommand?: (password: string) => void;
}

export function VoiceAssistant({ 
  commands = [],
  onLoginCommand,
  onPasswordCommand
}: VoiceAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [assistantResponse, setAssistantResponse] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [permissionRetries, setPermissionRetries] = useState(0);
  const [browserSupportError, setBrowserSupportError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const commandsMap: Record<string, () => void> = {};
  commands.forEach((cmd) => {
    commandsMap[cmd.command] = cmd.action;
  });
  
  const {
    isListening,
    isSpeaking,
    isWaitingForWakeWord,
    transcript,
    interimTranscript,
    toggle,
    speak,
    hasPermission,
    permissionState,
    start,
    stop,
  } = useVoiceAssistant({
    commands: commandsMap,
    wakeWord: "WAKE-UP",
    onWakeWord: () => {
      setAssistantResponse("I'm listening. How can I help you?");
    },
    onCommandDetected: (command, fullTranscript) => {
      setLastCommand(command);
      console.log("Command detected:", command, "Full transcript:", fullTranscript);
      
      if (command === "login with" && fullTranscript && onLoginCommand) {
        const emailMatch = fullTranscript.match(/login with\s+(.+?)(?:\s+password\s+|$)/i);
        if (emailMatch && emailMatch[1]) {
          const email = emailMatch[1].trim();
          onLoginCommand(email);
          setAssistantResponse(`Email set to ${email}. What is your password?`);
          speak(`Email set to ${email}. What is your password?`);
          return;
        }
      }
      
      if (command === "my password is" && fullTranscript && onPasswordCommand) {
        const passwordMatch = fullTranscript.match(/password(?:\sis)?\s+(.+?)$/i);
        if (passwordMatch && passwordMatch[1]) {
          const password = passwordMatch[1].trim();
          onPasswordCommand(password);
          setAssistantResponse("Password received. Logging you in.");
          speak("Password received. Logging you in.");
          return;
        }
      }
      
      const matchedCommand = commands.find(cmd => cmd.command === command);
      if (matchedCommand) {
        const responses = [
          `Executing ${matchedCommand.description}`,
          `I'll ${matchedCommand.description} for you`,
          `${matchedCommand.description} right away`,
        ];
        const response = responses[Math.floor(Math.random() * responses.length)];
        setAssistantResponse(response);
        speak(response);
      } else {
        setAssistantResponse("I heard you, but I'm not sure how to help with that. Try saying 'help' for a list of commands.");
        speak("I heard you, but I'm not sure how to help with that. Try saying help for a list of commands.");
      }
    },
    onError: (error) => {
      console.error("Voice assistant error:", error);
      
      if (error.message === "not-allowed") {
        setPermissionError("Microphone access was denied. Please enable it in your browser settings.");
        toast({
          variant: "destructive",
          title: "Microphone Access Denied",
          description: "Voice assistant requires microphone permission to work"
        });
      } else if (error.message === "no-speech") {
        console.log("No speech detected");
      } else {
        toast({
          variant: "destructive",
          title: "Voice Assistant Error",
          description: `Error: ${error.message || "Unknown error"}`,
        });
      }
    }
  });
  
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setBrowserSupportError("Your browser doesn't support speech recognition. Try using Chrome, Edge, or Safari.");
      toast({
        variant: "destructive",
        title: "Browser Not Supported",
        description: "Your browser doesn't support the voice assistant feature.",
      });
    }

    if (!('speechSynthesis' in window)) {
      toast({
        variant: "destructive",
        title: "Voice Synthesis Unavailable",
        description: "Your browser doesn't support voice responses.",
      });
    }
  }, []);
  
  useEffect(() => {
    if (hasPermission) {
      setPermissionError(null);
    }
  }, [hasPermission]);
  
  useEffect(() => {
    const hasWelcomed = sessionStorage.getItem('welcomedUser');
    if (!hasWelcomed && !browserSupportError) {
      const welcomeMessage = "Welcome to AidoHealth Nexus. I'm your voice assistant. Say 'WAKE-UP' to activate, then try commands like 'Help' or 'What can I do here?'";
      setAssistantResponse(welcomeMessage);
      
      setTimeout(() => {
        speak(welcomeMessage);
        sessionStorage.setItem('welcomedUser', 'true');
      }, 1000);
    }
  }, [speak, browserSupportError]);
  
  useEffect(() => {
    if (user && !browserSupportError) {
      const userGreeting = `Hello ${user.name}. Welcome to your ${user.role} dashboard. Say 'WAKE-UP' and I'll assist you.`;
      setAssistantResponse(userGreeting);
      speak(userGreeting);
    }
  }, [user, speak, browserSupportError]);

  const requestMicrophoneAccess = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionError(null);
      setPermissionRetries(0);
      toast({
        title: "Microphone Access Granted",
        description: "You can now use the voice assistant",
      });
      start();
    } catch (err) {
      console.error("Microphone permission error:", err);
      setPermissionRetries(prev => prev + 1);
      
      if (permissionRetries > 2) {
        setPermissionError("Microphone access was denied multiple times. You may need to reset permissions in your browser settings.");
      } else {
        setPermissionError("Microphone access was denied. Please enable microphone access in your browser settings.");
      }
      
      toast({
        variant: "destructive",
        title: "Microphone Access Denied",
        description: "Voice assistant requires microphone permission to work",
      });
    }
  };
  
  const handleAssistantToggle = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
    
    if (browserSupportError) {
      toast({
        variant: "destructive",
        title: "Browser Not Supported",
        description: browserSupportError,
      });
      return;
    }
    
    if (!hasPermission && permissionState === 'denied') {
      setPermissionError("Microphone access was denied. Please enable it in your browser settings and reload the page.");
      return;
    } else if (!hasPermission) {
      requestMicrophoneAccess();
      return;
    }
    
    toggle();
  };
  
  const showHelpInfo = () => {
    const helpMessage = "Say 'WAKE-UP' to activate me, then try these commands: Help, Login, Register, Tell me about AidoHealth, What can you do here?, Go back, or Open profile.";
    setAssistantResponse(helpMessage);
    speak(helpMessage);
  };
  
  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out ${isExpanded ? 'w-80' : 'w-auto'}`}>
      {isExpanded && (
        <Card className="mb-2 shadow-lg border-primary/20 animate-fade-in">
          <CardContent className="p-4">
            <div className="space-y-2">
              {browserSupportError && (
                <Alert variant="destructive" className="mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Browser Not Supported</AlertTitle>
                  <AlertDescription className="text-xs">
                    {browserSupportError}
                  </AlertDescription>
                </Alert>
              )}
              
              {permissionError && !browserSupportError && (
                <Alert variant="destructive" className="mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Microphone Access Needed</AlertTitle>
                  <AlertDescription className="text-xs">
                    {permissionError}
                  </AlertDescription>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-2" 
                    onClick={requestMicrophoneAccess}
                  >
                    Request Access
                  </Button>
                </Alert>
              )}
              
              <div className="text-sm font-medium">
                {assistantResponse && (
                  <div className="mb-2 p-2 bg-primary/10 rounded-lg">
                    <p className="flex gap-2 items-center">
                      <Volume2 className="h-4 w-4 text-primary" />
                      <span>{assistantResponse}</span>
                    </p>
                  </div>
                )}
                
                {isWaitingForWakeWord && isListening && (
                  <div className="mb-2 p-2 bg-yellow-500/10 rounded-lg">
                    <p className="flex gap-2 items-center text-amber-700 dark:text-amber-500">
                      <Ear className="h-4 w-4" />
                      <span>Waiting for "WAKE-UP" command...</span>
                    </p>
                  </div>
                )}
                
                {isListening && !isWaitingForWakeWord && (
                  <>
                    <p className="text-xs text-muted-foreground mb-1">Listening...</p>
                    <div className="flex items-center gap-2">
                      <div className="voice-wave-container">
                        <div className="voice-wave-bar h-3 animate-wave-1"></div>
                        <div className="voice-wave-bar h-5 animate-wave-2"></div>
                        <div className="voice-wave-bar h-8 animate-wave-3"></div>
                        <div className="voice-wave-bar h-5 animate-wave-4"></div>
                        <div className="voice-wave-bar h-3 animate-wave-5"></div>
                      </div>
                      <span className="text-sm">{interimTranscript || transcript || "Say something..."}</span>
                    </div>
                  </>
                )}
                
                {lastCommand && !isListening && (
                  <p className="text-xs text-muted-foreground">
                    Last command: "{lastCommand}"
                  </p>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={showHelpInfo}
                      >
                        <Info size={14} />
                        <span className="ml-1">Help</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Show available voice commands</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                >
                  Minimize
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              className={`rounded-full w-14 h-14 shadow-lg ${
                isListening 
                  ? isWaitingForWakeWord 
                    ? 'bg-amber-500 animate-pulse-slow' 
                    : 'bg-primary animate-pulse-soft'
                  : permissionError || browserSupportError
                    ? 'bg-destructive hover:bg-destructive/90' 
                    : 'bg-primary/80 hover:bg-primary'
              }`}
              onClick={handleAssistantToggle}
            >
              {isListening ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isListening ? 'Stop' : 'Start'} voice assistant</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
