'use client';
import React from 'react';
import clsx from 'clsx';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary'|'secondary'|'ghost'|'danger';
  size?: 'sm'|'md'|'lg';
  full?: boolean;
};

export default function Button({
  className, variant='primary', size='md', full=false, ...rest
}: Props){
  const base = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:focus-ring';
  const sizes = {
    sm:'h-9 px-3 text-sm',
    md:'h-11 px-4 text-sm',
    lg:'h-12 px-5 text-base',
  }[size];

  const variants = {
    primary:'bg-[var(--brand-600)] text-white hover:bg-[var(--brand-700)]',
    secondary:'bg-[var(--brand-50)] text-[var(--brand-700)] hover:bg-[var(--brand-100)]',
    ghost:'bg-transparent text-[var(--ink-700)] hover:bg-[var(--surface-2)]',
    danger:'bg-red-600 text-white hover:bg-red-700',
  }[variant];

  return (
    <button
      className={clsx(base, sizes, variants, full && 'w-full', className)}
      {...rest}
    />
  );
}
