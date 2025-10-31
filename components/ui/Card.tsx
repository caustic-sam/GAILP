import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${hover ? 'hover:shadow-md transition-shadow' : 'shadow-sm'} ${className}`}>
      {children}
    </div>
  );
}