import React from 'react';
import { cn } from '../../lib/utils';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("card-standard text-slate-900", className)}
      {...props}
    />
  )
);

export function CardHeader({ className, children }: { className?: string, children: React.ReactNode }) {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string, children: React.ReactNode }) {
  return <h3 className={cn('font-semibold leading-none tracking-tight', className)}>{children}</h3>;
}

export function CardContent({ className, children }: { className?: string, children: React.ReactNode }) {
  return <div className={cn('p-6 pt-0', className)}>{children}</div>;
}
