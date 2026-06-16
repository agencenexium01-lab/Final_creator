import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NICHES } from '@/config/constants';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A0A14] text-white overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#1E1E3A] bg-[#0A0A14]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-[#7C3AED] fill-[#7C3AED]" />
            <span className="text-xl font-bold tracking-tight">Creator Booster IA</span>
            <Badge variant="outline" className="ml-2 border-[#7C3AED]/50 text-[#7C3AED] text-[10px] hidden sm:inline-flex">
              by NexiumAgency
            </Badge>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#94A3B8]">
            <Link to="/guide" className="hover:text-[#F1F5F9] transition-colors">Guide</Link>
            <Link to="/login" className="hover:text-[#F1F5F9] transition-colors">Connexion</Link>
            <Button asChild className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] hover:opacity-90 text-white border-none rounded-xl">
              <Link to="/signup">Commencer</Link>
            </Button>
          </nav>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Zap className="w-6 h-6 text-[#7C3AED]" />
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 md:py-28 overflow-hidden">
          {/* Arrière-plans flous et responsifs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-72 h-72 md:w-96 md:h-96 bg-[#7C3AED]/20 rounded-full blur-[80px] md:blur-[128px]" />
            <div className="absolute bottom-0 right-1/4 w-72 h-72 md:w-96 md:h-96 bg-[#06B6D4]/20 rounded-full blur-[80px] md:blur-[128px]" />
          </div>
          
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-6 bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/20 hover:bg-[#7C3AED]/20 px-4 py-1 text-xs md:text-sm">
                L'IA au service des créateurs africains 🌍
              </Badge>
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-[#94A3B8] bg-clip-text text-transparent leading-tight md:leading-none">
                Crée des contenus viraux <br className="hidden sm:block" /> avec l'IA
              </h1>
              <p className="text-base md:text-xl text-[#94A3B8] max-w-2xl mx-auto mb-10 leading-relaxed px-2">
                Le seul outil pensé pour les créateurs TikTok et Facebook d'Afrique francophone. 
                Génère des hooks, des scripts et des idées adaptés à ta culture.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
                <Button size="lg" asChild className="w-full sm:w-auto h-14 px-8 text-base md:text-lg bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] hover:opacity-90 text-white border-none rounded-xl shadow-lg shadow-[#7C3AED]/20">
                  <Link to="/signup" className="flex items-center justify-center gap-2">
                    Commencer <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="w-full sm:w-auto h-14 px-8 text-base md:text-lg border-[#1E1E3A] bg-[#12121F] hover:bg-[#1E1E3A] rounded-xl">
                  <Link to="/guide">Voir le guide</Link>
                </Button>
              </div>
            </motion.div>

            {/* 💡 INTÉGRATION DE LA VIDÉO DE PRÉSENTATION GOOGLE DRIVE */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-full max-w-4xl mx-auto mt-16 md:mt-24 px-2"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#1E1E3A] shadow-2xl bg-[#12121F]/80 backdrop-blur-sm group hover:border-[#7C3AED]/30 transition-all duration-300">
                {/* Remplace 'TON_ID_GOOGLE_DRIVE' par l'identifiant réel de ton fichier Drive */}
                <iframe
                  src="https://drive.google.com/file/d/1lePbr0Ju-_ArgTpUWmHNS-jtHs6wevy2/preview"
                  className="absolute top-0 left-0 w-full h-full border-none rounded-2xl"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title="Présentation vidéo - Creator Booster IA"
                ></iframe>
              </div>
            </motion.div>

          </div>
        </section>

        {/* Niches Section */}
        <section className="py-16 md:py-20 bg-[#12121F]/50 border-y border-[#1E1E3A]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Adapté à toutes les niches</h2>
              <p className="text-[#94A3B8] text-sm md:text-base">Peu importe ton domaine, l'IA connaît tes codes.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-4xl mx-auto">
              {NICHES.map((niche) => (
                <Badge key={niche.id} variant="secondary" className="bg-[#1E1E3A] text-[#F1F5F9] hover:bg-[#2D2D5E] px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm rounded-full border-none transition-all hover:scale-105">
                  <span className="mr-1.5">{niche.icon}</span> {niche.label}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Ils dominent déjà leur niche</h2>
              <p className="text-[#94A3B8] text-sm md:text-base">Rejoins des milliers de créateurs qui utilisent Creator Booster IA.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
              {[
                { name: "Moussa K.", niche: "Business", result: "+50k abonnés en 2 mois", text: "Les hooks sont incroyables. Je ne passe plus des heures à réfléchir à mon accroche." },
                { name: "Awa D.", niche: "Lifestyle", result: "1M de vues sur TikTok", text: "L'IA comprend vraiment le parler africain. C'est naturel et ça percute direct." },
                { name: "Jean-Paul M.", niche: "Motivation", result: "Engagement x3 sur Facebook", text: "Le calendrier de 30 jours m'a sauvé. Je publie enfin tous les jours sans stress." },
              ].map((t, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="p-6 md:p-8 rounded-2xl bg-[#12121F] border border-[#1E1E3A] relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Star className="w-12 h-12 text-[#7C3AED]" />
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-lg font-bold">
                      {t.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm md:text-base">{t.name}</h4>
                      <p className="text-[11px] md:text-xs text-[#94A3B8]">{t.niche} • {t.result}</p>
                    </div>
                  </div>
                  <p className="text-sm md:text-base text-[#94A3B8] italic leading-relaxed">"{t.text}"</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0A0A14] border-t border-[#1E1E3A] py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-[#7C3AED] fill-[#7C3AED]" />
                <span className="text-lg font-bold">Creator Booster IA</span>
              </div>
              <p className="text-[#94A3B8] text-sm mb-4 leading-relaxed">
                L'IA au service des créateurs africains. <br />
                Propulsé par NexiumAgency.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm md:text-base">Liens rapides</h4>
              <ul className="space-y-2 text-sm text-[#94A3B8]">
                <li><Link to="/dashboard" className="hover:text-[#F1F5F9] transition-colors">Dashboard</Link></li>
                <li><Link to="/guide" className="hover:text-[#F1F5F9] transition-colors">Guide Créateur</Link></li>
                <li><Link to="/tools/hooks" className="hover:text-[#F1F5F9] transition-colors">Générateur de Hooks</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm md:text-base">Légal</h4>
              <ul className="space-y-2 text-sm text-[#94A3B8]">
                <li><Link to="#" className="hover:text-[#F1F5F9] transition-colors">Confidentialité</Link></li>
                <li><Link to="#" className="hover:text-[#F1F5F9] transition-colors">CGU</Link></li>
                <li><Link to="/contact" className="hover:text-[#F1F5F9] transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[#1E1E3A] text-center text-xs md:text-sm text-[#94A3B8]">
            <p>© 2026 NexiumAgency. Tous droits réservés. Fait avec ❤️ pour l'Afrique.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}