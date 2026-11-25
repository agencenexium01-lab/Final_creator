// Validation des entrées, prompts, schémas de réponse et normalisation des sorties de l'IA.
// Utilisé par api/generate.ts (serveur) et par l'interface (affichage, limites des champs).

import { TOOL_COSTS } from './pricing.js';
import { DURATIONS, PLATFORMS, TONES, nicheLabel } from './catalog.js';

/** Longueurs maximales des champs libres (caractères). */
export const FIELD_LIMITS = Object.freeze({
  niche: 80,
  topic: 300,
  hook: 300,
  message: 1000,
});

const FIELD_NAMES = { niche: 'niche', topic: 'sujet', hook: 'hook de départ', message: 'contexte' };

/**
 * @typedef {Object} GenerationParams
 * @property {string} niche
 * @property {'tiktok' | 'facebook' | 'both'} platform
 * @property {string} tone
 * @property {string} topic
 * @property {string} hook
 * @property {string} message
 * @property {string} duration
 */

/** @param {unknown} value */
function cleanText(value) {
  if (typeof value !== 'string') return '';
  // Retire les caractères de contrôle (sauf saut de ligne) et les espaces en trop.
  return value.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '').trim();
}

/**
 * @param {string} tool
 * @param {Record<string, unknown>} raw
 * @returns {{ ok: true, params: GenerationParams } | { ok: false, error: string }}
 */
export function validateGenerationInput(tool, raw) {
  if (!Object.prototype.hasOwnProperty.call(TOOL_COSTS, tool)) {
    return { ok: false, error: 'Outil inconnu.' };
  }
  const input = raw && typeof raw === 'object' ? raw : {};

  /** @type {Record<string, string>} */
  const text = {};
  for (const key of /** @type {const} */ (['niche', 'topic', 'hook', 'message'])) {
    const v = cleanText(input[key]);
    if (v.length > FIELD_LIMITS[key]) {
      return { ok: false, error: `Le champ « ${FIELD_NAMES[key]} » dépasse ${FIELD_LIMITS[key]} caractères.` };
    }
    text[key] = v;
  }

  const platform = input.platform === undefined || input.platform === '' ? 'both' : input.platform;
  if (!PLATFORMS.some((p) => p.id === platform)) return { ok: false, error: 'Plateforme inconnue.' };

  const tone = input.tone === undefined || input.tone === '' ? TONES[0] : input.tone;
  if (!TONES.includes(/** @type {string} */ (tone))) return { ok: false, error: 'Ton inconnu.' };

  const duration = input.duration === undefined || input.duration === '' ? '60 sec' : input.duration;
  if (!DURATIONS.includes(/** @type {string} */ (duration))) return { ok: false, error: 'Durée inconnue.' };

  return {
    ok: true,
    params: {
      niche: text.niche,
      platform: /** @type {GenerationParams['platform']} */ (platform),
      tone: /** @type {string} */ (tone),
      topic: text.topic,
      hook: text.hook,
      message: text.message,
      duration: /** @type {string} */ (duration),
    },
  };
}

const PLATFORM_TEXT = {
  tiktok: 'TikTok (vidéo courte verticale, face caméra)',
  facebook: 'Facebook (post texte à lire dans le fil)',
  both: 'TikTok et Facebook (alterne les deux formats)',
};

/**
 * @param {{ countryName?: string }} ctx
 */
function systemPrompt(ctx) {
  const audience = ctx.countryName
    ? `Le créateur vit au ${ctx.countryName} et s'adresse d'abord à un public de ce pays, puis à l'Afrique francophone.`
    : "Le créateur s'adresse à un public d'Afrique francophone (Bénin, Côte d'Ivoire, Sénégal, Cameroun, Togo…).";
  return [
    'Tu es stratège de contenu pour des créateurs TikTok et Facebook francophones africains.',
    audience,
    'Règles :',
    "- Écris en français courant, naturel à l'oral. Tu peux utiliser des expressions locales connues quand elles sonnent juste, sans caricature.",
    '- Appuie-toi sur des situations concrètes du quotidien africain (marché, taxi-moto, famille, débrouille, Mobile Money, coupures de courant…), seulement quand elles servent le sujet.',
    '- Pas de promesse de gain chiffrée, pas de conseil médical ou financier risqué, pas de contenu haineux ou politique partisan.',
    "- Phrases courtes. Pas d'émojis dans les scripts, sauf dans les posts Facebook (2 ou 3 maximum).",
    '- Réponds uniquement avec le JSON demandé, sans texte autour.',
  ].join('\n');
}

/**
 * @param {GenerationParams} p
 */
