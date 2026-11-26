import { Link } from 'react-router-dom';
import { Logo } from '@/components/brand/Logo';
import { SITE } from '@/config/site';
import { InstallButton, ShareButton } from '@/components/ShareInstall';

export function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[#1E1E3A] bg-[#0A0A14]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#94A3B8]">
            Le planning et les scripts de tes contenus TikTok et Facebook, écrits pour l’Afrique francophone.
            Un produit {SITE.publisher}.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <InstallButton />
            <ShareButton />
          </div>
        </div>
        <nav aria-label="Produit">
          <h2 className="mb-3 text-sm font-medium text-white">Produit</h2>
          <ul className="space-y-2 text-sm text-[#94A3B8]">
            <li><Link to="/#apercu" className="hover:text-white">Aperçu des outils</Link></li>
            <li><Link to="/pricing" className="hover:text-white">Tarifs</Link></li>
            <li><Link to="/guide" className="hover:text-white">Guide du créateur</Link></li>
            <li><Link to="/contact" className="hover:text-white">Aide et contact</Link></li>
          </ul>
        </nav>
        <nav aria-label="Informations légales">
          <h2 className="mb-3 text-sm font-medium text-white">Légal</h2>
          <ul className="space-y-2 text-sm text-[#94A3B8]">
            <li><Link to="/conditions" className="hover:text-white">Conditions générales</Link></li>
            <li><Link to="/confidentialite" className="hover:text-white">Confidentialité</Link></li>
            <li><Link to="/conditions#remboursement" className="hover:text-white">Remboursement</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-[#1E1E3A] py-6 text-center text-xs text-[#64748B]">
        © {year} {SITE.publisher}. Tous droits réservés.
      </div>
    </footer>
  );
}
