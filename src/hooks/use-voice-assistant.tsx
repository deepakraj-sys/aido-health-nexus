
import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';

interface VoiceAssistantOptions {
  onResult?: (transcript: string) => void;
  onCommandDetected?: (command: string, fullTranscript?: string) => void;
  onListening?: () => void;
  onStopped?: () => void;
  onWakeWord?: () => void;
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

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

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

  // Move speak function up before it's referenced
  const speak = useCallback((text: string, rate = 1, pitch = 1) => {
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
    
    synthRef.current.cancel();
    
    utteranceRef.current.text = text;
    utteranceRef.current.rate = rate;
    utteranceRef.current.pitch = pitch;
    
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
    
    synthRef.current.speak(utteranceRef.current);
    setIsSpeaking(true);
  }, []);

  const initializeRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Voice Assistant Unavailable",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
      return false;
    }
    
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionAPI();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';
    
    recognitionRef.current.onstart = () => {
      setIsListening(true);
      console.log("Voice recognition started");
      if (onListening) onListening();
    };
    
    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let interimText = '';
      let finalText = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        } else {
          interimText += event.results[i][0].transcript;
        }
      }
      
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
      
      if (interimText) {
        console.log("Interim transcript:", interimText);
      }
      setInterimTranscript(interimText);
    };
    
    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error, event.message);
      
      if (event.error === 'not-allowed') {
        setHasPermission(false);
        setPermissionState('denied');
        toast({
          title: "Microphone Access Denied",
          description: "Voice assistant requires microphone permission",
          variant: "destructive"
        });
        stop();
        return;
      }
      
      if (event.error === 'no-speech') {
        console.log("No speech detected, restarting recognition");
        if (isListening && recognitionRef.current) {
          try {
            recognitionRef.current.stop();
            setTimeout(() => {
              if (recognitionRef.current) recognitionRef.current.start();
            }, 100);
          } catch (e) {
            console.error("Error restarting recognition:", e);
          }
        }
      } else {
        toast({
          title: "Voice Assistant Error",
          description: `Error: ${event.error}`,
          variant: "destructive"
        });
        stop();
      }
    };
    
    recognitionRef.current.onend = () => {
      console.log("Speech recognition ended");
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.start();
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
  }, [isListening, onListening, onResult, onStopped, onWakeWord, wakeWord, isWaitingForWakeWord, speak]);
  
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
          text.startsWith(commandPattern.toLowerCase())) {
        console.log("Command match found:", commandPattern);
        if (onCommandDetected) onCommandDetected(commandPattern, fullTranscript);
        action();
        return;
      }
    }
    
    // If no command matches, provide help
    if (text === "what can i do here" || text === "help me" || text === "help") {
      speak("You can navigate the app, login, register, or ask me for help. Try saying commands like 'go back' or 'open profile'.");
    }
  }, [commands, onCommandDetected, speak]);
  
  const start = useCallback(async () => {
    // Check for microphone permission first
    try {
      if (permissionState !== 'granted') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setHasPermission(true);
        setPermissionState('granted');
      }
      
      if (!recognitionRef.current) {
        const initialized = initializeRecognition();
        if (!initialized) return;
      }
      
      try {
        console.log("Starting speech recognition");
        recognitionRef.current?.start();
        setTranscript('');
        setInterimTranscript('');
        setIsWaitingForWakeWord(true);
        speak("Voice assistant is now listening. Say 'WAKE-UP' to activate.");
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast({
          title: "Error Starting Voice Assistant",
          description: "Could not start speech recognition.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      setHasPermission(false);
      setPermissionState('denied');
      toast({
        title: "Microphone Access Denied",
        description: "Voice assistant requires microphone permission to work",
        variant: "destructive"
      });
    }
  }, [initializeRecognition, speak, permissionState]);
  
  const stop = useCallback(() => {
    try {
      console.log("Stopping speech recognition");
      recognitionRef.current?.stop();
      setIsListening(false);
      setIsWaitingForWakeWord(true);
      if (onStopped) onStopped();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }, [onStopped]);
  
  const resetWakeWordState = useCallback(() => {
    setIsWaitingForWakeWord(true);
  }, []);
  
  const toggle = useCallback(() => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  }, [isListening, start, stop]);
  
  useEffect(() => {
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      if (synthRef.current && isSpeaking) {
        synthRef.current.cancel();
      }
    };
  }, [isListening, isSpeaking]);
  
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

