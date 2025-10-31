import React from 'react';

interface AvatarProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ children, size = 'md' }: AvatarProps) {
  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base'
  };
  
  return (
    <div className={`${sizes[size]} rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold`}>
      {children}
    </div>
  );
}