function contextLines(p) {
  const lines = [
    `Niche : ${p.niche ? nicheLabel(p.niche) : 'généraliste'}`,
    `Plateforme : ${PLATFORM_TEXT[p.platform]}`,
    `Ton : ${p.tone}`,
  ];
  if (p.message) lines.push(`Contexte donné par le créateur : ${p.message}`);
  return lines.join('\n');
}

/** @param {Date} d */
function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

/**
 * @param {'hooks' | 'ideas' | 'script' | 'calendar'} tool
 * @param {GenerationParams} p
 * @param {{ countryName?: string, today: Date }} ctx
 * @returns {{ system: string, user: string }}
 */
export function buildPrompt(tool, p, ctx) {
  const system = systemPrompt(ctx);
  const base = contextLines(p);

  if (tool === 'hooks') {
    return {
      system,
      user: [
        base,
        `Sujet : ${p.topic || 'au choix, dans la niche'}`,
        '',
        'Écris 10 hooks (les premières phrases d’une vidéo ou d’un post) qui arrêtent le scroll.',
        '- Chaque hook fait au plus 20 mots et se dit en moins de 3 secondes.',
        '- Varie les mécanismes : curiosité, contre-intuition, question, chiffre, histoire, erreur courante, défi.',
        '- framework = le mécanisme utilisé, en 1 à 3 mots.',
        '- score = note de 0 à 10 de son potentiel de rétention ; justification = une phrase qui explique la note.',
        '- platform = tiktok ou facebook.',
      ].join('\n'),
    };
  }

  if (tool === 'ideas') {
    return {
      system,
      user: [
        base,
        p.topic ? `Thème : ${p.topic}` : '',
        '',
        'Propose 20 idées de contenus originales et concrètes, pas des thèmes vagues.',
        '- title : le sujet précis de la vidéo ou du post, en une ligne.',
        '- description : ce qu’on montre ou dit, en 1 à 2 phrases.',
        '- format : un format court (Face caméra, Storytime, Tutoriel, Avant/après, Micro-trottoir, Liste, Réaction, Carrousel, Post texte…).',
        '- platform : tiktok ou facebook.',
      ].filter(Boolean).join('\n'),
    };
  }

  if (tool === 'script') {
    const facebook = p.platform === 'facebook';
    const structure = facebook
      ? [
          'Écris un post Facebook prêt à coller.',
          'sections, dans cet ordre (id / label) :',
          '1. hook / Accroche : 1 à 2 lignes qui donnent envie de cliquer sur « Voir plus ».',
          '2. body / Développement : 3 à 6 paragraphes courts, aérés.',
          '3. key / Point clé : la phrase à retenir.',
          "4. question / Question d'engagement : une seule question ouverte pour faire commenter.",
          'hashtags : 3 à 6 hashtags pertinents. Pas de visual_note.',
        ]
      : [
          `Écris un script TikTok prêt à tourner, durée visée ${p.duration}.`,
          'sections, dans cet ordre (id / label) :',
          '1. hook / Accroche (0-3 s)',
          '2. context / Contexte',
          '3. message / Message principal',
          '4. twist / Twist : un retournement ou une révélation qui relance l’attention',
          "5. cta / Appel à l'action",
          'Pour chaque section, content = le texte exact à dire, et visual_note = une indication pour filmer (cadrage, geste, texte à l’écran).',
          'caption : la légende à publier, 1 à 2 lignes. hashtags : 3 à 5 hashtags.',
        ];
    return {
      system,
      user: [
        base,
        p.hook ? `Hook de départ à utiliser : ${p.hook}` : 'Hook de départ : à toi de l’écrire.',
        p.topic ? `Sujet : ${p.topic}` : '',
        '',
        ...structure,
        'title : un titre court pour retrouver ce contenu.',
        `platform : ${facebook ? 'facebook' : 'tiktok'}.`,
      ].filter(Boolean).join('\n'),
    };
  }

  // calendar
  return {
    system,
    user: [
      base,
      '',
      `Crée un calendrier éditorial de 30 jours qui commence le ${isoDate(ctx.today)} (jour 1).`,
      '- days : exactement 30 entrées, day de 1 à 30, date au format AAAA-MM-JJ.',
      '- idea : le sujet précis du contenu du jour.',
      '- hook : la première phrase à dire ou écrire, au plus 20 mots.',
      '- format : un format court (Face caméra, Storytime, Tutoriel, Avant/après, Liste, Réaction, Post texte…).',
      `- platform : ${p.platform === 'both' ? 'tiktok ou facebook, en alternant' : p.platform}.`,
      '- Construis une progression : semaine 1 se présenter et créer la confiance, semaine 2 apporter de la valeur, semaine 3 histoires et preuves, semaine 4 engagement et appel à l’action.',
      '- Pas deux jours identiques ; varie les formats.',
    ].join('\n'),
  };
}

const S = (description) => ({ type: 'STRING', description });

