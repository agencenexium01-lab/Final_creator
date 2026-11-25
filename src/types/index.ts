import type { ToolId, Platform } from '@/config/ui';

export type { ToolId, Platform };

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  niche?: string;
  platform: Platform;
  country?: string;
  credits: number;
  totalCreditsUsed: number;
  totalCreditsPurchased: number;
  lastPurchaseDate: string;
  lastPurchasePack: 'starter' | 'createur' | 'pro' | '';
  onboarding_completed: boolean;
  created_at: string;
}

export interface HookResult {
  hook: string;
  framework: string;
  platform: string;
  score: number;
  justification: string;
}

export interface IdeaResult {
  title: string;
  description: string;
  format: string;
  platform: string;
}

export interface ScriptSection {
  id: string;
  label: string;
  content: string;
  visual_note?: string;
}

export interface ScriptResult {
  title: string;
  platform: 'tiktok' | 'facebook';
  sections: ScriptSection[];
  caption?: string;
  hashtags?: string[];
}

export interface CalendarDay {
  day: number;
  date: string;
  idea: string;
  hook: string;
  format: string;
  platform: string;
}

export type GenerationOutput =
  | { hooks: HookResult[] }
  | { ideas: IdeaResult[] }
  | ScriptResult
  | { days: CalendarDay[] }
  | string; // anciens calendriers en texte brut

export interface Generation {
  id: string;
  tool: ToolId;
  niche: string;
  platform: string;
  input: Record<string, unknown> | null;
  output: GenerationOutput | null;
  createdAt: string;
}
