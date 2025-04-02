
import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Info } from 'lucide-react';
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
}

export function VoiceAssistant({ commands = [] }: VoiceAssistantProps) {
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
    transcript,
    interimTranscript,
    toggle,
    speak,
  } = useVoiceAssistant({
    commands: commandsMap,
    onCommandDetected: (command) => {
      setLastCommand(command);
      
      // Generate assistant response
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
      const welcomeMessage = "Welcome to AidoHealth Nexus. I'm your voice assistant. Say 'Help' or click the microphone to get started.";
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
      const userGreeting = `Hello ${user.name}. Welcome to your ${user.role} dashboard. How can I help you today?`;
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
                
                {isListening && (
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
                          setAssistantResponse("Here are some commands you can try: Help, Login, Register, Tell me about AidoHealth, What can you do?");
                          speak("Here are some commands you can try: Help, Login, Register, Tell me about AidoHealth, or What can you do?");
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
              className={`rounded-full w-14 h-14 shadow-lg ${isListening ? 'bg-primary animate-pulse-soft' : 'bg-primary/80 hover:bg-primary'}`}
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
