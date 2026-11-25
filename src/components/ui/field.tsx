import * as React from 'react';
import { cn } from '@/lib/utils';

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactElement<{ id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }>;
}

/** Libellé visible + aide + erreur reliés au champ (accessibilité). */
export function Field({ id, label, hint, error, optional, className, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {optional && <span className="ml-1 font-normal text-muted-foreground">(facultatif)</span>}
      </label>
      {React.cloneElement(children, { id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Classes communes aux champs de saisie (hauteur tactile 44 px). */
export const inputClass =
  'w-full min-h-11 rounded-lg border border-[#2D2D5E] bg-[#1A1A2E] px-3 py-2 text-base text-white placeholder:text-[#64748B] transition-colors focus-visible:border-[#7C3AED] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/40 aria-[invalid=true]:border-red-400 disabled:opacity-50';

export function NativeSelect({ className, children, ...props }: React.ComponentProps<'select'>) {
  return (
    <select className={cn(inputClass, 'appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10', className)}
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }}
      {...props}
    >
      {children}
    </select>
  );
}

export function TextInput({ className, ...props }: React.ComponentProps<'input'>) {
  return <input className={cn(inputClass, className)} {...props} />;
}

export function TextArea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return <textarea className={cn(inputClass, 'min-h-24 resize-y leading-relaxed', className)} {...props} />;
}
