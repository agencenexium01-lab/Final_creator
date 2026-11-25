import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TOOL_COSTS,
  PACKS,
  MONTH_PLAN,
  getToolCost,
  getPack,
  getPackByProductEnvKey,
  creditPriceFcfa,
  monthCostFcfa,
  packCoverage,
  formatFcfa,
} from '../src/shared/pricing.js';

test('les coûts par outil correspondent à la grille validée', () => {
  assert.deepEqual(TOOL_COSTS, { hooks: 2, ideas: 3, script: 3, calendar: 10 });
});

test('getToolCost refuse un outil inconnu', () => {
  assert.equal(getToolCost('script'), 3);
  assert.equal(getToolCost('unknown'), null);
  assert.equal(getToolCost('__proto__'), null);
});

test('un mois complet = 1 calendrier + 30 scripts = 100 crédits', () => {
  assert.equal(MONTH_PLAN.credits, 100);
  assert.equal(MONTH_PLAN.scripts, 30);
});

test('les packs gardent les prix et crédits vendus sur Chariow', () => {
  assert.deepEqual(
    PACKS.map((p) => [p.id, p.priceFcfa, p.credits]),
    [
      ['starter', 3000, 50],
      ['createur', 7000, 150],
      ['pro', 14000, 350],
    ],
  );
  assert.equal(getPack('pro').credits, 350);
  assert.equal(getPack('inconnu'), null);
});

test('getPackByProductEnvKey retrouve le pack depuis son id produit Chariow', () => {
  const env = { CHARIOW_PRODUCT_STARTER: 'prd_a', CHARIOW_PRODUCT_CREATEUR: 'prd_b', CHARIOW_PRODUCT_PRO: 'prd_c' };
  assert.equal(getPackByProductEnvKey('prd_b', env).id, 'createur');
  assert.equal(getPackByProductEnvKey('prd_z', env), null);
  assert.equal(getPackByProductEnvKey(undefined, env), null);
});

test('prix du crédit et coût mensuel par pack', () => {
  assert.equal(creditPriceFcfa(getPack('starter')), 60);
  assert.equal(creditPriceFcfa(getPack('pro')), 40);
  assert.equal(monthCostFcfa(getPack('starter')), 6000);
  assert.equal(monthCostFcfa(getPack('pro')), 4000);
  assert.equal(monthCostFcfa(getPack('createur')), 4667);
});

test('packCoverage décrit honnêtement ce que couvre chaque pack', () => {
  assert.deepEqual(packCoverage(getPack('starter')), { months: 0, calendars: 1, scripts: 13, leftover: 1 });
  assert.deepEqual(packCoverage(getPack('createur')), { months: 1, calendars: 2, scripts: 43, leftover: 1 });
  assert.deepEqual(packCoverage(getPack('pro')), { months: 3, calendars: 4, scripts: 103, leftover: 1 });
});

test('formatFcfa utilise des espaces insécables (le montant ne se coupe jamais)', () => {
  assert.equal(formatFcfa(14000), '14\u00a0000\u00a0FCFA');
  assert.equal(formatFcfa(600), '600\u00a0FCFA');
});
