import { Mail, MessageCircle } from 'lucide-react';
import { SiteLayout, PageHeader } from '@/components/layout/SiteLayout';
import { FAQ } from '@/content/faq';
import { SITE } from '@/config/site';

const whatsappUrl = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Bonjour Creator Booster, j’ai une question : ')}`;

export default function ContactPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl">
        <PageHeader eyebrow="Aide" title="Questions et contact" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <section aria-labelledby="faq" className="rounded-2xl border border-[#1E1E3A] bg-[#12121F] px-5">
            <h2 id="faq" className="sr-only">Questions fréquentes</h2>
            <div className="divide-y divide-[#1E1E3A]">
              {FAQ.map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-medium text-white">
                    {f.q}
                    <span className="text-[#94A3B8] transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="mt-2 leading-relaxed text-[#94A3B8]">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <aside aria-labelledby="contact" className="h-fit rounded-2xl border border-[#1E1E3A] p-6">
            <h2 id="contact" className="text-lg font-medium text-white">Écris-nous</h2>
            <p className="mt-1 text-sm text-[#94A3B8]">
              Pour un souci de paiement, indique l’e-mail de ton compte et la référence de la transaction.
            </p>
            <div className="mt-5 space-y-3">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] font-medium text-[#0A0A14] hover:bg-[#1FBE5B]">
                <MessageCircle className="h-5 w-5" aria-hidden="true" /> WhatsApp
              </a>
              <a href={`mailto:${SITE.supportEmail}`} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#2D2D5E] font-medium text-white hover:bg-[#12121F]">
                <Mail className="h-5 w-5" aria-hidden="true" /> {SITE.supportEmail}
              </a>
            </div>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
