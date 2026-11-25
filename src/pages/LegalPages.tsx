import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { SiteLayout } from '@/components/layout/SiteLayout';
import { LEGAL, SITE } from '@/config/site';
import { MONTH_PLAN, PACKS, TOOL_COSTS, formatFcfa } from '@/config/pricing';

function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl space-y-6 leading-relaxed text-[#CBD5E1] [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-white [&_li]:ml-5 [&_li]:list-disc [&_a]:text-[#A78BFA] [&_a]:underline">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
          <p className="mt-2 text-sm text-[#94A3B8]">Dernière mise à jour : {LEGAL.lastUpdated}</p>
        </header>
        {children}
      </article>
    </SiteLayout>
  );
}

function Publisher() {
  return (
    <ul className="space-y-1">
      <li>Éditeur : {LEGAL.companyName} ({LEGAL.legalForm})</li>
      <li>Immatriculation : {LEGAL.registration}</li>
      <li>Adresse : {LEGAL.address}, {LEGAL.country}</li>
      <li>Contact : <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a></li>
      <li>Hébergement : Vercel Inc. (site et serveur), Google Firebase (comptes et données)</li>
    </ul>
  );
}

export function TermsPage() {
  return (
    <LegalLayout title="Conditions générales d’utilisation et de vente">
      <p>
        Ces conditions encadrent l’utilisation de {SITE.name} et l’achat de crédits. En créant un compte ou en payant, tu les acceptes.
      </p>

      <h2>1. Éditeur</h2>
      <Publisher />

      <h2>2. Le service</h2>
      <p>
        {SITE.name} génère, à l’aide d’un modèle d’intelligence artificielle (Google Gemini), des calendriers éditoriaux, des scripts,
        des hooks et des idées de contenus. Les textes produits sont des propositions : tu restes responsable de ce que tu publies
        et de son respect des règles de TikTok, de Facebook et de la loi.
      </p>

      <h2>3. Crédits et prix</h2>
      <ul>
        {PACKS.map((p) => (
          <li key={p.id}>{p.name} : {formatFcfa(p.priceFcfa)} pour {p.credits} crédits.</li>
        ))}
      </ul>
      <p>
        Coût par génération : calendrier {TOOL_COSTS.calendar} crédits, script ou post {TOOL_COSTS.script} crédits,
        20 idées {TOOL_COSTS.ideas} crédits, 10 hooks {TOOL_COSTS.hooks} crédits (un mois complet : {MONTH_PLAN.credits} crédits).
        Le coût est affiché avant chaque génération. Il n’y a pas d’abonnement. Les crédits n’expirent pas, ne sont ni cessibles
        ni convertibles en argent.
      </p>

      <h2>4. Paiement</h2>
      <p>
        Le paiement (Mobile Money ou carte) est traité par notre prestataire Chariow. Nous ne voyons ni ne conservons tes
        coordonnées bancaires. Les crédits sont ajoutés automatiquement après confirmation du paiement par Chariow.
      </p>

      <h2 id="remboursement">5. Remboursement</h2>
      <ul>
        <li>Si une génération échoue (l’IA ne renvoie pas de résultat exploitable), les crédits sont automatiquement recrédités.</li>
        <li>Un pack dont aucun crédit n’a été utilisé peut être remboursé sur demande dans les 14 jours suivant l’achat.</li>
        <li>Les crédits déjà utilisés ne sont pas remboursables, le service ayant été fourni.</li>
        <li>Pour toute demande : <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a> ou WhatsApp, avec l’e-mail du compte et la référence du paiement.</li>
      </ul>

      <h2>6. Utilisation acceptable</h2>
      <p>
        Il est interdit d’utiliser le service pour produire des contenus illégaux, haineux, trompeurs ou portant atteinte aux droits
        d’autrui, ou de tenter de contourner le système de crédits. Nous pouvons suspendre un compte qui enfreint ces règles.
      </p>

      <h2>7. Responsabilité et disponibilité</h2>
      <p>
        Nous faisons le maximum pour que le service soit disponible, sans pouvoir le garantir en permanence. Aucun résultat
        d’audience (vues, abonnés, ventes) n’est garanti.
      </p>

      <h2>8. Modification et droit applicable</h2>
      <p>
        Ces conditions peuvent évoluer ; la version en vigueur est celle publiée sur cette page au moment de l’achat. Elles sont
        soumises au droit du {LEGAL.country}.
      </p>
      <p>Voir aussi la <Link to="/confidentialite">politique de confidentialité</Link>.</p>
    </LegalLayout>
  );
}

export function PrivacyPage() {
  return (
    <LegalLayout title="Politique de confidentialité">
      <p>Cette page explique quelles données {SITE.name} collecte, pourquoi, et comment exercer tes droits.</p>

      <h2>1. Responsable du traitement</h2>
      <Publisher />

      <h2>2. Données collectées</h2>
      <ul>
        <li>Compte : nom, adresse e-mail, mot de passe (géré et chiffré par Google Firebase, jamais visible par nous).</li>
        <li>Profil : pays, niche, plateforme préférée.</li>
        <li>Utilisation : textes saisis dans les outils, contenus générés, solde et historique de crédits.</li>
        <li>Paiement : nom, e-mail, numéro de téléphone transmis à Chariow pour le paiement, référence de la vente.</li>
        <li>Mesure d’audience anonyme des pages visitées (Vercel Analytics, sans cookie publicitaire).</li>
      </ul>

      <h2>3. Pourquoi</h2>
      <ul>
        <li>Fournir le service et ton historique.</li>
        <li>Encaisser les paiements et créditer ton compte.</li>
        <li>Répondre à tes demandes d’aide et prévenir la fraude.</li>
      </ul>

      <h2>4. Avec qui elles sont partagées</h2>
      <ul>
        <li>Google (Firebase pour les comptes et les données, Gemini pour générer les contenus à partir de ce que tu saisis).</li>
        <li>Chariow pour le paiement.</li>
        <li>Vercel pour l’hébergement.</li>
      </ul>
      <p>Nous ne vendons pas tes données et n’en faisons aucun usage publicitaire.</p>

      <h2>5. Durée de conservation</h2>
      <p>
        Tant que ton compte existe. Tu peux supprimer à tout moment un contenu de ton historique. Les données de paiement sont
        conservées le temps imposé par les obligations comptables.
      </p>

      <h2>6. Tes droits</h2>
      <p>
        Tu peux demander l’accès, la rectification ou la suppression de tes données, ou la fermeture de ton compte, en écrivant à{' '}
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>. Tu peux aussi saisir l’autorité compétente :{' '}
        {LEGAL.dataProtectionAuthority}.
      </p>
    </LegalLayout>
  );
}

export function NotFoundPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-xl py-16 text-center">
        <p className="text-sm tabular-nums text-[#94A3B8]">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Cette page n’existe pas</h1>
        <p className="mt-3 text-[#94A3B8]">Le lien est peut-être ancien ou mal copié.</p>
        <Link to="/" className="mt-8 inline-flex min-h-11 items-center rounded-xl bg-white px-5 font-medium text-[#0A0A14]">
          Retour à l’accueil
        </Link>
      </div>
    </SiteLayout>
  );
}
