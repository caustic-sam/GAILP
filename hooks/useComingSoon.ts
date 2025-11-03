'use client';

import { useState } from 'react';

export function useComingSoon() {
  const [isOpen, setIsOpen] = useState(false);
  const [feature, setFeature] = useState('This feature');

  const showComingSoon = (featureName: string) => {
    setFeature(featureName);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    feature,
    showComingSoon,
    closeModal,
  };
}