/** Schémas de réponse au format Gemini (sous-ensemble OpenAPI). */
export const RESPONSE_SCHEMAS = Object.freeze({
  hooks: {
    type: 'OBJECT',
    properties: {
      hooks: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            hook: S('Le hook'),
            framework: S('Mécanisme utilisé'),
            platform: { type: 'STRING', enum: ['tiktok', 'facebook'] },
            score: { type: 'NUMBER' },
            justification: S('Pourquoi cette note'),
          },
          required: ['hook', 'framework', 'platform', 'score', 'justification'],
        },
      },
    },
    required: ['hooks'],
  },
  ideas: {
    type: 'OBJECT',
    properties: {
      ideas: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            title: S('Sujet précis'),
            description: S('Ce qu’on montre'),
            format: S('Format'),
            platform: { type: 'STRING', enum: ['tiktok', 'facebook'] },
          },
          required: ['title', 'description', 'format', 'platform'],
        },
      },
    },
    required: ['ideas'],
  },
  script: {
    type: 'OBJECT',
    properties: {
      title: S('Titre court'),
      platform: { type: 'STRING', enum: ['tiktok', 'facebook'] },
      sections: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            id: S('Identifiant de section'),
            label: S('Nom de la section'),
            content: S('Texte exact'),
            visual_note: S('Indication de tournage'),
          },
          required: ['id', 'label', 'content'],
        },
      },
      caption: S('Légende'),
      hashtags: { type: 'ARRAY', items: { type: 'STRING' } },
    },
    required: ['title', 'platform', 'sections'],
  },
  calendar: {
    type: 'OBJECT',
    properties: {
      days: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            day: { type: 'INTEGER' },
            date: S('AAAA-MM-JJ'),
            idea: S('Sujet du jour'),
            hook: S('Première phrase'),
            format: S('Format'),
            platform: { type: 'STRING', enum: ['tiktok', 'facebook'] },
          },
          required: ['day', 'date', 'idea', 'hook', 'format', 'platform'],
        },
      },
    },
    required: ['days'],
  },
});

/** @param {unknown} v */
const str = (v) => (typeof v === 'string' ? v.trim() : '');
/** @param {unknown} v */
const plat = (v) => (v === 'facebook' ? 'facebook' : 'tiktok');

/**
 * Vérifie et nettoie la réponse de l'IA. Retourne null si elle est inutilisable.
 * @param {'hooks' | 'ideas' | 'script' | 'calendar'} tool
 * @param {any} data
 */
export function normalizeResult(tool, data) {
  if (!data || typeof data !== 'object') return null;

  if (tool === 'hooks') {
    const hooks = (Array.isArray(data.hooks) ? data.hooks : [])
      .map((h) => ({
        hook: str(h?.hook),
        framework: str(h?.framework),
        platform: plat(h?.platform),
        score: Math.min(10, Math.max(0, Math.round(Number(h?.score) || 0))),
        justification: str(h?.justification),
      }))
      .filter((h) => h.hook);
    return hooks.length ? { hooks } : null;
  }

  if (tool === 'ideas') {
    const ideas = (Array.isArray(data.ideas) ? data.ideas : [])
      .map((i) => ({ title: str(i?.title), description: str(i?.description), format: str(i?.format), platform: plat(i?.platform) }))
      .filter((i) => i.title);
    return ideas.length ? { ideas } : null;
  }

  if (tool === 'script') {
    const sections = (Array.isArray(data.sections) ? data.sections : [])
      .map((s, idx) => ({
        id: str(s?.id) || `s${idx + 1}`,
        label: str(s?.label) || `Partie ${idx + 1}`,
        content: str(s?.content),
        ...(str(s?.visual_note) ? { visual_note: str(s.visual_note) } : {}),
      }))
      .filter((s) => s.content);
    if (!sections.length) return null;
    const hashtags = (Array.isArray(data.hashtags) ? data.hashtags : [])
      .map((t) => str(t).replace(/^#+/, '').replace(/\s+/g, ''))
      .filter(Boolean)
      .map((t) => `#${t}`);
    return {
      title: str(data.title) || 'Script',
      platform: plat(data.platform),
      sections,
      caption: str(data.caption),
      hashtags,
    };
  }

  if (tool === 'calendar') {
    const days = (Array.isArray(data.days) ? data.days : [])
      .map((d) => ({
        day: Math.round(Number(d?.day) || 0),
        date: str(d?.date),
        idea: str(d?.idea),
        hook: str(d?.hook),
        format: str(d?.format),
        platform: plat(d?.platform),
      }))
      .filter((d) => d.idea)
      .sort((a, b) => a.day - b.day)
      .map((d, idx) => ({ ...d, day: idx + 1 }));
    return days.length >= 28 ? { days } : null;
  }

  return null;
}
