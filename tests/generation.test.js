import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateGenerationInput,
  buildPrompt,
  RESPONSE_SCHEMAS,
  normalizeResult,
} from '../src/shared/generation.js';
import { NICHES, TONES } from '../src/shared/catalog.js';

const today = new Date('2026-12-01T08:00:00Z');

test('outil inconnu refusé', () => {
  const r = validateGenerationInput('video', {});
  assert.equal(r.ok, false);
});

test('valeurs par défaut appliquées et champs nettoyés', () => {
  const r = validateGenerationInput('hooks', { niche: '  business ', topic: 'Mon\u0000 premier client\n', platform: 'tiktok' });
  assert.equal(r.ok, true);
  assert.equal(r.params.niche, 'business');
  assert.equal(r.params.topic, 'Mon premier client');
  assert.equal(r.params.platform, 'tiktok');
  assert.equal(r.params.tone, TONES[0]);
});

test('plateforme, ton et durée hors liste refusés', () => {
  assert.equal(validateGenerationInput('script', { platform: 'snapchat' }).ok, false);
  assert.equal(validateGenerationInput('script', { tone: 'Agressif' }).ok, false);
  assert.equal(validateGenerationInput('script', { duration: '10 min' }).ok, false);
});

test('texte trop long refusé avec un message qui nomme le champ', () => {
  const r = validateGenerationInput('ideas', { message: 'a'.repeat(1001) });
  assert.equal(r.ok, false);
  assert.match(r.error, /contexte/i);
});

test('le prompt utilise le libellé de la niche, le pays et le ton', () => {
  const niche = NICHES.find((n) => n.id === 'personal_dev');
  const { params } = validateGenerationInput('hooks', { niche: 'personal_dev', tone: 'Drôle', topic: 'se lever tôt' });
  const p = buildPrompt('hooks', params, { countryName: 'Bénin', today });
  assert.match(p.user, new RegExp(niche.label));
  assert.match(p.system, /Bénin/);
  assert.match(p.user, /Drôle/);
  assert.match(p.user, /se lever tôt/);
  assert.match(p.user, /10 hooks/);
});

test('niche libre conservée telle quelle', () => {
  const { params } = validateGenerationInput('ideas', { niche: 'Pâtisserie végane' });
  assert.match(buildPrompt('ideas', params, { today }).user, /Pâtisserie végane/);
});

test('script TikTok et post Facebook ont des structures différentes', () => {
  const tk = buildPrompt('script', validateGenerationInput('script', { platform: 'tiktok' }).params, { today }).user;
  const fb = buildPrompt('script', validateGenerationInput('script', { platform: 'facebook' }).params, { today }).user;
  assert.match(tk, /twist/i);
  assert.match(tk, /appel à l'action/i);
  assert.match(fb, /question d'engagement/i);
  assert.match(fb, /hashtags/i);
});

test('le calendrier part de la date du jour et demande 30 jours datés', () => {
  const { params } = validateGenerationInput('calendar', { message: 'Je vends des perruques' });
  const p = buildPrompt('calendar', params, { today });
  assert.match(p.user, /2026-12-01/);
  assert.match(p.user, /30 jours/);
  assert.match(p.user, /Je vends des perruques/);
});

test('un schéma JSON existe pour chaque outil', () => {
  for (const tool of ['hooks', 'ideas', 'script', 'calendar']) {
    assert.equal(RESPONSE_SCHEMAS[tool].type, 'OBJECT');
  }
});

test('normalizeResult hooks : score borné entre 0 et 10 et arrondi', () => {
  const r = normalizeResult('hooks', {
    hooks: [
      { hook: 'A', framework: 'Curiosité', platform: 'tiktok', score: 12, justification: 'x' },
      { hook: 'B', framework: 'Peur', platform: 'facebook', score: 7.6, justification: 'y' },
    ],
  });
  assert.deepEqual(r.hooks.map((h) => h.score), [10, 8]);
});

test('normalizeResult refuse une réponse vide ou mal formée', () => {
  assert.equal(normalizeResult('hooks', { hooks: [] }), null);
  assert.equal(normalizeResult('ideas', { foo: 1 }), null);
  assert.equal(normalizeResult('script', { sections: [{ label: 'x' }] }), null);
  assert.equal(normalizeResult('calendar', 'Jour 1 : texte'), null);
});

test('normalizeResult calendrier : jours triés, numérotés et au moins 28', () => {
  const days = Array.from({ length: 30 }, (_, i) => ({
    day: 30 - i, date: '', idea: `Idée ${30 - i}`, hook: 'h', format: 'Face caméra', platform: 'tiktok',
  }));
  const r = normalizeResult('calendar', { days });
  assert.equal(r.days.length, 30);
  assert.equal(r.days[0].day, 1);
  assert.equal(r.days[29].idea, 'Idée 30');
  assert.equal(normalizeResult('calendar', { days: days.slice(0, 10) }), null);
});

test('normalizeResult script : hashtags nettoyés et préfixés par #', () => {
  const r = normalizeResult('script', {
    title: 'T', platform: 'facebook',
    sections: [{ id: 'hook', label: 'Accroche', content: 'Salut' }],
    hashtags: ['entrepreneur', '#Bénin', ''],
  });
  assert.deepEqual(r.hashtags, ['#entrepreneur', '#Bénin']);
});
