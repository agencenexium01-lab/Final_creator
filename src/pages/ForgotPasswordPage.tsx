import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, MailCheck } from 'lucide-react';
import { AuthCard } from '@/components/AuthCard';
import { Field, TextInput } from '@/components/ui/field';
import { authService } from '@/services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Adresse e-mail invalide.');
      return;
    }
    setLoading(true);
    try {
      await authService.sendPasswordResetEmail(email.trim());
    } catch {
      // Même message que si l'e-mail existe : on ne révèle pas quels comptes existent.
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <AuthCard title="Mot de passe oublié" footer={<Link to="/login" className="text-[#A78BFA] hover:text-white">Retour à la connexion</Link>}>
      {sent ? (
        <div className="flex gap-3 text-[#CBD5E1]" role="status">
          <MailCheck className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
          <p>Si un compte existe pour {email}, un lien de réinitialisation vient d’être envoyé. Pense à vérifier les spams.</p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          <p className="text-sm text-[#94A3B8]">Saisis l’e-mail de ton compte : on t’envoie un lien pour choisir un nouveau mot de passe.</p>
          <Field id="email" label="E-mail" error={error}>
            <TextInput type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} />
          </Field>
          <button type="submit" disabled={loading} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] font-medium text-white hover:bg-[#6D28D9] disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Envoyer le lien
          </button>
        </form>
      )}
    </AuthCard>
  );
}
