import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { verifyPulseSignature, readSale } from '../api/_lib/pulse.js';

const SECRET = 'whsec_test123';
const sign = (body, secret = SECRET) => 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');
const ENV = { CHARIOW_PRODUCT_STARTER: 'prd_s', CHARIOW_PRODUCT_CREATEUR: 'prd_c', CHARIOW_PRODUCT_PRO: 'prd_p' };

test('signature valide acceptée, sur les octets bruts', () => {
  const body = Buffer.from('{"event":"successful.sale","url":"https:\\/\\/x.y"}');
  assert.equal(verifyPulseSignature(body, sign(body), SECRET), true);
});

test('signature absente, mal formée, d’un autre secret ou d’un autre corps : refusée', () => {
  const body = Buffer.from('{"a":1}');
  assert.equal(verifyPulseSignature(body, undefined, SECRET), false);
  assert.equal(verifyPulseSignature(body, 'abc', SECRET), false);
  assert.equal(verifyPulseSignature(body, sign(body, 'whsec_autre'), SECRET), false);
  assert.equal(verifyPulseSignature(Buffer.from('{"a":2}'), sign(body), SECRET), false);
});

test('secret non configuré : toujours refusé', () => {
  const body = Buffer.from('{}');
  assert.equal(verifyPulseSignature(body, sign(body, ''), ''), false);
});

const sale = (over = {}) => ({
  event: 'successful.sale',
  sale: { id: 'sal_1', status: 'completed', custom_metadata: { user_id: 'uid_42', pack: 'pro' } },
  product: { id: 'prd_c' },
  customer: { email: 'Awa@Example.com' },
  ...over,
});

test('vente complète : le pack vient de l’id produit, pas des métadonnées', () => {
  assert.deepEqual(readSale(sale(), ENV), {
    kind: 'sale', saleId: 'sal_1', userId: 'uid_42', email: 'awa@example.com', packId: 'createur', credits: 150,
  });
});

test('ancienne clé userId acceptée, user absent toléré (rapprochement par e-mail)', () => {
  const r1 = readSale(sale({ sale: { id: 'sal_2', status: 'completed', custom_metadata: { userId: 'u_old' } } }), ENV);
  assert.equal(r1.userId, 'u_old');
  const r2 = readSale(sale({ sale: { id: 'sal_3', status: 'completed', custom_metadata: null } }), ENV);
  assert.equal(r2.kind, 'sale');
  assert.equal(r2.userId, null);
});

test('autres événements, ventes non terminées et produits inconnus : ignorés', () => {
  assert.equal(readSale(sale({ event: 'abandoned.sale' }), ENV).kind, 'ignore');
  assert.equal(readSale(sale({ sale: { id: 'sal_4', status: 'pending' } }), ENV).kind, 'ignore');
  assert.equal(readSale(sale({ product: { id: 'prd_inconnu' } }), ENV).kind, 'ignore');
  assert.equal(readSale({ event: 'successful.sale' }, ENV).kind, 'ignore');
});
