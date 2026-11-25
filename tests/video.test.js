import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toEmbed } from '../src/lib/video.js';

test('lien de partage Google Drive (…/view?usp=drivesdk) → lecteur intégré /preview', () => {
  assert.deepEqual(toEmbed('https://drive.google.com/file/d/1k145PtobmiCMZjWqmYdg5wjQgdagrduK/view?usp=drivesdk'), {
    kind: 'drive',
    src: 'https://drive.google.com/file/d/1k145PtobmiCMZjWqmYdg5wjQgdagrduK/preview',
  });
});

test('lien Drive déjà en /preview ou au format open?id= : même résultat', () => {
  const expected = { kind: 'drive', src: 'https://drive.google.com/file/d/abc_DEF-123/preview' };
  assert.deepEqual(toEmbed('https://drive.google.com/file/d/abc_DEF-123/preview'), expected);
  assert.deepEqual(toEmbed('https://drive.google.com/open?id=abc_DEF-123'), expected);
});

test('YouTube (watch, youtu.be, shorts) → lecteur youtube-nocookie sans suggestions', () => {
  const src = 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1&playsinline=1&autoplay=1';
  assert.deepEqual(toEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=3'), { kind: 'youtube', src });
  assert.deepEqual(toEmbed('https://youtu.be/dQw4w9WgXcQ'), { kind: 'youtube', src });
  assert.deepEqual(toEmbed('https://youtube.com/shorts/dQw4w9WgXcQ'), { kind: 'youtube', src });
});

test('fichier vidéo (mp4, webm) ou chemin du site → lecteur natif', () => {
  assert.deepEqual(toEmbed('/videos/demo.mp4'), { kind: 'file', src: '/videos/demo.mp4' });
  assert.deepEqual(toEmbed('https://cdn.exemple.com/demo.webm?v=2'), { kind: 'file', src: 'https://cdn.exemple.com/demo.webm?v=2' });
});

test('vide ou non reconnu → null (emplacement « bientôt disponible »)', () => {
  assert.equal(toEmbed(''), null);
  assert.equal(toEmbed('   '), null);
  assert.equal(toEmbed('https://exemple.com/page'), null);
});
