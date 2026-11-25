# Creator Booster IA

Planning et scripts de contenus TikTok et Facebook pour les créateurs d'Afrique francophone : calendrier de 30 jours, scripts, hooks et idées générés par Google Gemini, payés en crédits (Mobile Money ou carte via Chariow).

Site : https://creator-booster.vercel.app · Éditeur : NexiumAgency

## Stack

| Partie | Outil |
| --- | --- |
| Interface | React 19, Vite 6, Tailwind CSS 4, React Router 7, Zustand |
| Comptes et données | Firebase Auth + Cloud Firestore |
| Serveur | Fonctions Vercel (Node 20 ou 22) dans `api/` |
| IA | Gemini 2.5 Flash (réponses JSON contraintes par schéma) |
| Paiement | Chariow (checkout + webhook « Pulse » signé) |

## Démarrer en local

```bash
npm install
cp .env.example .env.local   # puis remplir les valeurs
npm run dev                  # interface seule sur http://localhost:3000
npx vercel dev               # interface + fonctions api/ (nécessite la CLI Vercel)
```

Vérifications avant chaque envoi :

```bash
npm run check   # typecheck + tests + build
```

## Organisation

```
api/                     Fonctions serveur (Vercel)
  generate.ts            Génération IA : jeton vérifié, crédits réservés en transaction, remboursés si échec
  initiate-checkout.ts   Ouvre un paiement Chariow relié au compte (custom_metadata.user_id)
  webhook-chariow.ts     Reçoit les ventes (signature HMAC vérifiée, une vente = un crédit)
  _lib/                  Firebase Admin, authentification, logique du webhook
src/
  shared/                Source unique : prix, pays/téléphone, prompts et schémas IA (JS + JSDoc, utilisé par le front ET le serveur)
  config/                site.ts (contact, vidéos de démo, infos légales), ui.ts (outils, icônes)
  content/               Textes : FAQ, exemples de la section « Aperçu »
  components/            Mise en page (AppShell, en-tête public), affichage des résultats, champs de formulaire
  pages/                 Une page par route (chargées à la demande)
  services/              Firebase, API, historique
tests/                   Tests unitaires (node --test, sans dépendance)
firestore.rules          Règles de sécurité (le client ne peut pas modifier ses crédits)
firestore.indexes.json   Index nécessaires à l'historique
```

## Grille de crédits

Définie dans `src/shared/pricing.js` et reprise partout (site, FAQ, CGV, serveur, webhook).

| Outil | Crédits |
| --- | --- |
| Calendrier 30 jours | 10 |
| Script TikTok ou post Facebook | 3 |
| 20 idées | 3 |
| 10 hooks | 2 |
| **Un mois complet** (1 calendrier + 30 scripts) | **100** |

| Pack | Prix | Crédits | Prix d'un mois complet |
| --- | --- | --- | --- |
| Starter | 3 000 FCFA | 50 | 6 000 FCFA |
| Créateur | 7 000 FCFA | 150 | 4 667 FCFA |
| Pro | 14 000 FCFA | 350 | 4 000 FCFA |

Coût IA estimé : moins de 15 FCFA par génération (Gemini 2.5 Flash à 0,30 $ / 2,50 $ par million de jetons), contre 80 à 600 FCFA facturés.

## Mise en production

1. **Variables Vercel** : toutes celles de `.env.example` (Production et Preview). `APP_URL` = URL publique.
2. **Règles et index Firestore** : `npx firebase-tools deploy --only firestore` (vérifier le nom de la base dans `firebase.json`).
3. **Chariow**
   - Sur chacun des 3 produits, autoriser les achats multiples (sinon Chariow répond `already_purchased` au deuxième achat).
   - Créer un Pulse vers `https://<domaine>/api/webhook-chariow`, événement `successful.sale`, et copier son secret `whsec_…` dans `CHARIOW_PULSE_SECRET`.
4. **Vidéos de démonstration** : renseigner les liens dans `src/config/site.ts` (`DEMO_VIDEOS`). Sans lien, un emplacement « bientôt disponible » s'affiche.
5. **Pages légales** : compléter `LEGAL` dans `src/config/site.ts` (forme juridique, RCCM/IFU, adresse) et faire relire CGV et confidentialité.

### Ventes sans compte correspondant

Si une vente arrive sans `user_id` et qu'aucun compte n'a l'e-mail de l'acheteur, elle est enregistrée dans la collection `unmatched_sales` (Firestore) pour être créditée à la main. Le webhook répond quand même 200 pour que Chariow ne désactive pas le Pulse.
