import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Logo } from '@/components/brand/Logo';
import { Field, NativeSelect, TextInput } from '@/components/ui/field';
import { safeNext } from '@/components/AuthCard';
import { NICHE_OPTIONS, PLATFORM_OPTIONS, type Platform } from '@/config/ui';
import { COUNTRIES } from '@/shared/phone.js';
import { authService } from '@/services/authService';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';

const STEPS = 3;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const user = useAppStore((s) => s.user);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? '',
    country: user?.country ?? 'BJ',
    niche: user?.niche ?? '',
    platform: (user?.platform ?? 'both') as Platform,
  });

  const nameOk = form.name.trim().length >= 2 && form.name.trim().length <= 50;
  const canContinue = (step === 1 && nameOk) || (step === 2 && !!form.niche) || step === 3;

  const finish = async () => {
    setSaving(true);
    try {
      await authService.updateProfile({ ...form, name: form.name.trim(), onboarding_completed: true });
      navigate(safeNext(params.get('next'), '/tools/calendar'), { replace: true });
    } catch {
      toast.error('Enregistrement impossible. Réessaie.');
      setSaving(false);
    }
  };

  const next = () => (step < STEPS ? setStep(step + 1) : finish());

  return (
    <div className="min-h-dvh bg-[#0A0A14] px-4 py-8 text-white">
      <div className="mx-auto max-w-2xl">
        <Logo />
        <div className="mt-10">
          <p className="text-sm text-[#94A3B8]">Étape {step} sur {STEPS}</p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#1E1E3A]">
            <div className="h-full bg-[#7C3AED] transition-[width] duration-300" style={{ width: `${(step / STEPS) * 100}%` }} />
          </div>
        </div>

        <main id="contenu" className="mt-10">
          {step === 1 && (
            <section className="space-y-6">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Faisons connaissance</h1>
              <Field id="name" label="Ton prénom ou nom de créateur">
                <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="given-name" maxLength={50} />
              </Field>
              <Field id="country" label="Ton pays" hint="L’IA utilisera des références que ton public reconnaît.">
                <NativeSelect value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
                  {COUNTRIES.map((c) => <option key={c.iso} value={c.iso}>{c.name}</option>)}
                </NativeSelect>
              </Field>
            </section>
          )}

          {step === 2 && (
            <section>
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Dans quel domaine tu crées ?</h1>
              <p className="mt-2 text-[#94A3B8]">Tu pourras écrire une niche plus précise dans chaque outil.</p>
              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Niche">
                {NICHE_OPTIONS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={form.niche === id}
                    onClick={() => setForm({ ...form, niche: id })}
                    className={cn(
                      'flex min-h-14 items-center gap-3 rounded-xl border px-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]',
                      form.niche === id ? 'border-[#7C3AED] bg-[#17142B] text-white' : 'border-[#1E1E3A] bg-[#12121F] text-[#CBD5E1] hover:border-[#2D2D5E]',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-[#94A3B8]" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 3 && (
            <section>
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Où publies-tu surtout ?</h1>
              <div className="mt-6 space-y-2" role="radiogroup" aria-label="Plateforme">
                {PLATFORM_OPTIONS.map(({ id, label, description, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={form.platform === id}
                    onClick={() => setForm({ ...form, platform: id })}
                    className={cn(
                      'flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]',
                      form.platform === id ? 'border-[#7C3AED] bg-[#17142B]' : 'border-[#1E1E3A] bg-[#12121F] hover:border-[#2D2D5E]',
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0 text-[#94A3B8]" aria-hidden="true" />
                    <span className="flex-1">
                      <span className="block font-medium text-white">{label}</span>
                      <span className="block text-sm text-[#94A3B8]">{description}</span>
                    </span>
                    {form.platform === id && <Check className="h-5 w-5 text-[#A78BFA]" aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </section>
          )}
        </main>

        <div className="mt-10 flex items-center justify-between gap-4">
          <button type="button" onClick={() => setStep(step - 1)} disabled={step === 1} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-[#94A3B8] hover:text-white disabled:invisible">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour
          </button>
          <button type="button" onClick={next} disabled={!canContinue || saving} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#7C3AED] px-6 font-medium text-white hover:bg-[#6D28D9] disabled:opacity-50">
            {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {step === STEPS ? 'Ouvrir mon espace' : 'Continuer'}
            {!saving && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>
    </div>
  );
}
