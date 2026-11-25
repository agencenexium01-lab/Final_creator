import {
  Briefcase, Rocket, Sparkles, Scissors, UtensilsCrossed, Dumbbell, GraduationCap, Cpu,
  BookOpen, Laugh, Heart, Sprout, Church, Music2, MessageSquareText, Layers,
  CalendarDays, Clapperboard, Magnet, Lightbulb, type LucideIcon,
} from 'lucide-react';
import { NICHES, PLATFORMS } from '@/shared/catalog.js';
import { TOOL_COSTS } from '@/shared/pricing.js';

export type ToolId = keyof typeof TOOL_COSTS;
export type Platform = 'tiktok' | 'facebook' | 'both';

const NICHE_ICONS: Record<string, LucideIcon> = {
  business: Briefcase,
  entrepreneurship: Rocket,
  lifestyle: Sparkles,
  beauty: Scissors,
  food: UtensilsCrossed,
  fitness: Dumbbell,
  education: GraduationCap,
  tech: Cpu,
  storytelling: BookOpen,
  humor: Laugh,
  relations: Heart,
  personal_dev: Sprout,
  faith: Church,
};

export const NICHE_OPTIONS = NICHES.map((n) => ({ ...n, icon: NICHE_ICONS[n.id] ?? Sparkles }));

const PLATFORM_ICONS: Record<string, LucideIcon> = { tiktok: Music2, facebook: MessageSquareText, both: Layers };
export const PLATFORM_OPTIONS = PLATFORMS.map((p) => ({ ...p, id: p.id as Platform, icon: PLATFORM_ICONS[p.id] }));

export interface ToolInfo {
  id: ToolId;
  title: string;
  short: string;
  description: string;
  icon: LucideIcon;
  cost: number;
}

/** Ordre d'affichage : le parcours conseillé (planifier, écrire, puis piocher). */
export const TOOLS: ToolInfo[] = [
  {
    id: 'calendar',
    title: 'Calendrier 30 jours',
    short: 'Calendrier',
    description: 'Une idée, un hook et un format pour chaque jour du mois.',
    icon: CalendarDays,
    cost: TOOL_COSTS.calendar,
  },
  {
    id: 'script',
    title: 'Script ou post',
    short: 'Script',
    description: 'Un script TikTok prêt à tourner ou un post Facebook prêt à coller.',
    icon: Clapperboard,
    cost: TOOL_COSTS.script,
  },
  {
    id: 'hooks',
    title: 'Hooks',
    short: 'Hooks',
    description: '10 premières phrases notées sur 10, pour arrêter le scroll.',
    icon: Magnet,
    cost: TOOL_COSTS.hooks,
  },
  {
    id: 'ideas',
    title: "Banque d'idées",
    short: 'Idées',
    description: '20 sujets concrets quand tu manques d’inspiration.',
    icon: Lightbulb,
    cost: TOOL_COSTS.ideas,
  },
];

export function getTool(id: string | undefined): ToolInfo | undefined {
  return TOOLS.find((t) => t.id === id);
}

export function plural(n: number, singular: string, pluralForm = `${singular}s`) {
  return `${n} ${n > 1 ? pluralForm : singular}`;
}
