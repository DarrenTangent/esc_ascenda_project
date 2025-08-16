import React from 'react';
import clsx from 'clsx';

export function Label({children}:{children:React.ReactNode}) {
  return <label className="mb-1 block text-sm font-medium text-[var(--ink-700)]">{children}</label>;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        'h-11 w-full rounded-lg border border-[var(--ink-300)] bg-white/90 px-3 text-[var(--ink-900)]',
        'placeholder:text-slate-400 focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[var(--brand-300)]',
        props.className
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={clsx(
        'h-11 w-full rounded-lg border border-[var(--ink-300)] bg-white/90 px-3 text-[var(--ink-900)]',
        'focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[var(--brand-300)]',
        props.className
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={clsx(
        'w-full rounded-lg border border-[var(--ink-300)] bg-white/90 px-3 py-2 text-[var(--ink-900)]',
        'placeholder:text-slate-400 focus:border-[var(--brand-500)] focus:ring-2 focus:ring-[var(--brand-300)]',
        props.className
      )}
    />
  );
}
