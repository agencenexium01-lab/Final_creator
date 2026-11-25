import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, LifeBuoy, Loader2, LogOut, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/SiteLayout';
import { Field, NativeSelect, TextInput } from '@/components/ui/field';
import { NICHE_OPTIONS, PLATFORM_OPTIONS, type Platform } from '@/config/ui';
import { COUNTRIES } from '@/shared/phone.js';
import { authService } from '@/services/authService';
import { useAppStore } from '@/stores/appStore';

export default function SettingsPage() {
  const user = useAppStore((s) => s.user)!;
  const navigate = useNavigate();
  const listed = !user.niche || NICHE_OPTIONS.some((n) => n.id === user.niche);
  const [form, setForm] = useState({
    name: user.name,
    niche: listed ? user.niche ?? '' : '__custom__',
    customNiche: listed ? '' : user.niche ?? '',
    platform: user.platform,
    country: user.country ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (name.length < 2 || name.length > 50) {
      setNameError('Ton nom doit faire entre 2 et 50 caractères.');
      return;
    }
    setSaving(true);
    try {
      const niche = form.niche === '__custom__' ? form.customNiche.trim().slice(0, 80) : form.niche;
      await authService.updateProfile({
        name,
        niche,
        platform: form.platform as Platform,
        ...(form.country ? { country: form.country } : {}),
      });
      toast.success('Paramètres enregistrés.');
    } catch {
      toast.error('Enregistrement impossible. Réessaie.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Paramètres" description="Ces réglages servent de valeurs par défaut dans chaque outil." />
        <form onSubmit={save} className="space-y-5 rounded-2xl border border-[#1E1E3A] bg-[#12121F] p-6">
          <Field id="name" label="Prénom ou nom affiché" error={nameError}>
            <TextInput value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); setNameError(''); }} autoComplete="name" maxLength={50} />
          </Field>
          <Field id="email" label="E-mail du compte" hint="C’est sur ce compte que les crédits achetés sont ajoutés.">
            <TextInput value={user.email} readOnly className="text-[#94A3B8]" />
          </Field>
          <Field id="country" label="Pays" hint="L’IA adapte les références à ton pays.">
            <NativeSelect value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
              <option value="">Non précisé</option>
              {COUNTRIES.map((c) => <option key={c.iso} value={c.iso}>{c.name}</option>)}
            </NativeSelect>
          </Field>
          <Field id="niche" label="Niche principale">
            <NativeSelect value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })}>
              <option value="">Généraliste</option>
              {NICHE_OPTIONS.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
              <option value="__custom__">Autre (je l’écris)</option>
            </NativeSelect>
          </Field>
          {form.niche === '__custom__' && (
            <Field id="customNiche" label="Ta niche">
              <TextInput value={form.customNiche} onChange={(e) => setForm({ ...form, customNiche: e.target.value })} maxLength={80} />
            </Field>
          )}
          <Field id="platform" label="Plateforme principale">
            <NativeSelect value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value as Platform })}>
              {PLATFORM_OPTIONS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </NativeSelect>
          </Field>
          <button type="submit" disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#7C3AED] px-5 font-medium text-white hover:bg-[#6D28D9] disabled:opacity-60">
            {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Enregistrer
          </button>
        </form>

        <nav aria-label="Liens utiles" className="mt-6 divide-y divide-[#1E1E3A] overflow-hidden rounded-2xl border border-[#1E1E3A]">
          {[
            { to: '/pricing', label: 'Recharger mes crédits', icon: Wallet },
            { to: '/guide', label: 'Guide du créateur', icon: BookOpen },
            { to: '/contact', label: 'Aide et contact', icon: LifeBuoy },
          ].map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex min-h-12 items-center gap-3 px-5 text-white hover:bg-[#12121F]">
              <Icon className="h-4 w-4 text-[#94A3B8]" aria-hidden="true" />
              <span className="flex-1">{label}</span>
              <ChevronRight className="h-4 w-4 text-[#64748B]" aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <section className="mt-6 rounded-2xl border border-[#1E1E3A] p-6">
          <h2 className="font-medium text-white">Session</h2>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Crédits achetés au total : <span className="tabular-nums text-white">{user.totalCreditsPurchased}</span> · utilisés : <span className="tabular-nums text-white">{user.totalCreditsUsed}</span>
          </p>
          <button
            type="button"
            onClick={async () => { await authService.logout(); navigate('/'); }}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#2D2D5E] px-4 text-sm text-white hover:bg-[#1A1A2E]"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> Se déconnecter
          </button>
        </section>
      </div>
    </AppShell>
  );
}
