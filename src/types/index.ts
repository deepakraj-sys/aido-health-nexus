
export enum UserRole {
  PATIENT = "patient",
  DOCTOR = "doctor",
  ENGINEER = "engineer",
  RESEARCHER = "researcher",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  username?: string;
  avatar?: string;
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

export interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
  category: "navigation" | "authentication" | "general" | "help" | "accessibility" | "detection" | "data" | "telehealth" | "health" | "diagnosis" | "settings" | "bioinformatics";
}

export interface GenomeData {
  id: string;
  patientId: string;
  patientName: string;
  sampleDate: string;
  analysisStatus: "completed" | "in-progress" | "pending";
  results?: {
    riskFactors: Array<{
      condition: string;
      riskLevel: "high" | "moderate" | "low";
      confidence: number;
      biomarkers: string[];
    }>;
    recommendations: string[];
    preventativeMeasures: string[];
  };
}

// Web Speech API interfaces
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

// Fix the global declaration
declare global {
  interface Window {
    SpeechRecognition: {new(): SpeechRecognition};
    webkitSpeechRecognition: {new(): SpeechRecognition};
  }
}
