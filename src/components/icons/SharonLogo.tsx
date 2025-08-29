import React from 'react';

interface SharonLogoProps {
  className?: string;
  alt?: string;
}

export const SharonLogo: React.FC<SharonLogoProps> = ({ className = 'h-10 w-auto', alt = 'SHARON Logo' }) => (
  <img
    src="/logo.png"
    alt={alt}
    className={className}
  />
);
