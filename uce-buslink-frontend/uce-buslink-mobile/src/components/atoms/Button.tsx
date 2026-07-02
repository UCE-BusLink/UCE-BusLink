import type { ReactNode } from 'react';
import { Pressable, Text } from 'react-native';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'ghost';
  size?: 'sm' | 'md';
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onPress,
  disabled,
  className = '',
  textClassName = '',
}: ButtonProps) {
  const base = 'rounded-lg flex-row items-center justify-center';
  const variants = {
    primary: 'bg-navy-900 active:bg-navy-800',
    ghost: 'gap-1.5',
  };
  const sizes = {
    sm: 'px-4 py-2',
    md: 'px-4 py-2',
  };
  const textVariants = {
    primary: 'text-white font-semibold',
    ghost: 'text-navy-900 font-semibold',
  };
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
  };
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      {typeof children === 'string' ? (
        <Text className={`${textVariants[variant]} ${textSizes[size]} ${textClassName}`}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
