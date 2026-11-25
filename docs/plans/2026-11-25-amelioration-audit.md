# Amélioration post-audit — Plan d'implémentation

**Objectif :** corriger toutes les failles et incohérences relevées dans l'audit du 25/11/2026 et rendre le site prêt à encaisser.
**Architecture :** une seule source de vérité pour les prix et les prompts (`src/shared/*.js`, importée par le front Vite et les fonctions Vercel) ; API protégée par jeton Firebase ; crédits déduits côté serveur en transaction ; webhook Chariow signé et idempotent ; règles Firestore qui interdisent au client de toucher aux crédits.
**Stack :** React 19 + Vite 6 + Tailwind 4, Firebase Auth/Firestore, fonctions Vercel (Node), Gemini 2.5 Flash, Chariow.
**Spec :** rapport « Audit Creator Booster IA » (25/11/2026) + réponses du propriétaire.

## Contraintes globales
- Rien n'est poussé sur GitHub : commits locaux sur la branche `amelioration-audit`.
- Pas de crédits offerts à l'inscription.
- Grille de crédits : hooks 2, idées 3, script 3, calendrier 10 (1 mois = 1 calendrier + 30 scripts = 100 crédits).
- Packs inchangés côté Chariow : Starter 3 000 FCFA / 50, Créateur 7 000 FCFA / 150, Pro 14 000 FCFA / 350.
- Témoignages remplacés par un aperçu réel des résultats de chaque outil, avec un emplacement vidéo par outil.
- Modules partagés en JavaScript + JSDoc (exécutables par `node --test`, Vite et Vercel sans étape de build).

## Points de vigilance
1. Deux générations lancées en même temps → une seule passe, la seconde reçoit 429 (transaction + `lastGenerationAt`).
2. Gemini renvoie un JSON invalide deux fois → remboursement automatique, 502 au client.
3. Pulse Chariow rejoué (même vente) → crédité une seule fois (`processed_sales/{sale.id}`).
4. Vente sans `user_id` (achat via l'ancienne page produit) → rapprochement par e-mail, sinon `unmatched_sales` + 200 pour ne pas désactiver le Pulse.
5. Téléphone vide, avec espaces, préfixe +229 / 00229 / sans indicatif → normalisé ou refusé avec message clair, jamais remplacé par un faux numéro.

## Tâches
1. `src/shared/pricing.js` + tests — coûts, packs, équivalences affichées.
2. `src/shared/phone.js` + tests — normalisation et pays acceptés par Chariow.
3. `src/shared/generation.js` + tests — validation des entrées, prompts, schémas JSON, normalisation des sorties.
4. `api/_lib/pulse.js` + tests — signature `x-chariow-signature`, extraction de la vente.
5. API : `_lib/firebaseAdmin.ts`, `_lib/auth.ts`, `generate.ts`, `initiate-checkout.ts`, `webhook-chariow.ts` ; suppression de `history.ts`.
6. `firestore.rules` verrouillées.
7. Front : services (jeton, profil temps réel), AppShell + barre mobile, landing, aperçus, tarifs + formulaire de paiement, outils, historique, paramètres, pages légales.
8. SEO/perf : `index.html`, `public/`, découpage par route, Geist auto-hébergée, dépendances.
9. Nettoyage, README, `.env.example`, CI GitHub Actions.
10. Vérification : tests, contrôle syntaxique, revue fraîche.

## Journal des décisions
- Décision : modules partagés en `.js` + JSDoc — Vercel compile chaque `.ts` séparément et Node ESM exige l'extension réelle ; le `.js` évite toute ambiguïté — coût si faux : faible (renommage).
- Décision : dédoublonnage des ventes sur `sale.id` plutôt que sur `x-pulse-delivery-id` — on veut « une vente = un crédit », même si Chariow livre plusieurs fois — coût si faux : aucun double crédit possible, au pire un rejeu manuel est ignoré.
- Décision : progression mensuelle = scripts générés / 30 — un script = une vidéo, ce que promet la landing — coût si faux : simple libellé.
