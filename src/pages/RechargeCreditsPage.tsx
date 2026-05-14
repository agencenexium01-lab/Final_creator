import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppStore } from '../stores/appStore';
import { authService } from '../services/authService';
import { stripeService } from '../services/stripeService';
import Sidebar from '../components/layout/Sidebar';

interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  popular?: boolean;
  bonus?: number;
}

const CREDIT_PACKAGES: CreditPackage[] = [
  { id: 'starter', credits: 100, price: 9.99 },
  { id: 'pro', credits: 500, price: 39.99, popular: true, bonus: 50 },
  { id: 'agency', credits: 2000, price: 119.99, bonus: 300 },
];

export default function RechargeCreditsPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAppStore();
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(CREDIT_PACKAGES[1]);
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    if (!selectedPackage || !user) {
      toast.error('Sélectionnez un package');
      return;
    }

    setIsLoading(true);
    try {
      // Créer une session Stripe Checkout
      const sessionId = await stripeService.createCheckoutSession({
        credits: selectedPackage.credits + (selectedPackage.bonus || 0),
        price: selectedPackage.price,
        userId: user.id,
        userEmail: user.email,
        packageId: selectedPackage.id,
      });

      // Rediriger vers Stripe Checkout
      await stripeService.redirectToCheckout(sessionId);
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      toast.error('Erreur lors du paiement. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A14] text-[#F1F5F9]">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg bg-[#1A1A2E] hover:bg-[#252540] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold">Recharger les Crédits</h1>
          </div>

          {/* Credits Info */}
          <div className="bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] rounded-lg p-6 mb-8">
            <p className="text-sm text-white/70 mb-2">Crédits Disponibles</p>
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8" />
              <span className="text-4xl font-bold">{user?.credits || 0}</span>
            </div>
          </div>

          {/* Packages */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {CREDIT_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg)}
                className={`p-6 rounded-lg cursor-pointer transition-all ${
                  selectedPackage?.id === pkg.id
                    ? 'bg-[#7C3AED] border-2 border-[#7C3AED] scale-105'
                    : 'bg-[#1A1A2E] border-2 border-[#2D2D4A] hover:border-[#7C3AED]'
                }`}
              >
                {pkg.popular && (
                  <div className="bg-[#FF6B6B] text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                    POPULAIRE
                  </div>
                )}

                <h3 className="text-lg font-bold mb-2">{pkg.credits} Crédits</h3>

                {pkg.bonus && (
                  <p className="text-sm text-[#7C3AED] mb-4">+{pkg.bonus} bonus</p>
                )}

                <div className="mb-4">
                  <span className="text-3xl font-bold">${pkg.price}</span>
                  <span className="text-sm text-white/50 ml-2">
                    ({(pkg.price / pkg.credits).toFixed(2)}¢ par crédit)
                  </span>
                </div>

                {pkg.bonus && (
                  <p className="text-xs text-white/60 mb-4">
                    Économisez {((pkg.bonus * pkg.price) / pkg.credits).toFixed(2)}$
                  </p>
                )}

                {selectedPackage?.id === pkg.id && (
                  <div className="flex items-center gap-2 text-white">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">Sélectionné</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Purchase Button */}
          <div className="max-w-md">
            <button
              onClick={handlePurchase}
              disabled={!selectedPackage || isLoading}
              className="w-full py-3 px-6 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {isLoading ? 'Traitement...' : 'Procéder au Paiement'}
            </button>
            <p className="text-xs text-white/50 mt-4 text-center">
              Paiement sécurisé via Stripe
            </p>
          </div>

          {/* FAQ */}
          <div className="mt-12 max-w-2xl">
            <h2 className="text-xl font-bold mb-4">Questions Fréquentes</h2>
            <div className="space-y-4">
              <div className="bg-[#1A1A2E] p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Combien de crédits me coûte une génération?</h4>
                <p className="text-sm text-white/70">
                  • Hooks: 10 crédits • Scripts: 15 crédits • Idées: 5 crédits • Calendrier: 20 crédits
                </p>
              </div>
              <div className="bg-[#1A1A2E] p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Les crédits expirent-ils?</h4>
                <p className="text-sm text-white/70">
                  Non, vos crédits n'expirent jamais. Vous pouvez les utiliser quand vous le souhaitez.
                </p>
              </div>
              <div className="bg-[#1A1A2E] p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Puis-je me faire rembourser?</h4>
                <p className="text-sm text-white/70">
                  Les crédits ne sont pas remboursables, mais vous pouvez les utiliser pour générer du contenu.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
