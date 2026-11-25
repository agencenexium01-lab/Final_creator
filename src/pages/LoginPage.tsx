import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { AuthCard, Divider, GoogleButton, authErrorMessage, safeNext } from '@/components/AuthCard';
import { Field, TextInput } from '@/components/ui/field';
import { authService } from '@/services/authService';

const schema = z.object({
  email: z.string().trim().email('Adresse e-mail invalide.'),
  password: z.string().min(1, 'Saisis ton mot de passe.'),
});
type Values = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), mode: 'onTouched' });

  // La redirection vers l'onboarding (profil incomplet) est gérée par les routes protégées.
  const done = () => navigate(next, { replace: true });

  const onSubmit = async (v: Values) => {
    setLoading(true);
    setError('');
    try {
      await authService.loginWithEmailPassword(v.email, v.password);
      done();
    } catch (e) {
      setError(authErrorMessage(e));
      setLoading(false);
    }
  };

  const google = async () => {
    setLoading(true);
    setError('');
    try {
      await authService.loginWithGoogle();
      done();
    } catch (e) {
      setError(authErrorMessage(e));
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Connexion"
      footer={<>Pas encore de compte ? <Link to={`/signup${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-[#A78BFA] hover:text-white">Créer un compte</Link></>}
    >
      <GoogleButton onClick={google} disabled={loading}>Continuer avec Google</GoogleButton>
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Field id="email" label="E-mail" error={errors.email?.message}>
          <TextInput type="email" autoComplete="email" inputMode="email" {...register('email')} />
        </Field>
        <Field id="password" label="Mot de passe" error={errors.password?.message}>
          <TextInput type="password" autoComplete="current-password" {...register('password')} />
        </Field>
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-[#A78BFA] hover:text-white">Mot de passe oublié ?</Link>
        </div>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <button type="submit" disabled={loading} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] font-medium text-white hover:bg-[#6D28D9] disabled:opacity-60">
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Se connecter
        </button>
      </form>
    </AuthCard>
  );
}
