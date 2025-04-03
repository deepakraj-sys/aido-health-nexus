
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
  category: "navigation" | "authentication" | "general" | "help" | "accessibility" | "detection" | "data" | "telehealth" | "health" | "diagnosis" | "settings";
}
