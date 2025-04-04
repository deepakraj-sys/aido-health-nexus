
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

export interface AIModel {
  id: string;
  name: string;
  version: string;
  description: string;
  capabilities: string[];
  inputFormat: "text" | "image" | "audio" | "multimodal";
  accuracy?: number;
  lastUpdated: string;
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

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  condition: string;
  lastVisit: string;
  status: "stable" | "improving" | "needs-attention" | "critical";
  medicalHistory?: string[];
  vitalSigns?: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    respiratoryRate: number;
  };
  aiRiskAssessment?: {
    overallRisk: "high" | "moderate" | "low";
    factors: string[];
    recommendations: string[];
  };
}

export interface AIAnalysisResult {
  id: string;
  timestamp: string;
  patientId: string;
  analysisTool: string;
  confidence: number;
  findings: string[];
  recommendations: string[];
  rawData?: any;
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
