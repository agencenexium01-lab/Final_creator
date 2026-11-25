import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import { SiteLayout, PageHeader } from '@/components/layout/SiteLayout';
import { PricingCards } from '@/components/PricingCards';
import { Field, NativeSelect, TextInput } from '@/components/ui/field';
import { MONTH_PLAN, PACKS, TOOL_COSTS, formatFcfa, getPack, type PackId } from '@/config/pricing';
import { COUNTRIES, normalizePhone } from '@/shared/phone.js';
import { apiService, ApiError } from '@/services/api';
import { useAppStore } from '@/stores/appStore';
import { TOOLS, plural } from '@/config/ui';

function splitName(full: string) {
  const parts = full.trim().split(/\s+/);
  return { first: parts[0] ?? '', last: parts.slice(1).join(' ') };
}

export default function PricingPage() {
  const { user, status } = useAppStore();
  const [params] = useSearchParams();
  const initial = (getPack(params.get('pack') ?? '')?.id ?? 'createur') as PackId;
  const [packId, setPackId] = useState<PackId>(initial);
  const pack = getPack(packId)!;

  const [form, setForm] = useState({ firstName: '', lastName: '', country: 'BJ', phone: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const { first, last } = splitName(user.name);
    setForm((f) => ({
      ...f,
      firstName: f.firstName || first,
      lastName: f.lastName || last,
      country: user.country || f.country,
    }));
  }, [user]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const validate = () => {
    const next: typeof errors = {};
    if (!form.firstName.trim()) next.firstName = 'Indique ton prénom.';
    if (!form.lastName.trim()) next.lastName = 'Indique ton nom.';
    const phone = normalizePhone(form.country, form.phone);
    if (!phone.ok) next.phone = phone.error;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const url = await apiService.initiateCheckout({ pack: packId, ...form });
      window.location.assign(url);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Le paiement n’a pas pu démarrer. Réessaie dans un instant.');
      setSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl">
        <PageHeader
          eyebrow="Tarifs"
          title="Des crédits, sans abonnement"
          description={`Un mois de contenu (1 calendrier + ${MONTH_PLAN.scripts} scripts) demande ${MONTH_PLAN.credits} crédits. Les crédits n’expirent jamais.`}
        />

        <PricingCards selected={packId} onSelect={setPackId} />

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <section aria-labelledby="paiement" className="rounded-2xl border border-[#1E1E3A] bg-[#12121F] p-6">
            <h2 id="paiement" className="text-lg font-medium text-white">
              Payer le {pack.name} · {formatFcfa(pack.priceFcfa)}
            </h2>

            {status !== 'signedIn' ? (
              <div className="mt-4 space-y-4">
                <p className="text-[#94A3B8]">Crée ton compte (ou connecte-toi) pour que les crédits arrivent au bon endroit.</p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link to={`/signup?next=${encodeURIComponent(`/pricing?pack=${packId}`)}`} className="grid min-h-12 place-items-center rounded-xl bg-[#7C3AED] px-6 font-medium text-white hover:bg-[#6D28D9]">
                    Créer mon compte
                  </Link>
                  <Link to={`/login?next=${encodeURIComponent(`/pricing?pack=${packId}`)}`} className="grid min-h-12 place-items-center rounded-xl border border-[#2D2D5E] px-6 font-medium text-white hover:bg-[#1A1A2E]">
                    J’ai déjà un compte
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="firstName" label="Prénom" error={errors.firstName}>
                    <TextInput value={form.firstName} onChange={set('firstName')} autoComplete="given-name" maxLength={50} />
                  </Field>
                  <Field id="lastName" label="Nom" error={errors.lastName}>
                    <TextInput value={form.lastName} onChange={set('lastName')} autoComplete="family-name" maxLength={50} />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                  <Field id="country" label="Pays">
                    <NativeSelect value={form.country} onChange={set('country')} autoComplete="country">
                      {COUNTRIES.map((c) => (
                        <option key={c.iso} value={c.iso}>{c.name} (+{c.dial})</option>
                      ))}
                    </NativeSelect>
                  </Field>
                  <Field id="phone" label="Numéro Mobile Money" hint="Le numéro qui recevra la demande de paiement." error={errors.phone}>
                    <TextInput type="tel" inputMode="tel" value={form.phone} onChange={set('phone')} autoComplete="tel-national" placeholder="01 97 00 00 00" />
                  </Field>
                </div>

                <p className="text-sm text-[#94A3B8]">
                  Les crédits seront ajoutés au compte <span className="text-white">{user?.email}</span>.
                </p>

                {submitError && (
                  <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-300">
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-6 font-medium text-white transition-colors hover:bg-[#6D28D9] disabled:opacity-60 sm:w-auto"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Lock className="h-4 w-4" aria-hidden="true" />}
                  {submitting ? 'Ouverture du paiement…' : `Payer ${formatFcfa(pack.priceFcfa)}`}
                </button>
                <p className="text-xs text-[#64748B]">
                  Paiement traité par Chariow (Mobile Money ou carte). En payant, tu acceptes les{' '}
                  <Link to="/conditions" className="underline hover:text-white">conditions de vente</Link>.
                </p>
              </form>
            )}
          </section>

          <aside aria-labelledby="couts" className="rounded-2xl border border-[#1E1E3A] p-6">
            <h2 id="couts" className="text-lg font-medium text-white">Coût de chaque outil</h2>
            <table className="mt-4 w-full text-sm">
              <tbody className="divide-y divide-[#1E1E3A]">
                {TOOLS.map((t) => (
                  <tr key={t.id}>
                    <th scope="row" className="py-3 text-left font-normal text-[#CBD5E1]">{t.title}</th>
                    <td className="py-3 text-right tabular-nums text-white">{plural(TOOL_COSTS[t.id], 'crédit')}</td>
                  </tr>
                ))}
                <tr>
                  <th scope="row" className="py-3 text-left font-medium text-white">Un mois complet</th>
                  <td className="py-3 text-right font-medium tabular-nums text-white">{MONTH_PLAN.credits} crédits</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-4 text-sm text-[#94A3B8]">
              {status === 'signedIn' && user ? <>Ton solde : <span className="tabular-nums text-white">{user.credits}</span> crédits.</> : `Packs de ${PACKS.map((p) => p.credits).join(', ')} crédits.`}
            </p>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
