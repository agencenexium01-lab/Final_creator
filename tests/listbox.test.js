import { test } from 'node:test';
import assert from 'node:assert/strict';
import { typeaheadIndex, moveIndex } from '../src/lib/listbox.js';

const PAYS = ['Bénin', 'Burkina Faso', 'Cameroun', "Côte d'Ivoire", 'Sénégal', 'Tchad', 'Togo'];

test('taper une lettre va au premier libellé qui commence par elle, accents ignorés', () => {
  assert.equal(typeaheadIndex(PAYS, 'c', -1), 2);
  assert.equal(typeaheadIndex(PAYS, 's', -1), 4);
  assert.equal(typeaheadIndex(PAYS, 'S', -1), 4);
});

test('retaper la même lettre passe au libellé suivant, puis reboucle', () => {
  assert.equal(typeaheadIndex(PAYS, 'c', 2), 3);
  assert.equal(typeaheadIndex(PAYS, 'c', 3), 2);
  assert.equal(typeaheadIndex(PAYS, 't', 5), 6);
});

test('plusieurs lettres tapées vite affinent la recherche', () => {
  assert.equal(typeaheadIndex(PAYS, 'bu', 0), 1);
  assert.equal(typeaheadIndex(PAYS, 'cote', -1), 3);
  assert.equal(typeaheadIndex(PAYS, 'to', 5), 6);
});

test('aucune correspondance : on ne bouge pas', () => {
  assert.equal(typeaheadIndex(PAYS, 'z', 3), 3);
  assert.equal(typeaheadIndex([], 'a', -1), -1);
});

test('flèches, Début et Fin restent dans la liste', () => {
  assert.equal(moveIndex(7, 0, 'ArrowDown'), 1);
  assert.equal(moveIndex(7, 6, 'ArrowDown'), 6);
  assert.equal(moveIndex(7, 0, 'ArrowUp'), 0);
  assert.equal(moveIndex(7, -1, 'ArrowDown'), 0);
  assert.equal(moveIndex(7, 3, 'Home'), 0);
  assert.equal(moveIndex(7, 3, 'End'), 6);
  assert.equal(moveIndex(7, 3, 'PageDown'), 6);
  assert.equal(moveIndex(7, 3, 'PageUp'), 0);
});
