// Logique clavier des listes déroulantes (menu dessiné par le site).

/** @param {string} s */
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Index du libellé correspondant à ce que l'utilisateur tape.
 * Une seule lettre (ou la même répétée) : passe au libellé suivant qui commence par elle.
 * Plusieurs lettres : premier libellé qui commence par la suite tapée, à partir de la position actuelle.
 * @param {string[]} labels
 * @param {string} query
 * @param {number} current  -1 si rien n'est sélectionné
 */
export function typeaheadIndex(labels, query, current) {
  const n = labels.length;
  const q = norm(query);
  if (!n || !q) return current;
  const sameChar = q.split('').every((c) => c === q[0]);
  const needle = sameChar ? q[0] : q;
  const start = sameChar ? current + 1 : Math.max(current, 0);
  for (let i = 0; i < n; i++) {
    const idx = (((start + i) % n) + n) % n;
    if (norm(labels[idx]).startsWith(needle)) return idx;
  }
  return current;
}

/**
 * @param {number} count
 * @param {number} current
 * @param {string} key
 */
export function moveIndex(count, current, key) {
  const last = count - 1;
  const clamp = (/** @type {number} */ i) => Math.min(last, Math.max(0, i));
  switch (key) {
    case 'ArrowDown': return clamp(current + 1);
    case 'ArrowUp': return clamp(current - 1);
    case 'PageDown': return clamp(current + 10);
    case 'PageUp': return clamp(current - 10);
    case 'Home': return 0;
    case 'End': return last;
    default: return current;
  }
}
