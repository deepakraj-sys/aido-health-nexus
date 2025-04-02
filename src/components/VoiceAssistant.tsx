
import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Info, Ear } from 'lucide-react';
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
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Convert commands to the format expected by useVoiceAssistant
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
  } = useVoiceAssistant({
    commands: commandsMap,
    wakeWord: "WAKE-UP",
    onWakeWord: () => {
      setAssistantResponse("I'm listening. How can I help you?");
    },
    onCommandDetected: (command, fullTranscript) => {
      setLastCommand(command);
      
      // Handle login command
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
      
      // Handle password command
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
      
      // Generate assistant response for other commands
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
      }
    },
  });
  
  // Welcome user on first load
  useEffect(() => {
    const hasWelcomed = sessionStorage.getItem('welcomedUser');
    if (!hasWelcomed) {
      const welcomeMessage = "Welcome to AidoHealth Nexus. I'm your voice assistant. Say 'WAKE-UP' to activate, then try commands like 'Help' or 'What can I do here?'";
      setAssistantResponse(welcomeMessage);
      
      // Delay speech to ensure the browser is ready
      setTimeout(() => {
        speak(welcomeMessage);
        sessionStorage.setItem('welcomedUser', 'true');
      }, 1000);
    }
  }, [speak]);
  
  // Generate and speak personalized greeting when user logs in
  useEffect(() => {
    if (user) {
      const userGreeting = `Hello ${user.name}. Welcome to your ${user.role} dashboard. Say 'WAKE-UP' and I'll assist you.`;
      setAssistantResponse(userGreeting);
      speak(userGreeting);
    }
  }, [user, speak]);
  
  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out ${isExpanded ? 'w-80' : 'w-auto'}`}>
      {isExpanded && (
        <Card className="mb-2 shadow-lg border-primary/20 animate-fade-in">
          <CardContent className="p-4">
            <div className="space-y-2">
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
                        onClick={() => {
                          const helpMessage = "Say 'WAKE-UP' to activate me, then try these commands: Help, Login, Register, Tell me about AidoHealth, What can you do here?, Go back, or Open profile.";
                          setAssistantResponse(helpMessage);
                          speak(helpMessage);
                        }}
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
                  : 'bg-primary/80 hover:bg-primary'
              }`}
              onClick={() => {
                if (!isExpanded) {
                  setIsExpanded(true);
                }
                toggle();
              }}
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
