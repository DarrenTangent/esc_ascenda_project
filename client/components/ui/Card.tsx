import React from 'react';
import clsx from 'clsx';

export default function Card({
  className, children,
}: React.PropsWithChildren<{className?: string}>) {
  return (
    <div className={clsx(
      'rounded-2xl bg-white shadow-sm ring-1 ring-black/5',
      className
    )}>
      {children}
    </div>
  );
}
