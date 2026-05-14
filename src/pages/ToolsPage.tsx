import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, PenTool, Lightbulb, Calendar as CalendarIcon, 
  Loader2, Copy, Check, RefreshCw, Download, 
  ChevronRight, ArrowLeft, Star, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Sidebar from '@/components/layout/Sidebar';
import { useAppStore } from '@/stores/appStore';
import { geminiService } from '@/services/geminiService';
import { creditService } from '@/services/creditService';
import { authService } from '@/services/authService';
import { NICHES } from '@/config/constants';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function ToolsPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const { user, updateProfile } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const creditCost = creditService.getCost(toolId as any);

  const [formData, setFormData] = useState<{
    niche: string;
    platform: string;
    topic: string;
    tone: string;
    hook: string;
    message: string;
    goal: string;
    duration: string;
    angles: string[];
    intensity: string;
  }>({
    niche: (user?.niche ?? '') as string,
    platform: (user?.platform ?? 'both') as string,
    topic: '',
    tone: 'Motivationnel',
    hook: '',
    message: '',
    goal: 'Inspirer et motiver',
    duration: '60 sec',
    angles: [],
    intensity: '1 contenu/jour',
  });

  useEffect(() => {
    setResults(null);
  }, [toolId]);

  // --- MODIFIED HANDLE GENERATE WITH CREDITS CHECK ---
  const handleGenerate = async () => {
    if (isLoading) return;

    // Check credits
    const hasCredits = creditService.hasEnoughCredits(user?.credits || 0, toolId as any);
    if (!hasCredits) {
      toast.error(`Crédits insuffisants. Vous avez besoin de ${creditCost} crédit(s).`, {
        duration: 5000,
      });
      
      // Show go to recharge button
      setTimeout(() => {
        toast((t) => (
          <div>
            <p className="mb-3">Allez recharger vos crédits</p>
            <Button
              onClick={() => {
                navigate('/recharge-credits');
                toast.dismiss(t.id);
              }}
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
              size="sm"
            >
              Recharger
            </Button>
          </div>
        ), {
          duration: 8000,
        });
      }, 100);
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await geminiService.generateContent(toolId as any, formData);
      setResults(data);

      // Deduct credits after successful generation
      const updatedUser = await authService.addCredits(-creditCost);
      updateProfile({ credits: updatedUser.credits });
      
      toast.success(`Génération terminée! ${creditCost} crédit(s) déduit(s).`);
    } catch (error: any) {
      console.error("Gemini Error:", error);

      if (error.message?.includes('429') || error.message?.includes('prepayment')) {
        toast.error("Quota épuisé ou crédit insuffisant sur Google Cloud.", {
          duration: 5000,
        });
      } else if (error.message?.includes('API Key')) {
        toast.error("Clé API manquante ou invalide.");
      } else {
        toast.error("Une erreur est survenue lors de la génération.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  // --------------------------------

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copié !");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportToPDF = async () => {
    const element = document.getElementById('calendar-results');
    if (!element) return;
    
    setIsLoading(true);
    try {
      const canvas = await html2canvas(element, { backgroundColor: '#0A0A14' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`calendrier-30-jours-${formData.niche}.pdf`);
      toast.success("PDF téléchargé !");
    } catch (error) {
      toast.error("Erreur lors de l'export PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  const toolInfo = {
    hooks: { title: 'Hooks Viraux', icon: PenTool, desc: 'Génère des accroches qui stoppent le scroll.' },
    script: { title: 'Scripts Vidéo', icon: PenTool, desc: 'Des scripts structurés pour TikTok et Facebook.' },
    ideas: { title: 'Banque d\'Idées', icon: Lightbulb, desc: 'Des idées de contenus originaux pour ta niche.' },
    calendar: { title: 'Calendrier 30 Jours', icon: CalendarIcon, desc: 'Ton plan d\'action complet pour le mois.' },
  }[toolId as string] || { title: 'Outil', icon: Zap, desc: '' };

  return (
    <div className="flex min-h-screen bg-[#0A0A14]">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto text-white">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="md:hidden">
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <toolInfo.icon className="w-6 h-6 text-[#7C3AED]" />
                <h1 className="text-2xl font-bold">{toolInfo.title}</h1>
              </div>
              <p className="text-[#94A3B8] text-sm">{toolInfo.desc}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Column */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="bg-[#12121F] border-[#1E1E3A]">
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#94A3B8] uppercase">Niche</label>
                    <Select value={formData.niche} onValueChange={(v: string | null) => setFormData({ ...formData, niche: v ?? '' })}>
                      <SelectTrigger className="bg-[#1A1A2E] border-[#2D2D5E] text-white">
                        <SelectValue placeholder="Choisir une niche" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#12121F] border-[#1E1E3A] text-white">
                        {NICHES.map(n => <SelectItem key={n.id} value={n.id}>{n.icon} {n.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#94A3B8] uppercase">Plateforme</label>
                    <div className="flex gap-2">
                      {['tiktok', 'facebook', 'both'].map((p) => (
                        <Button
                          key={p}
                          variant={formData.platform === p ? 'default' : 'outline'}
                          onClick={() => setFormData({ ...formData, platform: p as any })}
                          className={`flex-1 h-10 rounded-lg capitalize ${
                            formData.platform === p ? 'bg-[#7C3AED] hover:bg-[#7C3AED]/90' : 'border-[#2D2D5E] hover:bg-[#1E1E3A] text-white'
                          }`}
                        >
                          {p === 'both' ? 'Les deux' : p}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {toolId === 'hooks' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#94A3B8] uppercase">Sujet spécifique</label>
                        <Textarea 
                          value={formData.topic}
                          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                          placeholder="Ex: comment j'ai gagné mon premier client..."
                          className="bg-[#1A1A2E] border-[#2D2D5E] min-h-[80px] text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#94A3B8] uppercase">Ton</label>
                        <Select value={formData.tone} onValueChange={(v: string | null) => setFormData({ ...formData, tone: v ?? 'Motivationnel' })}>
                          <SelectTrigger className="bg-[#1A1A2E] border-[#2D2D5E] text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#12121F] border-[#1E1E3A] text-white">
                            {['Motivationnel', 'Controversé', 'Éducatif', 'Storytelling', 'Drôle', 'Provocateur'].map(t => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {toolId === 'script' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#94A3B8] uppercase">Hook de départ</label>
                        <Textarea 
                          value={formData.hook}
                          onChange={(e) => setFormData({ ...formData, hook: e.target.value })}
                          placeholder="Copie un hook ici ou laisse vide..."
                          className="bg-[#1A1A2E] border-[#2D2D5E] min-h-[80px] text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-[#94A3B8] uppercase">Message principal</label>
                        <Textarea 
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Ce que tu veux transmettre..."
                          className="bg-[#1A1A2E] border-[#2D2D5E] min-h-[80px] text-white"
                        />
                      </div>
                    </>
                  )}

                  {/* Credits Info */}
                  <div className="p-4 bg-[#1A1A2E] border border-[#2D2D5E] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-[#94A3B8] uppercase">Coût de génération</p>
                      <Badge variant="outline" className="bg-[#7C3AED]/20 border-[#7C3AED] text-[#7C3AED]">
                        {creditCost} crédit{creditCost > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[#94A3B8]">Votre solde</p>
                      <p className="text-lg font-bold text-[#06B6D4]">{user?.credits || 0}</p>
                    </div>
                  </div>

                  <Button 
                    onClick={handleGenerate} 
                    disabled={isLoading || !creditService.hasEnoughCredits(user?.credits || 0, toolId as any)}
                    className="w-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] hover:opacity-90 text-white border-none h-12 rounded-xl mt-4 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Génération...</>
                    ) : !creditService.hasEnoughCredits(user?.credits || 0, toolId as any) ? (
                      <><AlertCircle className="w-5 h-5 mr-2" /> Crédits insuffisants</>
                    ) : (
                      <><Zap className="w-5 h-5 mr-2 fill-current" /> Générer ⚡</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-8 space-y-6">
              <AnimatePresence mode="wait">
                {!results && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-[#1E1E3A] rounded-2xl"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#12121F] flex items-center justify-center mb-6">
                      <toolInfo.icon className="w-8 h-8 text-[#94A3B8]" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Prêt à créer ?</h3>
                    <p className="text-[#94A3B8] max-w-xs">
                      Remplis le formulaire à gauche et laisse l'IA booster ton contenu.
                    </p>
                  </motion.div>
                )}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {[1, 2, 3].map(i => (
                      <Card key={i} className="bg-[#12121F] border-[#1E1E3A] animate-pulse">
                        <CardContent className="p-6 space-y-4">
                          <div className="h-4 bg-[#1E1E3A] rounded w-3/4" />
                          <div className="h-4 bg-[#1E1E3A] rounded w-1/2" />
                          <div className="h-20 bg-[#1E1E3A] rounded w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </motion.div>
                )}

                {results && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Render Hooks */}
                    {toolId === 'hooks' && results.hooks?.map((hook: any, i: number) => (
                      <Card key={i} className="bg-[#12121F] border-[#1E1E3A] hover:border-[#7C3AED]/30 transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary" className="bg-[#7C3AED]/10 text-[#7C3AED] border-none">{hook.framework}</Badge>
                              <Badge variant="outline" className="border-[#1E1E3A] text-[#94A3B8]">{hook.platform}</Badge>
                            </div>
                            <div className="flex items-center gap-1 text-[#F59E0B]">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="font-bold">{hook.score}/10</span>
                            </div>
                          </div>
                          <p className="text-lg font-medium mb-4 leading-relaxed">{hook.hook}</p>
                          <p className="text-sm text-[#94A3B8] italic mb-6">"{hook.justification}"</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => copyToClipboard(hook.hook, `hook-${i}`)}
                            className="bg-[#1A1A2E] border-[#2D2D5E] hover:bg-[#1E1E3A] text-white"
                          >
                            {copiedId === `hook-${i}` ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                            Copier
                          </Button>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Render Scripts */}
                    {toolId === 'script' && (
                      <Card className="bg-[#12121F] border-[#1E1E3A]">
                        <CardHeader className="border-b border-[#1E1E3A]">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-white">Script {results.platform}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                          {results.sections?.map((section: any) => (
                            <div key={section.id} className="space-y-2">
                              <h4 className="text-xs font-bold text-[#7C3AED] uppercase tracking-widest">{section.label}</h4>
                              <div className="p-4 rounded-xl bg-[#1A1A2E] border border-[#2D2D5E]">
                                <p className="whitespace-pre-wrap leading-relaxed text-white">{section.content}</p>
                                {section.visual_note && (
                                  <p className="mt-3 text-xs text-[#06B6D4] italic">Note: {section.visual_note}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}