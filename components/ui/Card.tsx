import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false, ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 ${hover ? 'hover:shadow-md transition-shadow cursor-pointer' : 'shadow-sm'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}