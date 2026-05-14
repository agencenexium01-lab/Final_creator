
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { Sparkles, TrendingUp, PenTool, Lightbulb, Calendar, ArrowRight, Clock, Loader2, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/layout/Sidebar';
import { useAppStore } from '@/stores/appStore';
import { authService } from '@/services/authService';
import { DAILY_INSPIRATIONS, NICHES, PLATFORMS } from '@/config/constants';
import { geminiService } from '@/services/geminiService';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [searchParams] = useSearchParams();
  const { user, updateProfile } = useAppStore();
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [inspiration, setInspiration] = useState(DAILY_INSPIRATIONS[0]);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'pending' | 'failed' | null>(null);
  const [paymentMessage, setPaymentMessage] = useState('');

  const getEncouragementMessage = (count: number) => {
    if (count === 0) return "Premier pas ! Lance-toi dès maintenant 🚀";
    if (count === 1) return "Tu as commencé ! Continue sur cette lancée 🔥";
    if (count < 10) return `${count}/30 - Belle dynamique, continue ! 💪`;
    if (count < 20) return `${count}/30 - Tu es dans le rythme ! 🎯`;
    if (count < 30) return `${count}/30 - Presque là, ne lâche rien ! ⚡`;
    return "🎉 Objectif accompli pour le mois ! Félicitations !";
  };
  
  useEffect(() => {
    // Check for successful payment
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      verifyPayment(sessionId);
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/verify-payment/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPaymentStatus('success');
          setPaymentMessage(`✨ ${data.credits} crédits ont été ajoutés à votre compte!`);
          
          const updatedUser = await authService.getProfile();
          if (updatedUser) {
            updateProfile({ credits: updatedUser.credits });
          }
          
          toast.success(data.message);
          
          // Clear URL params
          setTimeout(() => {
            window.history.replaceState({}, document.title, '/dashboard');
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentStatus('failed');
      setPaymentMessage('Erreur lors de la vérification du paiement.');
    }
  };
  
  useEffect(() => {
    // Random inspiration at each login
    const randomInspiration = DAILY_INSPIRATIONS[Math.floor(Math.random() * DAILY_INSPIRATIONS.length)];
    setInspiration(randomInspiration);
    
    const fetchHistory = async () => {
      try {
        const data = await geminiService.getHistory(5);
        setHistory(data);
        
        // Count generations from current month
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const monthlyGenerations = data.filter(item => {
          const itemDate = new Date((item as any).created_at);
          return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
        });
        
        // Count all generations from current month (not just from history)
        const allGenerations = await geminiService.getMonthlyCount(currentMonth, currentYear);
        setMonthlyCount(allGenerations);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  const nicheLabel = NICHES.find(n => n.id === user?.niche)?.label || user?.niche;
  const platformLabel = PLATFORMS.find(p => p.id === user?.platform)?.label || user?.platform;

  const tools = [
    { id: 'hooks', title: 'Hooks Viraux', desc: 'Génère 10 accroches qui stoppent le scroll.', icon: PenTool, color: '#7C3AED' },
    { id: 'script', title: 'Scripts Vidéo', desc: 'Des scripts structurés pour TikTok et Facebook.', icon: PenTool, color: '#06B6D4' },
    { id: 'ideas', title: 'Banque d\'Idées', desc: '20 idées de contenus originaux pour ta niche.', icon: Lightbulb, color: '#F59E0B' },
    { id: 'calendar', title: 'Calendrier 30 Jours', desc: 'Ton plan d\'action complet pour le mois.', icon: Calendar, color: '#10B981' },
  ];

  const progressValue = Math.min((monthlyCount / 30) * 100, 100);
  const progressText = getEncouragementMessage(monthlyCount);

  const getToolLabel = (id: string) => {
    return tools.find(t => t.id === id)?.title || id;
  };

  return (
    <div className="flex min-h-screen bg-[#0A0A14]">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Bonjour {user?.name} 👋</h1>
              <p className="text-[#94A3B8]">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-[#1E1E3A] border-[#2D2D5E] text-[#F1F5F9] px-3 py-1">
                {nicheLabel}
              </Badge>
              <Badge variant="outline" className="bg-[#1E1E3A] border-[#2D2D5E] text-[#F1F5F9] px-3 py-1">
                {platformLabel}
              </Badge>
            </div>
          </header>

          {/* Payment Status Alert */}
          {paymentStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-[#10B981]/20 border border-[#10B981] rounded-lg flex items-start gap-3"
            >
              <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-[#10B981]">Paiement réussi!</h4>
                <p className="text-sm text-[#10B981]/80">{paymentMessage}</p>
              </div>
            </motion.div>
          )}

          {paymentStatus === 'failed' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-[#EF4444]/20 border border-[#EF4444] rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-[#EF4444]">Erreur de paiement</h4>
                <p className="text-sm text-[#EF4444]/80">{paymentMessage}</p>
              </div>
            </motion.div>
          )}

          {/* Inspiration Card */}
          <Card className="bg-gradient-to-r from-[#7C3AED]/20 via-[#4F46E5]/10 to-[#06B6D4]/20 border-[#7C3AED]/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-24 h-24 text-white" />
            </div>
            <CardContent className="p-8">
              <div className="flex items-center gap-2 text-[#7C3AED] mb-4">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wider">Inspiration du jour</span>
              </div>
              <p className="text-xl md:text-2xl font-medium mb-4 italic">
                "{inspiration.quote || inspiration.hook}"
              </p>
              {inspiration.author && <p className="text-[#94A3B8]">— {inspiration.author}</p>}
              {inspiration.stat && (
                <div className="flex items-center gap-2 text-[#06B6D4]">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">{inspiration.stat}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Credits Card */}
          <Card className="bg-gradient-to-r from-[#06B6D4]/20 to-[#10B981]/20 border-[#06B6D4]/30 overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#06B6D4]/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-[#06B6D4]" />
                </div>
                <div>
                  <p className="text-sm text-[#94A3B8]">Crédits disponibles</p>
                  <p className="text-3xl font-bold">{user?.credits || 0}</p>
                </div>
              </div>
              <Link to="/recharge-credits">
                <Button className="bg-[#06B6D4] hover:bg-[#0891B2] text-white font-semibold">
                  Recharger
                </Button>
              </Link>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Progress Card */}
            <Card className="lg:col-span-1 bg-[#12121F] border-[#1E1E3A]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#7C3AED]" />
                  Progression mensuelle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#94A3B8]">Objectif 30 contenus/mois</span>
                    <span className="font-bold">{monthlyCount}/30</span>
                  </div>
                  <Progress value={progressValue} className="h-3 bg-[#1E1E3A] [&>div]:bg-gradient-to-r [&>div]:from-[#7C3AED] [&>div]:to-[#06B6D4]" />
                </div>
                <p className="text-sm text-[#94A3B8] font-medium bg-[#1E1E3A] p-3 rounded-lg border border-[#2D2D5E]">
                  {progressText}
                </p>
              </CardContent>
            </Card>

            {/* Tools Grid */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tools.map((tool) => (
                <Link key={tool.id} to={`/tools/${tool.id}`}>
                  <Card className="h-full bg-[#12121F] border-[#1E1E3A] hover:border-[#7C3AED]/50 transition-all group cursor-pointer">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`} style={{ backgroundColor: `${tool.color}20` }}>
                        <tool.icon className="w-6 h-6" style={{ color: tool.color }} />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{tool.title}</h3>
                      <p className="text-sm text-[#94A3B8] mb-4">{tool.desc}</p>
                      <div className="flex items-center text-xs font-bold text-[#7C3AED] group-hover:translate-x-1 transition-transform">
                        OUVRIR L'OUTIL <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent History */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#94A3B8]" />
                Historique récent
              </h2>
              <Button variant="link" className="text-[#7C3AED]">Voir tout</Button>
            </div>
            <div className="space-y-4">
              {isLoadingHistory ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
                </div>
              ) : history?.length > 0 ? (
                history?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[#12121F] border border-[#1E1E3A] hover:bg-[#1E1E3A] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#1E1E3A] flex items-center justify-center">
                        <PenTool className="w-5 h-5 text-[#94A3B8]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{getToolLabel(item.tool)}</h4>
                        <p className="text-xs text-[#94A3B8]">{item.niche} • {new Date(item.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Link to={`/tools/${item.tool}`}>
                      <Button variant="ghost" size="sm" className="text-[#7C3AED] hover:bg-[#7C3AED]/10">Revoir</Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 bg-[#12121F] rounded-xl border border-[#1E1E3A]">
                  <p className="text-[#94A3B8]">Aucun contenu généré pour le moment.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
