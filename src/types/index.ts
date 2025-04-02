
// User types
export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ENGINEER = 'engineer',
  RESEARCHER = 'researcher',
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  name: string;
  avatar?: string;
}

// Voice assistant types
export interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
  category: 'navigation' | 'authentication' | 'general' | 'help' | 'accessibility' | 'detection' | 'data' | 'bioinformatics';
}

export interface AIFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  forRoles: UserRole[];
  comingSoon?: boolean;
}

// Bioinformatics types
export interface GenomeData {
  id: string;
  patientId: string;
  patientName: string;
  sampleDate: string;
  analysisStatus: 'pending' | 'in-progress' | 'completed';
  results?: BioinformaticsResult;
}

export interface BioinformaticsResult {
  riskFactors: {
    condition: string;
    riskLevel: 'low' | 'moderate' | 'high';
    confidence: number;
    biomarkers: string[];
  }[];
  recommendations: string[];
  preventativeMeasures: string[];
}

// Speech Recognition type definitions
declare global {
  interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message?: string;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onstart: () => void;
    onend: () => void;
  }

  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}
