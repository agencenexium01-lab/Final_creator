import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  error: Error | null;
}

/**
 * Filet de sécurité : une erreur dans une page affiche un message clair au lieu d'une page blanche.
 * Après un nouveau déploiement, un ancien fichier de page peut manquer : le bouton recharge la version à jour.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erreur dans l’interface', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="grid min-h-dvh place-items-center bg-[#0A0A14] px-4 text-center text-white">
        <div className="max-w-md">
          <h1 className="text-xl font-medium">Cette page n’a pas pu s’afficher</h1>
          <p className="mt-2 text-[#94A3B8]">Recharge la page. Si le problème continue, écris-nous sur WhatsApp.</p>
          {import.meta.env.DEV && (
            <pre className="mt-4 whitespace-pre-wrap rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-left text-xs text-red-200">{error.message}</pre>
          )}
          <div className="mt-6 flex justify-center gap-3">
            <button type="button" onClick={() => window.location.reload()} className="min-h-11 rounded-xl bg-white px-5 font-medium text-[#0A0A14]">
              Recharger
            </button>
            <a href="/" className="grid min-h-11 place-items-center rounded-xl border border-[#2D2D5E] px-5 text-white">
              Accueil
            </a>
          </div>
        </div>
      </div>
    );
  }
}
