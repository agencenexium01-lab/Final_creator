import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installMethod } from '../src/lib/install.js';

const ANDROID_CHROME = 'Mozilla/5.0 (Linux; Android 14; SM-A146B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36';
const IPHONE_SAFARI = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1';
const IPHONE_CHROME = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1';
const TIKTOK = 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36 musical_ly_2023 BytedanceWebview/d8a21c6';
const FACEBOOK = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 [FBAN/FBIOS;FBAV/440.0]';
const WINDOWS_EDGE = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36 Edg/131.0';

test('déjà ouverte comme application : rien à installer', () => {
  assert.equal(installMethod({ ua: ANDROID_CHROME, standalone: true, canPrompt: true }), 'installed');
});

test('le navigateur propose l’installation en un clic (Chrome, Edge, Samsung)', () => {
  assert.equal(installMethod({ ua: ANDROID_CHROME, standalone: false, canPrompt: true }), 'prompt');
  assert.equal(installMethod({ ua: WINDOWS_EDGE, standalone: false, canPrompt: true }), 'prompt');
});

test('iPhone et iPad : instructions Partager puis « Sur l’écran d’accueil », même dans Chrome iOS', () => {
  assert.equal(installMethod({ ua: IPHONE_SAFARI, standalone: false, canPrompt: false }), 'ios');
  assert.equal(installMethod({ ua: IPHONE_CHROME, standalone: false, canPrompt: false }), 'ios');
});

test('navigateur intégré de TikTok ou Facebook : il faut d’abord ouvrir dans le vrai navigateur', () => {
  assert.equal(installMethod({ ua: TIKTOK, standalone: false, canPrompt: false }), 'inapp');
  assert.equal(installMethod({ ua: FACEBOOK, standalone: false, canPrompt: false }), 'inapp');
});

test('sinon : passer par le menu du navigateur', () => {
  assert.equal(installMethod({ ua: ANDROID_CHROME, standalone: false, canPrompt: false }), 'menu');
  assert.equal(installMethod({ ua: '', standalone: false, canPrompt: false }), 'menu');
});
