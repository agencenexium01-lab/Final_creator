import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Sidebar from '@/components/layout/Sidebar';
import { useAppStore } from '@/stores/appStore';
import { apiService } from '@/services/api';

const PRICING_PACKS = [
  {
    id: 'starter',
    title: 'Pack Starter',
    price: 3000,
    credits: 50,
    description: 'Idéal pour démarrer rapidement avec des contenus puissants.',
  },
  {
    id: 'createur',
    title: 'Pack Créateur',
    price: 7000,
    credits: 150,
    description: 'Le pack recommandé pour des créateurs réguliers.',
    popular: true,
  },
  {
    id: 'pro',
    title: 'Pack Pro',
    price: 14000,
    credits: 350,
    description: 'La meilleure autonomie pour vos publications mensuelles.',
  },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [selectedPack, setSelectedPack] = useState(PRICING_PACKS[1]);
  const [isLoading, setIsLoading] = useState(false);

  const defaultPhone = '+22900000000';

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Utilisateur non connecté.');
      return;
    }

    const currentEmail = (user.email || '').trim();
    const fallbackName = currentEmail ? currentEmail.split('@')[0] : 'Client';
    const [rawFirstName = '', rawLastName = ''] = (user.name || '').split(' ');
    const currentFirstName = rawFirstName && !rawFirstName.includes('@') ? rawFirstName.trim() : fallbackName.trim();
    const currentLastName = rawLastName && !rawLastName.includes('@') ? rawLastName.trim() : 'Booster';
    const currentPhone = defaultPhone;

    if (!currentEmail) {
      toast.error('Email manquant dans le profil utilisateur.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        pack: selectedPack.id.trim() as 'starter' | 'createur' | 'pro',
        userId: user.id || currentEmail,
        email: currentEmail,
        firstName: currentFirstName || 'Client',
        lastName: currentLastName || 'Booster',
        phone: currentPhone,
      };

      console.log('📤 Tentative de checkout avec payload:', payload);

      const checkoutUrl = await apiService.initiateCheckout(payload);

      window.location.href = checkoutUrl;
    } catch (error: any) {
      console.error('Erreur checkout:', error);
      toast.error(error?.message || 'Impossible de démarrer le paiement.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A14] text-white">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="md:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <p className="text-sm text-[#94A3B8] mb-1">Monétisation par crédits</p>
              <h1 className="text-3xl font-bold">Tarifs & Packs</h1>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <section className="space-y-6">
              <Card className="bg-[#12121F] border-[#1E1E3A]">
                <CardHeader>
                  <CardTitle className="text-xl">Vos options</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-[#94A3B8] leading-7">
                    Choisissez un pack de crédits pour continuer à générer du contenu. Chaque génération consomme des crédits selon le type d'outil, et votre solde est actualisé automatiquement après un paiement réussi.
                  </p>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                {PRICING_PACKS.map((pack) => (
                  <Card
                    key={pack.id}
                    onClick={() => setSelectedPack(pack)}
                    className={`cursor-pointer border-2 transition-all ${selectedPack.id === pack.id ? 'border-[#7C3AED] bg-[#1F1B3A]' : 'border-[#1E1E3A] bg-[#12121F] hover:border-[#7C3AED]/70'}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div>
                          <h2 className="text-lg font-semibold">{pack.title}</h2>
                          <p className="text-sm text-[#94A3B8] mt-1">{pack.credits} crédits</p>
                        </div>
                        {pack.popular && (
                          <Badge className="bg-[#f59e0b] text-black">Recommandé</Badge>
                        )}
                      </div>
                      <p className="text-4xl font-bold mb-3">{pack.price.toLocaleString('fr-FR')} FCFA</p>
                      <p className="text-sm text-[#cbd5e1]">{pack.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <Card className="bg-[#12121F] border-[#1E1E3A] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#7C3AED]/20 text-[#7C3AED]">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-[#94A3B8]">Solde actuel</p>
                    <p className="text-3xl font-bold">{user?.credits ?? 0} crédits</p>
                  </div>
                </div>
                <div className="space-y-4 text-sm text-[#cbd5e1]">
                  <p><span className="font-semibold">Pack sélectionné :</span> {selectedPack.title}</p>
                  <p><span className="font-semibold">Montant :</span> {selectedPack.price.toLocaleString('fr-FR')} FCFA</p>
                  <p><span className="font-semibold">Crédits :</span> {selectedPack.credits}</p>
                </div>
                <Button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="mt-6 w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                >
                  {isLoading ? 'Redirection en cours...' : 'Acheter ce pack'}
                </Button>
              </Card>

              <Card className="bg-[#0F172A] border-[#1E293B] p-6">
                <h3 className="text-lg font-semibold mb-3">Comment ça marche ?</h3>
                <ul className="space-y-3 text-sm text-[#cbd5e1]">
                  <li>• Le paiement est traité par Chariow en toute sécurité.</li>
                  <li>• Après achat, vous revenez au dashboard avec un message de succès.</li>
                  <li>• Le crédit est automatiquement ajouté à votre compte via webhook.</li>
                  <li>• Vous pouvez ensuite générer du contenu IA immédiatement.</li>
                </ul>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
