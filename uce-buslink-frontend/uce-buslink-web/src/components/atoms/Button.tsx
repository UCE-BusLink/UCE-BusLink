import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  size?: 'sm' | 'md';
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  const base = 'font-semibold transition-colors rounded-lg';
  const variants = {
    primary: 'bg-navy-900 text-white hover:bg-navy-800',
    ghost: 'flex items-center gap-1.5 text-navy-900 hover:text-amber-600',
  };
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-4 py-2 text-sm',
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
  );
}
