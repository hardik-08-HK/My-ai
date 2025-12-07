

export interface User {
  email: string;
  name: string;
  photoUrl?: string;
  isAdmin: boolean;
  isBanned: boolean;
  agreedToTerms: boolean;
  joinedAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  images?: string[]; // base64 strings for user uploads
  generatedImage?: string; // base64 string for AI generation
  generatedImages?: string[]; // Multiple generated images
  generatedVideo?: string; // URI for generated video
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export type ViewState = 'landing' | 'chat' | 'history' | 'admin-users' | 'admin-builder' | 'settings';

export interface AdminConfig {
  systemInstruction: string;
  securityLevel: 'standard' | 'high' | 'maximum';
  features: {
    codeGeneration: boolean;
    imageAnalysis: boolean;
  }
}

export type ModelMode = 'standard' | 'research' | 'creative' | 'thinking' | 'video';

export type ImageSize = '1K' | '2K' | '4K';
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}