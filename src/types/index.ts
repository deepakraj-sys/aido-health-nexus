
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
  category: 'navigation' | 'authentication' | 'general' | 'help' | 'accessibility';
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
