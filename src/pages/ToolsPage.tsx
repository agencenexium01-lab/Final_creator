import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, PenTool, Lightbulb, Calendar as CalendarIcon, 
  Loader2, Copy, Check, Download, 
  ArrowLeft, Star, AlertCircle, Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Sidebar from '@/components/layout/Sidebar';
import { useAppStore } from '@/stores/appStore';
import { creditService } from '@/services/creditService';
import { authService } from '@/services/authService';
import { apiService } from '@/services/api';
import { NICHES } from '@/config/constants';
import toast from 'react-hot-toast';

export default function ToolsPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const { user, updateProfile } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCustomNiche, setIsCustomNiche] = useState(false);

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

  const [showBlockedModal, setShowBlockedModal] = useState(false);

  const handleGenerate = async () => {
    if (isLoading) return;

    if (!user) {
      toast.error('Utilisateur non trouvé.');
      return;
    }

    const hasCredits = creditService.hasEnoughCredits(user.credits, toolId as any);
    if (!hasCredits) {
      if (user.credits <= 0) {
        setShowBlockedModal(true);
        return;
      }

      toast.error(`Crédits insuffisants. Vous avez besoin de ${creditCost} crédit(s).`, {
        duration: 5000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiService.generateContent({
        userId: user.id,
        tool: toolId as string,
        params: formData,
      });
      setResults(data);

      const updatedUser = await authService.getProfile();
      if (updatedUser) {
        updateProfile({ credits: updatedUser.credits });
      }

      toast.success(`Génération terminée ! ${creditCost} crédit(s) déduit(s).`);
    } catch (error: any) {
      console.error('Generate API Error:', error);
      if (error?.message === 'INSUFFICIENT_CREDITS') {
        toast.error('Crédits insuffisants. Rechargez votre compte.');
      } else {
        toast.error(error?.message || 'Erreur lors de la génération.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const closeBlockedModal = () => {
    setShowBlockedModal(false);
    navigate('/pricing');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copié !");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportToPDF = () => {
    const calendarText = getRawCalendarText();
    if (!calendarText) {
      toast.error("Aucun contenu à exporter.");
      return;
    }
    
    setIsLoading(true);
    try {
      // 1. Initialiser jsPDF en format A4 standard
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // 2. Configurer une police propre et lisible pour du texte structuré
      pdf.setFont("courier", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(20, 20, 20); // Texte sombre pour l'impression sur fond blanc
      
      // 3. Découper le texte automatiquement pour qu'il ne dépasse pas de la page A4 (largeur max ~180mm)
      const splitText = pdf.splitTextToSize(calendarText, 180);
      
      // 4. Gérer la pagination automatique si le calendrier fait plusieurs pages
      let y = 15; // Marge du haut initiale
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Titre du document
      pdf.setFont("courier", "bold");
      pdf.setFontSize(14);
      pdf.text(`Calendrier de Contenu - Niche: ${formData.niche || 'Personnalisee'}`, 15, y);
      y += 10;
      
      pdf.setFont("courier", "normal");
      pdf.setFontSize(10);
      
      for (let i = 0; i < splitText.length; i++) {
        if (y > pageHeight - 15) { // Si on arrive en bas de page, on crée une nouvelle page
          pdf.addPage();
          y = 15; // Reset de la marge du haut sur la nouvelle page
        }
        pdf.text(splitText[i], 15, y);
        y += 6; // Hauteur de ligne (interligne de 6mm)
      }
      
      // 5. Sauvegarder le fichier
      pdf.save(`calendrier-30-jours-${formData.niche || 'personnalise'}.pdf`);
      toast.success("PDF téléchargé avec succès !");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la génération du PDF textuel.");
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

  // Helper pour extraire le texte ou les objets de calendrier
  const getRawCalendarText = () => {
    if (!results) return '';
    if (typeof results === 'string') return results;
    if (results.result && typeof results.result === 'string') return results.result;
    if (results.outputData && typeof results.outputData === 'string') return results.outputData;
    return JSON.stringify(results);
  };

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
                  
                  {/* Niche Selection */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#94A3B8] uppercase">Niche</label>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="text-xs text-[#7C3AED] p-0 h-auto"
                        onClick={() => {
                          setIsCustomNiche(!isCustomNiche);
                          setFormData({ ...formData, niche: '' });
                        }}
                      >
                        {isCustomNiche ? "Choisir dans la liste" : "Écrire ma propre niche"}
                      </Button>
                    </div>
                    
                    {isCustomNiche ? (
                      <Input 
                        value={formData.niche}
                        onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                        placeholder="Ex: Pâtisserie végane, Domotique..."
                        className="bg-[#1A1A2E] border-[#2D2D5E] text-white h-10"
                      />
                    ) : (
                      <Select value={formData.niche} onValueChange={(v: string | null) => setFormData({ ...formData, niche: v ?? '' })}>
                        <SelectTrigger className="bg-[#1A1A2E] border-[#2D2D5E] text-white">
                          <SelectValue placeholder="Choisir une niche" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#12121F] border-[#1E1E3A] text-white">
                          {NICHES.map(n => <SelectItem key={n.id} value={n.id}>{n.icon} {n.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Platform Selection */}
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

                  {/* Global Tone Selection (Accessible to all tools) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#94A3B8] uppercase">Ton du contenu</label>
                    <Select value={formData.tone} onValueChange={(v: string | null) => setFormData({ ...formData, tone: v ?? 'Motivationnel' })}>
                      <SelectTrigger className="bg-[#1A1A2E] border-[#2D2D5E] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#12121F] border-[#1E1E3A] text-white">
                        {['Motivationnel', 'Controversé', 'Éducatif', 'Storytelling', 'Drôle', 'Provocateur', 'Professionnel'].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Hooks Specific Inputs */}
                  {toolId === 'hooks' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#94A3B8] uppercase">Sujet spécifique</label>
                      <Textarea 
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        placeholder="Ex: comment j'ai gagné mon premier client..."
                        className="bg-[#1A1A2E] border-[#2D2D5E] min-h-[80px] text-white"
                      />
                    </div>
                  )}

                  {/* Scripts Specific Inputs */}
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

                  {/* Ideas and Calendar Specific Inputs */}
                  {(toolId === 'ideas' || toolId === 'calendar') && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#94A3B8] uppercase">Instructions ou contexte client</label>
                      <Textarea 
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Donne plus de détails sur tes attentes, ton offre, ta cible ou le type de contenu voulu..."
                        className="bg-[#1A1A2E] border-[#2D2D5E] min-h-[100px] text-white"
                      />
                    </div>
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
                          <CardTitle className="text-white">Script {results.platform}</CardTitle>
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

                    {/* Render Ideas Bank */}
                    {toolId === 'ideas' && (
                      <div className="space-y-4">
                        <h2 className="text-lg font-bold text-[#F59E0B] flex items-center gap-2">
                          <Lightbulb className="w-5 h-5" /> Banque d'idées générée
                        </h2>
                        {(results.ideas || (Array.isArray(results) ? results : [])).map((idea: any, idx: number) => (
                          <Card key={idx} className="bg-[#12121F] border-[#1E1E3A]">
                            <CardContent className="p-5 flex justify-between items-start gap-4">
                              <div className="space-y-1">
                                <h4 className="font-bold text-white text-base">{idea.title}</h4>
                                <p className="text-sm text-gray-300 leading-relaxed">{idea.description}</p>
                                {idea.format && <Badge className="mt-2 bg-[#1A1A2E] text-[#F59E0B] border-[#F59E0B]/20">{idea.format}</Badge>}
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-gray-400 hover:text-white"
                                onClick={() => copyToClipboard(`${idea.title}\n${idea.description}`, `idea-${idx}`)}
                              >
                                {copiedId === `idea-${idx}` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Render 30-Day Calendar */}
                    {toolId === 'calendar' && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h2 className="text-lg font-bold text-[#10B981] flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5" /> Votre Plan d'action 30 Jours
                          </h2>
                          <Button 
                            onClick={exportToPDF} 
                            disabled={isLoading}
                            className="bg-[#10B981] hover:bg-[#0f9f6e] text-white flex items-center gap-2 text-xs"
                          >
                            <Download className="w-4 h-4" /> Exporter en PDF
                          </Button>
                        </div>
                        
                        <Card id="calendar-printable-area" className="bg-[#12121F] border-[#1E1E3A] p-6 relative">
                          <div className="absolute top-4 right-4">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-gray-400 hover:text-white"
                              onClick={() => copyToClipboard(getRawCalendarText(), 'cal-raw')}
                            >
                              {copiedId === 'cal-raw' ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                              Tout copier
                            </Button>
                          </div>
                          <pre className="whitespace-pre-wrap font-sans text-gray-200 leading-relaxed text-sm bg-[#0A0A14] p-5 rounded-xl border border-[#1E1E3A] mt-6">
                            {getRawCalendarText()}
                          </pre>
                        </Card>
                      </div>
                    )}

                  </motion.div>
                )}
              </AnimatePresence>

              <Dialog open={showBlockedModal} onOpenChange={setShowBlockedModal}>
                <DialogContent className="bg-[#0b1220] border border-[#1e293b]">
                  <DialogHeader>
                    <DialogTitle>Crédits insuffisants</DialogTitle>
                    <DialogDescription>
                      Votre solde est à zéro et vous ne pouvez pas générer de contenu pour le moment.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4 space-y-3 text-sm text-[#cbd5e1]">
                    <p>Rechargez votre compte pour continuer à utiliser les outils IA.</p>
                  </div>
                  <DialogFooter>
                    <Button onClick={closeBlockedModal} className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white">
                      Aller à la page des tarifs
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}