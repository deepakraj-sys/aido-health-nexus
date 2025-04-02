import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';

interface VoiceAssistantOptions {
  onResult?: (transcript: string) => void;
  onCommandDetected?: (command: string) => void;
  onListening?: () => void;
  onStopped?: () => void;
  commands?: Record<string, () => void>;
  autoStart?: boolean;
}

export function useVoiceAssistant({
  onResult,
  onCommandDetected,
  onListening,
  onStopped,
  commands = {},
  autoStart = false,
}: VoiceAssistantOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech recognition
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
        setTranscript((prev) => {
          const newTranscript = prev ? `${prev} ${finalText}` : finalText;
          if (onResult) onResult(newTranscript);
          processCommand(finalText.toLowerCase().trim());
          return newTranscript;
        });
      }
      
      setInterimTranscript(interimText);
    };
    
    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      
      if (event.error === 'no-speech') {
        // This is a common error that isn't really an issue - just restart
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
  }, [isListening, onListening, onResult, onStopped]);
  
  const processCommand = useCallback((text: string) => {
    // Simple command matching
    for (const [commandPattern, action] of Object.entries(commands)) {
      // Simple exact match or startsWith match
      if (text === commandPattern.toLowerCase() || 
          text.startsWith(commandPattern.toLowerCase())) {
        if (onCommandDetected) onCommandDetected(commandPattern);
        action();
        return;
      }
    }
  }, [commands, onCommandDetected]);
  
  const start = useCallback(() => {
    if (!recognitionRef.current) {
      const initialized = initializeRecognition();
      if (!initialized) return;
    }
    
    try {
      recognitionRef.current?.start();
      setTranscript('');
      setInterimTranscript('');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast({
        title: "Error Starting Voice Assistant",
        description: "Could not start speech recognition.",
        variant: "destructive"
      });
    }
  }, [initializeRecognition]);
  
  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop();
      setIsListening(false);
      if (onStopped) onStopped();
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
    }
  }, [onStopped]);
  
  const toggle = useCallback(() => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  }, [isListening, start, stop]);
  
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
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    // Configure new speech
    utteranceRef.current.text = text;
    utteranceRef.current.rate = rate;
    utteranceRef.current.pitch = pitch;
    
    // Use a neutral voice if available
    if (synthRef.current.getVoices().length > 0) {
      const voices = synthRef.current.getVoices();
      // Try to find a natural sounding English voice
      const preferredVoice = voices.find(
        (voice) => voice.name.includes('Google') && voice.lang.includes('en')
      ) || voices.find(
        (voice) => voice.lang.includes('en')
      );
      
      if (preferredVoice) {
        utteranceRef.current.voice = preferredVoice;
      }
    }
    
    // Speak the text
    synthRef.current.speak(utteranceRef.current);
    setIsSpeaking(true);
  }, []);
  
  // Clean up on unmount
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
  
  // Auto-start if requested
  useEffect(() => {
    if (autoStart) {
      start();
    }
  }, [autoStart, start]);

  return {
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    start,
    stop,
    toggle,
    speak,
  };
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
