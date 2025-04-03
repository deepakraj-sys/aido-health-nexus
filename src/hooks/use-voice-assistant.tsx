import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';

interface VoiceAssistantOptions {
  onResult?: (transcript: string) => void;
  onCommandDetected?: (command: string, fullTranscript?: string) => void;
  onListening?: () => void;
  onStopped?: () => void;
  onWakeWord?: () => void;
  onError?: (error: { message: string }) => void;
  commands?: Record<string, () => void>;
  autoStart?: boolean;
  wakeWord?: string;
}

export function useVoiceAssistant({
  onResult,
  onCommandDetected,
  onListening,
  onStopped,
  onWakeWord,
  onError,
  commands = {},
  autoStart = false,
  wakeWord = "WAKE-UP",
}: VoiceAssistantOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isWaitingForWakeWord, setIsWaitingForWakeWord] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [recognitionActive, setRecognitionActive] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const restartTimerRef = useRef<number | null>(null);

  // Check for microphone permissions on mount
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        if (navigator.permissions) {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setPermissionState(permissionStatus.state as 'prompt' | 'granted' | 'denied');
          setHasPermission(permissionStatus.state === 'granted');
          
          permissionStatus.onchange = () => {
            setPermissionState(permissionStatus.state as 'prompt' | 'granted' | 'denied');
            setHasPermission(permissionStatus.state === 'granted');
          };
        }
      } catch (error) {
        console.error("Error checking microphone permission:", error);
      }
    };
    
    checkMicPermission();
  }, []);

  // Define the stop function early to avoid reference before declaration
  const stop = useCallback(() => {
    try {
      // Clear any pending restart timers
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }
      
      console.log("Stopping speech recognition");
      recognitionRef.current?.stop();
      setIsListening(false);
      setIsWaitingForWakeWord(true);
      if (onStopped) onStopped();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }, [onStopped]);

  // Move speak function up before it's referenced
  const speak = useCallback((text: string, rate = 1, pitch = 1) => {
    if (!text) return;
    
    if (!synthRef.current || !utteranceRef.current) {
      if (!('speechSynthesis' in window)) {
        toast({
          title: "Voice Synthesis Unavailable",
          description: "Your browser doesn't support speech synthesis.",
          variant: "destructive"
        });
        return;
      }
      
      synthRef.current = window.speechSynthesis;
      utteranceRef.current = new SpeechSynthesisUtterance();
    }
    
    // Cancel any ongoing speech
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    
    utteranceRef.current.text = text;
    utteranceRef.current.rate = rate;
    utteranceRef.current.pitch = pitch;
    
    // Set voice if available
    if (synthRef.current.getVoices().length > 0) {
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(
        (voice) => voice.name.includes('Google') && voice.lang.includes('en')
      ) || voices.find(
        (voice) => voice.lang.includes('en')
      );
      
      if (preferredVoice) {
        utteranceRef.current.voice = preferredVoice;
      }
    }
    
    // Attach event handlers
    utteranceRef.current.onstart = () => setIsSpeaking(true);
    utteranceRef.current.onend = () => setIsSpeaking(false);
    utteranceRef.current.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };
    
    // Speak the text
    try {
      synthRef.current.speak(utteranceRef.current);
    } catch (error) {
      console.error("Error during speech synthesis:", error);
      setIsSpeaking(false);
    }
  }, []);

  const initializeRecognition = useCallback(() => {
    // Check for browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Voice Assistant Unavailable",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
      return false;
    }
    
    // Initialize the recognition object
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionAPI();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    
    // Event handlers
    recognitionRef.current.onstart = () => {
      console.log("Voice recognition started");
      setIsListening(true);
      setRecognitionActive(true);
      if (onListening) onListening();
    };
    
    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = '';
      let finalText = '';
      
      // Process results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        } else {
          interimText += event.results[i][0].transcript;
        }
      }
      
      // Handle interim text
      if (interimText) {
        console.log("Interim transcript:", interimText);
        setInterimTranscript(interimText);
      }
      
      // Handle final text
      if (finalText) {
        console.log("Recognition result:", finalText);
        const normalizedText = finalText.toLowerCase().trim();
        
        // Check for wake word if in waiting state
        if (isWaitingForWakeWord && normalizedText.includes(wakeWord.toLowerCase())) {
          console.log("Wake word detected!");
          setIsWaitingForWakeWord(false);
          if (onWakeWord) onWakeWord();
          speak("Hello! How can I help you?");
          setTranscript('');
          setInterimTranscript('');
          return;
        }
        
        // Only process commands if not waiting for wake word
        if (!isWaitingForWakeWord) {
          setTranscript((prev) => {
            const newTranscript = prev ? `${prev} ${finalText}` : finalText;
            if (onResult) onResult(newTranscript);
            processCommand(normalizedText, newTranscript);
            return newTranscript;
          });
        }
      }
    };
    
    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error, event.message);
      
      if (event.error === 'not-allowed') {
        setHasPermission(false);
        setPermissionState('denied');
        
        if (onError) {
          onError({ message: 'not-allowed' });
        } else {
          toast({
            title: "Microphone Access Denied",
            description: "Voice assistant requires microphone permission",
            variant: "destructive"
          });
        }
        stop();
        return;
      }
      
      if (event.error === 'no-speech') {
        console.log("No speech detected, restarting recognition");
        if (onError) {
          onError({ message: 'no-speech' });
        }
        
        // Only restart if we're still supposed to be listening
        if (isListening && recognitionRef.current && recognitionActive) {
          try {
            recognitionRef.current.stop();
            
            // Use setTimeout to avoid rapid cycling
            if (restartTimerRef.current) {
              clearTimeout(restartTimerRef.current);
            }
            
            restartTimerRef.current = window.setTimeout(() => {
              if (recognitionRef.current && isListening) {
                recognitionRef.current.start();
              }
              restartTimerRef.current = null;
            }, 300);
          } catch (e) {
            console.error("Error restarting recognition:", e);
          }
        }
      } else {
        if (onError) {
          onError({ message: event.error });
        } else {
          toast({
            title: "Voice Assistant Error",
            description: `Error: ${event.error}`,
            variant: "destructive"
          });
        }
        
        // Only stop on serious errors
        if (event.error === 'audio-capture' || event.error === 'network') {
          stop();
        }
      }
    };
    
    recognitionRef.current.onend = () => {
      console.log("Speech recognition ended");
      setRecognitionActive(false);
      
      // If we're still supposed to be listening, restart
      if (isListening && recognitionRef.current) {
        try {
          // Avoid immediate restarts
          if (restartTimerRef.current) {
            clearTimeout(restartTimerRef.current);
          }
          
          restartTimerRef.current = window.setTimeout(() => {
            if (recognitionRef.current && isListening) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.error("Could not restart recognition:", e);
                setIsListening(false);
                if (onStopped) onStopped();
              }
            }
            restartTimerRef.current = null;
          }, 300);
        } catch (e) {
          console.error("Could not restart recognition:", e);
          setIsListening(false);
          if (onStopped) onStopped();
        }
      } else {
        setIsListening(false);
        if (onStopped) onStopped();
      }
    };
    
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      utteranceRef.current = new SpeechSynthesisUtterance();
      
      utteranceRef.current.onstart = () => {
        setIsSpeaking(true);
      };
      
      utteranceRef.current.onend = () => {
        setIsSpeaking(false);
      };
      
      utteranceRef.current.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
      };
    }
    
    return true;
  }, [isListening, onListening, onResult, onStopped, onWakeWord, wakeWord, isWaitingForWakeWord, speak, stop, onError]);
  
  // Process commands from speech input
  const processCommand = useCallback((text: string, fullTranscript?: string) => {
    console.log("Processing command:", text);
    
    // Extract login credentials from commands
    if (text.startsWith("login with")) {
      const emailMatch = text.match(/login with\s+(.+?)(?:\s+password\s+|$)/i);
      const passwordMatch = text.match(/password\s+(.+?)$/i);
      
      if (emailMatch && emailMatch[1]) {
        if (onCommandDetected) {
          onCommandDetected("login with", fullTranscript);
        }
        speak("What is your password?");
        return;
      }
      
      speak("Please provide your email. For example, say 'login with example@mail.com'");
      return;
    }
    
    // Handle password input
    if (text.startsWith("password") || text.startsWith("my password is")) {
      if (onCommandDetected) {
        onCommandDetected("my password is", fullTranscript);
      }
      speak("Logging you in now");
      return;
    }
    
    // Handle special login/register flow
    if (text === "login" || text === "log in" || text === "sign in") {
      speak("What is your email or username?");
      return;
    }
    
    if (text === "register" || text === "sign up" || text === "create account") {
      speak("Let's create an account. What is your name?");
      return;
    }
    
    // Handle navigation commands
    if (text === "go back" || text === "back") {
      if (commands["go back"]) {
        commands["go back"]();
        speak("Going back");
        return;
      }
    }
    
    // Process regular commands
    for (const [commandPattern, action] of Object.entries(commands)) {
      if (text === commandPattern.toLowerCase() || 
          text.includes(commandPattern.toLowerCase())) {
        console.log("Command match found:", commandPattern);
        if (onCommandDetected) onCommandDetected(commandPattern, fullTranscript);
        action();
        return;
      }
    }
    
    // If no command matches, provide help
    if (text === "what can i do here" || text === "help me" || text === "help") {
      speak("You can navigate the app, login, register, or ask me for help. Try saying commands like 'go back' or 'open profile'.");
      if (onCommandDetected) onCommandDetected("help", fullTranscript);
      return;
    }
    
    // No matching command found
    if (onCommandDetected) {
      onCommandDetected("unknown", fullTranscript);
    }
    
  }, [commands, onCommandDetected, speak]);
  
  // Start speech recognition
  const start = useCallback(async () => {
    // Clear any existing restart timer
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    
    // Check for microphone permission first
    try {
      if (permissionState !== 'granted') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setHasPermission(true);
        setPermissionState('granted');
      }
      
      // Initialize recognition if needed
      if (!recognitionRef.current) {
        const initialized = initializeRecognition();
        if (!initialized) return;
      }
      
      try {
        console.log("Starting speech recognition");
        
        // Don't try to start if already active
        if (recognitionActive) {
          console.log("Recognition already active, stopping first");
          recognitionRef.current?.stop();
          
          // Small delay to ensure stop completes
          setTimeout(() => {
            if (recognitionRef.current) {
              recognitionRef.current.start();
              setTranscript('');
              setInterimTranscript('');
              setIsWaitingForWakeWord(true);
              speak("Voice assistant is now listening. Say 'WAKE-UP' to activate.");
            }
          }, 300);
        } else {
          recognitionRef.current?.start();
          setTranscript('');
          setInterimTranscript('');
          setIsWaitingForWakeWord(true);
          speak("Voice assistant is now listening. Say 'WAKE-UP' to activate.");
        }
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        
        if (onError) {
          onError({ message: "start-error" });
        } else {
          toast({
            title: "Error Starting Voice Assistant",
            description: "Could not start speech recognition.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      setHasPermission(false);
      setPermissionState('denied');
      
      if (onError) {
        onError({ message: "permission-denied" });
      } else {
        toast({
          title: "Microphone Access Denied",
          description: "Voice assistant requires microphone permission to work",
          variant: "destructive"
        });
      }
    }
  }, [initializeRecognition, speak, permissionState, recognitionActive, onError]);
  
  // Reset wake word state
  const resetWakeWordState = useCallback(() => {
    setIsWaitingForWakeWord(true);
  }, []);
  
  // Toggle speech recognition
  const toggle = useCallback(() => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  }, [isListening, start, stop]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      if (synthRef.current && isSpeaking) {
        synthRef.current.cancel();
      }
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
      }
    };
  }, [isListening, isSpeaking]);
  
  // Auto-start if enabled
  useEffect(() => {
    if (autoStart) {
      start();
    }
  }, [autoStart, start]);

  return {
    isListening,
    isSpeaking,
    isWaitingForWakeWord,
    transcript,
    interimTranscript,
    start,
    stop,
    toggle,
    speak,
    resetWakeWordState,
    hasPermission,
    permissionState
  };
}
