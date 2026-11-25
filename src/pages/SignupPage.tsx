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
  name: z.string().trim().min(2, 'Au moins 2 caractères.').max(50, '50 caractères maximum.'),
  email: z.string().trim().email('Adresse e-mail invalide.'),
  password: z.string().min(8, '8 caractères minimum.'),
});
type Values = z.infer<typeof schema>;

export default function SignupPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'), '/onboarding');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), mode: 'onTouched' });

  const done = () => navigate(next === '/onboarding' ? next : `/onboarding?next=${encodeURIComponent(next)}`, { replace: true });

  const onSubmit = async (v: Values) => {
    setLoading(true);
    setError('');
    try {
      await authService.registerWithEmailPassword(v.name, v.email, v.password);
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
      title="Créer un compte"
      subtitle="Ton espace pour planifier et écrire tes contenus."
      footer={<>Déjà un compte ? <Link to={`/login${params.get('next') ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-[#A78BFA] hover:text-white">Se connecter</Link></>}
    >
      <GoogleButton onClick={google} disabled={loading}>Continuer avec Google</GoogleButton>
      <Divider />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Field id="name" label="Prénom ou nom de créateur" error={errors.name?.message}>
          <TextInput autoComplete="name" {...register('name')} />
        </Field>
        <Field id="email" label="E-mail" error={errors.email?.message}>
          <TextInput type="email" autoComplete="email" inputMode="email" {...register('email')} />
        </Field>
        <Field id="password" label="Mot de passe" hint="8 caractères minimum." error={errors.password?.message}>
          <TextInput type="password" autoComplete="new-password" {...register('password')} />
        </Field>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <button type="submit" disabled={loading} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] font-medium text-white hover:bg-[#6D28D9] disabled:opacity-60">
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Créer mon compte
        </button>
        <p className="text-xs text-[#64748B]">
          En créant un compte, tu acceptes les <Link to="/conditions" className="underline">conditions générales</Link> et la{' '}
          <Link to="/confidentialite" className="underline">politique de confidentialité</Link>.
        </p>
      </form>
    </AuthCard>
  );
}
