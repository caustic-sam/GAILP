import React from 'react';

interface StatusDotProps {
  status: 'draft' | 'adopted' | 'in_force' | 'repealed';
}

export function StatusDot({ status }: StatusDotProps) {
  const colors = {
    draft: 'bg-yellow-500',
    adopted: 'bg-blue-500',
    in_force: 'bg-green-500',
    repealed: 'bg-gray-500'
  };
  
  return <div className={`w-2 h-2 rounded-full ${colors[status]}`} />;
}