
export type Platform = 'tiktok' | 'facebook' | 'both';
export type ToolType = 'hooks' | 'script' | 'ideas' | 'calendar';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  niche?: string;
  platform: Platform;
  credits: number;
  totalCreditsUsed: number;
  totalCreditsPurchased: number;
  lastPurchaseDate: string;
  lastPurchasePack: 'starter' | 'createur' | 'pro' | '';
  onboarding_completed: boolean;
  created_at: string;
}

export interface Generation {
  id: string;
  user_id: string;
  tool: ToolType;
  niche: string;
  platform: string;
  input_data: any;
  output_data: any;
  created_at: string;
}

export interface HookResult {
  hook: string;
  framework: string;
  platform: string;
  score: number;
  justification: string;
}

export interface ScriptSection {
  id: string;
  label: string;
  duration?: string;
  content: string;
  visual_note?: string;
}

export interface ScriptResult {
  platform: 'tiktok' | 'facebook';
  duration_estimate?: string;
  reading_time?: string;
  sections: ScriptSection[];
}

export interface IdeaResult {
  title: string;
  description: string;
  format: string;
  platform: string;
}

export interface CalendarDay {
  day: number;
  week: number;
  idea: string;
  hook: string;
  format: string;
  platform: string;
}

export interface CalendarResult {
  calendar: CalendarDay[];
}
