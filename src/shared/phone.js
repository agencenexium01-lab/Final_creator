// Normalisation des numéros de téléphone pour le paiement Chariow (Mobile Money).
// Chariow attend : phone.number = chiffres uniquement, phone.country_code = ISO alpha-2.

/** @typedef {{ iso: string, name: string, dial: string }} Country */

/** @type {ReadonlyArray<Country>} */
export const COUNTRIES = Object.freeze([
  { iso: 'BJ', name: 'Bénin', dial: '229' },
  { iso: 'BF', name: 'Burkina Faso', dial: '226' },
  { iso: 'CM', name: 'Cameroun', dial: '237' },
  { iso: 'CF', name: 'Centrafrique', dial: '236' },
  { iso: 'CG', name: 'Congo-Brazzaville', dial: '242' },
  { iso: 'CD', name: 'RD Congo', dial: '243' },
  { iso: 'CI', name: "Côte d'Ivoire", dial: '225' },
  { iso: 'GA', name: 'Gabon', dial: '241' },
  { iso: 'GN', name: 'Guinée', dial: '224' },
  { iso: 'ML', name: 'Mali', dial: '223' },
  { iso: 'MA', name: 'Maroc', dial: '212' },
  { iso: 'NE', name: 'Niger', dial: '227' },
  { iso: 'SN', name: 'Sénégal', dial: '221' },
  { iso: 'TD', name: 'Tchad', dial: '235' },
  { iso: 'TG', name: 'Togo', dial: '228' },
  { iso: 'TN', name: 'Tunisie', dial: '216' },
  { iso: 'FR', name: 'France', dial: '33' },
  { iso: 'BE', name: 'Belgique', dial: '32' },
  { iso: 'CA', name: 'Canada', dial: '1' },
]);

/** @param {string} iso */
export function getCountry(iso) {
  return COUNTRIES.find((c) => c.iso === iso) ?? null;
}

const MIN_DIGITS = 8;
const MAX_DIGITS = 13;

/**
 * @param {string} countryIso  Pays choisi dans le formulaire
 * @param {string} raw         Saisie libre de l'utilisateur
 * @returns {{ ok: true, countryCode: string, number: string } | { ok: false, error: string }}
 */
export function normalizePhone(countryIso, raw) {
  const selected = getCountry(countryIso);
  if (!selected) return { ok: false, error: 'Choisis ton pays dans la liste.' };

  const trimmed = String(raw ?? '').trim();
  let country = selected;
  let digits;

  const international = trimmed.match(/^(?:\+|00)\s*(.*)$/);
  if (international) {
    const all = international[1].replace(/\D/g, '');
    // Indicatif le plus long d'abord (ex. 229 avant 2).
    const match = [...COUNTRIES]
      .sort((a, b) => b.dial.length - a.dial.length)
      .find((c) => all.startsWith(c.dial));
    if (!match) return { ok: false, error: "Indicatif du numéro non reconnu. Saisis le numéro sans l'indicatif." };
    country = match;
    digits = all.slice(match.dial.length);
  } else {
    digits = trimmed.replace(/\D/g, '');
  }

  if (digits.length < MIN_DIGITS || digits.length > MAX_DIGITS || /^0+$/.test(digits)) {
    return { ok: false, error: 'Ce numéro ne semble pas valide. Vérifie le numéro Mobile Money saisi.' };
  }
  return { ok: true, countryCode: country.iso, number: digits };
}
