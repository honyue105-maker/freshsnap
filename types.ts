export interface Item {
  id: string | number;
  name: string;
  expiryDate: string; // ISO string YYYY-MM-DD
  category: 'food' | 'medicine' | 'cosmetic' | 'household' | 'daily' | 'other';
  description?: string; // Mapped from reasoning or user input
  addedDate: string;
  // New UI specific fields
  image?: string; // Emoji
  coverImage?: string | null; // Base64 image
  notifyDays?: number;
}

export interface AnalysisResult {
  items: Array<{
    name: string;
    expiryDate: string | null;
    category: 'food' | 'medicine' | 'cosmetic' | 'household' | 'daily' | 'other';
    confidence: number;
    reasoning: string;
  }>;
}

export enum AppView {
  HOME = 'home',
  CAMERA = 'camera',
  NOTIFICATIONS = 'notifications'
}