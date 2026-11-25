import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COUNTRIES, normalizePhone, getCountry } from '../src/shared/phone.js';

test('la liste des pays contient au moins la zone FCFA et le code ISO', () => {
  for (const iso of ['BJ', 'CI', 'SN', 'TG', 'BF', 'ML', 'NE', 'CM', 'GA', 'CG']) {
    assert.ok(getCountry(iso), `pays manquant : ${iso}`);
  }
  assert.ok(COUNTRIES.every((c) => /^[A-Z]{2}$/.test(c.iso) && /^\d{1,4}$/.test(c.dial)));
});

test('numéro local sans indicatif : on garde les chiffres et le pays choisi', () => {
  assert.deepEqual(normalizePhone('BJ', '01 97 00 11 22'), { ok: true, countryCode: 'BJ', number: '0197001122' });
});

test('numéro avec +indicatif du même pays : on retire l’indicatif', () => {
  assert.deepEqual(normalizePhone('CI', '+225 07 08 09 10 11'), { ok: true, countryCode: 'CI', number: '0708091011' });
  assert.deepEqual(normalizePhone('SN', '00221 77 123 45 67'), { ok: true, countryCode: 'SN', number: '771234567' });
});

test('numéro avec l’indicatif d’un autre pays : le pays suit l’indicatif', () => {
  assert.deepEqual(normalizePhone('BJ', '+228 90 12 34 56'), { ok: true, countryCode: 'TG', number: '90123456' });
});

test('tirets, points et parenthèses sont tolérés', () => {
  assert.deepEqual(normalizePhone('CM', '(6) 77-12.34.56'), { ok: true, countryCode: 'CM', number: '677123456' });
});

test('numéro vide, trop court, trop long ou fait de zéros : refusé avec un message', () => {
  for (const raw of ['', '   ', '1234', '0000000000', '1234567890123456']) {
    const r = normalizePhone('BJ', raw);
    assert.equal(r.ok, false, raw);
    assert.match(r.error, /numéro/i);
  }
});

test('pays inconnu : refusé', () => {
  const r = normalizePhone('ZZ', '97001122');
  assert.equal(r.ok, false);
  assert.match(r.error, /pays/i);
});

test('indicatif international inconnu : refusé plutôt que deviné', () => {
  const r = normalizePhone('BJ', '+999 12345678');
  assert.equal(r.ok, false);
});
